# pokosmari: how the game is built

This is the engine's contract: the modules, what each owns and the shapes they pass each
other. `docs/world.md` holds the region, the story and the level curve.

## Look and feel

The screen is a Game Boy's: 160×144 logical pixels, scaled up by whole numbers to fit the
window, drawn on one `<canvas>`. The world is a grid of 16×16 tiles (10×9 on screen); text
is an 8×8 font. Colours are Game Boy Color-like: each map theme has its own small palette,
and creatures keep the generator's colours. Input is the keyboard (arrows or WASD to move,
Z/J/Enter = A, X/K/Backspace = B, Enter = Start, Shift = Select) and any standard gamepad.

The game runs at a fixed 60 steps a second off `requestAnimationFrame`; everything counts
in frames. One walking step is 16 frames (8 on the bike).

## Files

All game code is plain JavaScript ES modules under `web/static/src/`, checked by `tsc`
(`// @ts-check`, JSDoc types) and tested with `node --test` in `web/test/`. Nothing is
bundled: the browser loads the modules directly, and the server serves them under
`/v/<release>/`, so a release never mixes with an older one in a browser's cache.

| Folder | Owns |
| --- | --- |
| `core/` | The loop, input, the screen canvas, the scene stack, the seeded RNG, error reporting |
| `gfx/` | All drawing that isn't a creature: tiles, buildings, characters, objects, font, window frames, battle backgrounds, trainer portraits |
| `audio/` | The synthesizer, every song and sound effect, creature cries |
| `battle/` | The battle engine (pure rules), the battle scene, the AI |
| `world/` | Maps at runtime, the overworld scene, movement, NPCs, warps, encounters |
| `script/` | The event scripts' runtime (`ScriptContext`) |
| `ui/` | Text boxes, menus, the start menu and its screens (party, bag, dex, card, save, options), shops, the storage PC, naming |
| `game/` | The dex, creatures, the save, flags, the player's state |
| `data/` | Moves, the type chart, items, learnsets, trainers, the map legend, the maps (`data/maps/`) |

## Pixel art

Art is data first: every tile, character and object is a grid of palette indexes written
as strings, and the drawing code renders a grid once to an offscreen canvas and reuses it.
The pure functions return pixel data so tests can check them without a canvas.

`gfx/` exports:

- `tilePixels(ch, theme, frame) -> Pixels`: the 16×16 tile for a legend character
  (`data/tiles.js`) in a theme. `frame` is the world's frame counter; water, flowers and
  tall grass animate from it.
- `buildingPixels(kind, theme) -> Pixels`: a whole building (`BUILDINGS` in `data/tiles.js`
  gives each kind's size in tiles and its door).
- `characterPixels(sprite, dir, step) -> Pixels`: a 16×16 overworld person. `dir` is
  `"up" | "down" | "left" | "right"`, `step` is 0 (standing), 1 or 2 (the two stride frames).
- `objectPixels(kind) -> Pixels`: `"itemball"`, `"boulder"`, `"sign"`.
- `portraitPixels(sprite) -> Pixels`: a 48×48 front view of a trainer for battle intros,
  and `"player-back"`, the player seen from behind for the player's side of a battle.
- `fontGlyph(ch) -> Pixels` and `drawText(ctx, text, x, y, color)`.
- `drawPixels(ctx, pixels, x, y, {flipX})`: draws (and caches) any `Pixels`.
- `drawFrame(ctx, x, y, w, h)`: a window with a border, in pixels, multiples of 8.
- `drawBattleBackground(ctx, theme)`.
- `creatureCanvas(species, {back})`: a species' sprite from the dex (`sprite.pixels` is one
  base-36 palette index per pixel, 0 transparent); the back view is the front mirrored.

`Pixels` is `{ w, h, rows: string[], palette: string[] }`: `rows[y][x]` is a palette index
character (`0` is transparent), and `palette` holds `#rrggbb` colours.

## Sound

`audio/audio.js` exports `createAudio()`, which returns
`{ unlock(), playMusic(id), stopMusic(), jingle(id), playSfx(id), playCry(speciesId), setVolumes({music, sfx}), current }`
(`current` is the song playing or waiting to).
It is a four-voice chip synthesizer on Web Audio (two pulse waves with duty cycles, a
triangle-like wave channel and noise), and every song is original. A jingle (item, heal,
badge, level up, evolution done, save) pauses the music and resumes it after; the victory
themes after a battle are songs. An unknown id throws, so a typo fails the tests. A cry is
synthesized from the species id, so each species has its own.

## Creatures and battles

`game/creature.js` holds the creature record and the shared formulas (stats, experience).
`battle/engine.js` is pure: no drawing, no sound, no timers; it takes a seeded RNG and
returns events the battle scene plays. The scene asks the engine for the next decision
point, shows events in order, collects the player's choice and passes it back.

## Scripts

Map events are `async` functions that take a `ScriptContext` (`script/context.js`), the
one way content touches the game: text, choices, items, battles, flags, movement, music,
healing, shops. A map file in `data/maps/` holds its tiles and its scripts together.

## Saves

The game saves to the browser's local storage, one slot, versioned (`game/save.js`), and
can download the save as a file and load one back, so a save can move to another
browser. A save written by an older version is migrated on load; one that can't be read
is kept untouched and the player is told, never overwritten.

## Testing without a browser

`web/test/harness/headless.mjs` runs the real game in Node: the same modules, drawing into
a software canvas, driven by scripted button presses, silent, with screenshots written as
PNGs. The tests use it to play the opening and to run every map script with a bot that
keeps pressing A; it's also how to look at a screen while building one, without opening a
window.

## Errors

A script error the game didn't expect is reported to the server (`POST /api/errors`), which
logs it, and the player sees a message saying the game hit a problem, with the save left
as it was at the last save.
