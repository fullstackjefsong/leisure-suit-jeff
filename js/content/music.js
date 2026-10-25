// Leisure Suit Jeff soundtrack: original compositions in MIDI-style note data, played by js/audio.js.
//
// Notation (one string per track):
//   NOTE:LEN   note name + octave (C4 = middle C, sharps "#", flats "b"), length in 16th notes
//              (1 = 16th, 2 = 8th, 4 = quarter, 8 = half, 16 = whole). Length carries over if omitted.
//   A+C+E:8    a chord.   r:4  a rest.   |  a bar line (every bar must add up to 16).
// Drum tracks are grids, one character per 16th: x = hit, X = accent, . = rest.
//   k kick, s snare, h closed hat, o open hat, c crash, t tom, p rimshot, w woodblock.
(function (root) {
  'use strict';
  const LSJ = root.LSJ;
  const bars = (...b) => b.join(' | ');
  const times = (n, s) => Array(n).fill(s);
  const rest = (n) => times(n, 'r:16');

  // ------------------------------------------------------------- instruments (2-operator FM patches)
  // ratio: modulator/carrier frequency. i0 -> i1 over it seconds: modulation index envelope (brightness).
  // a/d/s/r: carrier envelope. wave/modWave: OPL2 waveform (sine, half, abs, quarter). vib: [Hz, cents, delay].
  const instruments = {
    sax: { ratio: 1, i0: 3.4, i1: 1.6, it: 0.25, a: 0.03, d: 0.25, s: 0.75, r: 0.1, gain: 0.15, vib: [5.5, 14, 0.25], bend: -60 },
    brass: { ratio: 1, i0: 0.6, i1: 2.6, it: 0.08, a: 0.04, d: 0.2, s: 0.8, r: 0.1, gain: 0.09, vib: [5, 6, 0.3] },
    trombone: { ratio: 1, i0: 1, i1: 2.2, it: 0.12, a: 0.06, d: 0.3, s: 0.85, r: 0.25, gain: 0.2, vib: [5, 32, 0.35], bend: -90 },
    epiano: { ratio: 1, i0: 1.8, i1: 0.15, it: 0.6, a: 0.004, d: 1.4, s: 0.25, r: 0.35, gain: 0.06 },
    bass: { ratio: 1, i0: 2.4, i1: 0.7, it: 0.15, a: 0.004, d: 0.5, s: 0.45, r: 0.06, gain: 0.3, wave: 'half' },
    vibes: { ratio: 4, i0: 1.2, i1: 0, it: 0.25, a: 0.002, d: 1.6, s: 0, r: 0.5, gain: 0.13, vib: [5.5, 8, 0.01] },
    marimba: { ratio: 4, i0: 2, i1: 0, it: 0.06, a: 0.002, d: 0.4, s: 0, r: 0.1, gain: 0.2 },
    flute: { ratio: 1, i0: 0.35, i1: 0.25, it: 0.2, a: 0.07, d: 0.3, s: 0.85, r: 0.12, gain: 0.13, vib: [4.8, 16, 0.3] },
    strings: { ratio: 1, i0: 1.1, i1: 0.9, it: 0.5, a: 0.35, d: 0.5, s: 0.85, r: 0.6, gain: 0.04, vib: [4.2, 9, 0.4], modWave: 'half' },
    bell: { ratio: 3.5, i0: 3, i1: 0, it: 0.8, a: 0.002, d: 1.5, s: 0, r: 0.8, gain: 0.14 },
  };

  // ------------------------------------------------------------- "Polyester Nights" (title theme)
  // Swingin' lounge in F: I-VI-ii-V A section, a bluesy bridge, honking sax over walking bass.
  const F6 = 'A3+C4+D4+F4', D7 = 'F#3+A3+C4+D4', Gm7 = 'G3+Bb3+D4+F4', C7 = 'G3+Bb3+C4+E4';
  const Bb7 = 'Ab3+Bb3+D4+F4', G7 = 'G3+B3+D4+F4';
  const charleston = (ch) => `${ch}:4 r:2 ${ch}:2 r:8`;

  const titleLeadA = [
    'r:2 A4:2 C5:2 D5:2 F5:4 D5:4',
    'F#5:2 F5:2 D5:2 C5:2 A4:8',
    'r:2 Bb4:2 D5:2 F5:2 G5:4 F5:2 D5:2',
    'E5:3 D5:1 C5:2 Bb4:2 G4:8',
    'r:2 A4:2 C5:2 D5:2 F5:4 A5:4',
    'Ab5:2 A5:2 F#5:2 D5:2 C5:4 A4:4',
    'Bb4:2 D5:2 G5:2 F5:2 E5:2 C5:2 Bb4:2 G4:2',
    'F4:2 A4:2 C5:2 F5:6 r:4',
  ];
  const titleLeadB = [
    'r:4 D5:2 F5:2 Ab5:4 G5:2 F5:2',
    'D5:12 r:4',
    'r:4 C5:2 D5:2 F5:4 A5:2 G5:2',
    'F5:12 r:4',
    'r:2 B4:2 D5:2 F5:2 A5:4 G5:4',
    'F5:2 D5:2 B4:2 G4:2 A4:8',
    'G4:2 A4:2 Bb4:2 C5:2 D5:2 E5:2 G5:2 Bb5:2',
    'C6:4 r:12',
  ];
  const titleCompA = [F6, D7, Gm7, C7, F6, D7, null, F6].map((c) => (c ? charleston(c) : `${Gm7}:4 r:4 ${C7}:4 r:4`));
  const titleCompB = [Bb7, Bb7, F6, F6, G7, G7, C7].map(charleston).concat([`${C7}:4 r:12`]);
  const walk = (s) => s.split(' ').map((n) => n + ':4').join(' ');
  const titleBassA = (lastBar) => [
    'F2 A2 C3 D3', 'D2 F#2 A2 C3', 'G2 Bb2 D3 Db3', 'C3 Bb2 G2 E2',
    'F2 A2 C3 Eb3', 'D3 C3 A2 F#2', 'G2 Bb2 C3 E2', lastBar,
  ].map(walk);
  const titleBassB = [
    'Bb2 D3 F2 Ab2', 'Bb2 Ab2 G2 Gb2', 'F2 A2 C3 D3', 'F2 D2 E2 F#2',
    'G2 B2 D3 B2', 'G2 F2 D2 B1', 'C2 E2 G2 Bb2',
  ].map(walk).concat(['C2:4 r:12']);
  const titleStabsB = [
    'r:16', 'r:4 Ab4+D5+F5:2 r:2 Ab4+D5+F5:2 r:6', 'r:16', 'r:4 A4+C5+F5:2 r:2 A4+C5+F5:2 r:6',
    'r:16', 'r:8 B4+D5+F5:2 r:2 B4+D5+F5:2 r:2', 'r:16', 'Bb4+E5+G5:4 r:12',
  ];
  const G = {
    k: 'x.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', c: '................',
  };
  const grid = (kind, list) => list.map((b) => (typeof b === 'string' ? b : b[kind] || G[kind] || '................')).join('|');
  const crash = { c: 'x...............' };
  const titleDrumBars = [
    { s: '................', h: 'x.x.x.x.x.x.x.x.' },
    { s: '....x...x.x.xxxx', h: 'x.x.x.x.........' },
    crash, {}, {}, {}, {}, {}, {}, {},
    crash, {}, {}, {}, {}, {}, {}, { k: 'x...............', s: 'X...............', h: '................', c: 'x...............' },
    crash, {}, {}, {}, {}, {}, {}, {},
  ];
  const drums = (barList, kinds) => {
    const o = {};
    for (const k of kinds) o[k] = grid(k, barList);
    return o;
  };

  const title = {
    name: 'Polyester Nights', bpm: 128, swing: 0.6, loopBar: 2,
    tracks: [
      { inst: 'sax', seq: bars(...rest(2), ...titleLeadA, ...titleLeadB, ...titleLeadA) },
      { inst: 'epiano', seq: bars(...rest(2), ...titleCompA, ...titleCompB, ...titleCompA) },
      { inst: 'brass', seq: bars(...rest(2), ...rest(8), ...titleStabsB, ...rest(8)) },
      { inst: 'bass', seq: bars(walk('F2 A2 C3 D3'), walk('Eb3 D3 C3 C2'), ...titleBassA('F2 A2 C3 A2'), ...titleBassB, ...titleBassA('F2 C3 C2 E2')) },
      { drums: drums(titleDrumBars, ['k', 's', 'h', 'c']), vol: 0.9 },
    ],
  };

  // ------------------------------------------------------------- "Waterbed Groove" (Jeff's apartment)
  // Lazy 70s slow jam in C: electric piano, slap-happy bass, vibraphone.
  const homeChords = ['E3+G3+B3+D4', 'G3+C4+E4', 'F3+A3+C4+E4', 'F3+A3+B3+E4', 'G3+B3+D4', 'G3+C#4+E4', 'F3+A3+C4+E4', 'F3+A3+C4+D4'];
  const funk = (s) => { const [R, F, O, X] = s.split(' '); return `${R}:3 r:1 ${R}:2 ${F}:2 r:2 ${O}:2 ${X}:2 ${F}:2`; };
  const homeBass = ['C2 G2 C3 B2', 'A1 E2 A2 G2', 'D2 A2 D3 C3', 'G1 D2 G2 F2', 'E2 B2 E3 D3', 'A1 E2 A2 G2', 'D2 A2 D3 C3', 'G1 D2 G2 F2'].map(funk);
  const home = {
    name: 'Waterbed Groove', bpm: 84, swing: 0.3,
    tracks: [
      {
        inst: 'vibes',
        seq: bars(
          'r:4 G4:2 A4:2 B4:6 G4:2', 'E5:4 D5:2 C5:2 A4:8', 'r:4 F4:2 A4:2 C5:6 D5:2', 'B4:4 A4:2 G4:2 F4:8',
          'r:4 G4:2 B4:2 D5:6 E5:2', 'C#5:4 B4:2 A4:2 G4:8', 'r:2 A4:2 C5:2 D5:2 F5:4 E5:2 D5:2', 'C5:12 r:4',
          'r:4 E5:2 D5:2 B4:4 G4:4', 'A4:2 C5:2 E5:2 G5:2 E5:8', 'r:4 D5:2 C5:2 A4:4 F4:4', 'G4:2 B4:2 D5:2 F5:2 D5:8',
          'r:4 B4:2 D5:2 G5:4 E5:4', 'E5:2 C#5:2 A4:2 G4:2 E4:8', 'F4:2 A4:2 D5:2 F5:2 A5:4 G5:2 F5:2', 'E5:4 D5:4 C5:8',
        ),
      },
      { inst: 'epiano', vol: 1.1, seq: bars(...homeChords.concat(homeChords).map((c) => `${c}:8 r:2 ${c}:6`)) },
      { inst: 'bass', vol: 0.9, seq: bars(...homeBass, ...homeBass) },
      { drums: { k: times(16, 'x.....x...x.....').join('|'), p: times(16, '....x.......x...').join('|'), h: times(16, 'x.x.x.x.x.x.x.x.').join('|') }, vol: 0.6 },
    ],
  };

  // ------------------------------------------------------------- "Please Hold (Synergy Bossa)" (Synergex)
  // Corporate elevator muzak in F. Inoffensive. Aggressively inoffensive.
  const FM7 = 'F3+A3+C4+E4', Gm7b = 'G3+Bb3+D4+F4', C7b = 'G3+Bb3+C4+E4', Am7 = 'G3+A3+C4+E4', D7b = 'F#3+A3+C4+D4';
  const F7 = 'F3+A3+C4+Eb4', BbM7 = 'F3+A3+Bb3+D4', Bbm6 = 'F3+G3+Bb3+Db4';
  const workPads = [FM7, FM7, Gm7b, C7b, Am7, D7b, Gm7b, C7b, FM7, F7, BbM7, Bbm6, Am7, D7b, null, FM7]
    .map((c) => (c ? `${c}:16` : `${Gm7b}:8 ${C7b}:8`));
  const bossa = (s) => { const [R, F] = s.split(' '); return `${R}:6 ${F}:2 ${F}:6 ${R}:2`; };
  const workBass = ['F2 C3', 'F2 C3', 'G2 D3', 'C2 G2', 'A1 E2', 'D2 A2', 'G2 D3', 'C2 G2', 'F2 C3', 'F2 C3', 'Bb1 F2', 'Bb1 F2', 'A1 E2', 'D2 A2', null, 'F2 C3']
    .map((s) => (s ? bossa(s) : 'G2:6 D3:2 C2:6 G2:2'));
  const work = {
    name: 'Please Hold (Synergy Bossa)', bpm: 100, swing: 0,
    tracks: [
      {
        inst: 'flute',
        seq: bars(
          'A4:6 G4:2 F4:4 E4:4', 'F4:12 r:4', 'Bb4:6 A4:2 G4:4 F4:4', 'G4:12 r:4',
          'C5:6 B4:2 A4:4 G4:4', 'F#4:8 A4:4 C5:4', 'Bb4:6 A4:2 G4:4 D5:4', 'C5:12 r:4',
          'A4:4 C5:4 E5:4 D5:4', 'Eb5:8 C5:4 A4:4', 'D5:6 C5:2 Bb4:4 A4:4', 'Db5:8 Bb4:4 G4:4',
          'C5:6 B4:2 A4:4 E4:4', 'F#4:6 G4:2 A4:4 C5:4', 'Bb4:4 D5:4 E5:4 G4:4', 'F4:12 r:4',
        ),
      },
      { inst: 'strings', seq: bars(...workPads) },
      { inst: 'bass', vol: 0.8, seq: bars(...workBass) },
      { drums: { k: times(16, 'x..xx..xx..xx..x').join('|'), p: times(16, 'x..x..x...x..x..').join('|'), h: times(16, 'x.x.x.x.x.x.x.x.').join('|') }, vol: 0.45 },
    ],
  };

  // ------------------------------------------------------------- "Bulk Buy Boogie" (Costco)
  // Oom-pah marimba polka in G. Everything is in bulk, including the cheer.
  const GM = 'B3+D4+G4', CM = 'C4+E4+G4', D7c = 'A3+C4+F#4', G7c = 'B3+D4+F4', Cm = 'C4+Eb4+G4', E7 = 'G#3+D4+E4', A7 = 'G3+C#4+E4', D7d = 'F#3+C4+D4';
  const pah = (c) => `r:4 ${c}:3 r:5 ${c}:3 r:1`;
  const oom = (s) => { const [R, F] = s.split(' '); return `${R}:4 r:4 ${F}:4 r:4`; };
  const costco = {
    name: 'Bulk Buy Boogie', bpm: 150, swing: 0,
    tracks: [
      {
        inst: 'marimba',
        seq: bars(
          'G4:2 B4:2 D5:2 B4:2 G5:4 D5:4', 'E5:2 D5:2 B4:2 G4:2 A4:4 B4:4', 'C5:2 E5:2 G5:2 E5:2 C5:4 E5:4', 'D5:2 B4:2 G4:2 B4:2 D5:8',
          'F#5:2 E5:2 D5:2 C5:2 A4:4 F#4:4', 'A4:2 C5:2 E5:2 F#5:2 A5:8', 'G5:2 F#5:2 G5:2 D5:2 B4:4 G4:4', 'A4:2 B4:2 C5:2 D5:2 E5:2 F#5:2 G5:4',
          'B5:4 G5:2 D5:2 B4:4 D5:4', 'F5:4 D5:2 B4:2 G4:4 B4:4', 'C5:2 D5:2 E5:2 G5:2 C6:4 G5:4', 'Eb5:2 D5:2 C5:2 G4:2 Eb5:8',
          'D5:2 B4:2 D5:2 G5:2 B5:4 A5:4', 'G#5:2 E5:2 B4:2 G#4:2 B4:8', 'A4:2 C#5:2 E5:2 A5:2 F#5:2 D5:2 A4:2 C5:2', 'B4:2 G4:2 D5:4 G5:4 r:4',
        ),
      },
      { inst: 'brass', vol: 0.9, seq: bars(...[GM, GM, CM, GM, D7c, D7c, GM, D7c, GM, G7c, CM, Cm, GM, E7].map(pah), `r:4 ${A7}:3 r:5 ${D7d}:3 r:1`, pah(GM)) },
      { inst: 'bass', seq: bars(...['G2 D2', 'G2 D2', 'C3 G2', 'G2 D2', 'D2 A2', 'D2 A2', 'G2 D2', 'D2 A2', 'G2 D2', 'G2 D2', 'C3 G2', 'C3 G2', 'G2 D2', 'E2 B2', 'A2 D3', 'G2 D2'].map(oom)) },
      {
        drums: {
          k: times(16, 'x.......x.......').join('|'),
          s: times(16, '....x.......x...').join('|'),
          h: times(16, 'x.x.x.x.x.x.x.x.').join('|'),
          w: times(16, '..............x.').join('|'),
          c: ['x...............', ...times(7, '................'), 'x...............', ...times(7, '................')].join('|'),
        },
        vol: 0.7,
      },
    ],
  };

  // ------------------------------------------------------------- jingles
  const points = {
    name: 'Points!', bpm: 200, free: true, vol: 0.9,
    tracks: [
      { inst: 'marimba', seq: 'C5:1 E5:1 G5:1 C6:3' },
      { inst: 'bell', vol: 0.5, seq: 'r:3 C6:3' },
    ],
  };
  const death = {
    name: 'Wah-Wah-Waaah', bpm: 76, free: true,
    tracks: [
      { inst: 'trombone', seq: 'Bb3:4 A3:4 Ab3:4 G3:14' },
      { inst: 'bass', vol: 0.6, seq: 'Bb2:4 A2:4 Ab2:4 G1:14' },
      { drums: { t: 'x...x...x...x' }, vol: 0.6 },
    ],
  };
  const fanfare = {
    name: 'Act I Fanfare', bpm: 132,
    tracks: [
      { inst: 'brass', vol: 1.4, seq: bars('G4:2 G4:1 G4:1 C5:2 E5:2 G5:4 E5:2 G5:2', 'C6:16') },
      { inst: 'brass', vol: 1.1, seq: bars('E4:2 E4:1 E4:1 G4:2 C5:2 E5:4 C5:2 E5:2', 'E5+G5:16') },
      { inst: 'sax', seq: bars('r:16', 'r:4 G5:2 A5:2 Bb5:2 B5:2 C6:4') },
      { inst: 'bass', seq: bars('C3:2 C3:1 C3:1 E3:2 G3:2 C3:4 G2:2 C3:2', 'C2:16') },
      { drums: { s: 'x.xxx.x.x.x.x.x.|................', k: 'x.......x.......|x...............', c: '................|X...............' } },
    ],
  };

  LSJ.music = {
    instruments,
    songs: { title, home, work, costco, points, death, fanfare },
    // Which song plays at each destination (destination id -> song id).
    themes: { home: 'home', work: 'work', costco: 'costco' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
