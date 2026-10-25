(function () {
  'use strict';
  const E = LSJ.Engine;
  const $ = (id) => document.getElementById(id);
  const log = $('log');
  const cmd = $('cmd');
  const history = [];
  let hIdx = 0;
  let onTitle = true;

  function print(text, cls) {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    log.appendChild(p);
    while (log.childNodes.length > 300) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }

  function printAll(outputs) {
    for (const o of outputs) print(o.text, o.type === 'text' ? '' : o.type);
  }

  function chip(label, onClick) {
    const s = document.createElement('span');
    s.className = 'chip';
    s.textContent = label;
    s.addEventListener('click', onClick);
    return s;
  }

  function fillChips(el, items, labelOf, onClick) {
    el.innerHTML = '';
    if (!items.length) { el.textContent = '(nothing)'; return; }
    items.forEach((it, i) => {
      if (i) el.appendChild(document.createTextNode(', '));
      el.appendChild(chip(labelOf(it), () => onClick(it)));
    });
  }

  function insertNoun(name) {
    const n = name.replace(/\s*\(.*\)$/, '');
    cmd.value = cmd.value.trim() ? cmd.value.trimEnd() + ' ' + n : 'look at ' + n;
    cmd.focus();
  }

  function render() {
    const v = E.view();
    $('st-score').textContent = `Score: ${v.score} of ${v.maxScore}`;
    $('st-right').textContent = `${v.time}  ${v.money}`;
    const art = $('art');
    art.classList.toggle('death', !!v.dead);
    if (v.dead) art.textContent = LSJ.config.deathArt + '\n\n' + centered(v.dead.title);
    else if (v.ended) art.textContent = LSJ.config.endArt;
    else art.textContent = v.art.replace(/^\n/, '');
    $('loc').textContent = v.dead ? '*** GAME OVER ***' : v.title;
    fillChips($('see'), v.objects, (o) => o.name, (o) => insertNoun(o.name));
    fillChips($('exits'), v.exits, (e) => e.label, (e) => run('go ' + e.label.replace(/\s*\(.*\)$/, '')));
    fillChips($('travel'), v.travel, (t) => t.name, (t) => run('go to ' + t.name.toLowerCase()));
  }

  function centered(s) {
    const pad = Math.max(0, Math.floor((60 - s.length) / 2));
    return ' '.repeat(pad) + s;
  }

  function showTitle() {
    onTitle = true;
    $('art').textContent = LSJ.config.titleArt.replace(/^\n/, '');
    $('loc').textContent = 'A Polyester Software Production';
    $('see').textContent = '';
    $('exits').textContent = '';
    $('travel').textContent = '';
    $('st-score').textContent = '';
    $('st-right').textContent = '';
    print('Press ENTER to begin a new game, or type RESTORE to load your quick-save.', 'system');
  }

  function run(input) {
    if (onTitle) {
      onTitle = false;
      log.innerHTML = '';
      printAll(E.start());
      if (/^\s*(restore|load)\b/i.test(input)) printAll(E.exec(input));
      render();
      return;
    }
    if (!input.trim()) return;
    print('> ' + input.toUpperCase(), 'echo');
    printAll(E.exec(input));
    render();
  }

  cmd.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = cmd.value;
      cmd.value = '';
      if (v.trim()) { history.push(v); hIdx = history.length; }
      run(v);
    } else if (e.key === 'ArrowUp') {
      if (hIdx > 0) { hIdx -= 1; cmd.value = history[hIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (hIdx < history.length - 1) { hIdx += 1; cmd.value = history[hIdx]; } else { hIdx = history.length; cmd.value = ''; }
      e.preventDefault();
    }
  });

  document.addEventListener('click', (e) => {
    if (!window.getSelection().toString() && !e.target.classList.contains('chip')) cmd.focus();
  });

  showTitle();
  cmd.focus();
})();
