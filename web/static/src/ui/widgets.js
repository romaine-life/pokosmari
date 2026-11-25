// @ts-check
// Pieces the screens share: a full-screen page, HP and experience bars, a creature's
// sprite, and the frame-by-frame loop of a list a screen moves through.

import { drawFrame, drawText, creatureCanvas } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";
import { statsOf, expForLevel, displayName } from "../game/creature.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("../game/creature.js").Creature} Creature */

export const PAPER = "#f8f8f0";
export const INK = "#202820";

/** A blank page: the screens draw on it. @param {CanvasRenderingContext2D} ctx */
export function page(ctx) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

/**
 * An HP bar 48 pixels wide, green, then yellow below half, red below a fifth.
 * @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} hp @param {number} max
 */
export function hpBar(ctx, x, y, hp, max) {
  drawText(ctx, "HP", x - 16, y - 2);
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, 50, 5);
  ctx.fillStyle = PAPER;
  ctx.fillRect(x + 1, y + 1, 48, 3);
  const f = max > 0 ? Math.max(0, hp) / max : 0;
  ctx.fillStyle = f > 0.5 ? "#38b848" : f > 0.2 ? "#e8b820" : "#e83820";
  ctx.fillRect(x + 1, y + 1, Math.ceil(48 * f), 3);
}

/**
 * The experience bar toward the next level.
 * @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} w @param {Creature} c
 */
export function expBar(ctx, x, y, w, c) {
  const lo = expForLevel(c.level), hi = expForLevel(c.level + 1);
  const f = c.level >= 100 ? 1 : Math.min(1, (c.exp - lo) / (hi - lo));
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = "#38a0e8";
  ctx.fillRect(x + 1, y + 1, Math.floor((w - 2) * f), 1);
}

/** @param {import("../game/creature.js").Status|null} s */
export function statusLabel(s) {
  return s ? { brn: "BRN", psn: "PSN", tox: "PSN", par: "PAR", slp: "SLP", frz: "FRZ" }[s] : "";
}

/**
 * Draw a creature's sprite at (x, y), its 40×40 grid scaled.
 * @param {CanvasRenderingContext2D} ctx @param {Game} game @param {string} species @param {number} x @param {number} y
 * @param {{scale?: number, back?: boolean}} [o]
 */
export function drawCreature(ctx, game, species, x, y, o = {}) {
  const c = creatureCanvas(game.dex.get(species), { back: o.back });
  const s = o.scale ?? 1;
  ctx.drawImage(c, Math.round(x), Math.round(y), c.width * s, c.height * s);
}

/**
 * One line of the party list: name, level, HP bar and numbers, status.
 * @param {CanvasRenderingContext2D} ctx @param {Game} game @param {Creature} c @param {number} x @param {number} y
 */
export function partyLine(ctx, game, c, x, y) {
  const sp = game.dex.get(c.species);
  const max = statsOf(sp, c).hp;
  drawCreature(ctx, game, c.species, x, y - 2, { scale: 0.4 });
  drawText(ctx, displayName(game.dex, c), x + 18, y);
  drawText(ctx, c.hp <= 0 ? "FNT" : statusLabel(c.status) || `:L${c.level}`, x + 104, y);
  hpBar(ctx, x + 34, y + 10, c.hp, max);
  drawText(ctx, `${String(Math.max(0, c.hp)).padStart(3)}/${String(max).padStart(3)}`, x + 88, y + 9);
}

/**
 * Run a full-screen page until `step` returns a value other than undefined. `step` is called
 * each frame after drawing; `draw` paints the page.
 * @template T
 * @param {Game} game
 * @param {(ctx: CanvasRenderingContext2D) => void} draw
 * @param {() => T|undefined} step
 * @returns {Promise<T>}
 */
export async function screen(game, draw, step) {
  const layer = { draw };
  game.push(layer);
  await game.frame();
  try {
    for (;;) {
      const r = step();
      if (r !== undefined) return r;
      await game.frame();
    }
  } finally {
    game.remove(layer);
  }
}

/**
 * Show a page while an async flow (text, a choice) runs over it.
 * @template T
 * @param {Game} game @param {(ctx: CanvasRenderingContext2D) => void} draw @param {() => Promise<T>} fn
 */
export async function over(game, draw, fn) {
  const layer = { draw };
  game.push(layer);
  try {
    return await fn();
  } finally {
    game.remove(layer);
  }
}

/** A window with a title line. @param {CanvasRenderingContext2D} ctx @param {string} title */
export function titleBar(ctx, title) {
  drawFrame(ctx, 0, 0, WIDTH, 24);
  drawText(ctx, title, 8, 8);
}
