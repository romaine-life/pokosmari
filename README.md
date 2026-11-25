# pokosmari

A monster-catching RPG for the browser, in the style of the Game Boy games: walk an
overworld, meet wild creatures in tall grass, battle and catch them, beat eight Wardens
and the High Council. A playthrough takes 5 to 10 hours. Every creature comes from
[pokemon-generator](https://forgejo.romaine.life/romaine-life/pokemon-generator), and the
world, story, music and art are original. It runs on romaine.life's AKS cluster at
https://pokosmari.romaine.life ([PG-1](https://openproject.home.romaine.life/wp/PG-1)).

## Playing

| Button | Keys | Gamepad |
| --- | --- | --- |
| Move | arrows or WASD | d-pad or left stick |
| A (talk, confirm) | Z, J or Space | A |
| B (cancel, hold to hurry text) | X, K, Backspace or Esc | B |
| Start (menu) | Enter | Start |
| Select (get on or off the bike) | Shift | Back |

The game saves in the browser (START → SAVE), one save per browser. OPTIONS can download
the save as a file and load one back, which is how a save moves to another browser or
computer.

## How it fits together

The server is one Go binary that hands out the game's files and logs the errors the game
reports. The game is plain JavaScript modules the browser loads directly, with no bundler;
`tsc` type-checks them from their JSDoc. `docs/design.md` is the engine's contract between
its parts, and `docs/world.md` the region, story and level curve.

| Path | Holds |
| --- | --- |
| `internal/species/roster.json` | The 56 creature families: each is a pokemon-generator seed and type |
| `internal/species`, `cmd/species` | Builds the dex, `web/static/data/species.json`, from the roster with the generator at the version `go.mod` pins |
| `internal/server`, `cmd/pokosmari` | The routes: the page, the game's files under `/v/<release>/`, `POST /api/errors`, `/healthz`; `--self-test` |
| `web/static/src/core` | The 60-steps-a-second loop, input, layers and the async flows that drive scripts and menus |
| `web/static/src/world` | Maps at runtime and the overworld: walking, edges, warps, ledges, surfing, trainers' sight, encounters |
| `web/static/src/script` | `ScriptContext`, the API map scripts use |
| `web/static/src/battle` | The battle engine (pure rules, seeded), the AI, creating creatures, and the battle scene |
| `web/static/src/ui` | Text boxes, menus and every screen |
| `web/static/src/gfx`, `audio` | All pixel art as data, drawn through a cache; the chip synthesizer, songs, sound effects and cries |
| `web/static/src/data` | Moves, types, items, learnsets, trainers, the map legend and the maps (`data/maps/<id>.js`) |
| `web/test` | `node --test` checks: battle rules, data, maps (every warp, edge, trainer and item resolves, every map is reachable), art, sound, every map script run by a bot, and the opening played headless |
| `web/test/harness` | The real game in Node with a software canvas: scripted presses, PNG screenshots, no window or sound |

The creatures are fixed by the generator's version in `go.mod`, not by whatever the
generator does today: taking up a new generator release means `go get` the new version,
`go run ./cmd/species` and committing the rebuilt dex, and `go test` fails if the
committed dex doesn't match the roster.

## Running and testing

```sh
go test ./...
(cd web && npm ci && npm run lint && npm test)
go run ./cmd/pokosmari            # http://localhost:8080
go run ./cmd/pokosmari --self-test
go run ./cmd/species              # rebuild the dex from the roster
go run ./cmd/species --pick       # choose a new roster (replaces roster.json)
```

## How it ships

CI comes from the pipeline-templates suites `go`, `web-app` (with `web-image`) and
`cluster-service`, selected by this repository's entry in pipeline-templates' `fleet.json`.
A pull request runs the Go tests, the game's type check and tests, renders and checks
`k8s/`, and builds the image and runs its `--self-test`. A merge publishes
`romainecr.azurecr.io/pokosmari` and opens a pin PR that rewrites the image in
`k8s/values.yaml` to the new tag and digest. Argo CD runs `k8s/` from its Application in
infra-bootstrap's `k8s/apps`, in the `pokosmari` namespace; external-dns publishes
`pokosmari.romaine.life` from the HTTPRoute, and cert-manager issues its certificate. The
pod keeps no state and calls nothing, so it has no Azure identity and mounts no service
account token.
