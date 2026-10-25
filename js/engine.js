(function (root) {
  'use strict';
  const LSJ = root.LSJ;

  const DAYS = ['Fri', 'Sat', 'Sun', 'Mon'];
  const BUS_FARE = 200;
  const BUS_MINUTES = 30;
  const CAR_MINUTES = 15;

  const VERB_DEFS = {
    look: ['look', 'l', 'examine', 'x', 'inspect', 'check', 'check out', 'look at', 'view', 'observe', 'study', 'admire', 'watch', 'stare', 'stare at', 'gaze at', 'ogle'],
    search: ['search', 'look in', 'look under', 'look behind', 'look inside', 'look through', 'rummage', 'rummage in', 'rummage through', 'dig', 'dig in', 'dig through', 'check under', 'feel under'],
    read: ['read'],
    take: ['take', 'get', 'grab', 'pick up', 'pick', 'steal', 'snag', 'pocket', 'collect', 'swipe', 'lift', 'borrow', 'accept'],
    drop: ['drop', 'discard', 'throw away', 'toss', 'leave behind'],
    use: ['use', 'operate', 'turn on', 'switch on', 'activate', 'play', 'start', 'boot', 'print', 'log in', 'log into', 'login'],
    open: ['open', 'pop', 'unlock', 'pop open'],
    close: ['close', 'shut'],
    talk: ['talk', 'talk to', 'talk with', 'speak', 'speak to', 'speak with', 'chat', 'chat with', 'ask', 'greet', 'say hi to', 'say hello to', 'converse with', 'hi', 'hello'],
    flirt: ['flirt', 'flirt with', 'hit on', 'wink at', 'wink', 'seduce', 'kiss', 'compliment', 'pick up line', 'smooth talk'],
    give: ['give', 'hand', 'offer', 'show', 'return', 'give back', 'deliver', 'submit', 'turn in', 'hand in'],
    buy: ['buy', 'purchase', 'pay for', 'order'],
    wear: ['wear', 'put on', 'don', 'spray', 'splash', 'pin', 'pin on', 'apply'],
    remove: ['take off', 'remove', 'undress', 'strip'],
    eat: ['eat', 'taste', 'consume', 'try', 'bite', 'devour', 'sample', 'lick'],
    drink: ['drink', 'sip', 'chug', 'gulp', 'quaff', 'pour'],
    sit: ['sit', 'sit on', 'sit in', 'lie on', 'lay on', 'relax', 'lounge', 'lounge on', 'bounce on'],
    sleep: ['sleep', 'nap', 'go to bed', 'go to sleep', 'lie down', 'lay down', 'sleep in', 'sleep on', 'hit hay', 'hit sack', 'turn in for night'],
    kick: ['kick', 'hit', 'punch', 'smash', 'break', 'attack', 'whack', 'beat', 'bash', 'slap', 'thump', 'bang'],
    smell: ['smell', 'sniff', 'whiff'],
    push: ['push', 'press', 'pull', 'move', 'shove', 'jiggle', 'shake', 'wiggle', 'lift up', 'tip'],
    listen: ['listen', 'listen to', 'play messages', 'check messages', 'hear'],
    put: ['put', 'place', 'insert', 'install', 'load', 'attach', 'stick', 'clip', 'fill', 'set', 'connect', 'plug', 'feed', 'refill', 'add'],
    staple: ['staple'],
    clean: ['clean', 'scrub', 'wash', 'rub', 'dab', 'treat', 'remove stain', 'fix stain'],
    renew: ['renew', 'sign up', 'sign up for', 'join', 'reactivate', 'extend'],
    dance: ['dance', 'boogie', 'disco', 'hustle', 'moonwalk'],
    flush: ['flush'],
    comb: ['comb', 'brush', 'style', 'groom', 'fix hair', 'do hair'],
    call: ['call', 'dial', 'phone', 'telephone'],
    wait: ['wait', 'z', 'idle', 'loiter'],
    go: ['go', 'go to', 'go into', 'go in', 'go back to', 'walk', 'walk to', 'walk into', 'run', 'run to', 'head', 'head to', 'head into', 'enter', 'exit', 'leave', 'travel', 'travel to', 'visit', 'return to', 'back to', 'climb', 'get in', 'get into', 'step into', 'move to', 'proceed to'],
    drive: ['drive', 'drive to', 'drive back to', 'drive home'],
    bus: ['bus', 'bus to', 'take bus', 'take bus to', 'ride bus', 'ride bus to', 'catch bus', 'catch bus to', 'board bus', 'board bus to', 'bus home', 'take bus home'],
  };
  const VERB_LIST = [];
  for (const [canon, phrases] of Object.entries(VERB_DEFS)) {
    for (const p of phrases) VERB_LIST.push([p.split(' '), canon]);
  }
  VERB_LIST.sort((a, b) => b[0].length - a[0].length);

  const STOP = new Set(['the', 'a', 'an', 'some', 'my', 'that', 'this', 'these', 'those', 'please', 'around', 'then', 'just', 'again', 'quickly', 'carefully', 'yourself', 'his', 'her']);
  const PREPS = new Set(['on', 'onto', 'to', 'with', 'in', 'into', 'at', 'from', 'under', 'inside', 'for', 'about', 'through']);
  const TWO_OBJ_VERBS = new Set(['use', 'put', 'give', 'staple', 'clean', 'wear', 'drop', 'kick', 'eat', 'drink', 'buy']);

  const tokenize = (s) =>
    String(s).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9$ ]+/g, ' ').split(/\s+/).filter(Boolean);
  const norm = (s) => tokenize(s).filter((t) => !STOP.has(t));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmtMoney = (c) => '$' + (c / 100).toFixed(2);

  function parse(input) {
    const toks = norm(input);
    let verb = null;
    let len = 0;
    for (const [phrase, canon] of VERB_LIST) {
      if (phrase.length <= toks.length && phrase.every((w, i) => toks[i] === w)) {
        verb = canon;
        len = phrase.length;
        break;
      }
    }
    const rest = toks.slice(len);
    // "drive home" / "bus home" consume the word home
    if ((verb === 'drive' || verb === 'bus') && toks.slice(0, len).includes('home')) rest.unshift('home');
    let r = rest;
    while (r.length && PREPS.has(r[0])) r = r.slice(1);
    const idx = r.findIndex((t) => PREPS.has(t));
    const dobj = idx === -1 ? r : r.slice(0, idx);
    const prep = idx === -1 ? null : r[idx];
    const iobj = idx === -1 ? [] : r.slice(idx + 1).filter((t) => !PREPS.has(t));
    return { verb, toks, rest: r, dobj, prep, iobj };
  }

  function matchScore(phraseToks, name) {
    const s = phraseToks.join(' ');
    const n = norm(name).join(' ');
    if (!n) return 0;
    if (s === n) return 1000 + n.length;
    if ((' ' + s + ' ').includes(' ' + n + ' ')) return 500 + n.length;
    if ((' ' + n + ' ').includes(' ' + s + ' ')) return 100 + s.length;
    return 0;
  }

  // ---------------------------------------------------------------------------
  let S = null;
  let out = [];
  let undoStack = [];
  const memStore = {};
  const store = {
    get(k) {
      try { if (root.localStorage) return root.localStorage.getItem(k); } catch (e) { /* ignore */ }
      return memStore[k] || null;
    },
    set(k, v) {
      try { if (root.localStorage) return root.localStorage.setItem(k, v); } catch (e) { /* ignore */ }
      memStore[k] = v;
    },
  };

  const R = () => LSJ.rooms[S.room];
  const D = (id) => LSJ.destinations[id];
  const maxScore = () => Object.values(LSJ.scores).reduce((a, s) => a + s.pts, 0);
  const val = (x, ...args) => (typeof x === 'function' ? x(...args) : x);

  function fmtTime(min) {
    const day = DAYS[Math.floor(min / 1440)] || 'Day ' + Math.floor(min / 1440);
    const m = min % 1440;
    let h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${day} ${h}:${mm} ${ampm}`;
  }

  const say = (text, type = 'text') => {
    if (text != null && text !== '') out.push({ type, text: String(text) });
  };
  const sfx = (name) => out.push({ type: 'sfx', text: name });

  const g = {
    get state() { return S; },
    say: (t) => say(t),
    sfx,
    flag: (k) => !!S.flags[k],
    get: (k) => S.flags[k],
    set: (k, v = true) => { S.flags[k] = v; },
    unset: (k) => { delete S.flags[k]; },
    has: (id) => S.inventory.includes(id),
    give: (id) => { if (!S.inventory.includes(id)) S.inventory.push(id); },
    lose: (id) => { S.inventory = S.inventory.filter((x) => x !== id); },
    money: () => S.money,
    spend: (c) => { if (S.money < c) return false; S.money -= c; return true; },
    earn: (c) => { S.money += c; },
    fmt: fmtMoney,
    award(id) {
      const s = LSJ.scores[id];
      if (!s) throw new Error('Unknown score id: ' + id);
      if (S.scored[id]) return;
      S.scored[id] = true;
      S.score += s.pts;
      say(`[+${s.pts} point${s.pts === 1 ? '' : 's'}: ${s.label}]`, 'score');
    },
    die(title, text) {
      S.dead = { title, text };
      say(text);
      say('*** ' + title + ' ***', 'death');
      say('Type RESTORE, UNDO, or RESTART.', 'system');
    },
    end(title, text) {
      S.ended = { title, text };
      say(text);
      say('*** ' + title + ' ***', 'end');
      say(`Final score: ${S.score} of ${maxScore()}. Type RESTART to play again.`, 'system');
    },
    goto: (id) => enterRoom(id),
    advance: (m) => { S.minutes += m; },
    minuteOfDay: () => S.minutes % 1440,
    time: () => S.minutes,
    learn(id) {
      if (S.known[id]) return;
      S.known[id] = true;
      const d = D(id);
      say(`[New destination unlocked: ${d.name}. Type MAP to see where you can go.]`, 'system');
    },
    room: () => S.room,
    carAt: () => S.carAt,
  };

  function newState() {
    const c = LSJ.config;
    const known = {};
    for (const d of Object.values(LSJ.destinations)) if (d.known) known[d.id] = true;
    return {
      room: c.startRoom,
      inventory: [...(c.startInventory || [])],
      money: c.startMoney || 0,
      minutes: c.startMinutes || 0,
      flags: {},
      scored: {},
      score: 0,
      known,
      carAt: c.carStart || null,
      visited: {},
      moves: 0,
      dead: null,
      ended: null,
    };
  }

  function enterRoom(id) {
    const r = LSJ.rooms[id];
    if (!r) throw new Error('Unknown room: ' + id);
    S.room = id;
    const first = !S.visited[id];
    S.visited[id] = true;
    say(r.title, 'room');
    say(val(r.desc, g, first));
    if (r.onEnter) {
      const t = r.onEnter(g, first);
      if (typeof t === 'string') say(t);
    }
  }

  function visibleObjects() {
    const r = R();
    const list = [];
    for (const [id, def] of Object.entries(r.objects || {})) {
      if (val(def.hidden, g)) continue;
      list.push({ id, def, where: 'room' });
    }
    return list;
  }

  function scope() {
    const list = visibleObjects();
    for (const id of S.inventory) list.push({ id, def: LSJ.items[id], where: 'inv' });
    if (LSJ.self) list.push({ id: 'jeff', def: LSJ.self, where: 'self' });
    return list;
  }

  function resolve(toks) {
    if (!toks.length) return null;
    let best = null;
    let bestScore = 0;
    for (const o of scope()) {
      for (const n of o.def.names || []) {
        const sc = matchScore(toks, n);
        if (sc > bestScore) { bestScore = sc; best = o; }
      }
    }
    return best;
  }

  const nameOf = (o) => val(o.def.name, g) || o.id;

  function run(h, ctx) {
    if (h == null) return false;
    if (typeof h === 'function') {
      const r = h(g, ctx);
      if (r === false) return false;
      if (typeof r === 'string') say(r);
      return true;
    }
    say(h);
    return true;
  }

  // ------------------------------------------------------------------ travel
  function exitsOf(room) {
    return (room.exits || []).filter((e) => !val(e.hidden, g));
  }

  function findExit(toks) {
    let best = null;
    let bestScore = 0;
    for (const e of exitsOf(R())) {
      const names = [...(e.names || []), e.label, ...(LSJ.rooms[e.to].names || [])];
      for (const n of names) {
        const sc = matchScore(toks, n);
        if (sc > bestScore) { bestScore = sc; best = e; }
      }
    }
    return bestScore >= 500 || (best && bestScore > 100) ? best : null;
  }

  function findRoomInDest(toks) {
    const here = R().dest;
    let best = null;
    let bestScore = 0;
    for (const r of Object.values(LSJ.rooms)) {
      if (r.dest !== here || r.id === S.room) continue;
      for (const n of [r.title, ...(r.names || [])]) {
        const sc = matchScore(toks, n);
        if (sc > bestScore) { bestScore = sc; best = r; }
      }
    }
    return bestScore >= 500 ? best : null;
  }

  function findDest(toks) {
    let best = null;
    let bestScore = 0;
    for (const d of Object.values(LSJ.destinations)) {
      for (const n of [d.name, ...(d.names || [])]) {
        const sc = matchScore(toks, n);
        if (sc > bestScore) { bestScore = sc; best = d; }
      }
    }
    return bestScore >= 500 ? best : null;
  }

  function useExit(e) {
    const c = val(e.cond, g);
    if (typeof c === 'string') { say(c); return; }
    if (c === false) return;
    if (S.dead) return;
    if (e.msg) say(val(e.msg, g));
    if (e.sfx) sfx(e.sfx);
    enterRoom(e.to);
  }

  // Walk through same-location rooms (BFS) so "go to break room" works from the lobby.
  function walkTo(roomId) {
    const prev = {};
    const q = [S.room];
    const seen = { [S.room]: true };
    while (q.length) {
      const cur = q.shift();
      if (cur === roomId) break;
      for (const e of LSJ.rooms[cur].exits || []) {
        if (!seen[e.to] && LSJ.rooms[e.to].dest === R().dest) {
          seen[e.to] = true;
          prev[e.to] = { from: cur, exit: e };
          q.push(e.to);
        }
      }
    }
    if (!seen[roomId]) return false;
    const path = [];
    for (let n = roomId; n !== S.room; n = prev[n].from) path.unshift(prev[n].exit);
    for (const e of path) {
      const c = val(e.cond, g);
      if (typeof c === 'string' || c === false || S.dead) {
        if (typeof c === 'string') say(c);
        if (S.room !== e.to && path[0] !== e) enterRoom(S.room);
        return true;
      }
      S.room = e.to;
    }
    enterRoom(roomId);
    return true;
  }

  function travel(dest, mode) {
    const hereId = R().dest;
    if (dest.id === hereId) {
      say(`You're already at ${dest.name}. Look at the exits listed below the picture to move around.`);
      return;
    }
    if (!S.known[dest.id]) {
      say('Jeff has heard of it, but has no idea how to get there yet. Type MAP to see the places you know.');
      return;
    }
    if (dest.comingSoon) { say(val(dest.comingSoon, g)); return; }
    const carHere = g.flag('car_fixed') && S.carAt === hereId;
    const how = mode || (carHere ? 'car' : 'bus');
    if (how === 'car' && !carHere) {
      if (!g.flag('car_fixed')) {
        say("Your 1984 Pontiac Fiero is sitting in the Shady Pines parking lot with a battery deader than disco. It isn't driving anywhere. Try TAKE BUS TO " + dest.name.toUpperCase() + '.');
      } else {
        say(`Your Fiero is parked at ${D(S.carAt).name}. Jeff's Fiero does not come when called. Take the bus.`);
      }
      return;
    }
    if (how === 'bus' && S.money < BUS_FARE) {
      say(`The bus costs ${fmtMoney(BUS_FARE)}. You have ${fmtMoney(S.money)}. The driver has seen your type before.`);
      return;
    }
    const hereDest = D(hereId);
    if (hereDest.onDepart && hereDest.onDepart(g, dest, how) === false) return;
    if (how === 'car') {
      S.carAt = dest.id;
      S.minutes += CAR_MINUTES;
      sfx('car');
      say(pick(LSJ.config.driveLines || ['You drive.']).replace('{dest}', dest.prose || dest.name));
      g.award('first_drive');
    } else {
      S.money -= BUS_FARE;
      S.minutes += BUS_MINUTES;
      sfx('bus');
      say(`[Bus fare: -${fmtMoney(BUS_FARE)}]`, 'system');
      say(pick(LSJ.config.busLines || ['You ride the bus.']).replace('{dest}', dest.prose || dest.name));
    }
    enterRoom(dest.hub);
    if (dest.onArrive) {
      const t = dest.onArrive(g, how);
      if (typeof t === 'string') say(t);
    }
  }

  function doGo(toks, mode) {
    if (!toks.length) {
      if (mode) { say(`${mode === 'car' ? 'Drive' : 'Take the bus'} where? Type MAP for places you know.`); return; }
      const exits = exitsOf(R());
      if (exits.length === 1) return useExit(exits[0]);
      say('Go where? Exits: ' + exits.map((e) => e.label).join(', ') + '. Or GO TO a place on your MAP.');
      return;
    }
    if (!mode) {
      const e = findExit(toks);
      if (e) return useExit(e);
      const room = findRoomInDest(toks);
      if (room && walkTo(room.id)) return;
    }
    const dest = findDest(toks);
    if (dest) return travel(dest, mode);
    if (!mode) {
      const o = resolve(toks);
      if (o && o.def.verbs && o.def.verbs.go && run(o.def.verbs.go, {})) return;
      if (o) { say(`You walk up to the ${nameOf(o)}. You are now slightly closer to it. Congratulations.`); return; }
    }
    say(`Jeff doesn't know any place called "${toks.join(' ')}". Type MAP for places you know, or look at the exits listed below the picture.`);
  }

  // ------------------------------------------------------------------ verbs
  const DEFAULTS = {
    look: (o) => `It's ${/^[A-Z]/.test(nameOf(o)) ? nameOf(o) : 'a ' + nameOf(o)}. It looks exactly like you'd expect.`,
    take: (o) => (o.where === 'inv' ? 'You already have it. Jeff is many things, but forgetful about his own pockets is only one of them.' : pick(["You can't take that.", "It's not yours. Jeff has a strict policy against stealing. Mostly because he's bad at it.", "Nice try, but it's not going anywhere."])),
    drop: (o) => (o.where === 'inv' ? "You'd better hang on to that." : "You don't have it."),
    use: () => pick(["You can't figure out how to use that.", "Jeff fiddles with it. Nothing happens. Story of his life.", 'Use it how, exactly?']),
    open: () => "It doesn't open.",
    close: () => "It isn't open.",
    talk: (o) => (o.def.person ? `${nameOf(o)} doesn't seem to want to talk right now.` : pick(["It doesn't answer. Even inanimate objects ignore Jeff.", "You talk to it. It's a good listener, at least."])),
    flirt: (o) => (o.def.person ? `You raise one eyebrow at ${nameOf(o)}. Nothing happens, except you now have a cramp in your eyebrow.` : "You wink at it. Jeff, it's an object. Even for you, that's a new low."),
    give: (o) => `Give the ${nameOf(o)} to whom?`,
    buy: () => "That's not for sale. Not everything has a price, Jeff. Just most things.",
    wear: () => "You can't wear that. Well, you could, but you'd get arrested.",
    remove: () => "You're not wearing that.",
    eat: () => pick(['Even Jeff has standards. Low ones, but standards.', "That's not food. Put it down."]),
    drink: () => "You can't drink that. You checked.",
    sit: () => "You can't sit on that.",
    sleep: () => "You can't sleep here. Jeff needs his waterbed.",
    kick: (o) => (o.def.person ? "Violence isn't the answer. Also, they'd win." : 'You kick it. Your toe hurts. The object does not care.'),
    smell: () => 'It smells like the 1980s: faint, sad, and slightly of Aqua Net.',
    push: () => 'Nothing happens.',
    listen: () => 'You hear nothing special.',
    put: () => 'Put it where? Try USE <item> ON <something>.',
    staple: () => "You don't need to staple that.",
    clean: () => 'Cleaning that is not your top priority.',
    renew: () => "That doesn't need renewing. Unlike your Costco membership, maybe.",
    dance: () => 'You bust a move. The object is unimpressed.',
    flush: () => "You can't flush that.",
    comb: () => "That doesn't need combing.",
    call: () => "You can't call that.",
    search: (o) => `You search the ${nameOf(o)} and find nothing of interest.`,
    read: (o) => `There's nothing to read on the ${nameOf(o)}.`,
  };

  const NO_OBJ = {
    look: () => describeRoom(),
    dance: () => "You do your signature move: the Lovett Hustle. A combination of the Hustle and a hamstring injury. Nobody's watching, which is probably best.",
    sleep: () => "There's nowhere to sleep here. Jeff needs his waterbed. Go HOME first.",
    listen: () => 'You hear the hum of fluorescent lights and, faintly, your own regrets.',
    smell: () => 'You smell polyester. That would be you.',
    sit: () => "There's nowhere good to sit. Jeff remains standing, majestically.",
    wait: () => { S.minutes += 15; return 'You wait 15 minutes. Time, like your hairline, marches on.'; },
    flirt: () => 'Flirt with whom? There has to be someone there, Jeff. That was the problem in college.',
    kick: () => 'You kick the air. Karate class pays off.',
    call: () => 'Call whom? The only phone you have is the one at home.',
    clean: () => 'Clean what?',
    comb: () => "With what? Your fingers? You've tried. It wasn't pretty.",
    renew: () => 'Renew what?',
    talk: () => 'Talk to whom?',
    buy: () => 'Buy what?',
    flush: () => 'Flush what?',
  };

  function describeRoom() {
    const r = R();
    say(r.title, 'room');
    say(val(r.desc, g, false));
  }

  function act(p) {
    const { verb } = p;
    if (verb === 'go' && !p.rest.length && ['enter', 'in'].includes(p.toks[0])) return doGo(['inside']);
    if (verb === 'go' && !p.rest.length && ['exit', 'leave'].includes(p.toks[0])) return doGo(['out']);
    if (verb === 'go') return doGo(p.rest);
    if (verb === 'drive') return doGo(p.rest, 'car');
    if (verb === 'bus') return doGo(p.rest, 'bus');

    const roomVerb = R().verbs && R().verbs[verb];

    if (!p.dobj.length) {
      if (roomVerb && run(roomVerb, {})) return;
      for (const o of visibleObjects()) {
        if (o.def.verbs && o.def.verbs[verb] && o.def.defaultFor && o.def.defaultFor.includes(verb)) {
          if (run(o.def.verbs[verb], { verb })) return;
        }
      }
      if (NO_OBJ[verb]) return run(NO_OBJ[verb], {});
      say(`What do you want to ${p.toks[0]}?`);
      return;
    }

    const A = resolve(p.dobj);
    if (!A) {
      // single-word/phrase input that is actually a place
      const e = findExit(p.dobj);
      if (e && (verb === 'use' || verb === 'take')) return useExit(e);
      say(pick([
        `You don't see any "${p.dobj.join(' ')}" here.`,
        `"${p.dobj.join(' ')}"? Jeff looks around blankly. Not here.`,
      ]));
      return;
    }

    if (p.iobj.length && verb !== 'talk' && verb !== 'take' && verb !== 'look' && verb !== 'search') {
      const B = resolve(p.iobj);
      if (!B) { say(`You don't see any "${p.iobj.join(' ')}" here.`); return; }
      let instr = A;
      let target = B;
      if (p.prep === 'with' && verb !== 'flirt') { instr = B; target = A; }
      const ctx = { verb, instr, target };
      const h1 = instr.def.useOn && instr.def.useOn[target.id];
      if (h1 != null && run(h1, ctx)) return;
      const h2 = target.def.receive && target.def.receive[instr.id];
      if (h2 != null && run(h2, ctx)) return;
      if (verb === 'give') { say(target.def.person ? `${nameOf(target)} doesn't want the ${nameOf(instr)}.` : "You can't give things to objects. They never say thank you."); return; }
      say(pick(['That doesn\'t do anything.', `Using the ${nameOf(instr)} on the ${nameOf(target)} accomplishes nothing, except making Jeff look busy.`]));
      return;
    }

    const ctx = { verb, about: p.iobj.length ? resolve(p.iobj) : null };
    const verbs = A.def.verbs || {};
    if (verbs[verb] != null && run(verbs[verb], ctx)) return;
    if ((verb === 'read' || verb === 'search') && verbs.look != null) { if (run(verbs.look, ctx)) return; }
    if (verb === 'look' || verb === 'read' || verb === 'search') {
      if (A.def.desc != null) return void say(val(A.def.desc, g));
    }
    if (verb === 'flirt' && verbs.talk != null && !A.def.person) { /* fall through */ }

    // Item used/put/given without a target: find a single sensible target in view.
    if (['use', 'put', 'give', 'staple', 'clean', 'wear'].includes(verb)) {
      const candidates = [];
      for (const o of scope()) {
        if (o.id === A.id) continue;
        if (A.def.useOn && A.def.useOn[o.id] != null) candidates.push([A.def.useOn[o.id], o]);
        else if (o.def.receive && o.def.receive[A.id] != null) candidates.push([o.def.receive[A.id], o]);
      }
      if (candidates.length === 1) {
        if (run(candidates[0][0], { verb, instr: A, target: candidates[0][1] })) return;
      }
    }

    if (verb === 'look' && A.where === 'self') return void say(val(LSJ.self.desc, g));
    const d = DEFAULTS[verb];
    say(d ? d(A) : "You can't do that.");
  }

  // ------------------------------------------------------------------ meta
  function help() {
    say(LSJ.config.helpText || 'Type commands like LOOK, TAKE <thing>, GO TO <place>.', 'system');
  }

  function inventory() {
    const items = S.inventory.filter((id) => !LSJ.items[id].worn).map((id) => val(LSJ.items[id].name, g));
    const worn = S.inventory.filter((id) => LSJ.items[id].worn).map((id) => val(LSJ.items[id].name, g));
    say('You are carrying: ' + (items.length ? items.join(', ') : 'nothing but hope') + '.');
    if (worn.length) say('You are wearing: ' + worn.join(', ') + '.');
    say('Cash: ' + fmtMoney(S.money) + '.');
  }

  function map() {
    const lines = ['PLACES JEFF KNOWS:'];
    for (const d of Object.values(LSJ.destinations)) {
      if (S.known[d.id]) {
        const here = R().dest === d.id ? '  <- you are here' : '';
        const car = S.carAt === d.id ? (g.flag('car_fixed') ? '  [your car]' : '  [your dead car]') : '';
        lines.push(`  ${d.name}${d.comingSoon ? ' (coming in a future act)' : ''}${here}${car}`);
      } else {
        lines.push('  ???');
      }
    }
    lines.push(`Bus: ${fmtMoney(BUS_FARE)}, ${BUS_MINUTES} min.  Car: free, ${CAR_MINUTES} min (if it runs).`);
    lines.push('Type GO TO <place>, DRIVE TO <place>, or TAKE BUS TO <place>.');
    say(lines.join('\n'), 'system');
  }

  function snapshot() {
    undoStack.push(JSON.stringify(S));
    if (undoStack.length > 30) undoStack.shift();
  }

  function meta(toks, raw) {
    const w = toks[0];
    const rest = toks.slice(1).join(' ');
    switch (w) {
      case 'help': case '?': case 'commands': help(); return true;
      case 'i': case 'inv': case 'inventory': case 'items': case 'pockets': inventory(); return true;
      case 'score': case 'points': say(`Score: ${S.score} of ${maxScore()}. Jeff has made ${S.moves} moves.`, 'system'); return true;
      case 'time': case 'clock': say(`It is ${fmtTime(S.minutes)}.`, 'system'); return true;
      case 'map': case 'places': case 'destinations': case 'where': map(); return true;
      case 'hint': case 'hints': say(LSJ.config.hint ? LSJ.config.hint(g) : 'No hints.', 'system'); return true;
      case 'save': {
        const slot = rest || 'quick';
        store.set('lsj-save-' + slot, JSON.stringify(S));
        say(`Game saved to slot "${slot}".`, 'system');
        return true;
      }
      case 'restore': case 'load': {
        if (w === 'load' && toks.length > 1 && resolve(norm(rest))) return false;
        const slot = rest || 'quick';
        const data = store.get('lsj-save-' + slot);
        if (!data) { say(`No saved game in slot "${slot}".`, 'system'); return true; }
        S = JSON.parse(data);
        say(`Game restored from slot "${slot}".`, 'system');
        describeRoom();
        return true;
      }
      case 'restart': { const o = start(); out.push(...o); return true; }
      case 'undo': case 'oops': {
        if (!undoStack.length) { say('Nothing to undo.', 'system'); return true; }
        S = JSON.parse(undoStack.pop());
        say('Undone. Time rewinds. If only real life had this.', 'system');
        describeRoom();
        return true;
      }
      case 'quit': case 'q': say("There's no quitting in Leisure Suit Jeff. Only RESTART and quiet despair.", 'system'); return true;
      case 'xyzzy': say('A hollow voice says "Wrong game, pal."'); return true;
      default: return false;
    }
  }

  // ------------------------------------------------------------------ api
  function start() {
    S = newState();
    out = [];
    undoStack = [];
    say(LSJ.config.intro, 'intro');
    enterRoom(S.room);
    return flush();
  }

  function flush() {
    const o = out;
    out = [];
    return o;
  }

  function exec(raw) {
    out = [];
    const input = String(raw || '').trim();
    if (!input) return flush();
    const toks = norm(input);
    const rawToks = tokenize(input);
    if (S.dead || S.ended) {
      if (['restore', 'load', 'restart', 'undo', 'oops', 'help', 'score'].includes(rawToks[0])) meta(rawToks, input);
      else say(S.dead ? 'Jeff is in no condition to do that. Type RESTORE, UNDO, or RESTART.' : 'This act is over! Type RESTART to play again.', 'system');
      return flush();
    }
    if (meta(rawToks, input)) return flush();
    if (!toks.length) { say("Huh? Jeff doesn't understand. Then again, Jeff rarely does."); return flush(); }

    snapshot();
    let p = parse(input);
    if (!p.verb) {
      // Bare place/exit/object names: "bathroom", "costco"
      const e = findExit(toks);
      const d = findDest(toks);
      if (e) p = { verb: 'go', rest: toks, dobj: toks, iobj: [], toks };
      else if (d) p = { verb: 'go', rest: toks, dobj: toks, iobj: [], toks };
      else if (resolve(toks)) p = { verb: 'look', rest: toks, dobj: toks, iobj: [], toks: ['look', ...toks] };
      else {
        undoStack.pop();
        say(pick([
          `I don't understand "${input}". Jeff's vocabulary peaked in 1987. Type HELP for commands.`,
          `"${toks[0]}"? That's not a word Jeff knows. He barely knows "deodorant". Type HELP.`,
          `Sorry, Jeff can't "${toks[0]}". Not in this economy. Type HELP for commands.`,
        ]));
        return flush();
      }
    }
    S.moves += 1;
    S.minutes += 1;
    act(p);
    if (!S.dead && !S.ended) {
      const d = D(R().dest);
      if (d && d.tick) d.tick(g);
      if (!S.dead && R().tick) R().tick(g);
    }
    return flush();
  }

  // Square up the right edge of boxed scenes so hand-drawn art doesn't need exact padding.
  function tidyArt(art) {
    const lines = String(art).split('\n');
    const top = lines.find((l) => /^ _{20,}\s*$/.test(l));
    if (!top) return art;
    const W = top.trimEnd().length + 1;
    return lines
      .map((l) => {
        const t = l.trimEnd();
        if (!t.startsWith('|') || !t.endsWith('|')) return l;
        let inner = t.slice(1, -1).trimEnd();
        const rail = inner.startsWith('_') && inner.endsWith('_');
        if (rail) inner = inner.replace(/_+$/, (u) => u.slice(0, Math.max(1, u.length - Math.max(0, inner.length - (W - 2)))));
        if (inner.length > W - 2) return l;
        return '|' + inner.padEnd(W - 2, rail ? '_' : ' ') + '|';
      })
      .join('\n');
  }

  function view() {
    const r = R();
    const objs = visibleObjects().filter((o) => !o.def.scenery).map((o) => ({ id: o.id, name: nameOf(o) }));
    const exits = exitsOf(r).map((e) => ({ label: e.label }));
    const travel = Object.values(LSJ.destinations)
      .filter((d) => S.known[d.id] && !d.comingSoon && d.id !== r.dest)
      .map((d) => ({ id: d.id, name: d.short || d.name }));
    return {
      score: S.score,
      maxScore: maxScore(),
      time: fmtTime(S.minutes),
      money: fmtMoney(S.money),
      title: r.title,
      dest: r.dest,
      art: tidyArt(val(r.art, g)),
      objects: objs,
      exits,
      travel,
      dead: S.dead,
      ended: S.ended,
    };
  }

  LSJ.Engine = {
    start,
    exec,
    view,
    parse,
    get state() { return S; },
    set state(v) { S = v; },
    api: g,
    fmtTime,
  };
})(typeof window !== 'undefined' ? window : globalThis);
