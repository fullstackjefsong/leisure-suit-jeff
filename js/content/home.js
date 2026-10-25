(function () {
  'use strict';
  const L = LSJ;

  const allDone = (g) => g.flag('paid') && g.flag('car_fixed') && g.flag('suit_clean');

  // ------------------------------------------------------------------ LIVING ROOM
  L.addRoom({
    id: 'home_living', dest: 'home', title: "JEFF'S APARTMENT", names: ['living room', 'apartment', 'bedroom', 'inside', 'apt'],
    art: String.raw`
 ________________________________________________________________________
|  .-------------.        _                           .------.  [PHONE]  |
|  | DOGS PLAYING|       ( )  LAVA      .--------.    |FRIDGE|  [=][o]*  |
|  |   POKER     |       |~|  LAMP      |   TV   |    |      |  blinking |
|  |  (velvet)   |       |~|            |  ~~~~  |    |  __  |           |
|  '-------------'      /___\           '--------'    | |  | |           |
|                                      ____||____      |_|__|_|           |
|   _____________________________                                .----.  |
|  /  ~  ~  ~ WATERBED  ~  ~  ~  /|        ____________          |DOOR|  |
| /______________________________/ |      /   COUCH    /|        | to |  |
| |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|  /     /____________/ |        |LOT |  |
| |_____________________________|/       |____________|/         | o  |  |
|________________________________________________________________________|
                          BATHROOM -->`,
    desc: (g) =>
      "Jeff's one-bedroom apartment, decorated in the style of 'nobody told him the 70s ended.' There's a king-size waterbed, a lava lamp, " +
      'a velvet painting of dogs playing poker, a TV, a plaid couch, and a fridge. ' +
      (g.flag('messages_heard') ? 'The answering machine sits next to the phone. ' : 'The answering machine next to the phone is BLINKING. ') +
      'The front door leads to the parking lot, and the bathroom is down the hall.',
    objects: {
      waterbed: {
        name: 'waterbed', names: ['waterbed', 'bed', 'water bed', 'mattress'],
        defaultFor: ['sleep'],
        desc: 'A king-size waterbed with a padded vinyl frame and leopard-print sheets. It sloshes if you so much as look at it. Sure enough: slosh.',
        verbs: {
          sit: (g) => { g.sfx('slosh'); return 'You sit. The bed sloshes. You slosh. Somewhere, a neighbor bangs on the wall.'; },
          push: 'You press on the waterbed. A wave travels across it, bounces off the far side, and comes back to slap you. Physics!',
          sleep: (g) => {
            if (allDone(g)) {
              g.sfx('slosh'); g.award('act_end');
              g.end('END OF ACT I', 'You flop onto the waterbed. It sloshes in triumph. You got paid, the Fiero runs, and the suit is spotless. Tomorrow you need a date, some dignity, and, according to the reunion committee, ice. But tonight, Jeff sleeps the sleep of a man who completed his TPS report. Sweet dreams, Jeff.');
              return;
            }
            const todo = [];
            if (!g.flag('paid')) todo.push('you still have no paycheck');
            if (!g.flag('car_fixed')) todo.push("your car still won't start");
            if (!g.flag('suit_clean')) todo.push('Ohio is still on your suit');
            g.advance(20);
            g.sfx('slosh');
            return 'You lie down on the waterbed and stare at the ceiling while the bed sloshes. You can\'t sleep. You keep thinking: ' + todo.join(', ') + '. You get back up after twenty restless minutes.';
          },
          kick: 'You kick the waterbed. It wobbles for nine minutes. You watch the whole time. It is the most action this bed has seen since 1996.',
          smell: 'Vinyl and Brut Force. The aroma of a bachelor.',
          flirt: 'You whisper "hey there" to the waterbed. It sloshes back. It is the best response you have had all year.',
        },
      },
      lava_lamp: {
        name: 'lava lamp', names: ['lava lamp', 'lamp', 'lava'],
        desc: 'An amber lava lamp. Blobs rise, split, and sink, like your hopes in a single afternoon.',
        verbs: {
          use: 'You switch on the lava lamp. Amber blobs rise and fall. The mood has been set, for whom nobody knows.',
          take: "It's been plugged into that outlet since 1991. At this point it's load-bearing.",
        },
      },
      painting: {
        name: 'velvet painting', names: ['painting', 'velvet painting', 'dogs', 'poker', 'velvet', 'picture', 'art', 'dogs playing poker'],
        desc: 'Dogs playing poker, on black velvet. The bulldog has a straight flush. The bulldog ALWAYS has a straight flush. You suspect the bulldog cheats.',
        verbs: {
          take: "You've tried taking it down before. The wall behind it is a different color. Let's leave it up.",
          search: "You check behind the painting. Just a rectangle of 1983's paint color. You've been robbed of a hidden safe, which is about right.",
        },
      },
      tv: {
        name: 'TV', names: ['tv', 'television', 'telly', 'set', 'remote'],
        desc: 'A 19-inch TV with rabbit ears wearing tinfoil hats.',
        verbs: {
          use: (g) => { g.advance(5); return 'You flip channels: infomercial, infomercial, a man selling knives, an infomercial about the man selling knives. You turn it off. You have things to do.'; },
          kick: 'You whack the side of the TV like your dad taught you. The picture improves. You turn it off anyway.',
        },
      },
      fridge_h: {
        name: 'fridge', names: ['fridge', 'refrigerator', 'icebox', 'freezer'],
        desc: 'An avocado-green fridge covered in pizza magnets.',
        verbs: {
          open: (g) => { g.set('home_fridge_open'); return 'Inside: one olive, a box of baking soda from 2003, and a deep sense of regret.'; },
          search: (g) => { g.set('home_fridge_open'); return 'Inside: one olive, a box of baking soda from 2003, and a deep sense of regret.'; },
        },
      },
      olive: {
        name: 'olive', names: ['olive', 'baking soda', 'regret'],
        hidden: (g) => !g.flag('home_fridge_open') || g.flag('olive_eaten'),
        desc: 'A single green olive, alone on a shelf. You relate.',
        verbs: {
          eat: (g) => { g.set('olive_eaten'); return 'You eat the last olive. It was the last olive. Somehow you feel worse.'; },
          take: (g) => { g.set('olive_eaten'); return 'You pick up the olive and, in a moment of weakness, eat it. It was the last olive.'; },
        },
      },
      couch: {
        name: 'couch', names: ['couch', 'sofa', 'cushions', 'cushion', 'plaid couch'],
        desc: 'A plaid couch with a permanent Jeff-shaped dent in the middle cushion.',
        verbs: {
          sit: 'You sit in the Jeff-shaped dent. It fits like a glove. A sad, plaid glove.',
          search: (g) => {
            if (g.flag('quarters')) return 'Only crumbs and a TV Guide from 1996 this time. The couch has given all it can.';
            g.set('quarters');
            g.earn(75);
            g.sfx('coins'); g.award('couch_quarters');
            return 'You dig between the cushions and find three quarters, a petrified Cheeto, and a cassette labeled "JEFF\'S SMOOTH MIX VOL. 4". You keep the quarters. [Cash: +$0.75]';
          },
          sleep: "The couch is for napping. You need a proper sleep in the waterbed, and only when the day's work is done.",
        },
      },
      phone: {
        name: 'phone & answering machine', names: ['phone', 'telephone', 'answering machine', 'machine', 'messages', 'message', 'blinking light', 'light'],
        desc: (g) => (g.flag('messages_heard') ? 'A beige phone with an answering machine. 0 NEW MESSAGES. Back to normal.' : 'A beige phone with an answering machine. The light is blinking: 3 NEW MESSAGES. Three! A personal record.'),
        verbs: {
          listen: (g) => L.playMessages(g),
          use: (g) => L.playMessages(g),
          push: (g) => L.playMessages(g),
          call: "Who would you call? Everyone you know is already on the answering machine. Try LISTEN TO MESSAGES.",
        },
      },
      bath_door: { name: 'bathroom door', scenery: true, names: ['hall', 'hallway'], desc: 'The hallway to the bathroom.' },
    },
    verbs: { listen: (g) => L.playMessages(g), call: 'You pick up the phone, then remember everyone you know is already on the answering machine.' },
    exits: [
      { to: 'home_lot', label: 'parking lot (front door)', names: ['door', 'front door', 'parking lot', 'lot', 'outside', 'out', 'car', 'street'] },
      { to: 'home_bath', label: 'bathroom', names: ['bathroom', 'bath', 'restroom', 'washroom', 'loo', 'mirror'] },
    ],
  });

  L.playMessages = (g) => {
    g.set('messages_heard');
    g.sfx('beep'); g.award('messages');
    return (
      'You press PLAY. The tape squeals.\n\n' +
      'BEEP. "Jeffy, it\'s Mom. The reunion is tomorrow night! Wear the nice suit. Not the blue one. ...It\'s always the blue one, isn\'t it. Love you."\n\n' +
      'BEEP. "Hi Jeff! It\'s Tiffany Vance from the Westside High reunion committee! Saturday, 8 PM, in the gym! Everybody\'s bringing a date! Also, you\'re in charge of ice. Okay, bye!"\n\n' +
      'BEEP. "This is Costco Membership Services. Your Gold Star membership has EXPIRED. Please renew at any membership desk. Have a Costco day."\n\n' +
      'END OF MESSAGES.'
    );
  };

  // ------------------------------------------------------------------ BATHROOM
  L.addRoom({
    id: 'home_bath', dest: 'home', title: "JEFF'S BATHROOM", names: ['bathroom', 'bath'],
    art: (g) => String.raw`
 ________________________________________________________________________
|   (avocado-green tile, wall to wall, floor to ceiling)                 |
|                    .---------------------.     .----------------.      |
|                    |                     |     |   MEDICINE     |      |
|                    |       MIRROR        |     |   CABINET      |      |
|                    |                     |     |  ${g.flag('cabinet_open') ? '[  open  ]' : '[ closed ]'}    |      |
|                    '---------------------'     '----------------'      |
|                         ___________                    ______           |
|                        |   SINK    |                  /      \          |
|                        |___ (o) ___|                 | TOILET |  ~drip~ |
|                            |   |                      \______/          |
|                            |   |                       |____|           |
|_______________________________________________________________________|
                         <-- LIVING ROOM`,
    desc: 'A bathroom the size of a phone booth, done in avocado-green from floor to ceiling. There is a mirror over the sink, a medicine cabinet, and a toilet that runs unless you jiggle the handle.',
    objects: {
      mirror: {
        name: 'mirror', names: ['mirror', 'reflection', 'glass'],
        desc: (g) => {
          g.award('look_mirror');
          return 'You gaze into the mirror. A handsome devil gazes back, if the devil were 44 and ate a lot of Costco hot dogs. ' +
            (g.flag('combed') ? 'The hair is a masterpiece. ' : 'The hair needs serious help. ') +
            (g.flag('suit_clean') ? 'The suit is immaculate. ' : 'Ohio is still on your suit. ') +
            (g.flag('cologne') ? 'The air around you shimmers with Brut Force.' : 'Something is missing. Something... musky.');
        },
        verbs: { kick: 'Seven years of bad luck? Jeff can barely survive the next seven hours.', flirt: '"Hey there, good-looking." The mirror says nothing, but it is clearly into you.' },
      },
      cabinet: {
        name: 'medicine cabinet', names: ['medicine cabinet', 'cabinet', 'cupboard'],
        desc: (g) => (g.flag('cabinet_open') ? 'The medicine cabinet is open.' : 'A small mirrored medicine cabinet. It is closed.'),
        verbs: {
          open: (g) => {
            g.set('cabinet_open');
            const bits = [];
            if (!g.has('cologne') && !g.flag('cologne')) bits.push('a bottle of Brut Force cologne');
            if (!g.has('comb')) bits.push('a black pocket comb');
            return 'You open the medicine cabinet. Inside: ' + (bits.length ? bits.join(', ') + ', ' : '') + 'a bottle of hair-growth tonic (empty, obviously), and dental floss still in the shrink-wrap from 2008.';
          },
          search: (g) => L.rooms.home_bath.objects.cabinet.verbs.open(g),
          close: (g) => { g.unset('cabinet_open'); return 'You close the cabinet. Your reflection reappears, disappointed.'; },
        },
      },
      cologne_cab: {
        name: 'cologne', names: ['cologne', 'brut force', 'brut', 'aftershave', 'bottle'],
        hidden: (g) => !g.flag('cabinet_open') || g.has('cologne') || g.flag('cologne_taken'),
        desc: 'A bottle of Brut Force cologne, circa 1989. About one splash left.',
        verbs: {
          take: (g) => { g.set('cologne_taken'); g.give('cologne'); return 'You take the Brut Force. It feels heavy with destiny. And alcohol.'; },
          wear: (g) => { g.set('cologne_taken'); g.give('cologne'); return L.items.cologne.verbs.wear(g); },
        },
      },
      comb_cab: {
        name: 'comb', names: ['comb', 'pocket comb'],
        hidden: (g) => !g.flag('cabinet_open') || g.has('comb'),
        desc: 'A black pocket comb with two missing teeth.',
        verbs: {
          take: (g) => { g.give('comb'); return 'You take the comb and slip it into your breast pocket, the way Fonzie would have wanted.'; },
          use: (g) => { g.give('comb'); return L.combHair(g); },
        },
      },
      sink: {
        name: 'sink', names: ['sink', 'faucet', 'tap', 'water'],
        desc: 'A small sink with a ring of toothpaste that has achieved geological status.',
        verbs: {
          use: 'You wash your hands. Mom would be proud. Then again, Mom thinks the blue suit is a mistake.',
          drink: 'You slurp some tap water. It tastes like pennies and apartment complex.',
        },
        receive: { suit: 'Plain water just turns Ohio into a soggy Ohio. You need a real stain remover.' },
      },
      toilet: {
        name: 'toilet', names: ['toilet', 'john', 'commode', 'handle', 'can'],
        desc: 'An avocado-green toilet that runs constantly. Its handle has to be jiggled. It is a relationship that requires work.',
        verbs: {
          flush: 'WHOOOOSH. The toilet flushes, gurgles, and starts running again. You jiggle the handle. Silence. You and the toilet understand each other.',
          use: "You use the toilet. This is a family-friendly-ish game, so we'll skip ahead. ...And done. Don't forget to wash your hands.",
          push: 'You jiggle the handle. The toilet stops running. For now.',
          sit: 'You sit on the lid and think about your life choices. It is a productive four minutes.',
          drink: "No. Absolutely not. Even Jeff's dog wouldn't, and Jeff doesn't have a dog.",
        },
      },
    },
    exits: [{ to: 'home_living', label: 'living room', names: ['living room', 'out', 'back', 'hall', 'apartment', 'bedroom'] }],
  });

  // ------------------------------------------------------------------ PARKING LOT
  L.addRoom({
    id: 'home_lot', dest: 'home', title: 'SHADY PINES APARTMENTS - PARKING LOT', names: ['parking lot', 'lot', 'outside', 'car'],
    art: (g) => {
      const car = g.carAt() === 'home';
      const hood = g.flag('hood_open');
      return String.raw`
     SHADY PINES APARTMENTS               (no pines, no shade)       _______
  _______________________________                                  |  42   |
 |  [ ]   [ ]   [ ]   [ ]   [#] <-- Jeff's apt                     |  BUS  |
 |  [ ]   [ ]   [ ]   [ ]   [ ]  |                                  | STOP  |
 |_______________[DOOR]__________|       .-----------.             |_______|
                                         | DUMPSTER  |                 |
` + (car ? (hood ? String.raw`        __/ \___________                 |___________|                 |
       |   HOOD UP      \____                                         |
       | 1984 FIERO   ${g.flag('car_fixed') ? '(runs!)' : '(dead) '}   \                                       |
       '--(O)--------(O)--'                                           |` : String.raw`           ______________                |___________|                 |
       ___/  [] []        \____                                       |
      | 1984 PONTIAC FIERO ${g.flag('car_fixed') ? '(runs!)' : '(dead) '}\                                    |
      '--(O)-----------(O)--'                                          |`) : String.raw`                                         |___________|                 |
                                                                      |
              [ space #14: empty ]                                    |
                                                                      |`) + String.raw`
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         (TRAVEL: GO TO WORK / COSTCO by bus or car)`;
    },
    desc: (g) =>
      'The parking lot of the Shady Pines Apartments. There are no pines. There is no shade. ' +
      (g.carAt() === 'home'
        ? 'Your 1984 Pontiac Fiero sits in space #14' + (g.flag('car_fixed') ? ', purring like a slightly asthmatic kitten. ' : ', as dead as disco. ')
        : 'Space #14 is empty. Your Fiero is parked elsewhere. ') +
      'A dumpster festers in the corner, and the Route 42 bus stop is by the street. Your apartment door is behind you.',
    objects: {
      car: {
        name: 'Pontiac Fiero', names: ['car', 'pontiac', 'fiero', 'auto', 'vehicle', 'pontiac fiero', 'ride', 'wheels'],
        hidden: (g) => g.carAt() !== 'home',
        desc: (g) =>
          'Your 1984 Pontiac Fiero in "Champagne Beige." Pop-up headlights, one of which pops up. ' +
          (g.flag('car_fixed') ? 'It runs! Type DRIVE TO <place> to go cruising.' : 'The battery died Tuesday. It has been a long week for both of you.') +
          (g.flag('hood_open') ? ' The hood is open.' : ''),
        verbs: {
          use: (g) => (g.flag('car_fixed') ? 'The Fiero is ready to roll. Type DRIVE TO WORK or DRIVE TO COSTCO.' : 'You turn the key. Click. Click-click. The battery is deader than disco. You need a new car battery.'),
          go: (g) => (g.flag('car_fixed') ? 'You hop in. Type DRIVE TO <place> to go somewhere.' : 'You sit in the driver\'s seat and make "vroom" noises. It doesn\'t help. You need a new battery.'),
          sit: (g) => (g.flag('car_fixed') ? 'You hop in. Type DRIVE TO <place> to go somewhere.' : 'You sit in the car and make "vroom" noises. It doesn\'t help.'),
          open: (g) => L.openHood(g),
          kick: (g) => (g.flag('car_fixed') ? 'Hey! Not the Fiero! It just started trusting you again.' : 'You kick the tire. The hubcap falls off. You put it back on. You need a battery, not anger management.'),
          flirt: 'You run a hand along the Fiero\'s fender and whisper, "Who\'s a pretty car?" A neighbor closes her blinds.',
          close: (g) => { g.unset('hood_open'); return 'You slam the hood shut.'; },
          search: 'Under the seat: four french fries, a Bee Gees cassette, and a parking ticket from 2017. Classic Fiero.',
        },
        receive: { battery: (g) => L.installBattery(g), keys: (g) => L.rooms.home_lot.objects.car.verbs.use(g) },
      },
      hood: {
        name: 'hood', scenery: true, names: ['hood', 'engine', 'old battery', 'dead battery', 'engine compartment', 'bonnet'],
        hidden: (g) => g.carAt() !== 'home',
        desc: (g) => (g.flag('hood_open') ? (g.flag('car_fixed') ? 'A shiny new DieHarder battery sits proudly under the hood.' : 'Under the hood: an old, crusty, extremely dead battery.') : 'The front hood of the Fiero. The engine is in the back, but the battery is up front, because the 80s were a confusing time.'),
        verbs: {
          open: (g) => L.openHood(g),
          close: (g) => { g.unset('hood_open'); return 'You slam the hood shut.'; },
          take: (g) => (g.flag('hood_open') ? (g.flag('car_fixed') ? 'You just put that in.' : "You don't need the old battery. You need a NEW one, from Costco.") : 'Open the hood first.'),
        },
        receive: { battery: (g) => L.installBattery(g) },
      },
      dumpster: {
        name: 'dumpster', names: ['dumpster', 'trash', 'garbage', 'bin', 'trash can'],
        desc: 'A big green dumpster. It smells like a Tuesday that went bad.',
        verbs: {
          search: (g) => {
            if (g.flag('coupon_found')) return "Nothing else in there but things you can't unsee.";
            g.set('coupon_found');
            g.give('coupon');
            g.award('coupon');
            return 'Holding your breath, you dig in. Under a pizza box you find a Costco mailer, and clipped to it: "$10 OFF ANY CAR BATTERY. Valid through TODAY ONLY." Destiny smells like pepperoni. You take the coupon.';
          },
          open: (g) => L.rooms.home_lot.objects.dumpster.verbs.search(g),
          eat: 'No. NO. We are not doing that.',
          smell: "You smell it. Why would you smell it? You knew. You KNEW.",
          go: 'You are not getting IN the dumpster. Searching it is as low as this game goes.',
        },
      },
      bus_stop_h: {
        name: 'bus stop', names: ['bus stop', 'stop', 'bus', 'sign', 'schedule'],
        desc: 'Route 42. Fare: $2.00. It stops at WORK and COSTCO. Type TAKE BUS TO WORK (or COSTCO). Someone has scratched "JEFF WAS HERE" into the pole. You don\'t remember doing that.',
      },
      apartments: { name: 'apartments', scenery: true, names: ['apartments', 'building', 'shady pines', 'windows'], desc: 'Shady Pines Apartments: affordable living for people who have given up on pines.' },
    },
    exits: [{ to: 'home_living', label: 'apartment', names: ['apartment', 'door', 'inside', 'in', 'living room', 'apt', 'bedroom', 'my apartment', 'upstairs'] }],
  });

  L.openHood = (g) => {
    if (g.carAt() !== 'home') return "Your car isn't here.";
    if (g.flag('hood_open')) return 'The hood is already open.';
    g.set('hood_open');
    g.award('open_hood');
    return g.flag('car_fixed')
      ? 'You pop the hood and admire your shiny new battery.'
      : 'You pop the hood. The old battery is crusted with blue-green fuzz and looks deader than a Tuesday night at the Disco Inferno. You need a new one.';
  };

  L.installBattery = (g) => {
    if (g.flag('car_fixed')) return 'The car already has a new battery.';
    if (!g.has('battery')) return "You don't have a battery.";
    const opened = !g.flag('hood_open');
    g.set('hood_open');
    if (opened) g.award('open_hood');
    g.lose('battery');
    g.set('car_fixed');
    g.sfx('car'); g.award('install_battery');
    return (opened ? 'You pop the hood. ' : '') +
      'You yank out the dead battery, heave in the 40-pound DieHarder, and connect red to red and black to black. You only get shocked twice. You turn the key... VRRRROOM! The Fiero roars to life, or at least clears its throat with real conviction. Its one working headlight pops up proudly.\n\nYou can now DRIVE TO places for free!';
  };
})();
