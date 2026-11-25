# The Osmari Isles

The region, its story and its pacing. A playthrough of the main story takes 5 to 10
hours: eight Wardens, the Eclipse Syndicate's plot, then the High Council. Map ids are the
file names in `web/static/src/data/maps/`; species ids are from `web/static/data/species.json`.

## Story

The player (named at the start) lives in Fernhollow with their mom. Professor Linden gives
them and their neighbour, the rival Kip, a first creature each: Sproufawn (grass),
Flaropaw (fire) or Hydrefry (water). Kip takes the one strong against the player's, and
battles them in the lab.

Linden asks them to fill the dex and to challenge the eight Wardens, who each keep one of
the Isles' spires. Along the way the Eclipse Syndicate, led by Director Halvard, is
gathering the pieces it needs to wake Trancedome, the Isles' sleeping guardian, believing
whoever wakes it commands the weather of the Isles. They steal the Storm Bell from the
shrine at Hollowmere, take over the Frostmere Observatory, and climb Skyreach Peak to ring
it. The player beats Halvard at the summit; Trancedome wakes, calm, and can be caught.
Then the eighth Warden, Victory Road and the High Council; the champion is Kip.

Kip turns up between most towns to battle, a step ahead and teasing, and grows into a
friendly rival by the end.

## Progression

| # | Area | Kind | Wild levels | What happens, and what gates it |
| --- | --- | --- | --- | --- |
| 1 | `fernhollow` | town (meadow), home | none | Mom, the lab, Kip's house. Choose a starter; first battle with Kip (his starter Lv. 5) |
| 2 | `route-1` | route (meadow) | 2–4 | Linden's aide gives 5 Capture Orbs once the player has the dex. 2 trainers |
| 3 | `brookside` | town | none | Mart clerk hands over the lab parcel; Linden gives the dex for it. Spire 1 opens after the dex |
| 4 | `brookside-spire` | spire | | Warden **Tamsin**, grass, ace Lv. 13; 2 spire trainers |
| 5 | `whisper-woods` | forest | 5–10 | Bug catchers; first Syndicate grunts (2) harassing a researcher. The guard at its Brookside entrance waits for badge 1 |
| 6 | `route-2` | route (meadow, ledges) | 9–13 | Kip battle 2 (party of 3, ace Lv. 15). 4 trainers |
| 7 | `cinderford` | town (volcanic) | none | |
| 8 | `cinderford-spire` | spire | | Warden **Bram**, fire, ace Lv. 18. After the badge, a resident gives the **Brush Cutter** |
| 9 | `route-3` | route (forest, small trees) | 13–17 | Cut trees open it. 5 trainers. Ember Grotto (`ember-grotto`, cave, 14–18, optional with items) |
| 10 | `port-saltry` | city (beach) | none | Bike shop (the **Bicycle** after the Syndicate dock fight), a fisher gives the **Old Rod** |
| 11 | `saltry-warehouse` | Syndicate dock warehouse | | 4 grunts and an admin; clearing it lets the spire open (the Warden was locked out) |
| 12 | `port-saltry-spire` | spire | | Warden **Nerys**, water, ace Lv. 24. After the badge she gives the **Tide Board** |
| 13 | `route-4` | sea route (surf) | 18–23 | Swimmers and sailors, 6 trainers; Kip battle 3 on the landing (ace Lv. 25) |
| 14 | `voltreach` | city | none | A scientist gives the **Lantern** after badge 4 |
| 15 | `voltreach-spire` | spire | | Warden **Ozzie**, electric, ace Lv. 29 |
| 16 | `route-5` | route (meadow) | 23–27 | 5 trainers; the fisher's brother gives the **Good Rod** |
| 17 | `hollowmere-cave` | dark cave | 24–29 | Needs the Lantern; 2 floors, ladders, 4 trainers |
| 18 | `hollowmere` | town (forest, misty) | none | Stillwater Shrine (`hollowmere-shrine`): the Syndicate steals the Storm Bell; the player fights an admin and loses the chase |
| 19 | `hollowmere-spire` | spire | | Warden **Vesper**, ghost, ace Lv. 34 |
| 20 | `route-6` | route (meadow, cliffs) | 28–32 | 5 trainers; Kip battle 4 (ace Lv. 35) |
| 21 | `ironvale` | town (city, mining) | none | The foreman gives the **Power Gloves** to clear the mine |
| 22 | `ironvale-mine` | cave with boulders | 30–34 | Syndicate grunts digging for an artifact; 4 trainers |
| 23 | `ironvale-spire` | spire | | Warden **Gideon**, steel, ace Lv. 37. After the badge, a gentleman gives the **Wing Whistle** |
| 24 | `route-7` | route (snow) | 33–37 | 5 trainers |
| 25 | `frostmere` | town (snow) | none | |
| 26 | `frostmere-observatory` | Syndicate HQ | | 3 floors: the **Syndicate Keycard** opens the doors; admins; Director Halvard battle 1 (ace Lv. 42) |
| 27 | `frostmere-spire` | spire | | Warden **Yuki**, ice, ace Lv. 43 |
| 28 | `skyreach-peak` | mountain path to the summit | 38–43 | Halvard rings the Storm Bell; final battle with him (ace Lv. 46); **Trancedome** Lv. 45 wakes and can be fought and caught |
| 29 | `route-8` | route (cliffs) | 38–42 | 6 trainers |
| 30 | `skyreach` | city on cliffs | none | |
| 31 | `skyreach-spire` | spire | | Warden **Corvin**, dragon, ace Lv. 48 |
| 32 | `victory-road` | cave, boulders, all field items | 42–48 | 6 trainers, Kip battle 5 at the exit (ace Lv. 50) |
| 33 | `summit-citadel` | the High Council | | Four rooms in a row: **Brakka** (fighting, ace 46), **Selene** (psychic, 50), **Mordecai** (dark, 51), **Lumi** (fairy, 52), then champion **Kip** (ace 52). Beating them is the end: the hall of fame and credits |

