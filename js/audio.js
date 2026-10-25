// AdLib (Yamaha OPL2) style FM synthesizer, sequencer and sound effects, built on Web Audio.
// Songs live in js/content/music.js as MIDI-style note data; see that file for the notation.
(function (root) {
  'use strict';
  const LSJ = root.LSJ;

  // ------------------------------------------------------------- notation
  const STEP = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

  function midi(name) {
    const m = /^([a-gA-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) throw new Error('Bad note "' + name + '"');
    return 12 * (+m[3] + 1) + STEP[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }

  // "C4:4 E4+G4:2 r:2 |" -> events in 16th-note steps. "|" marks a bar line and is length-checked.
  function parseSeq(str, barLen, where) {
    const ev = [];
    let t = 0, dur = 4, barStart = 0, bar = 1;
    const checkBar = () => {
      if (barLen && t - barStart !== barLen) throw new Error(`${where}: bar ${bar} is ${t - barStart}/16 long`);
    };
    for (const tok of str.trim().split(/\s+/)) {
      if (tok === '|') { checkBar(); barStart = t; bar += 1; continue; }
      const [p, d] = tok.split(':');
      if (d) dur = +d;
      if (!(dur > 0)) throw new Error(`${where}: bad duration in "${tok}"`);
      if (p !== 'r') ev.push({ t, d: dur, notes: p.split('+').map(midi) });
      t += dur;
    }
    if (t !== barStart) checkBar();
    return { ev, len: t };
  }

  // Drum grid: one character per 16th note. x = hit, X = accent, . = rest, | = bar line.
  function parseGrid(str, barLen, where) {
    const ev = [];
    let t = 0, barStart = 0, bar = 1;
    for (const ch of str.replace(/\s+/g, '')) {
      if (ch === '|') {
        if (barLen && t - barStart !== barLen) throw new Error(`${where}: bar ${bar} is ${t - barStart}/16 long`);
        barStart = t; bar += 1; continue;
      }
      if (ch === 'x' || ch === 'X') ev.push({ t, v: ch === 'X' ? 1 : 0.65 });
      t += 1;
    }
    return { ev, len: t };
  }

  const cache = {};
  function compile(id) {
    if (cache[id]) return cache[id];
    const song = LSJ.music.songs[id];
    if (!song) throw new Error('Unknown song: ' + id);
    const barLen = song.free ? 0 : 16;
    const events = [];
    const lens = [];
    song.tracks.forEach((tr, i) => {
      const where = `${id} track ${i + 1}`;
      if (tr.drums) {
        for (const [kind, grid] of Object.entries(tr.drums)) {
          const p = parseGrid(grid, barLen, `${where} (${kind})`);
          lens.push(p.len);
          for (const e of p.ev) events.push({ t: e.t, drum: kind, vel: e.v * (tr.vol || 1) });
        }
      } else {
        if (!LSJ.music.instruments[tr.inst]) throw new Error(`${where}: unknown instrument ${tr.inst}`);
        const p = parseSeq(tr.seq, barLen, where);
        lens.push(p.len);
        for (const e of p.ev) for (const n of e.notes) events.push({ t: e.t, d: e.d, midi: n + (tr.transpose || 0), inst: tr.inst, vel: tr.vol || 1 });
      }
    });
    const len = Math.max(...lens);
    if (!song.free && lens.some((l) => l !== len)) throw new Error(`${id}: tracks have different lengths (${lens.join(', ')})`);
    events.sort((a, b) => a.t - b.t);
    cache[id] = { id, song, events, len, loopAt: (song.loopBar || 0) * 16 };
    return cache[id];
  }

  // Swing pushes the off-beat 8th later; 1 = full triplet feel.
  function stepToBeats(pos, swing) {
    const beat = Math.floor(pos / 4);
    const x = pos - beat * 4;
    const off = 2 + (swing || 0) * (2 / 3);
    const y = x <= 2 ? (x * off) / 2 : off + ((x - 2) * (4 - off)) / 2;
    return (beat * 4 + y) / 4;
  }
  const secAt = (c, pos) => (stepToBeats(pos, c.song.swing) * 60) / c.song.bpm;

  // ------------------------------------------------------------- settings
  const SKEY = 'lsj-audio';
  const settings = { music: true, sfx: true, volume: 7 };
  try { Object.assign(settings, JSON.parse(root.localStorage.getItem(SKEY) || '{}')); } catch (e) { /* no storage */ }
  const saveSettings = () => { try { root.localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } };

  // ------------------------------------------------------------- audio graph
  let ctx = null, master, musicBus, sfxBus, noise, analyser;
  const waves = {};

  function oplWave(kind) {
    if (kind === 'sine' || !kind) return null;
    if (waves[kind]) return waves[kind];
    // OPL2 waveforms: half-sine, abs-sine and quarter ("pulse") sine.
    const N = 2048, H = 48, re = new Float32Array(H), im = new Float32Array(H);
    const s = [];
    for (let n = 0; n < N; n++) {
      const ph = (2 * Math.PI * n) / N, v = Math.sin(ph);
      const q = (n % (N / 2)) < N / 4;
      s.push(kind === 'half' ? Math.max(v, 0) : kind === 'abs' ? Math.abs(v) : q ? Math.abs(v) : 0);
    }
    for (let k = 1; k < H; k++) {
      let a = 0, b = 0;
      for (let n = 0; n < N; n++) { const ph = (2 * Math.PI * k * n) / N; a += s[n] * Math.cos(ph); b += s[n] * Math.sin(ph); }
      re[k] = a / N; im[k] = b / N;
    }
    waves[kind] = ctx.createPeriodicWave(re, im);
    return waves[kind];
  }

  function osc(type, freq, t) {
    const o = ctx.createOscillator();
    const w = oplWave(type);
    if (w) o.setPeriodicWave(w); else o.type = ['square', 'sawtooth', 'triangle'].includes(type) ? type : 'sine';
    o.frequency.setValueAtTime(freq, t);
    return o;
  }

  function vol() { return Math.pow(settings.volume / 10, 1.6) * 0.9; }

  function ensure() {
    if (ctx) return true;
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = vol();
    // Gentle low-pass for that warm, slightly muffled ISA-card sound.
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 7500; lp.Q.value = 0.3;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
    analyser = ctx.createAnalyser(); analyser.fftSize = 2048; comp.connect(analyser);
    musicBus = ctx.createGain(); musicBus.gain.value = settings.music ? 1 : 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = settings.sfx ? 1 : 0; sfxBus.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
    setInterval(tick, 40);
    return true;
  }

  // ------------------------------------------------------------- voices
  function fmNote(dest, inst, m, t, dur, vel) {
    const f = 440 * Math.pow(2, (m - 69) / 12);
    const end = t + dur;
    const car = osc(inst.wave, f, t);
    const mod = osc(inst.modWave, f * inst.ratio, t);
    const idx = ctx.createGain();
    idx.gain.setValueAtTime(f * inst.i0, t);
    idx.gain.setTargetAtTime(f * (inst.i1 != null ? inst.i1 : inst.i0), t + 0.001, Math.max(0.005, (inst.it || 0.1) / 3));
    mod.connect(idx); idx.connect(car.frequency);

    const env = ctx.createGain();
    const peak = (inst.gain || 0.2) * vel;
    const a = inst.a || 0.005, dk = inst.d || 0.3, s = inst.s != null ? inst.s : 0.7, r = inst.r || 0.1;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peak, t + a);
    env.gain.setTargetAtTime(peak * s, t + a, dk / 3);
    const held = end - t;
    const level = held <= a ? (peak * held) / a : peak * s + (peak - peak * s) * Math.exp(-(held - a) / (dk / 3));
    env.gain.setValueAtTime(level, end);
    env.gain.setTargetAtTime(0, end, r / 3);
    car.connect(env); env.connect(dest);

    if (inst.vib) {
      const lfo = osc('sine', inst.vib[0], t);
      const lg = ctx.createGain();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(inst.vib[1], t + (inst.vib[2] || 0.15));
      lfo.connect(lg); lg.connect(car.detune); lg.connect(mod.detune);
      lfo.start(t); lfo.stop(end + r * 2 + 0.05);
    }
    if (inst.bend) {
      // Start slightly flat and scoop up to pitch, like a sax or trombone.
      car.detune.setValueAtTime(inst.bend, t); car.detune.linearRampToValueAtTime(0, t + 0.06);
      mod.detune.setValueAtTime(inst.bend, t); mod.detune.linearRampToValueAtTime(0, t + 0.06);
    }
    car.start(t); mod.start(t);
    car.stop(end + r * 2 + 0.05); mod.stop(end + r * 2 + 0.05);
  }

  function noiseHit(dest, t, len, gain, type, freq, q) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const flt = ctx.createBiquadFilter();
    flt.type = type; flt.frequency.setValueAtTime(freq, t); flt.Q.value = q || 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    src.connect(flt); flt.connect(g); g.connect(dest);
    src.start(t, Math.random() * 1.5); src.stop(t + len + 0.02);
    return { src, flt, g };
  }

  function toneHit(dest, t, len, gain, f0, f1, type) {
    const o = osc(type || 'sine', f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + len * 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + len + 0.02);
    return { o, g };
  }

  // OPL2 rhythm-mode style kit.
  function drum(dest, kind, t, v) {
    switch (kind) {
      case 'k': toneHit(dest, t, 0.32, 0.9 * v, 140, 42); break;
      case 's': noiseHit(dest, t, 0.17, 0.42 * v, 'bandpass', 1900, 0.8); toneHit(dest, t, 0.09, 0.3 * v, 210, 150, 'triangle'); break;
      case 'h': noiseHit(dest, t, 0.045, 0.2 * v, 'highpass', 7500); break;
      case 'o': noiseHit(dest, t, 0.32, 0.18 * v, 'highpass', 6500); break;
      case 'p': toneHit(dest, t, 0.035, 0.35 * v, 900, 0, 'triangle'); noiseHit(dest, t, 0.03, 0.2 * v, 'bandpass', 3000, 2); break;
      case 'c': noiseHit(dest, t, 1.4, 0.22 * v, 'highpass', 4500); break;
      case 't': toneHit(dest, t, 0.28, 0.6 * v, 170, 95); break;
      case 'w': toneHit(dest, t, 0.08, 0.35 * v, 1200, 0, 'sine'); break; // woodblock
      default: break;
    }
  }

  function scheduleEvent(c, e, dest, t) {
    const spb = 60 / c.song.bpm / 4;
    if (e.drum) drum(dest, e.drum, t, e.vel);
    else {
      const dur = Math.max(0.03, secAt(c, e.t + e.d) - secAt(c, e.t) - spb * 0.12);
      fmNote(dest, LSJ.music.instruments[e.inst], e.midi, t, dur, e.vel);
    }
  }

  // ------------------------------------------------------------- music player
  const AHEAD = 0.35;
  let cur = null;      // { c, out, base, idx, loop, then, endAt }
  let want = null;     // what should be playing when music is (re)enabled
  let duckUntil = 0;

  function startSong(id, opts, at) {
    const c = compile(id);
    const out = ctx.createGain();
    out.gain.value = c.song.vol || 1;
    out.connect(musicBus);
    const t0 = Math.max(at || 0, ctx.currentTime + 0.06);
    cur = { id, c, out, base: t0, idx: 0, loop: opts.loop !== false, then: opts.then || null, endAt: null };
  }

  function fadeOut(p) {
    if (!p) return;
    const t = ctx.currentTime;
    p.out.gain.cancelScheduledValues(t);
    p.out.gain.setValueAtTime(p.out.gain.value, t);
    p.out.gain.linearRampToValueAtTime(0, t + 0.25);
    setTimeout(() => p.out.disconnect(), 1200);
  }

  function tick() {
    if (!cur || !ctx || ctx.state !== 'running') return;
    const horizon = ctx.currentTime + AHEAD;
    const c = cur.c;
    for (;;) {
      if (cur.idx >= c.events.length) {
        if (cur.loop) {
          cur.base += secAt(c, c.len) - secAt(c, c.loopAt);
          cur.idx = c.events.findIndex((e) => e.t >= c.loopAt);
          if (cur.idx < 0) cur.idx = 0;
          continue;
        }
        cur.endAt = cur.endAt || cur.base + secAt(c, c.len);
        if (cur.endAt <= horizon) {
          const next = cur.then, endAt = cur.endAt, old = cur;
          cur = null;
          setTimeout(() => old.out.disconnect(), 3000);
          if (next) startSong(next, { loop: true }, endAt);
        }
        return;
      }
      const e = c.events[cur.idx];
      const t = cur.base + secAt(c, e.t);
      if (t > horizon) return;
      if (t >= ctx.currentTime - 0.05) scheduleEvent(c, e, cur.out, t);
      cur.idx += 1;
    }
  }

  function playMusic(id, opts) {
    opts = opts || {};
    if (cur && cur.id === id) {
      if (opts.loop === false) { cur.loop = false; cur.then = opts.then || null; }
      want = opts.then || id;
      return;
    }
    if (cur && cur.then === id && !opts.force) return;
    want = opts.then || (opts.loop === false ? null : id);
    if (!ctx || !settings.music) return;
    fadeOut(cur);
    startSong(id, opts);
  }

  function stopMusic() {
    want = null;
    if (!ctx) return;
    fadeOut(cur);
    cur = null;
  }

  // Short one-shot songs played over the music, which ducks underneath.
  function jingle(id) {
    if (!ctx || !settings.sfx) return;
    const c = compile(id);
    const out = ctx.createGain();
    out.gain.value = c.song.vol || 1;
    out.connect(sfxBus);
    const t0 = ctx.currentTime + 0.03;
    for (const e of c.events) scheduleEvent(c, e, out, t0 + secAt(c, e.t));
    const len = secAt(c, c.len) + 0.3;
    duck(t0, len);
    setTimeout(() => out.disconnect(), (len + 2) * 1000);
  }

  function duck(t0, len) {
    if (!settings.music) return;
    const g = musicBus.gain;
    const until = t0 + len;
    if (until <= duckUntil) return;
    duckUntil = until;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(g.value, t0);
    g.linearRampToValueAtTime(0.22, t0 + 0.05);
    g.setValueAtTime(0.22, until);
    g.linearRampToValueAtTime(1, until + 0.4);
  }

  // ------------------------------------------------------------- sound effects
  const FX = {
    printer(d, t) {
      for (let i = 0; i < 7; i++) {
        const n = noiseHit(d, t + i * 0.16, 0.13, 0.32, 'bandpass', 900 + (i % 2) * 500, 2);
        n.flt.frequency.linearRampToValueAtTime(2400, t + i * 0.16 + 0.12);
        toneHit(d, t + i * 0.16, 0.12, 0.12, 70, 0, 'square');
      }
      noiseHit(d, t + 1.15, 0.25, 0.25, 'highpass', 3000);
    },
    stapler(d, t) {
      noiseHit(d, t, 0.03, 0.4, 'highpass', 4000);
      toneHit(d, t + 0.09, 0.16, 0.7, 160, 55);
      noiseHit(d, t + 0.09, 0.05, 0.5, 'bandpass', 2500, 3);
    },
    clunk(d, t) {
      toneHit(d, t, 0.3, 0.8, 120, 50);
      noiseHit(d, t, 0.2, 0.4, 'lowpass', 700);
      noiseHit(d, t + 0.05, 0.4, 0.15, 'bandpass', 2200, 4);
    },
    crash(d, t) {
      toneHit(d, t, 0.45, 0.9, 110, 40);
      noiseHit(d, t, 0.6, 0.5, 'lowpass', 1200);
      for (let i = 0; i < 5; i++) noiseHit(d, t + 0.12 + i * 0.07 + Math.random() * 0.04, 0.09, 0.25, 'bandpass', 1500 + Math.random() * 2500, 3);
    },
    slosh(d, t) {
      const n = noiseHit(d, t, 1.8, 0.6, 'lowpass', 350, 6);
      const lfo = osc('sine', 2.2, t);
      const lg = ctx.createGain(); lg.gain.value = 300;
      lfo.connect(lg); lg.connect(n.flt.frequency);
      lfo.start(t); lfo.stop(t + 1.9);
      n.g.gain.setValueAtTime(0.0008, t);
      n.g.gain.linearRampToValueAtTime(0.6, t + 0.25);
      n.g.gain.exponentialRampToValueAtTime(0.0008, t + 1.8);
    },
    bus(d, t) {
      const o = osc('sawtooth', 42, t);
      o.frequency.linearRampToValueAtTime(70, t + 1.2);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0008, t); g.gain.linearRampToValueAtTime(0.45, t + 0.3);
      g.gain.setValueAtTime(0.45, t + 1.0); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.5);
      o.connect(f); f.connect(g); g.connect(d); o.start(t); o.stop(t + 1.6);
      noiseHit(d, t + 1.45, 0.6, 0.3, 'highpass', 2500); // air brakes: pssssh
    },
    car(d, t) {
      for (let i = 0; i < 4; i++) toneHit(d, t + i * 0.14, 0.11, 0.5, 65, 45, 'sawtooth');
      const o = osc('sawtooth', 38, t + 0.6);
      o.frequency.exponentialRampToValueAtTime(110, t + 1.1);
      o.frequency.exponentialRampToValueAtTime(55, t + 1.7);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0008, t + 0.6); g.gain.linearRampToValueAtTime(0.5, t + 0.7);
      g.gain.setValueAtTime(0.5, t + 1.5); g.gain.exponentialRampToValueAtTime(0.0008, t + 2);
      o.connect(f); f.connect(g); g.connect(d); o.start(t + 0.6); o.stop(t + 2.05);
    },
    cash(d, t) {
      noiseHit(d, t, 0.08, 0.4, 'bandpass', 3500, 2);
      noiseHit(d, t + 0.1, 0.08, 0.3, 'bandpass', 2500, 2);
      fmNote(d, LSJ.music.instruments.bell, 88, t + 0.18, 0.08, 0.9);
      fmNote(d, LSJ.music.instruments.bell, 93, t + 0.26, 0.5, 1);
    },
    coins(d, t) {
      for (let i = 0; i < 3; i++) fmNote(d, LSJ.music.instruments.bell, 96 + (i % 2) * 3, t + i * 0.09, 0.06, 0.6);
    },
    ding(d, t) { fmNote(d, LSJ.music.instruments.bell, 81, t, 0.9, 1); },
    beep(d, t) {
      toneHit(d, t, 0.09, 0.18, 988, 0, 'square');
      toneHit(d, t + 0.13, 0.12, 0.18, 1319, 0, 'square');
    },
    gulp(d, t) {
      toneHit(d, t, 0.14, 0.6, 380, 120);
      toneHit(d, t + 0.22, 0.14, 0.6, 330, 100);
    },
    spray(d, t) {
      const n = noiseHit(d, t, 0.55, 0.45, 'highpass', 5000);
      n.g.gain.setValueAtTime(0.0008, t);
      n.g.gain.linearRampToValueAtTime(0.45, t + 0.04);
      n.g.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
    },
    cart(d, t) {
      for (let i = 0; i < 9; i++) noiseHit(d, t + i * 0.08 + Math.random() * 0.03, 0.06, 0.2, 'bandpass', 2000 + Math.random() * 2000, 5);
      toneHit(d, t, 0.2, 0.3, 90, 60);
    },
  };

  function sfx(name) {
    if (!ctx || !settings.sfx || !FX[name]) return;
    const t = ctx.currentTime + 0.02;
    FX[name](sfxBus, t);
    duck(t, name === 'bus' || name === 'car' || name === 'slosh' ? 1.8 : 0.6);
  }

  // ------------------------------------------------------------- controls
  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
  }

  function setMusic(on) {
    settings.music = !!on; saveSettings();
    if (!ctx) return;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(on ? 1 : 0, ctx.currentTime);
    if (!on) { const w = want; fadeOut(cur); cur = null; want = w; } else if (want && !cur) playMusic(want);
  }

  function setSfx(on) {
    settings.sfx = !!on; saveSettings();
    if (ctx) sfxBus.gain.setValueAtTime(on ? 1 : 0, ctx.currentTime);
  }

  function setVolume(v) {
    settings.volume = Math.max(0, Math.min(10, Math.round(v))); saveSettings();
    if (ctx) master.gain.setTargetAtTime(vol(), ctx.currentTime, 0.05);
  }

  LSJ.Audio = {
    settings, unlock, playMusic, stopMusic, jingle, sfx, setMusic, setSfx, setVolume, compile,
    effects: Object.keys(FX),
    get playing() { return cur ? cur.id : null; },
    // Current output level (peak, rms), for diagnostics.
    level() {
      if (!analyser) return null;
      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      let peak = 0, sum = 0;
      for (const v of buf) { peak = Math.max(peak, Math.abs(v)); sum += v * v; }
      return { peak, rms: Math.sqrt(sum / buf.length), state: ctx.state };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
