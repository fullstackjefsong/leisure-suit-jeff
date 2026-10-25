(function (root) {
  'use strict';
  const LSJ = (root.LSJ = root.LSJ || {});
  LSJ.rooms = {};
  LSJ.items = {};
  LSJ.destinations = {};
  LSJ.scores = {};
  LSJ.config = {};
  LSJ.addRoom = (r) => (LSJ.rooms[r.id] = r);
  LSJ.addItem = (i) => (LSJ.items[i.id] = i);
  LSJ.addDestination = (d) => (LSJ.destinations[d.id] = d);
  LSJ.addScores = (s) => Object.assign(LSJ.scores, s);
  LSJ.configure = (c) => Object.assign(LSJ.config, c);
})(typeof window !== 'undefined' ? window : globalThis);
