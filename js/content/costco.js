(function () {
  'use strict';
  const L = LSJ;
  const BATTERY_PRICE = 8999;
  const RENEW_PRICE = 6500;
  const HOT_DOG_PRICE = 150;

  const isClosed = (g) => g.minuteOfDay() >= L.config.costcoClose || g.minuteOfDay() < 10 * 60;

  // ------------------------------------------------------------------ PARKING LOT
  L.addRoom({
    id: 'costco_lot', dest: 'costco', title: 'COSTCO - PARKING LOT', names: ['parking lot', 'lot', 'outside'],
    art: (g) => String.raw`
     _________________________________________________________________
    |   C O S T C O    W H O L E S A L E          [ OPEN 10-8:30 ]    |
    |_________________________________________________________________|
    |      .--------------------.                 .---------.         |
    |      |      ENTRANCE      |                 |  FOOD   |         |
    |      |    >>  [ ]  <<     |                 |  COURT  |         |
    |______|____________________|_________________|_________|_________|
        _ _ _ _ _ _ _ _ _                        ${g.carAt() === 'costco' ? '    ______________    ' : '                      '}
       |=|=|=|=|=|=|=|=|=|  CART CORRAL           ${g.carAt() === 'costco' ? ' __/  []  []      \\__ ' : '   [ empty space ]    '}
       |_|_|_|_|_|_|_|_|_|                        ${g.carAt() === 'costco' ? '| YOUR FIERO (runs!) |' : '                      '}
                                                  ${g.carAt() === 'costco' ? "'--(O)--------(O)---'" : '                      '}
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      BUS STOP (Route 42)          (TRAVEL: GO TO HOME / WORK)`,
    desc: (g) =>
      'The Costco parking lot, a vast asphalt plain where minivans fight to the death for spots. The warehouse entrance looms ahead, and the food court is off to the side. ' +
      (g.has('cart') ? '' : 'A cart corral is full of shopping carts. ') +
      (g.carAt() === 'costco' ? 'Your Fiero is parked crookedly across two spaces. ' : '') +
      'The bus stop is by the road.',
    objects: {
      carts: {
        name: 'shopping carts', names: ['cart', 'carts', 'shopping cart', 'shopping carts', 'cart corral', 'corral', 'trolley', 'buggy'],
        hidden: (g) => g.has('cart'),
        desc: 'A cart corral full of jumbo Costco carts, each big enough to hold a family of four or a pallet of toilet paper.',
        verbs: {
          take: (g) => {
            g.give('cart');
            g.set('cart_taken_once');
            g.sfx('cart'); g.award('take_cart');
            return 'You yank a cart free from the corral. Its front-left wheel immediately starts squeaking and spinning, as if trying to escape. You are now a man with a cart. A man with PURPOSE.';
          },
          push: (g) => L.rooms.costco_lot.objects.carts.verbs.take(g),
          use: (g) => L.rooms.costco_lot.objects.carts.verbs.take(g),
        },
      },
      sign: {
        name: 'sign', scenery: true, names: ['sign', 'hours', 'costco sign'],
        desc: 'COSTCO WHOLESALE. Hours: 10:00 AM - 8:30 PM. Membership required. Dignity optional.',
      },
      fiero_c: {
        name: 'Pontiac Fiero', scenery: true, names: ['car', 'fiero', 'pontiac'],
        hidden: (g) => g.carAt() !== 'costco',
        desc: 'Your Fiero, parked across two spaces. A minivan driver glares at it. The Fiero does not care.',
        verbs: { use: 'Type DRIVE TO HOME or DRIVE TO WORK.' },
      },
      bus_stop_c: { name: 'bus stop', scenery: true, names: ['bus stop', 'bus', 'stop'], desc: 'Route 42 to HOME and WORK. Fare: $2.00.' },
    },
    exits: [
      {
        to: 'costco_entrance', label: 'warehouse entrance', names: ['entrance', 'warehouse', 'inside', 'in', 'store', 'doors', 'costco', 'door'],
        cond: (g) => {
          if (!isClosed(g)) return true;
          if (!g.has('battery') && !g.flag('car_fixed')) {
            g.die('NO BATTERY FOR YOU',
              'The doors are locked. Costco closed at 8:30. Inside, a 40-pound battery sits on a shelf, mocking you. Without it, the Fiero stays dead, Jeff takes the bus to the reunion, and he arrives smelling faintly of thermos soup. The reunion committee puts him in charge of ice for the next twenty years.');
            return false;
          }
          return "The doors are locked. Costco closed at 8:30 PM. Luckily, you already have what you need.";
        },
      },
      { to: 'costco_food', label: 'food court', names: ['food court', 'food', 'hot dog stand', 'snack bar', 'hot dogs'] },
    ],
  });

  // ------------------------------------------------------------------ ENTRANCE
  L.addRoom({
    id: 'costco_entrance', dest: 'costco', title: 'COSTCO - ENTRANCE', names: ['entrance', 'membership desk', 'front'],
    art: String.raw`
 ________________________________________________________________________
|  ===================  WELCOME TO COSTCO  ============================  |
|                                                                       |
|     .---.                                  .------------------------. |
|    ( ^_^ )  GUS                            |   MEMBERSHIP SERVICES  | |
|     /|V|\   (greeter, since 1983)          |    .---.               | |
|      | |    "Card please!"                 |   (o_o) DESK CLERK     | |
|     _| |_                                  |___/|__|\_______________| |
|                                                                       |
|   .------------------------------------------.                        |
|   |  >> TO THE AISLES >>   (members only)    |    <-- PARKING LOT     |
|   '------------------------------------------'    <-- FOOD COURT      |
|_______________________________________________________________________|`,
    desc: (g) =>
      'Just inside the warehouse doors. Gus the greeter, who has worked here since 1983 and will outlive us all, checks membership cards at the entrance to the aisles. ' +
      'To the right is the MEMBERSHIP SERVICES desk, staffed by a clerk with the thousand-yard stare of someone who has explained the Executive Membership 40,000 times. ' +
      'The aisles are beyond Gus. The parking lot is behind you.',
    objects: {
      gus: {
        name: 'Gus', person: true, names: ['gus', 'greeter', 'old man', 'man', 'door guy'],
        desc: 'Gus, the greeter. 87 years young. Firm handshake. He has seen everything, including you in 2009 with a perm.',
        verbs: {
          talk: (g) => {
            g.award('greeter');
            return g.flag('membership_valid')
              ? '"Go get \'em, Jeff! Try the samples! Aisle 12 has the weenies!"'
              : '"Card, please!" You show it. Gus squints. "Expired, son. I\'d love to let you in, but the Costco Code is the Costco Code. Membership desk is right there."';
          },
          flirt: 'You wink at Gus. Gus winks back. Gus has been winking since the Eisenhower administration. You cannot out-wink Gus.',
          kick: 'You would never kick Gus. Gus once fought a bear. Allegedly. In the parking lot. For a rotisserie chicken.',
        },
        receive: {
          costco_card: (g) => (g.flag('membership_valid') ? '"Lookin\' good! In you go!"' : '"EXPIRED. Membership desk, son. Right over there."'),
        },
      },
      desk: {
        name: 'membership desk', names: ['membership desk', 'desk', 'clerk', 'desk clerk', 'membership', 'membership services', 'services'],
        person: true,
        desc: 'The membership desk clerk is a young man named Tyler whose name tag reads "TYLER - ASK ME ABOUT EXECUTIVE MEMBERSHIP!" Please don\'t.',
        verbs: {
          talk: (g) => (g.flag('membership_valid') ? '"You\'re all set! Have you considered upgrading to Executive Membership? No? Okay." He sighs into his soul.' : '"Hi, welcome to Costco, I love you. Looks like your membership expired. Renewal is $65. Want to RENEW?"'),
          renew: (g) => L.renew(g),
          use: (g) => L.renew(g),
          buy: (g) => L.renew(g),
          flirt: 'You lean on the desk: "So... do you come here often?" Tyler: "I work here, sir." Smooth, Jeff.',
        },
        receive: { costco_card: (g) => L.renew(g), wallet: (g) => L.renew(g) },
      },
    },
    exits: [
      { to: 'costco_lot', label: 'parking lot', names: ['parking lot', 'lot', 'out', 'outside', 'exit'] },
      {
        to: 'costco_aisles', label: 'aisles', names: ['aisles', 'aisle', 'store', 'warehouse', 'inside', 'in', 'samples'],
        cond: (g) => (g.flag('membership_valid') ? true : 'Gus steps in front of you with surprising speed. "Card, please!" He looks at your card. "EXPIRED, son. Membership desk is right there." No membership, no warehouse.'),
        msg: (g) => (g.flag('membership_valid') ? 'Gus checks your card and waves you through. "Enjoy the samples!"' : ''),
      },
      { to: 'costco_food', label: 'food court', names: ['food court', 'food', 'hot dogs'] },
    ],
  });

  L.renew = (g) => {
    if (g.flag('membership_valid')) return '"You\'re already renewed! Executive Membership, though...?" No.';
    if (!g.spend(RENEW_PRICE)) return `"That'll be $65." You check your wallet: ${g.fmt(g.money())}. Tyler watches your face fall. "We take Visa," he says helpfully. You don't have a Visa. You have a TPS report problem and no paycheck.`;
    g.set('membership_valid');
    g.sfx('cash'); g.award('renew');
    return 'You hand over $65. Tyler slaps a shiny RENEWED sticker on your card and asks if you\'ve considered Executive Membership. You say no. He says "Okay" in a voice that sounds like a candle going out. You are once again a Costco member in good standing. [Cash: -$65.00]';
  };

  // ------------------------------------------------------------------ AISLES
  L.addRoom({
    id: 'costco_aisles', dest: 'costco', title: 'COSTCO - THE AISLES', names: ['aisles', 'aisle', 'warehouse'],
    art: String.raw`
 ________________________________________________________________________
| [ 120" TVs ][ 120" TVs ][ 120" TVs ]       |  5 GAL |   | 72-PACK  |   |
| [ ~~~~~~~ ][ ~~~~~~~~ ][ ~~~~~~~~ ]        |  MAYO  |   | TOILET   |   |
|  o  o  o  <- men staring at TVs            |________|   |  PAPER   |   |
| /|\/|\/|\                                               |__________|   |
|                .---.                                                   |
|      ________ (^o^)  SAMPLE LADY      .----------.   .--------------.  |
|     | WEENIES |/|\                     | 1-GALLON |   |  ROTISSERIE  |  |
|     |__[==]___|_|_     "Try one, hon!" | COLOGNE  |   | CHICKEN $4.99|  |
|                                        '----------'   '--------------'  |
|                                                                        |
|   <-- ENTRANCE                                  TIRE CENTER -->        |
|________________________________________________________________________|`,
    desc: 'The vast, echoing aisles of Costco, where everything comes in sizes meant for a family of forty. A wall of 120-inch TVs flickers while a row of men stares at them in silence. A sample lady hands out cocktail weenies. Nearby sit a 5-gallon jar of mayonnaise, a 72-pack of toilet paper, a 1-gallon jug of cologne, and a pile of $4.99 rotisserie chickens. The tire center is at the back.',
    objects: {
      sample_lady: {
        name: 'sample lady', person: true, names: ['sample lady', 'lady', 'woman', 'sample', 'samples', 'demo', 'demo lady', 'marge'],
        desc: (g) =>
          'Marge, the sample lady: hairnet, apron, and the energy of a woman who has handed out 2 million cocktail weenies and regrets none of them. ' +
          (g.flag('sample_eaten') && !g.flag('pen_taken') ? 'Next to the weenies, she is also demoing a STAIN-B-GONE PEN.' : ''),
        verbs: {
          talk: (g) => {
            if (!g.flag('sample_eaten')) return '"Try a Kirkwood Signature cocktail weenie, hon! Today only!" She looks you up and down and her eyes stop on Ohio. "...And when you\'re done, I\'ve got something else for that."';
            if (!g.flag('pen_taken')) return '"See, I\'m also demoing our Kirkwood Stain-B-Gone pen. Grass, wine, lipstick, chili..." She stares at your stain. "...Super Bowl chili. Take one, hon. Please. For all of us."';
            return '"Come back anytime, hon. Tell your friends about the weenies."';
          },
          flirt: (g) => '"Oh, stop." She giggles and swats your arm with a spatula. "You\'re trouble." For the first time all week, a woman has called Jeff trouble. You will remember this moment forever.',
          take: (g) => L.rooms.costco_aisles.objects.weenies.verbs.eat(g),
        },
      },
      weenies: {
        name: 'cocktail weenies', names: ['weenie', 'weenies', 'cocktail weenie', 'cocktail weenies', 'sample', 'toothpick', 'hot dog sample', 'free sample'],
        desc: 'Tiny cocktail weenies on toothpicks, glistening under the fluorescent lights. Free. The most beautiful word in the English language.',
        verbs: {
          eat: (g) => {
            if (g.flag('sample_eaten')) return '"One per customer, hon." She doesn\'t look up. She knows. She always knows.';
            g.set('sample_eaten');
            g.sfx('gulp'); g.award('eat_sample');
            return 'You pop a cocktail weenie into your mouth. "Mmmm!" you say loudly, as one does at sample stations. Marge beams. "A man who engages with the brand! I like you. Now, hon, about that stain..." She holds up a Kirkwood Signature STAIN-B-GONE PEN.';
          },
          take: (g) => L.rooms.costco_aisles.objects.weenies.verbs.eat(g),
        },
      },
      pen_demo: {
        name: 'Stain-B-Gone pen', names: ['pen', 'stain pen', 'stain-b-gone', 'stain b gone', 'stain remover', 'stain b gone pen'],
        hidden: (g) => !g.flag('sample_eaten') || g.flag('pen_taken'),
        desc: 'A Kirkwood Signature Stain-B-Gone pen. "Removes Grass, Wine, Lipstick, and Regret."',
        verbs: {
          take: (g) => { g.set('pen_taken'); g.give('stain_pen'); g.award('stain_pen'); return 'Marge presses the pen into your hand and closes your fingers around it. "Free sample, hon. You need it more than anyone I\'ve ever met." You now have a Stain-B-Gone pen.'; },
          buy: (g) => L.rooms.costco_aisles.objects.pen_demo.verbs.take(g),
        },
      },
      tvs: {
        name: 'wall of TVs', names: ['tv', 'tvs', 'televisions', 'wall of tvs', 'tv wall', 'men', 'guys', 'starers'],
        desc: 'A wall of 120-inch TVs showing slow-motion footage of a waterfall. A row of men stands before it in total silence, arms crossed. None of them is going to buy a TV. All of them are at peace.',
        verbs: {
          look: (g) => { g.award('stare_tvs'); g.advance(10); return 'You join the row of men staring at the TVs. Arms crossed. Nod slowly. A waterfall, in 8K. Nobody speaks. Nobody needs to. Ten minutes pass. You have never felt more like part of a team, not even at Synergex.'; },
          buy: 'A 120-inch TV would not fit in the Fiero. Or your apartment. Or your budget. Or your life.',
          talk: 'One of the men says, without looking away: "Look at that black level." Another: "Mmm." That was the whole conversation. It was beautiful.',
        },
      },
      mayo: {
        name: '5-gallon mayo', names: ['mayo', 'mayonnaise', 'jar', '5 gallon mayo', 'tub'],
        desc: 'A 5-gallon tub of Kirkwood Signature mayonnaise. Who buys this? Who NEEDS this? Somewhere, someone does.',
        verbs: {
          eat: (g) => g.die('DEATH BY CONDIMENT', 'You crack open the 5-gallon mayo and dig in with both hands. One gallon in, you feel invincible. Two gallons in, you see God, and God is a jar of mayonnaise. You do not make it to gallon three. Your obituary reads: "He went out doing what he loved, apparently."'),
          take: 'It weighs 40 pounds and you have no use for it. Even Costco has limits. Actually, Costco doesn\'t. YOU do.',
          buy: 'You do NOT need five gallons of mayo. Focus, Jeff.',
        },
      },
      tp: {
        name: '72-pack of toilet paper', names: ['toilet paper', 'tp', '72 pack', 'paper towels'],
        desc: 'A 72-pack of toilet paper, wrapped in plastic like a fortress. It would last Jeff until the next reunion.',
        verbs: { take: "You're a man on a mission. The mission is not toilet paper.", buy: "You're a man on a mission. The mission is not toilet paper.", sit: 'You sit on it. It is the most comfortable seat in Costco. A store employee asks you to move.' },
      },
      cologne_jug: {
        name: '1-gallon cologne', names: ['cologne', 'gallon cologne', '1 gallon cologne', 'jug', 'eau de musk', 'perfume'],
        desc: 'Kirkwood Signature Eau de Musk, in a 1-gallon jug with a pump. "Wear it like you mean it." The tester has a crust on it.',
        verbs: {
          wear: (g) => {
            if (g.flag('cologne')) return 'You already smell like a 1989 locker room. Adding Eau de Musk would create an entirely new element.';
            g.set('cologne');
            g.sfx('spray'); g.award('cologne');
            return 'You pump the tester once onto your neck. It smells like a lumberjack fighting a tiger in a pine forest. Three nearby shoppers sneeze in unison. You smell like a CHAMPION.';
          },
          drink: (g) => g.die('EAU DE DEATH', 'You pump Kirkwood Eau de Musk straight into your mouth. Your tongue goes numb, then your face, then your whole sense of self. The last thing you hear is Gus yelling, "CLEANUP ON AISLE 12!"'),
          buy: 'It costs $89.99 and would last 400 years. You need that money for a battery.',
          smell: 'Your nose hairs file a formal complaint.',
        },
      },
      chicken: {
        name: 'rotisserie chickens', names: ['chicken', 'chickens', 'rotisserie chicken', 'rotisserie'],
        desc: 'Rotisserie chickens, $4.99. Costco loses money on every single one. It is the last altruistic act in American retail.',
        verbs: {
          buy: "You'd love one, but the Fiero comes first. The chicken will be here. The chicken is ALWAYS here.",
          eat: 'Not in the store, Jeff. You have SOME dignity left. It\'s going on the reunion list.',
          smell: 'Heavenly.',
          take: "You'd love one, but the Fiero comes first.",
        },
      },
    },
    exits: [
      { to: 'costco_entrance', label: 'entrance', names: ['entrance', 'front', 'exit', 'out', 'membership desk'] },
      { to: 'costco_tire', label: 'tire center', names: ['tire center', 'tires', 'tire', 'auto', 'auto center', 'batteries', 'back'] },
    ],
  });

  // ------------------------------------------------------------------ TIRE CENTER
  L.addRoom({
    id: 'costco_tire', dest: 'costco', title: 'COSTCO - TIRE CENTER', names: ['tire center', 'tires', 'auto center'],
    art: String.raw`
 ________________________________________________________________________
|   T I R E   C E N T E R           "Ask about our road hazard warranty" |
|                                                                        |
|    ___   ___   ___   ___            .------------------------------.   |
|   (   ) (   ) (   ) (   )           |  CAR BATTERIES               |   |
|   ( O ) ( O ) ( O ) ( O )           |  [+  -] [+  -] [+  -] [+  -] |   |
|   (___) (___) (___) (___)           |  KIRKWOOD DIEHARDER  $89.99  |   |
|                                     '------------------------------'   |
|         .---.                                                          |
|        ( >_<)  RUSTY                                                   |
|        /|##|\  (mechanic)        ____________ COUNTER ______________   |
|         |  |                                                           |
|____________________________________________________________ AISLES -->|`,
    desc: 'The Costco Tire Center smells of rubber and motor oil. Stacks of tires line one wall. On a rack by the counter sit car batteries: Kirkwood DieHarder, $89.99. Rusty the mechanic leans on the counter, wiping his hands on a rag that is dirtier than his hands.',
    objects: {
      rusty: {
        name: 'Rusty', person: true, names: ['rusty', 'mechanic', 'guy', 'man', 'clerk', 'counter'],
        desc: 'Rusty: grease-stained coveralls, a mustache that has seen things, and a name tag that just says "RUSTY" in a font that suggests Rusty is not his real name.',
        verbs: {
          talk: (g) => {
            if (g.has('battery') || g.flag('car_fixed')) return '"Red to red, black to black. You got this, chief. Probably."';
            return '"Need a battery? DieHarder, $89.99. Best battery we sell. Only battery we sell." He looks at your suit. "Gonna need a cart for it, chief. Forty pounds. I\'ve seen guys like you try to carry one. Lot of chiropractor bills."';
          },
          flirt: '"Chief, I got a wife and three kids and a bass boat. Buy a battery or move along."',
          buy: (g) => L.buyBattery(g),
        },
        receive: { coupon: (g) => L.buyBattery(g), costco_card: (g) => L.buyBattery(g), cart: (g) => L.buyBattery(g), wallet: (g) => L.buyBattery(g) },
      },
      batteries: {
        name: 'car batteries', names: ['battery', 'batteries', 'car battery', 'car batteries', 'dieharder', 'rack'],
        desc: 'Kirkwood Signature DieHarder car batteries. $89.99. Each one weighs 40 pounds and has a handle designed by someone who hates hands.',
        verbs: {
          buy: (g) => L.buyBattery(g),
          take: (g) => L.buyBattery(g),
          use: (g) => L.buyBattery(g),
        },
      },
      tires: {
        name: 'tires', scenery: true, names: ['tires', 'tire', 'wheels', 'rubber'],
        desc: 'Stacks of tires. Your Fiero\'s tires are bald but technically legal. That is an Act II problem.',
        verbs: { kick: 'You kick a tire. Rusty nods approvingly. "Good tire, right?" Man-bonding achieved.', buy: 'One crisis at a time, Jeff.' },
      },
    },
    exits: [{ to: 'costco_aisles', label: 'aisles', names: ['aisles', 'aisle', 'back', 'out', 'store'] }],
  });

  L.buyBattery = (g) => {
    if (g.has('battery') || g.flag('car_fixed')) return 'You already have a battery. One is plenty, unless you are building a robot. Are you building a robot? Focus.';
    if (!g.has('cart')) return 'You grab a battery by its handle and lift. Your spine makes a noise like a Pringles can opening. You put it down. Rusty: "Told ya, chief. Get a cart. Corral\'s in the parking lot."';
    const coupon = g.has('coupon');
    const price = coupon ? BATTERY_PRICE - 1000 : BATTERY_PRICE;
    if (!g.spend(price)) return `"That'll be ${g.fmt(price)}, chief." You have ${g.fmt(g.money())}. Rusty waits. You wait. Nobody wins. Maybe go get that paycheck.`;
    g.give('battery');
    g.sfx('cash'); g.award('buy_battery');
    let msg = '';
    if (coupon) {
      g.lose('coupon');
      g.award('use_coupon');
      msg = 'You slap down the dumpster coupon. Rusty sniffs it. "Smells like pepperoni." He accepts it anyway. ';
    }
    return msg + `Rusty rings you up: ${g.fmt(price)}. He heaves a DieHarder battery into your cart. "Red to red, black to black, chief." You now have a car battery! [Cash: -${g.fmt(price)}]`;
  };

  // ------------------------------------------------------------------ FOOD COURT
  L.addRoom({
    id: 'costco_food', dest: 'costco', title: 'COSTCO - FOOD COURT', names: ['food court', 'food', 'snack bar'],
    art: String.raw`
 ________________________________________________________________________
|   F O O D   C O U R T                                                  |
|  .------------------------------------------------------------------.  |
|  | HOT DOG + SODA   $1.50 |  PIZZA SLICE $1.99  |  CHURRO  $1.00    |  |
|  |  (since 1985. we will never change. we cannot change.)           |  |
|  '------------------------------------------------------------------'  |
|        .---.                                                           |
|       ( o.o)  REGISTER                 [ CONDIMENT STATION ]           |
|      __|__|_______                     ketchup  mustard  ONIONS        |
|                                                                        |
|     ____     ____     ____     (red tables, bolted down for a reason)  |
|    |____|   |____|   |____|                                            |
|________________________________________________ <-- PARKING LOT _______|`,
    desc: 'The legendary Costco food court. The hot dog combo is $1.50 and has been since 1985. Red plastic tables are bolted to the floor. A register clerk waits beside a condiment station with a hand-crank onion grinder.',
    objects: {
      register: {
        name: 'register', person: true, names: ['register', 'clerk', 'cashier', 'counter', 'menu', 'hot dog', 'hot dogs', 'hot dog combo', 'combo', 'dog'],
        desc: 'HOT DOG + SODA: $1.50. PIZZA SLICE: $1.99. CHURRO: $1.00. The clerk looks like he has been working here since 1985 too.',
        verbs: {
          buy: (g) => L.buyHotDog(g),
          talk: '"Hot dog?" he asks. It is less a question than a prophecy.',
          eat: (g) => (g.has('hot_dog') ? L.items.hot_dog.verbs.eat(g) : L.buyHotDog(g)),
          take: (g) => L.buyHotDog(g),
        },
      },
      pizza: {
        name: 'pizza', scenery: true, names: ['pizza', 'slice', 'pizza slice', 'churro'],
        desc: 'Pizza the size of a manhole cover. Churros the length of a baguette.',
        verbs: { buy: 'You consider it, but the hot dog is calling to you.', eat: 'Buy a hot dog instead. It\'s tradition.' },
      },
      condiments: {
        name: 'condiment station', names: ['condiment station', 'condiments', 'mustard', 'ketchup', 'onions', 'onion grinder', 'grinder'],
        desc: 'Ketchup, mustard, relish, and the famous hand-crank onion grinder. Many have cranked it. Few have cleaned it.',
        verbs: {
          use: (g) => (g.has('hot_dog') ? 'You load up your dog with onions, mustard, and a little relish. Perfection.' : 'You crank the onion grinder with nothing to put onions on. A man watches you. You crank faster. Neither of you knows why.'),
          eat: "You eat a spoonful of relish straight. Everyone sees. You'll have to live with that.",
          drink: 'You squirt mustard directly into your mouth. A child begins to cry. Not your finest moment.',
        },
      },
      tables: {
        name: 'tables', scenery: true, names: ['tables', 'table', 'chair', 'seat', 'bench'],
        desc: 'Red plastic tables, bolted down. Someone has carved "GUS 4 EVER" into one.',
        verbs: { sit: 'You sit at a red table. It is surprisingly peaceful. You feel at one with the bulk economy.' },
      },
    },
    exits: [
      { to: 'costco_lot', label: 'parking lot', names: ['parking lot', 'lot', 'out', 'outside', 'exit'] },
      { to: 'costco_entrance', label: 'warehouse entrance', names: ['entrance', 'warehouse', 'inside', 'store', 'in'], cond: (g) => (isClosed(g) ? 'The warehouse is closed. Only the food court remains, like a lighthouse.' : true) },
    ],
  });

  L.buyHotDog = (g) => {
    if (g.has('hot_dog')) return 'You already have a hot dog. Eat it, Jeff. EAT IT.';
    if (!g.spend(HOT_DOG_PRICE)) return 'You cannot afford $1.50. Let that sink in.';
    g.give('hot_dog');
    g.sfx('cash');
    return 'You buy the hot dog combo for $1.50, the best deal in America. The clerk hands it over with the solemnity of a flag-folding ceremony. [Cash: -$1.50]';
  };
})();