Optional: Zapashark (Lv. 50) in `voltreach-ruins`, reached by surfing east of Voltreach
after the main story; Brrropede (Lv. 55) at the bottom of `frostmere-glacier`, after the
main story.

Every town has a healing center and a mart (`<town>-center`, `<town>-mart`) except
Fernhollow, and one or two houses with a person and something small to give or say.
Fernhollow has `fernhollow-home`, `fernhollow-kip-home` and `fernhollow-lab`.

## Wild creatures

Each family lives where its type and stage fit the level range; first stages on early
routes, middle stages later, final stages rare and late. Water families in the water of
routes 4, 5 and caves; ghost in Hollowmere; ice and steel late. Every non-legendary
family can be caught somewhere, so the dex can be completed. The starters' families are
not wild: a lab helper gives the two the player didn't choose after the High Council.

## Field items

| Item | Clears | From |
| --- | --- | --- |
| Brush Cutter | small trees (`t`) | Cinderford, after badge 2 |
| Tide Board | water (`~`, `w`) | Nerys, badge 3 |
| Bicycle | (faster on foot tiles) | Port Saltry bike shop |
| Lantern | dark cave floors (`d`) | Voltreach, after badge 4 |
| Power Gloves | boulders | Ironvale foreman |
| Wing Whistle | flies to any visited town with a center | Ironvale, after badge 6 |
| Old Rod, Good Rod | fishing in water | Port Saltry, route 5 |

## Trainers

Route trainers' parties are 1–3 creatures at the route's wild levels +1 to +3. Spire
trainers are a little above the route before. A Warden has 3–5 creatures of their type
(some dual-types or a related type allowed), the ace on the table above, the others 2–4
levels below; the first two use the plain trainer AI, the rest the expert one, which heals.
The Council have 4 each, the champion 5. `web/test/balance.test.mjs` holds every boss
winnable with each starter and the team a player would have by then.
