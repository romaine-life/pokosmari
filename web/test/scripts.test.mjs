// Every script in every map runs without an error: each NPC's, each trigger's and each
// map's onEnter, driven headless by a player who keeps pressing A (so every text box
// advances, every question gets its first answer and every battle is fought with the
// first move). It catches scripts calling something that doesn't exist, naming a trainer,
// item or species that doesn't exist, or a battle that can't finish.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import { Game } from "../static/src/core/game.js";
import { makeDex } from "../static/src/game/dex.js";
import { newState } from "../static/src/game/state.js";
import { Overworld } from "../static/src/world/overworld.js";
import { Scripts } from "../static/src/script/context.js";
import { makeCreature } from "../static/src/battle/spawn.js";
import { createRng } from "../static/src/core/rng.js";
import { SONGS } from "../static/src/audio/songs.js";
import { JINGLES } from "../static/src/audio/jingles.js";
import { SFX } from "../static/src/audio/sfx.js";

const here = dirname(fileURLToPath(import.meta.url));
const mapsDir = join(here, "../static/src/data/maps");
const dex = makeDex(JSON.parse(readFileSync(join(here, "../static/data/species.json"), "utf8")));

// Silent, but as strict as the real one: an unknown id throws.
const known = (table, kind) => (id) => {
  if (!(id in table)) throw new Error(`unknown ${kind} ${id}`);
};
const audio = {
  unlock() {},
  playMusic: known(SONGS, "song"),
  stopMusic() {},
  jingle: async (id) => known(JINGLES, "jingle")(id),
  playSfx: known(SFX, "sound"),
  playCry: (id) => {
    if (!dex.byId.has(id)) throw new Error(`unknown species ${id}`);
  },
  setVolumes() {},
};

function memoryStore() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
}

/** A game with a strong party, every field item, mid-story. */
function setup() {
  const errors = [];
  const game = new Game({ ctx: null, dex, audio, store: memoryStore(), report: (e, where) => errors.push(`${where}: ${e?.stack ?? e}`) });
  // Fixed randomness: every run plays every script the same way.
  game.rng = createRng(20261124);
  const s = newState();
  s.name = "Tester";
  s.flags.starter = "flaropaw";
  s.flags.dex = true;
  for (const sp of ["flarohorn", "hydreshark", "sproufang", "mudofang", "granamoth", "dojoqueen"]) s.party.push(makeCreature(dex, sp, 100, game.rng, { ot: "Tester", metAt: "test" }));
  for (const k of ["brush-cutter", "tide-board", "power-gloves", "lantern", "wing-whistle", "bicycle", "old-rod", "good-rod", "capture-orb", "tonic"]) s.bag[k] = 5;
  s.money = 50000;
  game.state = s;
  const world = new Overworld(game);
  world.scripts = new Scripts(game, world);
  world.openMenu = async () => {};
  game.world = world;
  game.push(world);
  return { game, world, errors };
}

/** Step the game, pressing A every few frames, until `done` resolves or time runs out. */
let seed = 12345;
// (reset per map below, so a map's run doesn't depend on the maps tested before it)
const pick = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

async function drive(game, promise, maxFrames = 30000) {
  let finished = false;
  promise.then(() => (finished = true), () => (finished = true));
  for (let f = 0; f < maxFrames && !finished; f++) {
    // Mostly A; now and then B, which backs out of a shop or a menu the A presses keep
    // re-entering.
    game.input.keys.clear();
    if (f % 3 === 0) {
      const r = pick();
      game.input.keys.add(r < 0.7 ? "a" : r < 0.85 ? "b" : "down");
    }
    game.step();
    await new Promise((r) => setImmediate(r));
  }
  game.input.keys.clear();
  if (!finished) {
    const shown = game.layers.filter((l) => l.shown).map((l) => l.shown.join(" / "));
    console.log("stuck on:", shown, game.layers.map((l) => l.constructor?.name));
  }
  return finished;
}

let battles = 0;
const files = readdirSync(mapsDir).filter((f) => f.endsWith(".js") && !f.startsWith("_"));

for (const f of files) {
  const id = f.slice(0, -3);
  test(`scripts on ${id} run`, async () => {
    seed = 12345;
    const def = (await import(pathToFileURL(join(mapsDir, f)).href)).default;
    const jobs = [];
    if (def.onEnter) jobs.push(["onEnter", def.onEnter, null]);
    for (const n of def.npcs ?? []) if (n.script) jobs.push([`npc ${n.id}`, n.script, n.id]);
    // A trainer standing on the map: talked to, they battle.
    for (const n of def.npcs ?? []) {
      if (n.trainer) jobs.push([`trainer ${n.trainer}`, async (g) => g.world.scripts.trainer(g.world.actor(n.id), false), n.id]);
    }
    for (const [k, t] of (def.triggers ?? []).entries()) jobs.push([`trigger ${k}`, t.script, { x: t.x, y: t.y }]);
    for (const [name, script, npcId] of jobs) {
      const { game, world, errors } = setup();
      // Stand somewhere walkable on the map, next to the person if there is one.
      // A trigger runs with the player on its tile, as it does in play.
      const spot = typeof npcId === "object" && npcId ? { ...npcId, dir: "up" } : findSpot(def, npcId);
      await drive(game, world.enter({ map: id, x: spot.x, y: spot.y, dir: spot.dir }));
      const self = typeof npcId === "string" ? world.actor(npcId) : undefined;
      const ok = await drive(game, game.run(() => world.scripts.run(script, `${id} ${name}`, self), name));
      assert.deepEqual(errors, [], `${id} ${name} threw`);
      assert.ok(ok, `${id} ${name} didn't finish`);
      const won = Object.keys(game.state.flags).filter((k) => k.startsWith("trainer:")).length;
      battles += won;
      if (process.env.DEBUG_SCRIPTS && String(script).includes("battle(") && !won) console.log("NO WIN", id, name, String(game.state.pos.map), game.state.party.map((c) => c.hp));
    }
  });
}

function findSpot(def, npcId) {
  const rows = def.rows;
  const open = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < rows[0].length && ".:\"F+S n_m#o=d".includes(rows[y][x]);
  if (npcId) {
    const n = def.npcs.find((n) => n.id === npcId);
    for (const [dx, dy, dir] of [[0, 1, "up"], [0, -1, "down"], [1, 0, "left"], [-1, 0, "right"]]) {
      if (open(n.x + dx, n.y + dy) && !(def.npcs ?? []).some((o) => o.x === n.x + dx && o.y === n.y + dy)) return { x: n.x + dx, y: n.y + dy, dir };
    }
  }
  for (const sp of Object.values(def.spawns ?? {})) return { x: sp.x, y: sp.y, dir: sp.dir ?? "down" };
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[0].length; x++) if (open(x, y)) return { x, y, dir: "down" };
  return { x: 0, y: 0, dir: "down" };
}

test("the driven scripts really fought their battles", () => {
  // Every trainer in the game, and those fought from scripts: over a hundred wins.
  assert.ok(battles >= 110, `only ${battles} battles were won`);
});
