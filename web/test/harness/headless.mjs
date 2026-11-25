// The real game, headless: the same modules the browser runs, drawing into a software
// canvas, driven by scripted button presses, with screenshots written as PNGs. Nothing
// opens a window or makes a sound. Used by tests and for looking at the game while it's
// being built:
//
//   const g = await startGame();
//   await g.press("start"); await g.wait(30); g.shot("title.png");

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SoftCanvas } from "./softcanvas.mjs";

const here = dirname(fileURLToPath(import.meta.url));

// The browser globals the game touches, before any game module loads.
globalThis.OffscreenCanvas ??= SoftCanvas;
globalThis.document ??= /** @type {any} */ ({
  documentElement: { dataset: { base: "./", version: "dev" } },
  createElement: (tag) => (tag === "canvas" ? new SoftCanvas() : { click() {}, addEventListener() {} }),
});
globalThis.window ??= /** @type {any} */ ({ addEventListener() {}, removeEventListener() {} });

const { Game, WIDTH, HEIGHT } = await import("../../static/src/core/game.js");
const { makeDex } = await import("../../static/src/game/dex.js");
const { Overworld } = await import("../../static/src/world/overworld.js");
const { Scripts } = await import("../../static/src/script/context.js");
const { titleScreen } = await import("../../static/src/ui/title.js");
const { startMenu } = await import("../../static/src/ui/start.js");

/** A silent audio that remembers what it was asked to play. */
function recordingAudio() {
  const log = [];
  return {
    log,
    unlock() {},
    playMusic: (id) => log.push(["music", id]),
    stopMusic() {},
    jingle: async (id) => void log.push(["jingle", id]),
    playSfx: (id) => log.push(["sfx", id]),
    playCry: (id) => log.push(["cry", id]),
    setVolumes() {},
  };
}

function memoryStore() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
}

/**
 * Boot the game as main.js does, minus the browser: title screen first.
 * @param {{store?: any, seed?: number, title?: boolean}} [o] title: false skips the title screen (set game.state and enter a map yourself)
 */
export async function startGame(o = {}) {
  const canvas = new SoftCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext();
  const dex = makeDex(JSON.parse(readFileSync(join(here, "../../static/data/species.json"), "utf8")));
  const audio = recordingAudio();
  const errors = [];
  const game = new Game({ ctx: /** @type {any} */ (ctx), dex, audio, store: o.store ?? memoryStore(), report: (e, where) => errors.push(`${where}: ${e?.stack ?? e}`) });
  if (o.seed != null) {
    const { createRng } = await import("../../static/src/core/rng.js");
    game.rng = createRng(o.seed);
  }
  const world = new Overworld(game);
  world.scripts = new Scripts(game, world);
  world.openMenu = startMenu;
  game.world = world;
  game.push(world);
  if (o.title !== false) game.run(() => titleScreen(game), "title");

  /** Run n frames. */
  async function wait(n = 1) {
    for (let i = 0; i < n; i++) {
      game.step();
      await new Promise((r) => setImmediate(r));
    }
  }
  /** Every full line of text shown, in order (for reading back what happened). */
  const said = [];
  const textNow = () => game.layers.filter((l) => l.shown).map((l) => l.shown.join(" ")).join(" | ");
  return {
    game, world, audio, errors, canvas, said,
    wait,
    /** Press and let go of a button (held for a few frames, like a person's tap). */
    async press(btn, times = 1) {
      for (let i = 0; i < times; i++) {
        const t = textNow();
        if (t && said[said.length - 1] !== t) said.push(t);
        game.input.keys.add(btn);
        await wait(3);
        game.input.keys.delete(btn);
        await wait(5);
      }
    },
    /** Hold a button down for n frames. */
    async hold(btn, n) {
      game.input.keys.add(btn);
      await wait(n);
      game.input.keys.delete(btn);
      await wait(1);
    },
    /** Type text the way a keyboard does on the naming screen. */
    async type(text) {
      for (const ch of text) {
        for (const f of keyListeners) f({ key: ch });
        await wait(2);
      }
    },
    /** Draw the current frame and write it as a PNG (3× size). */
    shot(path) {
      game.draw();
      writeFileSync(path, canvas.png());
    },
    /**
     * Walk to a tile on the current map by the shortest open path, as a player would: one
     * held direction per step. Anything that interrupts (a trainer, a wild battle, a scene)
     * is played through with A presses, then the walk goes on. Resolves true on arrival.
     */
    async walkTo(x, y, maxSteps = 400) {
      const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      for (let steps = 0; steps < maxSteps; steps++) {
        while (game.busy) await this.press("a");
        const p = world.player;
        if (p.x === x && p.y === y) return true;
        const path = route(world, p, x, y, DIRS);
        if (!path) return false;
        const dir = path[0];
        const from = `${world.map.id}:${p.x},${p.y}`;
        // Hold the direction until the step is nearly done, then let go, so it doesn't carry
        // into a second step (a tap first only turns the player to face that way).
        game.input.keys.add(dir);
        for (let f = 0; f < 40 && !(p.moving && p.moveFrames <= 2) && `${world.map.id}:${p.x},${p.y}` === from && !game.busy; f++) await wait(1);
        game.input.keys.delete(dir);
        for (let f = 0; f < 40 && world.player.moving; f++) await wait(1);
        // A door or an edge took the player to another map: the walk is over.
        if (world.map.id !== from.split(":")[0]) return false;
      }
      return false;
    },
    /** The text in the open text box, if any. */
    text() {
      return game.layers.filter((l) => l.shown).map((l) => l.shown.join(" / ")).join(" | ");
    },
  };
}

/**
 * The first direction of a shortest walkable path to (x, y), breadth first over the
 * overworld's own passable() (so people, signs, buildings and water count as they do in
 * play). The target must be walkable: to talk to someone, walk to the tile beside them.
 */
function route(world, p, tx, ty, DIRS) {
  const key = (x, y) => `${x},${y}`;
  const prev = new Map([[key(p.x, p.y), null]]);
  const queue = [[p.x, p.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === tx && y === ty) {
      const dirs = [];
      let k = key(x, y);
      while (prev.get(k)) {
        const [dir, pk] = prev.get(k);
        dirs.unshift(dir);
        k = pk;
      }
      return dirs;
    }
    for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
      const nx = x + dx, ny = y + dy, nk = key(nx, ny);
      if (prev.has(nk) || !world.map.inside(nx, ny)) continue;
      if (!world.passable(world.player, nx, ny)) continue;
      prev.set(nk, [dir, key(x, y)]);
      queue.push([nx, ny]);
    }
  }
  return null;
}

/** @type {((e: any) => void)[]} keydown listeners the naming screen adds to window */
const keyListeners = [];
globalThis.window.addEventListener = (type, f) => {
  if (type === "keydown") keyListeners.push(f);
};
globalThis.window.removeEventListener = (type, f) => {
  const i = keyListeners.indexOf(f);
  if (i >= 0) keyListeners.splice(i, 1);
};
