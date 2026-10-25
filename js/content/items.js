(function () {
  'use strict';
  const L = LSJ;

  L.cleanSuit = (g) => {
    if (g.flag('suit_clean')) return "The suit is already clean. Don't push your luck.";
    g.set('suit_clean');
    g.lose('stain_pen');
    g.sfx('spray'); g.award('clean_suit');
    return 'You uncap the Kirkwood Stain-B-Gone pen and dab at Ohio. The stain fizzes, shrinks to Rhode Island, then vanishes completely, along with a little polyester and maybe one of your fingerprints. The suit is CLEAN! The pen gives its life in the process.';
  };

  L.stapleReport = (g) => {
    if (g.flag('tps_stapled')) return 'The TPS report already has its cover sheet. Stapling it again would be showing off.';
    if (!g.has('tps_report')) return "You don't have the TPS report.";
    if (!g.has('cover_sheet')) return 'Staple what to it? The memo says it needs the NEW cover sheet.';
    if (!g.has('stapler')) return "You need a stapler. A paper clip would violate Section 4.2 of the employee handbook, and you'd have to fill out a form. A TPS form.";
    g.set('tps_stapled');
    g.lose('cover_sheet');
    g.sfx('stapler'); g.award('staple_report');
    return "KA-CHUNK. Merv's orange stapler bites through the cover sheet and the report like it was born to do this, and it probably was. The TPS report is now complete, compliant, and covered.";
  };

  L.addItem({
    id: 'suit', worn: true,
    name: (g) => (g.flag('suit_clean') ? 'powder-blue leisure suit (spotless)' : 'powder-blue leisure suit (stained)'),
    names: ['suit', 'leisure suit', 'jacket', 'pants', 'polyester', 'stain', 'lapels', 'clothes', 'chili stain', 'ohio'],
    desc: (g) =>
      g.flag('suit_clean')
        ? 'Powder-blue polyester with lapels wide enough to land a small aircraft. Spotless. It practically hums.'
        : 'Powder-blue polyester with lapels wide enough to land a small aircraft. Unfortunately there\'s a stain on the front shaped like the state of Ohio. You believe it\'s chili from the 1998 Super Bowl.',
    verbs: {
      remove: "Jeff hasn't taken off the suit in public since the Incident of '94. We don't talk about the Incident of '94.",
      wear: "You're already wearing it. Spiritually, you were born wearing it.",
      drop: "And walk around in your tank top? This isn't THAT kind of game.",
      take: "You're wearing it.",
      smell: (g) => (g.flag('cologne') ? 'Brut Force and polyester: the smell of victory. Or at least of effort.' : 'Notes of chili, mothball, and desperation.'),
      clean: (g) => (g.has('stain_pen') ? L.cleanSuit(g) : g.flag('suit_clean') ? 'It\'s already clean.' : "You lick your thumb and rub the stain. Now it's a WET stain shaped like Ohio. You need something stronger."),
      eat: 'You consider sucking the chili out of the stain. Then you remember the chili is from 1998.',
    },
    receive: { stain_pen: (g) => L.cleanSuit(g) },
  });

  L.addItem({
    id: 'wallet', name: 'wallet', names: ['wallet', 'billfold', 'money', 'cash', 'dollars'],
    desc: (g) => `A velcro wallet with a faded racing stripe. Inside: ${g.fmt(g.money())}, your Costco card, and a condom from 1991 that is now mostly a historical artifact.`,
    verbs: {
      open: (g) => `RRRRRIP goes the velcro. Inside: ${g.fmt(g.money())}, your Costco card, and a condom from 1991 that is now best considered a historical artifact.`,
      drop: 'Your whole life is in there. Well, $12 and a Costco card. Same thing.',
    },
  });

  L.addItem({
    id: 'keys', name: 'car keys', names: ['keys', 'key', 'car keys', 'keychain', 'disco ball'],
    desc: 'The keys to your 1984 Pontiac Fiero, on a keychain shaped like a tiny disco ball.',
    verbs: { use: 'Use them on the car. In the Shady Pines parking lot. Where you left it. Dead.', drop: 'Jeff once locked these in the car for three days. Never again.' },
  });

  L.addItem({
    id: 'costco_card',
    name: (g) => (g.flag('membership_valid') ? 'Costco card (valid)' : 'Costco card (expired)'),
    names: ['costco card', 'card', 'membership card', 'membership', 'gold star card'],
    desc: (g) =>
      'Your Costco Gold Star membership card. The photo is from 2009: Jeff with a perm and a dream. ' +
      (g.flag('membership_valid') ? 'It now has a shiny "RENEWED" sticker on it.' : 'Stamped in red: EXPIRED.'),
    verbs: { eat: 'It is not a Costco sample.', drop: 'You might need that.' },
  });

  L.addItem({
    id: 'tps_report',
    name: (g) => (g.flag('tps_stapled') ? 'TPS report (with cover sheet)' : 'TPS report'),
    names: ['tps report', 'report', 'tps', 'tps reports', 'testing procedure specification'],
    desc: (g) =>
      g.flag('tps_stapled')
        ? 'Your TPS report, with the NEW cover sheet stapled to the front in perfect compliance. It looks beautiful. Pointless, but beautiful.'
        : 'Your weekly TPS report: 40 pages of numbers nobody will read. Per the memo, it needs the NEW cover sheet.',
    verbs: {
      read: 'Page 1: "Testing Procedure Specification." Page 2: blank. Page 3: still blank. Page 40: "Synergy." You wrote this in 11 minutes on Tuesday.',
      staple: (g) => L.stapleReport(g),
      drop: 'Brumley would find out. Brumley ALWAYS finds out.',
      eat: 'That would destroy the evidence, but Brumley would just ask for another one.',
    },
    receive: {
      cover_sheet: (g) => (g.has('stapler') ? L.stapleReport(g) : 'You hold the cover sheet against the report. It needs to be stapled on. With a stapler.'),
      stapler: (g) => L.stapleReport(g),
    },
  });

  L.addItem({
    id: 'cover_sheet', name: 'TPS cover sheet', names: ['cover sheet', 'cover', 'sheet', 'cover page', 'tps cover sheet'],
    desc: 'The NEW TPS cover sheet. It is identical to the old cover sheet, except the logo is 2% bigger.',
    useOn: { tps_report: (g) => (g.has('stapler') ? L.stapleReport(g) : 'It needs to be stapled on. Merv has the only working stapler on the floor.') },
    verbs: { read: 'TESTING PROCEDURE SPECIFICATION - COVER SHEET (rev. 7). "Synergy Starts With You!"' },
  });

  L.addItem({
    id: 'paper', name: 'ream of paper', names: ['paper', 'ream', 'ream of paper', 'printer paper', 'letter paper', 'letter'],
    desc: 'A ream of 500 sheets of letter-size paper, slightly crushed from years of holding up a table.',
    verbs: { eat: 'Fiber is important, but no.', read: "It's blank. Like your mind during the Monday all-hands." },
  });

  L.addItem({
    id: 'cake', name: 'slice of birthday cake', names: ['cake', 'slice', 'slice of cake', 'birthday cake', 'piece of cake'],
    desc: 'A slice of supermarket sheet cake with "...EB" written in blue frosting. Yellow cake. Corner piece. Extra frosting. This is the good slice.',
    verbs: {
      eat: "You raise the cake to your lips... and stop. You have a feeling that someone in this office needs this cake more than you do. And that someone isn't Deb.",
      smell: 'Sugar, frosting, and a hint of the break-room fridge.',
    },
  });

  L.addItem({
    id: 'stapler', name: "Merv's orange stapler", names: ['stapler', 'orange stapler', 'mervs stapler', 'swingline'],
    desc: "A heavy-duty orange stapler. Merv's pride and joy. It is warm, because Merv has been holding it since 2004.",
    useOn: { tps_report: (g) => L.stapleReport(g), cover_sheet: (g) => L.stapleReport(g) },
    verbs: { drop: "Merv would find out. Merv finds out everything. He just doesn't tell anyone.", staple: (g) => L.stapleReport(g) },
  });

  L.addItem({
    id: 'stain_pen', name: 'Stain-B-Gone pen', names: ['pen', 'stain pen', 'stain-b-gone', 'stain b gone', 'stain remover', 'stain b gone pen'],
    desc: 'A Kirkwood Signature Stain-B-Gone pen. "Removes Grass, Wine, Lipstick, and Regret."',
    useOn: { suit: (g) => L.cleanSuit(g), jeff: (g) => L.cleanSuit(g) },
    verbs: { eat: "It's a pen, not a sample." },
  });

  L.addItem({
    id: 'battery', name: 'car battery', names: ['battery', 'car battery', 'new battery', 'dieharder'],
    desc: 'A 40-pound Kirkwood Signature DieHarder car battery. It has the heft of a small child and the personality of one too.',
    verbs: { drop: "You'd never get it back up. Your back made that decision for you.", eat: "That's how you get a Darwin Award." },
  });

  L.addItem({
    id: 'cart', name: 'shopping cart', names: ['cart', 'shopping cart', 'trolley', 'buggy'],
    desc: 'A Costco shopping cart large enough to fit a family of four. The front-left wheel spins and squeaks constantly, like it has something to say.',
    verbs: { drop: 'You park it. Then you un-park it. You need this.', sit: 'You climb into the cart. Nobody pushes you. You climb out.' },
  });

  L.addItem({
    id: 'coupon', name: 'battery coupon', names: ['coupon', 'battery coupon', 'mailer'],
    desc: 'A Costco coupon: "$10 OFF ANY CAR BATTERY. Valid through TODAY ONLY." It smells a little of pizza. Destiny smells like pizza.',
    verbs: { read: '"$10 OFF ANY CAR BATTERY. Valid through TODAY ONLY. Limit one per member."' },
  });

  L.addItem({
    id: 'hot_dog', name: 'hot dog', names: ['hot dog', 'hotdog', 'dog', 'frank', 'wiener', 'hot dog combo'],
    desc: 'A quarter-pound Costco hot dog with soda. Still $1.50, the last fixed point in a changing universe.',
    verbs: {
      eat: (g) => {
        g.lose('hot_dog');
        g.sfx('gulp'); g.award('hot_dog');
        return g.flag('suit_clean')
          ? 'You eat the hot dog leaning forward at a precise 45-degree angle, like a surgeon. Not one drop lands on the suit. A small crowd applauds. (One man. One man applauds.)'
          : "You wolf down the hot dog. A drop of mustard lands right on Ohio. Ohio doesn't notice. Ohio has seen worse.";
      },
    },
  });

  L.addItem({
    id: 'cologne', name: 'Brut Force cologne', names: ['cologne', 'brut force', 'brut', 'aftershave', 'bottle', 'perfume'],
    desc: 'A bottle of Brut Force cologne, circa 1989. "For the man who means business. Any business." There is about one splash left.',
    verbs: {
      wear: (g) => {
        if (g.flag('cologne')) return 'You already smell like a 1989 locker room. Any more and the EPA gets involved.';
        g.set('cologne');
        g.sfx('spray'); g.award('cologne');
        return 'You splash Brut Force on your neck, your wrists, and, for luck, your knees. The air around you shimmers. A fly drops dead somewhere in Ohio. You smell like a CHAMPION.';
      },
      use: (g) => L.items.cologne.verbs.wear(g),
      drink: (g) => g.die('DEATH BY BRUT FORCE', "You take a hearty swig of Brut Force. It tastes like a pine tree that's been through a divorce. Your vision fades to a warm, musky amber. At the funeral, everyone agrees: Jeff smelled great."),
      smell: 'Ooof. Pine, musk, and the 1989 NFL Draft.',
    },
    useOn: { jeff: (g) => L.items.cologne.verbs.wear(g), suit: (g) => L.items.cologne.verbs.wear(g) },
  });

  L.addItem({
    id: 'comb', name: 'comb', names: ['comb', 'pocket comb', 'brush'],
    desc: 'A black plastic pocket comb with two missing teeth. Like its owner, it does its best.',
    verbs: { use: (g) => L.combHair(g), comb: (g) => L.combHair(g) },
    useOn: { jeff: (g) => L.combHair(g) },
  });

  L.addItem({
    id: 'flair', name: 'flair button', names: ['flair', 'button', 'flair button', 'pin', 'badge'],
    desc: 'A round button that reads "I \u2665 SYNERGY". Synergex requires 15 pieces of flair. This is one.',
    verbs: {
      wear: (g) => {
        if (g.flag('flair_worn')) return "You're already wearing it. Proudly. Ish.";
        g.set('flair_worn');
        g.award('wear_flair');
        return 'You pin the "I \u2665 SYNERGY" button to your lapel. Corporate culture achieved. You feel 6% more synergistic and 40% less alive.';
      },
    },
  });
})();
