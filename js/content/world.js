(function () {
  'use strict';
  const L = LSJ;

  L.configure({
    startRoom: 'work_cubes',
    startMoney: 1275,
    startMinutes: 14 * 60 + 30, // Friday 2:30 PM
    startInventory: ['suit', 'wallet', 'keys', 'costco_card'],
    carStart: 'home',
    costcoClose: 20 * 60 + 30,

    titleArt: String.raw`
  _     _____ ___ ____  _   _ ____  _____   ____  _   _ ___ _____
 | |   | ____|_ _/ ___|| | | |  _ \| ____| / ___|| | | |_ _|_   _|
 | |   |  _|  | |\___ \| | | | |_) |  _|   \___ \| | | || |  | |
 | |___| |___ | | ___) | |_| |  _ <| |___   ___) | |_| || |  | |
 |_____|_____|___|____/ \___/|_| \_\_____| |____/ \___/|___| |_|
                  _   ______   ______   ______
                 | | |  ____| |  ____| |  ____|
                 | | | |__    | |__    | |__
             _   | | |  __|   |  __|   |  __|
            | |__| | | |____  | |      | |
             \____/  |______| |_|      |_|
        ACT I: "In Search of the Lost Paycheck"
           (c) 1987 Polyester Software, Inc.`,

    deathArt: String.raw`


                         _____________
                        /             \
                       /   R. I. P.    \
                      |                 |
                      |      JEFF       |
                      |   He tried.     |
                      |   Kind of.      |
                      |                 |
                 _____|_________________|_____
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,

    endArt: String.raw`

        *    .   *       .    *   .     *     .    *     .    *
     .     ____  _   _  ____       ___   _____     _    ____ _____   .
          | ___|| \ | ||  _ \     / _ \ |  ___|   / \  / ___|_   _|
     *    |  _| |  \| || | | |   | | | || |_     / _ \| |     | |  *
          | |___| |\  || |_| |   | |_| ||  _|   / ___ \ |___  | |
      .   |_____|_| \_||____/     \___/ |_|    /_/   \_\____| |_|   .
                          _____
              *          |_   _|        Jeff sleeps. The waterbed
                    .      | |          sloshes approvingly.
            .              | |    *
                          _| |_         TO BE CONTINUED IN ACT II:
                 *       |_____|   .    "Saturday Night Jeff-ver"`,

    intro:
      "LEISURE SUIT JEFF, Act I: \"In Search of the Lost Paycheck\"\n\n" +
      "It's 2:30 PM on Friday at Synergex Solutions. Tomorrow night at 8 is the Westside High reunion, " +
      "where Jeff Lovett (44, powder-blue leisure suit, unshakeable optimism) plans to show everyone how well he turned out.\n\n" +
      "Small problem: his Pontiac has a dead battery, his suit has a chili stain shaped like Ohio, and he has $12.75 to his name. " +
      "His boss still hasn't handed over this week's paycheck.\n\n" +
      "Get paid, fix the car, clean the suit, and get a good night's sleep. Type HELP if you're lost. Type HINT if you're REALLY lost.",

    helpText:
      'HOW TO PLAY: type commands in plain English.\n' +
      '  LOOK / LOOK AT <thing>      TAKE <thing>        USE <thing> ON <thing>\n' +
      '  TALK TO <person>            GIVE <thing> TO <person>   OPEN / SEARCH <thing>\n' +
      '  WEAR, EAT, DRINK, BUY, PUT, CLEAN, KICK, SMELL, SIT, SLEEP, FLIRT ...\n' +
      'MOVING: GO <exit> to walk to another screen (exits are listed under the picture).\n' +
      '  GO TO <place> travels across town (HOME, WORK, COSTCO), even if no path is shown.\n' +
      '  DRIVE TO <place> or TAKE BUS TO <place> picks how you get there.\n' +
      'OTHER: INVENTORY (I), SCORE, TIME, MAP, HINT, SAVE [slot], RESTORE [slot], UNDO, RESTART.\n' +
      'TIP: click names under the picture to add them to your command.',

    busLines: [
      'You ride the #42 bus to {dest}, sitting next to a man eating soup out of a thermos lid. He offers you some. You decline. He looks hurt.',
      'The bus to {dest} is packed. A teenager tells you your suit is "lowkey fire." You choose to take this as a compliment.',
      'You take the bus to {dest}. The driver plays smooth jazz the whole way. Jeff hums along. The driver turns it off.',
      'On the bus to {dest}, an old lady asks if you are "one of those disco people." You say yes. She moves seats.',
    ],
    driveLines: [
      'You fire up the Fiero and cruise to {dest} with the windows down and the Bee Gees up. Two pedestrians point. Probably admiringly.',
      'You drive to {dest}. The Fiero makes a noise like a lawnmower clearing its throat, but it gets there. Mostly.',
      'You drive to {dest}, one arm on the window, wearing sunglasses even though it is getting dark. Cool never sleeps.',
    ],
  });

  L.addDestination({
    id: 'home', name: 'Home (Shady Pines Apartments)', prose: 'Shady Pines', short: 'HOME', hub: 'home_lot', known: true,
    names: ['home', 'house', 'apartment', 'my apartment', 'my place', 'shady pines', 'pad', 'crib', 'bachelor pad'],
  });
  L.addDestination({
    id: 'work', name: 'Work (Synergex Solutions)', prose: 'Synergex', short: 'WORK', hub: 'work_lobby', known: true,
    names: ['work', 'office', 'job', 'synergex', 'synergex solutions', 'the office'],
  });
  L.addDestination({
    id: 'costco', name: 'Costco', short: 'COSTCO', hub: 'costco_lot', known: true,
    names: ['costco', 'warehouse', 'store', 'costco warehouse', 'wholesale club'],
    onDepart(g) {
      if (g.has('cart')) {
        g.lose('cart');
        g.say('You return the shopping cart to the cart corral like a decent human being. Civilization thanks you.');
        g.award('return_cart');
      }
    },
    tick(g) {
      const closed = g.minuteOfDay() >= L.config.costcoClose || g.minuteOfDay() < 10 * 60;
      if (closed && g.room() !== 'costco_lot' && g.room() !== 'costco_food') {
        g.say('"ATTENTION COSTCO SHOPPERS: the warehouse is now CLOSED. Please make your way to the registers, and then out of our lives." An employee escorts you to the parking lot.');
        if (g.has('cart')) g.lose('cart');
        g.goto('costco_lot');
      }
    },
  });
  L.addDestination({
    id: 'lefty', name: "Lefty's Lounge", short: "LEFTY'S", hub: null,
    names: ['leftys', 'leftys lounge', 'lefty', 'bar', 'lounge', 'pub'],
    comingSoon: "Lefty's Lounge doesn't open until Act II. Jeff isn't ready for that kind of excitement yet.",
  });
  L.addDestination({ id: 'gym', name: 'Iron Paradise Gym', hub: null, names: ['gym', 'iron paradise', 'health club', 'fitness center'], comingSoon: 'The gym? In Act I? Jeff has to work up to that. (Act II.)' });
  L.addDestination({ id: 'thrift', name: 'Second Chance Thrift', hub: null, names: ['thrift', 'thrift store', 'second chance', 'goodwill'], comingSoon: 'Second Chance Thrift opens in Act II.' });
  L.addDestination({ id: 'disco', name: 'Disco Inferno', hub: null, names: ['disco', 'disco inferno', 'club', 'nightclub', 'karaoke'], comingSoon: 'Disco Inferno opens in Act II. Save your moves.' });
  L.addDestination({ id: 'school', name: 'Westside High (Reunion)', hub: null, names: ['westside', 'westside high', 'high school', 'school', 'reunion', 'gym reunion'], comingSoon: "The reunion is tomorrow night (Act III). You're not ready. Look at you." });

  L.addScores({
    // work
    read_memo: { pts: 1, label: 'read the memo' },
    take_report: { pts: 2, label: 'took the TPS report' },
    print_cover: { pts: 2, label: 'sent the cover sheet to the printer' },
    kick_printer: { pts: 2, label: 'showed the printer who is boss' },
    load_printer: { pts: 3, label: 'PC LOADED LETTER' },
    get_cover: { pts: 2, label: 'got the cover sheet' },
    take_cake: { pts: 2, label: 'acquired cake' },
    merv_stapler: { pts: 5, label: 'earned Merv\'s trust' },
    staple_report: { pts: 5, label: 'TPS report complete' },
    paid: { pts: 10, label: 'got paid' },
    return_stapler: { pts: 3, label: 'returned the stapler' },
    talk_todds: { pts: 2, label: 'survived the consultants' },
    wear_flair: { pts: 2, label: 'minimum flair achieved' },
    solitaire: { pts: 1, label: 'productivity' },
    talk_peggy: { pts: 1, label: 'placed on hold' },
    // home
    couch_quarters: { pts: 2, label: 'couch money' },
    messages: { pts: 2, label: 'checked messages' },
    look_mirror: { pts: 1, label: 'self-reflection' },
    comb_hair: { pts: 3, label: 'magnificent swoop' },
    cologne: { pts: 3, label: 'smells like a winner' },
    coupon: { pts: 4, label: 'dumpster diving' },
    open_hood: { pts: 2, label: 'opened the hood' },
    install_battery: { pts: 10, label: 'the Fiero lives' },
    act_end: { pts: 15, label: 'completed Act I' },
    // costco
    take_cart: { pts: 2, label: 'got a cart' },
    renew: { pts: 5, label: 'Costco member in good standing' },
    eat_sample: { pts: 3, label: 'engaged with the brand' },
    stain_pen: { pts: 4, label: 'got the stain pen' },
    buy_battery: { pts: 8, label: 'bought a battery' },
    use_coupon: { pts: 2, label: 'savvy shopper' },
    hot_dog: { pts: 3, label: 'the $1.50 hot dog' },
    stare_tvs: { pts: 2, label: 'stared at TVs with strangers' },
    return_cart: { pts: 2, label: 'returned the cart' },
    greeter: { pts: 1, label: 'greeted the greeter' },
    // misc
    clean_suit: { pts: 10, label: 'Ohio has been removed' },
    first_drive: { pts: 3, label: 'cruising' },
  });

  L.self = {
    name: 'Jeff',
    names: ['jeff', 'me', 'self', 'myself', 'yourself', 'jeff lovett', 'lovett', 'hair', 'my hair', 'head', 'face'],
    desc: (g) =>
      'Jeff Lovett, 44. Middle manager. Owner of a waterbed. ' +
      (g.flag('combed') ? 'His hair is combed into a magnificent swoop that hides almost everything. ' : 'His hair is doing its own thing, and that thing is retreating. ') +
      (g.flag('suit_clean') ? 'His powder-blue leisure suit is spotless. ' : 'His powder-blue leisure suit has a chili stain shaped like Ohio. ') +
      (g.flag('cologne') ? 'He smells strongly of Brut Force. Strongly.' : 'He smells faintly of copier toner.'),
    verbs: {
      smell: (g) => (g.flag('cologne') ? 'Brut Force. Your eyes water. In a good way.' : "Copier toner and quiet desperation. Maybe there's cologne at home."),
      kick: 'You kick yourself for not doing this sooner. Metaphorically. Your hamstring will not allow the literal version.',
      flirt: 'You wink at yourself. You blush. Ladies, he\'s single.',
      talk: '"You got this, Jeff." "Thanks, Jeff." This is the most supportive conversation you\'ve had all week.',
      eat: 'No.',
      comb: (g) => (g.has('comb') ? L.combHair(g) : "You run your fingers through your hair. Most of it stays. You'll need a real comb."),
    },
  };

  L.combHair = (g) => {
    if (g.flag('combed')) return 'Your hair is already perfect. Touch it again and it might collapse.';
    g.set('combed');
    g.award('comb_hair');
    return 'You use the comb to sweep your hair up, over, and around in a gravity-defying swoop. Viewed from a distance, at night, from the front, Jeff has a full head of hair.';
  };

  L.config.hint = (g) => {
    const f = (k) => g.flag(k);
    if (!f('paid')) {
      if (!g.has('tps_report') && !f('report_given')) return 'HINT: Your boss wants the TPS report. It is on your desk at work. Better read the memo first.';
      if (!f('print_queued') && !f('cover_in_tray') && !g.has('cover_sheet') && !f('tps_stapled')) return 'HINT: The memo says the report needs the NEW cover sheet. Try USE COMPUTER at your desk.';
      if (!f('printer_loaded') && !g.has('cover_sheet') && !f('tps_stapled')) return 'HINT: The printer is out of paper (PC LOAD LETTER). Someone used the paper to prop up a wobbly table in the break room.';
      if (f('cover_in_tray') && !g.has('cover_sheet') && !f('tps_stapled')) return 'HINT: Your cover sheet is waiting in the printer tray in the break room.';
      if (!f('tps_stapled') && !g.has('stapler')) return "HINT: You need a stapler. Merv's orange stapler is his pride and joy. Maybe a slice of birthday cake would soften him up.";
      if (!f('tps_stapled')) return 'HINT: STAPLE REPORT (with the cover sheet and stapler in hand).';
      return "HINT: Give the TPS report to Brumley in his office. He's been waiting. Mmm-kay?";
    }
    if (!f('car_fixed') && !g.has('battery')) {
      if (!f('membership_valid')) return 'HINT: Go to Costco (TAKE BUS TO COSTCO) and renew your expired membership at the membership desk.';
      if (!g.has('cart')) return 'HINT: Car batteries are heavy. Grab a cart from the Costco parking lot.';
      return 'HINT: Car batteries are sold at the tire center, through the aisles. (Psst: the dumpster at home might hold a coupon.)';
    }
    if (!f('suit_clean') && !g.has('stain_pen')) return 'HINT: The sample lady in the Costco aisles is demoing more than cocktail weenies. Try her sample first.';
    if (!f('car_fixed')) return 'HINT: Take the battery home and put it in the car. Opening the hood helps.';
    if (!f('suit_clean')) return 'HINT: USE STAIN PEN ON SUIT.';
    return 'HINT: Everything is done! Go home and sleep in your waterbed.';
  };
})();
