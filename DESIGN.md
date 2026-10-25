# Leisure Suit Jeff: Design Outline

An 80s Sierra-style, parser-driven ASCII adventure inspired by *Leisure Suit Larry*.
It runs in the browser with an amber monochrome CRT look. The humor is PG-13 cheeky innuendo with no explicit content.

## Premise
Jeff Lovett is 44, a middle manager at **Synergex Solutions**, and owns a powder-blue polyester leisure suit.
His **high school reunion is Saturday night at 8 PM**. He has one weekend to get **a working car, a clean suit,
a date, and a shred of dignity**.

## Interface (80-column CRT)
```
+------------------------------------------------------------------------------+
| Score: 12 of 120          LEISURE SUIT JEFF                 Fri 4:42 PM $13.50 |
+------------------------------------------------------------------------------+
|                    ASCII ART SCENE (about 76x14)                             |
+------------------------------------------------------------------------------+
| JEFF'S APARTMENT                                                             |
| You see: fridge, phone, couch ...          (click a name to use it)          |
| Exits:   parking lot, bathroom             Travel: HOME  WORK  COSTCO        |
+------------------------------------------------------------------------------+
| narrator / response log (scrolling)                                          |
+------------------------------------------------------------------------------+
> _
```
* The **status bar** shows the score, the game clock and cash.
* The **art pane** shows one scene per room. Every interactive object is drawn and labelled.
* The **room panel** lists the visible objects and the on-screen exits, so players are never guessing.
* The **travel bar** lists destinations Jeff knows. He can go to them from almost anywhere, even when the screen shows no path.
* A **free-form parser** reads the typed input. Up and Down recall command history.

## Parser
* The parser reads `VERB [object] [preposition object]` and drops articles. Synonyms work, for example `grab`/`get`/`pick up` mean `take`.
* **Verbs:** look, search, read, take, drop, use, open, close, talk, flirt, give, buy, wear, remove, eat,
  drink, sit, sleep, kick, smell, push, listen, put, clean, staple, renew, dance, flush, comb, call.
* **Two-object commands:** `use X on Y`, `put X in Y`, `give X to Y`, and `clean Y with X`.
* **Movement:** `go <exit>` moves between screens. `go to <destination>`, `drive to <destination>` and `take bus to <destination>` travel between places.
* **System:** `help`, `inventory`, `score`, `time`, `map`, `hint`, `save`/`restore [slot]`, `undo`, `restart`.
* **Sierra touches:** each clever action scores points once, death screens are comedic (offering RESTORE / UNDO / RESTART), and unknown input gets a snarky reply.

## Travel
* Travel destinations are separate from on-screen exits. Typing `go home`, `go to work` or `go to costco` works from almost anywhere.
* **Bus:** $2.00 and 30 minutes. **Car:** free and 15 minutes, but only after the Pontiac is fixed, and the car stays wherever Jeff parked it.
* Places have opening hours. For example, Costco closes at 8:30 PM.
* New destinations are unlocked by clues such as flyers, phone messages or gossip. Locked ones appear as `???` on the map.

## Destinations
| Destination | Screens | Purpose | Status |
|---|---|---|---|
| Home (Shady Pines Apts) | living room, bathroom, parking lot | phone messages, grooming, car | **Act I slice** |
| Work (Synergex Solutions) | lobby, cubicles, break room, boss's office | TPS reports, paycheck, Office Space satire | **Act I slice** |
| Costco | parking lot, entrance, aisles, tire center, food court | membership, samples, battery, $1.50 hot dog | **Act I slice** |
| Lefty's Lounge | bar, restroom, back alley | flirting, information | Act II |
| Iron Paradise Gym | front desk, weights, sauna | "get in shape" in one day | Act II |
| Second Chance Thrift | single screen | wardrobe upgrades | Act II |
| Disco Inferno | dance floor, DJ booth | dance-off set piece | Act II |
| Westside High Gym | entrance, dance floor | the reunion finale | Act III |

## Acts
1. **Friday evening: "Get it together."** Get paid, fix the car, clean the suit, then go to sleep. *(This act is built.)*
2. **Saturday daytime: "Find a date."** Several possible dates, each with a puzzle chain across locations.
3. **Saturday night: "The reunion."** The ending depends on the date, outfit, car and dignity flags.

## Act I puzzle chain
```
Work: read memo -> take TPS report -> use computer (print cover sheet)
      -> break room: printer says PC LOAD LETTER -> take paper (under wobbly table)
      -> put paper in printer -> take cover sheet
      -> take cake -> give cake to Merv -> Merv lends his orange stapler
      -> staple report -> give report to Brumley -> $250 paycheck
Costco (bus): take cart -> renew membership ($65) -> sample lady: eat sample -> take stain pen
      -> tire center: buy battery (needs cart; dumpster coupon saves $10)
Home: open hood -> put battery in car;  clean suit with pen
      -> sleep in waterbed => END OF ACT I
```
Optional points come from things like the answering machine, the mirror, the comb, the cologne, kicking the printer, the consultants (the Todds),
flair, returning the stapler, the coupon, the hot dog, staring at the TV wall and returning the cart.
Comedic deaths include Karen's yogurt, the 1997 break-room coffee, drinking cologne, the 5-gallon mayo jar, and a closed Costco.

## Architecture
* `js/registry.js` defines the global `LSJ` registry (rooms, items, destinations, scores, config).
* `js/content/*.js` holds data-driven content. Each room has art, a description, objects with verb handlers, and exits.
* `js/engine.js` handles parsing, state, scoring, the clock, travel, save/load and undo. It has no DOM code, so it can be tested in Node.
* `js/ui.js` renders the CRT screen and handles input.
* `test/walkthrough.js` is a Node test that plays Act I end to end and checks the art dimensions.

### Content handler conventions
* `objects.<id>.verbs.<verb>` is either a string or `fn(g, ctx)`. A function may return a string to print, or `false` to fall through to the default reply.
* `objects.<id>.useOn.<targetId>` and `objects.<id>.receive.<itemId>` handle two-object commands.
* `hidden(g)` hides an object. `scenery: true` keeps it interactable but leaves it out of the "You see" list.
* `g` (game API): `say, flag, set, has, give, lose, money, spend, earn, award, die, end, goto, advance, learn, fmt`.

## Running
Open `index.html` in a browser. No build step is needed.
Test: `node test/walkthrough.js`
