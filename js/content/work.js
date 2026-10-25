(function () {
  'use strict';
  const L = LSJ;

  // ------------------------------------------------------------------ LOBBY
  L.addRoom({
    id: 'work_lobby', dest: 'work', title: 'SYNERGEX SOLUTIONS - LOBBY', names: ['lobby', 'reception', 'front desk'],
    art: String.raw`
 ________________________________________________________________________
|  S Y N E R G E X   S O L U T I O N S       .-------------------------.  |
|  "Synergizing Tomorrow's Synergy, Today"    |  T E A M W O R K        |  |
|                                             | None of us is as dumb   |  |
|       ___                                   | as all of us.           |  |
|      (o.o)  PEGGY        .-------.          '-------------------------'  |
|   ____\-/____________    |  [=]  |                TODD      TODD        |
|  | "Please hold."    |   |       |                (o_o)     (o_o)       |
|  |___________________|   |   >   | ELEVATOR      /|##|\    /|##|\       |
|  |                   |   |       | (cubicles)     _|  |______|  |_       |
|  |___________________|   '-------'               |____CONSULTANTS_|     |
|________________________________________________________________________|
       [ glass doors ]  -->  BUS STOP  (TRAVEL: HOME, COSTCO)`,
    desc: (g, first) =>
      'The lobby of Synergex Solutions, where dreams come to get downsized. Peggy the receptionist sits behind the front desk. ' +
      'Two consultants in matching vests, both named Todd, wait on the couch with clipboards. A motivational poster hangs on the wall. ' +
      'The elevator goes up to the cubicles. Outside the glass doors is the bus stop.',
    objects: {
      peggy: {
        name: 'Peggy', person: true, names: ['peggy', 'receptionist', 'woman', 'lady', 'front desk', 'desk'],
        desc: 'Peggy has worked the front desk for 22 years. She has a headset, a beehive hairdo, and a voice that could put a bear on hold.',
        verbs: {
          talk: (g) => {
            g.award('talk_peggy');
            return '"Synergex Solutions, please hold." She presses a button. You are on hold. In person. Smooth jazz plays from somewhere. After a minute she comes back: "Thanks for holding! Oh, Jeff. Brumley\'s looking for your TPS report. Something about a memo?"';
          },
          flirt: 'You lean on the desk and give Peggy your best smoldering look. She presses a button. You are on hold again. The smooth jazz is louder this time. Message received.',
          kick: 'You would never. Peggy controls the phones. Peggy controls EVERYTHING.',
        },
        receive: {
          tps_report: 'Peggy holds up a hand. "Reports go to Brumley. I just transfer people. Please hold."',
          cake: '"Oh hon, I\'m on a cleanse. Give it to someone who really needs it." Her eyes drift meaningfully toward the cubicles.',
        },
      },
      todds: {
        name: 'the Todds', person: true, names: ['todds', 'todd', 'consultants', 'consultant', 'men', 'guys', 'vests'],
        desc: 'Two efficiency consultants in identical fleece vests. They are both named Todd. They are here to "right-size" Synergex. Nobody knows which Todd is which, including the Todds.',
        verbs: {
          talk: (g) => {
            g.award('talk_todds');
            return '"Jeff! Great. Quick one," says Todd. "Walk us through a typical day." You explain: you go to meetings about upcoming meetings, then forward emails to people who were already CC\'d. The other Todd nods slowly. "So you\'re a... human Reply-All." They write SYNERGY RISK on a clipboard and underline it twice.';
          },
          flirt: 'You wink at the Todds. Both Todds write something down. This will come up in your review.',
          kick: 'Kicking a consultant is a great way to become a former employee.',
        },
      },
      poster: {
        name: 'poster', names: ['poster', 'motivational poster', 'teamwork', 'sign'],
        desc: 'A sunset over a rowing team. "TEAMWORK: None of us is as dumb as all of us." Somebody in HR thought this was inspiring. Somebody in HR was wrong.',
        verbs: { take: 'It is bolted to the wall. Management anticipated you.' },
      },
      elevator: {
        name: 'elevator', scenery: true, names: ['elevator', 'lift', 'button'],
        desc: 'The elevator to the cubicle floor. Its inspection certificate expired in 2011. It goes up anyway, out of spite.',
        verbs: { use: (g) => g.goto('work_cubes'), push: (g) => g.goto('work_cubes') },
      },
      bus_stop_w: {
        name: 'bus stop', scenery: true, names: ['bus stop', 'bus', 'glass doors', 'doors', 'stop'],
        desc: 'Outside the glass doors is the Route 42 bus stop. Fare: $2.00. From here you can TAKE BUS TO HOME or COSTCO.',
      },
    },
    exits: [{ to: 'work_cubes', label: 'cubicles (elevator)', sfx: 'ding', names: ['cubicles', 'cubicle', 'cubes', 'elevator', 'upstairs', 'up', 'in', 'inside', 'my desk'] }],
  });

  // ------------------------------------------------------------------ CUBICLES
  L.addRoom({
    id: 'work_cubes', dest: 'work', title: 'SYNERGEX SOLUTIONS - CUBICLE FARM', names: ['cubicles', 'cubicle', 'cubes', 'cubicle farm', 'my desk', 'desk'],
    art: (g) => String.raw`
  ______________     ______________     _____________     _______________
 |  JEFF'S      |   |  MERV'S      |   | (DOWNSIZED)  |   |  BRUMLEY'S    |
 |  CUBICLE     |   |  CUBICLE     |   |              |   |  OFFICE       |
 |    ______    |   |    .---.     |   |   cobwebs    |   |  .---------.  |
 |   |:::::|    |   |   ( -_- )    |   |   ~ ~ ~ ~    |   |  | WORLD'S |  |
 |   |_____| PC |   |   /|   |\    |   |              |   |  | OKAYEST |  |
 |   /_____\    |   |    ${g.flag('stapler_lent') ? '[     ]' : '[STAPL]'}   |   |   one sad    |   |  |  BOSS   |  |
 | ${g.has('tps_report') || g.flag('report_given') ? '     ' : '[TPS]'} [MEMO] |   |    MERV      |   |   ficus      |   |  '---------'  |
 |______________|   |______________|   |______________|   |______________|
       <-- LOBBY (elevator)                         BREAK ROOM -->`,
    desc: (g) =>
      'The cubicle farm: a gray maze of fabric walls and broken dreams. Your cubicle has a PC' +
      (g.has('tps_report') || g.flag('report_given') ? ' and a memo. ' : ', your TPS report, and a memo. ') +
      "Next door, Merv hunches in his cubicle" + (g.flag('stapler_lent') && !g.flag('stapler_returned') ? ', staring at the empty spot where his stapler used to be. ' : ', guarding his beloved orange stapler. ') + "One cubicle sits empty since the last round of 'right-sizing.' " +
      "Brumley's office is at the end of the row. The break room is around the corner, and the elevator goes down to the lobby.",
    objects: {
      computer: {
        name: 'computer', names: ['computer', 'pc', 'monitor', 'screen', 'keyboard', 'terminal', 'email', 'inbox', 'cover sheet template'],
        desc: 'A beige PC running Windows 3.1. Your inbox has 147 unread emails, all Reply-Alls about who microwaved fish in the break room. A folder on the desktop is labeled "NEW TPS COVER SHEET.DOC".',
        verbs: {
          use: (g) => {
            if (g.flag('tps_stapled') || g.has('cover_sheet') || g.flag('cover_in_tray')) return 'You already printed the cover sheet. Printing another would be a waste of paper, and paper is apparently a structural material around here.';
            if (g.flag('print_queued')) return 'The cover sheet is already in the print queue. The printer is waiting for paper: PC LOAD LETTER.';
            g.sfx('printer'); g.award('print_cover');
            if (g.flag('printer_loaded')) {
              g.set('cover_in_tray');
              return 'You open NEW TPS COVER SHEET.DOC and click PRINT. Down the hall, the printer obediently whirs. Your cover sheet is waiting in the break room.';
            }
            g.set('print_queued');
            return 'You open NEW TPS COVER SHEET.DOC and click PRINT. A pop-up appears: "PRINTER ERROR: PC LOAD LETTER." You stare at it. What does that even MEAN? The printer is in the break room.';
          },
          read: 'The latest email, subject "RE: RE: RE: RE: FISH", reads in full: "Per my last email." You do not read the other 146.',
          kick: 'You kick the PC. The monitor flickers and shows a Solitaire win animation. The cards bounce down the screen. It knows.',
        },
      },
      solitaire: {
        name: 'Solitaire', scenery: true, names: ['solitaire', 'game', 'cards', 'minesweeper'],
        desc: 'Solitaire: the backbone of American productivity.',
        verbs: {
          use: (g) => { g.sfx('beep'); g.award('solitaire'); g.advance(10); return 'You play a quick game of Solitaire. You win. The cards bounce across the screen. It is the most fulfilling ten minutes of your work week.'; },
        },
      },
      tps_desk: {
        name: 'TPS report', names: ['tps report', 'report', 'tps', 'tps reports'],
        hidden: (g) => g.has('tps_report') || g.flag('report_given'),
        desc: 'Your weekly TPS report: 40 pages of numbers nobody will read. Per the memo, it needs the NEW cover sheet.',
        verbs: {
          take: (g) => { g.give('tps_report'); g.award('take_report'); return 'You pick up the TPS report. It is warm from the window. Or the radiator. Or shame.'; },
        },
      },
      memo: {
        name: 'memo', names: ['memo', 'note', 'paper memo', 'notice'],
        desc: 'MEMO FROM: Bill Brumley, Division VP of Synergy. RE: TPS reports. "Effective immediately, ALL TPS reports must have the NEW cover sheet attached. The template is on everyone\'s PC. Failure to comply will result in a conversation. Mmm-kay? P.S. Paychecks will be distributed upon receipt of compliant TPS reports."',
        verbs: {
          read: (g) => { g.award('read_memo'); return L.rooms.work_cubes.objects.memo.desc; },
          look: (g) => { g.award('read_memo'); return L.rooms.work_cubes.objects.memo.desc; },
          take: "You don't need the memo. You will never escape the memo. The memo is a state of mind.",
        },
      },
      merv: {
        name: 'Merv', person: true, names: ['merv', 'mervin', 'coworker', 'guy', 'man', 'mervs cubicle'],
        desc: (g) =>
          'Merv has worked here longer than the building. Thick glasses, short-sleeved dress shirt, pocket protector. ' +
          (g.flag('stapler_lent') ? 'He keeps glancing nervously at the empty spot where his stapler usually sits.' : 'He clutches an orange stapler to his chest like a newborn kitten.'),
        verbs: {
          talk: (g) => {
            if (g.flag('stapler_returned')) return '"You... you brought it back. Nobody ever brings things back." Merv strokes the stapler. You have made a friend for life. Possibly against your will.';
            if (g.flag('stapler_lent')) return '"You\'ll... you\'ll bring it back, right? The stapler? Because I was told..." He trails off and stares at the ceiling tiles.';
            return 'Merv mumbles without looking up: "...moved my desk four times... used to be by the window... they had cake today. For Deb. Nobody gave me any. Nobody ever gives me any... and they\'re NOT taking my stapler." He holds the stapler a little tighter.';
          },
          flirt: 'You wink at Merv. Merv slowly slides his chair away from you, one squeak at a time.',
          kick: "You think about kicking Merv's chair. Something in his eyes tells you this would end with the building on fire. You let it go.",
        },
        receive: {
          cake: (g) => {
            g.lose('cake');
            g.set('stapler_lent');
            g.give('stapler');
            g.award('merv_stapler');
            return 'Merv looks at the cake. Then at you. Then at the cake again. His lip quivers. "For... me? Corner piece?" He eats it in four precise bites. Then, with enormous effort, he holds out the orange stapler. "You can... borrow it. BORROW. I\'ll... I\'ll need it back." You now have Merv\'s stapler.';
          },
          stapler: (g) => {
            g.lose('stapler');
            g.set('stapler_returned');
            g.award('return_stapler');
            return "You hand Merv his stapler. He gasps softly, as if reunited with a long-lost twin. \"You brought it back. Nobody ever brings things back.\" For the first time in eleven years, Merv smiles.";
          },
          tps_report: 'Merv squints at the report. "That goes to Brumley. Everything goes to Brumley. And then... it never comes back." He shudders.',
        },
      },
      merv_stapler: {
        name: 'orange stapler', names: ['stapler', 'orange stapler', 'mervs stapler', 'swingline'],
        hidden: (g) => g.flag('stapler_lent') && !g.flag('stapler_returned'),
        desc: "A heavy-duty orange stapler. Merv's pride and joy. The only working stapler on the floor.",
        verbs: {
          take: (g) =>
            g.flag('stapler_returned')
              ? "You already borrowed it once. Don't push your luck. Merv's eye is twitching."
              : 'You reach for the stapler. Merv lets out a low, inhuman sound, like a dial-up modem in pain. You withdraw your hand. Maybe if you did something nice for him first...',
          use: 'Merv is not going to let you use it. Not like this. Not without... a gesture.',
        },
      },
      empty_cube: {
        name: 'empty cubicle', scenery: true, names: ['empty cubicle', 'downsized', 'ficus', 'plant', 'cobwebs', 'empty'],
        desc: "This was Gary's cubicle until the Todds visited. All that's left is a sad ficus and a sign: \"OUT OF OFFICE (PERMANENTLY)\". Gary, we hardly knew ye.",
      },
    },
    exits: [
      { to: 'work_lobby', label: 'lobby', sfx: 'ding', names: ['lobby', 'elevator', 'down', 'downstairs', 'out', 'reception'] },
      { to: 'work_break', label: 'break room', names: ['break room', 'breakroom', 'kitchen', 'kitchenette', 'printer room', 'lounge'] },
      { to: 'work_boss', label: "Brumley's office", names: ['brumleys office', 'boss', 'bosss office', 'boss office', 'office', 'brumley'] },
    ],
  });

  // ------------------------------------------------------------------ BREAK ROOM
  L.addRoom({
    id: 'work_break', dest: 'work', title: 'SYNERGEX SOLUTIONS - BREAK ROOM', names: ['break room', 'breakroom', 'kitchen'],
    art: (g) => String.raw`
 ________________________________________________________________________
| ** MANDATORY FUN FRIDAY!! (attendance will be tracked) **   .--------. |
|                                                             |BULLETIN| |
|  .-------------.     .--------.     ${g.flag('cake_taken') ? '               ' : '  __[CAKE]__   '}       | BOARD  | |
|  |  PRINTER    |     | FRIDGE |     ${g.flag('cake_taken') ? '  (crumbs)     ' : ' |HAPPY BDAY|  '}       | *FLAIR*| |
|  | ${g.flag('printer_loaded') ? '   READY   ' : 'PC LOAD LTR'} |     |  "DO   |     ${g.flag('cake_taken') ? '               ' : ' |__ ..EB __|  '}       '--------' |
|  |  [_______]  |     |  NOT   |    ========================               |
|  |_____________|     | EAT"   |           counter            COFFEE      |
|                      |________|                             [__]~ 1997  |
|                                                         ${g.flag('table_down') ? '  ___________   ' : ' _|________|_   '}  |
|                                                         ${g.flag('table_down') ? ' /__/_____\\__\\  ' : ' |  wobbly  |   '}  |
|                                                         ${g.flag('table_down') ? '  (collapsed)   ' : ' |__[PAPER]_|   '}  |
|________________________________________________________________________|`,
    desc: (g) =>
      'The break room. A banner announces MANDATORY FUN FRIDAY. The printer in the corner ' +
      (g.flag('printer_loaded') ? 'hums contentedly.' : 'blinks an angry error: PC LOAD LETTER.') +
      ' There is a fridge covered in passive-aggressive notes, ' +
      (g.flag('cake_taken') ? 'a counter with nothing but cake crumbs on it, ' : 'a birthday sheet cake on the counter, ') +
      'a coffee pot, and a bulletin board. ' +
      (g.flag('table_down') ? 'The wobbly table has collapsed into modern art.' : 'A wobbly table in the corner is propped up by a ream of printer paper.'),
    objects: {
      printer: {
        name: 'printer', names: ['printer', 'copier', 'laser printer', 'pc load letter', 'error', 'paper tray', 'tray'],
        desc: (g) =>
          g.flag('printer_loaded')
            ? 'The printer hums, satisfied. For now.'
            : 'A massive office printer. Its display flashes: PC LOAD LETTER. Nobody has ever known what that means. Its paper tray is completely empty.',
        verbs: {
          kick: (g) => {
            g.sfx('clunk'); g.award('kick_printer');
            return "You take a deep breath and kick the printer. Then again. Then you're kicking it in slow motion while a rap song plays in your head. It feels AMAZING. The printer, unbowed, still reads PC LOAD LETTER. It needs paper, not therapy.";
          },
          open: (g) => (g.flag('printer_loaded') ? 'The paper tray is full. Life is good.' : 'You open the paper tray. Empty. That explains PC LOAD LETTER. "LOAD LETTER" means... load letter-size paper! Jeff is a genius.'),
          use: (g) => (g.flag('printer_loaded') ? 'It works fine now. Send something from your computer.' : 'PC LOAD LETTER. You need paper first.'),
        },
        receive: {
          paper: (g) => {
            g.lose('paper');
            g.set('printer_loaded');
            g.sfx('printer'); g.award('load_printer');
            if (g.flag('print_queued')) {
              g.unset('print_queued');
              g.set('cover_in_tray');
              return 'You load the ream into the tray. The printer clunks, thinks about it, and then whirs to life. PC LOAD LETTER disappears. Out slides your NEW TPS cover sheet, warm and smug.';
            }
            return 'You load the ream into the tray. PC LOAD LETTER disappears and the display reads READY. Now you just need to print something.';
          },
        },
      },
      tray_cover: {
        name: 'cover sheet', names: ['cover sheet', 'cover', 'sheet', 'printout', 'cover page'],
        hidden: (g) => !g.flag('cover_in_tray') || g.has('cover_sheet') || g.flag('tps_stapled'),
        desc: 'Your NEW TPS cover sheet, sitting in the printer output tray.',
        verbs: {
          take: (g) => { g.give('cover_sheet'); g.unset('cover_in_tray'); g.award('get_cover'); return 'You take the cover sheet from the printer. Still warm. Like a fresh-baked cookie of bureaucracy.'; },
        },
      },
      table: {
        name: 'wobbly table', names: ['table', 'wobbly table', 'leg'],
        desc: (g) => (g.flag('table_down') ? 'The table has collapsed in a heap. Facilities will fix it in six to eight business quarters.' : 'A cheap laminate table with one short leg. Someone has propped it up with an entire ream of printer paper.'),
        verbs: { push: 'It wobbles. The ream of paper underneath is the only thing keeping it upright.', sit: 'You sit on the table. It wobbles ominously. You stand up.' },
      },
      paper_ream: {
        name: 'ream of paper', names: ['paper', 'ream', 'ream of paper', 'printer paper', 'letter paper', 'letter'],
        hidden: (g) => g.flag('table_down'),
        desc: 'A ream of letter-size printer paper, wedged under the short leg of the wobbly table.',
        verbs: {
          take: (g) => {
            g.set('table_down');
            g.give('paper');
            g.sfx('crash');
            return 'You yank the ream out from under the table leg. The table tips, considers its life choices, and collapses with a CRASH. Somewhere, a facilities manager senses a disturbance. You now have a ream of paper.';
          },
        },
      },
      cake: {
        name: 'birthday cake', names: ['cake', 'birthday cake', 'sheet cake', 'slice', 'slice of cake'],
        hidden: (g) => g.flag('cake_taken'),
        desc: 'A supermarket sheet cake reading HAPPY BIRTHDAY DEB. Nobody knows Deb. Deb may not exist. Most of it is gone, but one perfect corner slice remains.',
        verbs: {
          take: (g) => { g.set('cake_taken'); g.give('cake'); g.award('take_cake'); return 'You take the last corner slice of Deb\'s birthday cake. Happy birthday, Deb, whoever you are.'; },
          eat: 'You could eat it here, but you take it instead, just in case. Jeff is many things, but wasteful is only some of them.',
        },
      },
      fridge_w: {
        name: 'fridge', names: ['fridge', 'refrigerator', 'note', 'notes', 'freezer'],
        desc: 'The fridge is covered in notes: "THIS IS NOT YOUR MOTHER. CLEAN UP." "WHOEVER TOOK MY YOGURT: I KNOW." "FISH IS NOT A MICROWAVE FOOD, GREG."',
        verbs: { open: (g) => { g.set('fridge_open_w'); return 'Inside: one container of strawberry yogurt with a label reading "KAREN\'S. DO NOT EAT. I HAVE COUNTED THEM." and a Tupperware that has evolved into a new form of life.'; } },
      },
      yogurt: {
        name: "Karen's yogurt", names: ['yogurt', 'karens yogurt', 'strawberry yogurt', 'tupperware'],
        hidden: (g) => !g.flag('fridge_open_w'),
        desc: '"KAREN\'S. DO NOT EAT. I HAVE COUNTED THEM." The handwriting is shaking with rage.',
        verbs: {
          take: (g) => L.rooms.work_break.objects.yogurt.verbs.eat(g),
          eat: (g) => g.die('KAREN KNOWS', 'You peel back the lid and take a spoonful of strawberry yogurt. A cold breeze sweeps through the break room. The lights flicker. Somewhere behind you, a voice says, "Excuse me. I need to speak to your manager." Jeff is never seen again. HR lists the cause as "Karen."'),
        },
      },
      coffee: {
        name: 'coffee pot', names: ['coffee', 'coffee pot', 'pot', 'coffee maker', 'mug', 'java', '1997'],
        desc: 'A coffee pot with a sign: "FRESH - DO NOT POUR OUT." The sign is dated 1997. The coffee has achieved sentience and is now part of the union.',
        verbs: {
          drink: (g) => g.die('DEATH BY DECAF', 'You pour a cup of the 1997 coffee. It does not so much pour as ooze. You sip. Your heart beats in Morse code: S-O-S. You see a bright light at the end of the tunnel. It\'s the printer. It says PC LOAD JEFF.'),
          take: 'It is legally part of the building.',
          smell: 'It smells like burnt pennies and the Clinton administration.',
        },
      },
      bulletin: {
        name: 'bulletin board', names: ['bulletin board', 'board', 'bulletin', 'flyer', 'flyers', 'notices', 'memos'],
        desc: (g) =>
          'Notices: "HAWAIIAN SHIRT DAY HAS BEEN CANCELLED DUE TO GREG." "LOST: stapler (red). NOT MERV\'S. MERV\'S IS ORANGE." "REMINDER: 15 pieces of FLAIR are the MINIMUM." ' +
          (g.flag('flair_taken') ? '' : 'A spare flair button is pinned to the board.'),
      },
      flair_board: {
        name: 'flair button', names: ['flair', 'button', 'flair button', 'pin', 'badge'],
        hidden: (g) => g.flag('flair_taken'),
        desc: 'A spare "I \u2665 SYNERGY" flair button pinned to the bulletin board.',
        verbs: { take: (g) => { g.set('flair_taken'); g.give('flair'); return 'You take the flair button. It is one of the 15 required pieces. You have one. Progress!'; } },
      },
    },
    exits: [{ to: 'work_cubes', label: 'cubicles', names: ['cubicles', 'cubicle', 'cubes', 'out', 'back', 'my desk'] }],
  });

  // ------------------------------------------------------------------ BOSS
  L.addRoom({
    id: 'work_boss', dest: 'work', title: "SYNERGEX SOLUTIONS - BRUMLEY'S OFFICE", names: ['brumleys office', 'boss office', 'bosss office'],
    art: String.raw`
 ________________________________________________________________________
|  .-------------------.                      .------------------------. |
|  |   WINDOW          |       ,----,         | EMPLOYEE OF THE MONTH: | |
|  |  (view of the     |      / __  \         |   BILL BRUMLEY         | |
|  |   parking lot)    |     | (o)(o)|        |   (12 months running)  | |
|  |___________________|      \  -- /         '------------------------' |
|                         ___/|____|\___                                  |
|         /\              | suspenders |          .---.                   |
|        /  \  GOLF       |____________|          |MUG| "WORLD'S OKAYEST  |
|       |PUTT|  ___________|__________|__________ '---'   BOSS"           |
|        \__/  |          BRUMLEY'S DESK        |                         |
|______________|_______________________________|__________________________|`,
    desc: 'Bill Brumley\'s office. Brumley himself leans back in a leather chair, wearing suspenders and holding a coffee mug that says WORLD\'S OKAYEST BOSS. A putter leans in the corner. The window has a lovely view of the parking lot.',
    objects: {
      brumley: {
        name: 'Brumley', person: true, names: ['brumley', 'bill', 'bill brumley', 'boss', 'manager'],
        desc: 'Bill Brumley: suspenders, a bow tie, and the dead-eyed calm of a man who has never once done a task himself. He has a way of saying "yeahhh" that makes your soul pack a suitcase.',
        verbs: {
          talk: (g) => {
            if (g.flag('paid')) return '"Yeahhh, Jeff. Oh, and I\'m gonna need you to go ahead and come in tomorrow. Sooo, if you could be here around, oh, nine, that\'d be greeaat." You do not answer. Some battles are for Act II.';
            if (g.flag('tps_stapled')) return '"Yeahhh, is that a TPS report I see? With the cover sheet? Go ahead and hand that over and we\'ll talk paycheck. Mmm-kay?"';
            return '"Yeahhh, Jeff. What\'s happening. I\'m gonna need you to go ahead and get me that TPS report. With the NEW cover sheet. Did you get the memo? Because I can have Peggy send you another copy of the memo. Paychecks go out when the reports come in. Mmm-kay? Greeaat."';
          },
          flirt: '"Yeahhh, I\'m gonna need you to go ahead and NOT do that." He writes something on a Post-it and sticks it on your file.',
          kick: 'You imagine it. Oh, you imagine it. But you need that paycheck.',
        },
        receive: {
          tps_report: (g) => {
            if (!g.flag('tps_stapled')) return 'Brumley looks at the report and sighs a long, disappointed sigh. "Yeahhh... it\'s just, we\'re putting the NEW cover sheets on all the TPS reports now. So if you could go ahead and do that, that\'d be greeaat." He hands it back.';
            g.lose('tps_report');
            g.set('report_given');
            g.set('paid');
            g.earn(25000);
            g.sfx('cash'); g.award('paid');
            return 'Brumley inspects the cover sheet. He holds it up to the light. He sniffs it. "Yeahhh... that\'s a cover sheet." He drops the report into a drawer marked SHRED and hands you an envelope. "Payroll is doing a cash thing this week. Don\'t ask." Inside: $250.00! [Cash: +$250.00]\n\n"Oh, and Jeff? Nice suit. Is that... Ohio?"';
          },
          cake: '"Yeahhh, I\'m gonna have to pass. I\'m doing keto. Mmm-kay."',
          stapler: '"Is that Merv\'s stapler? Yeahhh, you might want to give that back before he does something... Merv-ish."',
        },
      },
      putter: {
        name: 'putter', names: ['putter', 'golf club', 'club', 'golf', 'putt'],
        desc: 'A gold-plated putter. Brumley practices his short game during your performance reviews.',
        verbs: { take: '"Yeahhh, I\'m gonna need you to go ahead and put that down." You never even touched it. He just KNEW.' },
      },
      mug: {
        name: 'mug', scenery: true, names: ['mug', 'cup', 'okayest', 'worlds okayest boss'],
        desc: '"WORLD\'S OKAYEST BOSS." He bought it for himself. Unironically.',
        verbs: { take: 'Brumley tightens his grip on the mug. "Mmm, no."' },
      },
      window_b: {
        name: 'window', scenery: true, names: ['window', 'view', 'parking lot'],
        desc: "A gorgeous view of the parking lot. Brumley's Porsche takes up three spaces.",
      },
      plaque: {
        name: 'plaque', scenery: true, names: ['plaque', 'employee of month', 'employee'],
        desc: 'EMPLOYEE OF THE MONTH: BILL BRUMLEY. Twelve months running. He chairs the committee.',
      },
    },
    exits: [{ to: 'work_cubes', label: 'cubicles', names: ['cubicles', 'cubicle', 'cubes', 'out', 'back', 'leave'] }],
  });
})();
