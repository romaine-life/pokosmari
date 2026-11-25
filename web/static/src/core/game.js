// @ts-check
// The game object every part shares: the screen, input, sound, the dex, the save state, the
// layers drawn each frame, and frame-by-frame waiting for the async flows (scripts, menus,
// battles) that drive the game.

import { Input } from "./input.js";
import { createRng } from "./rng.js";

export const WIDTH = 160;
export const HEIGHT = 144;
const STEP_MS = 1000 / 60;

/**
 * Something drawn each frame, bottom to top. The overworld is the bottom layer; text boxes,
 * menus and the battle screen go above it while they are open.
 * @typedef {{draw(ctx: CanvasRenderingContext2D, game: Game): void, update?(game: Game): void}} Layer
 */

/**
 * @typedef {object} Audio
 * @property {() => void} unlock
 * @property {(id: string) => void} playMusic
 * @property {() => void} stopMusic
 * @property {(id: string) => Promise<void>|void} jingle
 * @property {(id: string) => void} playSfx
 * @property {(speciesId: string) => void} playCry
 * @property {(v: {music: number, sfx: number}) => void} setVolumes
 */

export class Game {
  /**
   * @param {{ctx: CanvasRenderingContext2D|null, dex: import("../game/dex.js").Dex, audio: Audio, store: import("../game/save.js").Store, report?: (e: unknown, where: string) => void}} o
   */
  constructor(o) {
    this.ctx = o.ctx;
    this.dex = o.dex;
    this.audio = o.audio;
    this.store = o.store;
    this.report = o.report ?? (() => {});
    this.input = new Input();
    this.rng = createRng((Date.now() ^ 0x5eed) >>> 0);
    /** @type {import("../game/state.js").State|null} */
    this.state = null;
    /** @type {Layer[]} */
    this.layers = [];
    /** Frames since the page loaded; animations key off it. */
    this.frameCount = 0;
    /** @type {(() => void)[]} */
    this.waiters = [];
    /** Set while an async flow (script, menu, battle) owns the input; the overworld waits. */
    this.busy = 0;
    /** The overworld, once a game is running (world/overworld.js). @type {any} */
    this.world = null;
    /** Fade to black: 0 clear, 1 black. */
    this.fade = 0;
    /** A white flash for a battle's start, 0-1. */
    this.flash = 0;
  }

  /** @param {Layer} l */
  push(l) {
    this.layers.push(l);
    return l;
  }

  /** @param {Layer} l */
  remove(l) {
    const i = this.layers.indexOf(l);
    if (i >= 0) this.layers.splice(i, 1);
  }

  /** Resolves after the next frame's update. */
  frame() {
    return new Promise((resolve) => this.waiters.push(() => resolve(undefined)));
  }

  /** @param {number} n frames */
  async wait(n) {
    for (let i = 0; i < n; i++) await this.frame();
  }

  /**
   * Run an async flow that owns the input until it ends. Errors it throws are reported and
   * shown, never swallowed.
   * @template T
   * @param {() => Promise<T>} fn
   * @param {string} where
   * @returns {Promise<T|undefined>}
   */
  async run(fn, where) {
    this.busy++;
    try {
      return await fn();
    } catch (e) {
      this.report(e, where);
      return undefined;
    } finally {
      this.busy--;
    }
  }

  /** Fade the screen to black (or back) over n frames. @param {number} to @param {number} n */
  async fadeTo(to, n = 12) {
    const from = this.fade;
    for (let i = 1; i <= n; i++) {
      this.fade = from + ((to - from) * i) / n;
      await this.frame();
    }
  }

  /** One frame: input, the layers' updates, then wake the flows waiting on a frame. */
  step() {
    this.frameCount++;
    this.input.update();
    if (this.state) this.state.playSeconds += 1 / 60;
    for (const l of [...this.layers]) l.update?.(this);
    const w = this.waiters;
    this.waiters = [];
    for (const f of w) f();
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (const l of this.layers) l.draw(ctx, this);
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flash})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  /** Run the loop off requestAnimationFrame at a fixed 60 steps a second. */
  start() {
    let last = performance.now();
    let acc = 0;
    /** @param {number} now */
    const tick = (now) => {
      acc += Math.min(now - last, 250);
      last = now;
      // At most two steps per animation frame, so a 50 Hz display keeps time; a long stall
      // (a background tab) drops the time rather than fast-forwarding the game.
      for (let n = 0; acc >= STEP_MS && n < 2; n++) {
        acc = acc > STEP_MS * 4 ? 0 : acc - STEP_MS;
        try {
          this.step();
        } catch (e) {
          this.report(e, "frame");
        }
      }
      this.draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
