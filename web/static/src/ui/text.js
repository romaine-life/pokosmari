// @ts-check
// The text box and the small prompts every part of the game uses: say, choose, yes/no and
// numbers. Each is an async flow: it draws a layer, reads the buttons frame by frame and
// resolves when the player is done.

import { drawFrame, drawText } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";

/** @typedef {import("../core/game.js").Game} Game */

export const LINE_CHARS = 18;
const BOX_Y = HEIGHT - 48;

/**
 * Put the player's and rival's names into a line.
 * @param {Game} game
 * @param {string} text
 */
export function fill(game, text) {
  const s = game.state;
  return text.replaceAll("{PLAYER}", s?.name || "YOU").replaceAll("{RIVAL}", s?.rival || "Kip");
}

/**
 * Break a paragraph into lines of at most `width` characters, at spaces where it can. A "\n"
 * forces a break.
 * @param {string} text
 * @param {number} width
 */
export function wrap(text, width = LINE_CHARS) {
  /** @type {string[]} */
  const lines = [];
  for (const hard of text.split("\n")) {
    let line = "";
    for (const word of hard.split(" ")) {
      if (word === "") continue;
      let w = word;
      while (w.length > width) {
        if (line) lines.push(line);
        lines.push(w.slice(0, width));
        w = w.slice(width);
        line = "";
      }
      if (!line) line = w;
      else if (line.length + 1 + w.length <= width) line += " " + w;
      else {
        lines.push(line);
        line = w;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Frames per character at each text speed (a fraction shows several a frame). */
const SPEED = { slow: 3, mid: 1, fast: 0.25 };

class TextBox {
  constructor() {
    /** @type {string[]} the two lines on screen */
    this.shown = ["", ""];
    this.arrow = false;
    this.visible = true;
  }
  /** @param {CanvasRenderingContext2D} ctx @param {Game} game */
  draw(ctx, game) {
    if (!this.visible) return;
    drawFrame(ctx, 0, BOX_Y, WIDTH, 48);
    drawText(ctx, this.shown[0], 8, BOX_Y + 8);
    drawText(ctx, this.shown[1], 8, BOX_Y + 24);
    if (this.arrow && Math.floor(game.frameCount / 16) % 2 === 0) drawText(ctx, "▼", WIDTH - 16, BOX_Y + 32);
  }
}

/** @type {TextBox|null} the box left open by say(..., {keep: true}) */
let openBox = null;

/**
 * Show text in the box, letter by letter. "\f" starts a new box. With keep, the box stays
 * on screen with the last lines for a prompt that follows (choose, yesNo); the next say or
 * close() takes it down.
 * @param {Game} game
 * @param {string} text
 * @param {{keep?: boolean, auto?: number}} [o] auto: close by itself after this many frames, no button
 */
export async function say(game, text, o = {}) {
  const box = openBox ?? new TextBox();
  if (!openBox) game.push(box);
  openBox = null;
  box.shown = ["", ""];
  const paragraphs = fill(game, text).split("\f");
  const input = game.input;
  for (let p = 0; p < paragraphs.length; p++) {
    const lines = wrap(paragraphs[p]);
    box.shown = ["", ""];
    let row = 0;
    for (let li = 0; li < lines.length; li++) {
      if (row === 2) {
        // Both lines are full: wait for a press, then scroll up one line.
        await waitPress(game, box, o.auto);
        box.shown = [box.shown[1], ""];
        await game.wait(4);
        row = 1;
      }
      const line = lines[li];
      const speed = SPEED[game.state?.options.textSpeed ?? "mid"];
      let shown = 0;
      let carry = 0;
      while (shown < line.length) {
        const fast = input.held("a") || input.held("b");
        carry += fast ? 4 : 1 / speed;
        const n = Math.floor(carry);
        carry -= n;
        shown = Math.min(line.length, shown + n);
        box.shown[row] = line.slice(0, shown);
        if (shown < line.length) await game.frame();
      }
      row++;
    }
    const last = p === paragraphs.length - 1;
    if (!last || !o.keep) await waitPress(game, box, o.auto);
  }
  if (o.keep) openBox = box;
  else game.remove(box);
}

/** Take down a box left open by say(..., {keep: true}). @param {Game} game */
export function close(game) {
  if (openBox) game.remove(openBox);
  openBox = null;
}

/** @param {Game} game @param {TextBox} box @param {number} [auto] */
async function waitPress(game, box, auto) {
  if (auto != null) {
    // Moves on by itself, or sooner with a press.
    for (let i = 0; i < auto; i++) {
      await game.frame();
      if (game.input.pressed("a") || game.input.pressed("b")) break;
    }
    return;
  }
  box.arrow = true;
  await game.frame();
  while (!game.input.pressed("a") && !game.input.pressed("b")) await game.frame();
  game.audio.playSfx("text-advance");
  box.arrow = false;
}

/**
 * A list to pick from, in a window. Resolves to the index picked, or -1 if cancelled with B
 * (when cancel is allowed).
 * @param {Game} game
 * @param {string[]} items
 * @param {{x?: number, y?: number, width?: number, cancel?: boolean, start?: number, onMove?: (i: number) => void, rows?: number, sides?: boolean, compact?: boolean}} [o]
 *   sides: left and right end the choice too, resolving to -2 and -3 (a bag switching pockets)
 *   compact: rows 10 pixels apart, so four fit in the 48-pixel text area (the battle menus)
 */
export async function choose(game, items, o = {}) {
  const longest = Math.max(...items.map((s) => s.length));
  const width = o.width ?? Math.ceil((longest + 3) / 1) * 8;
  const rows = Math.min(items.length, o.rows ?? items.length);
  const step = o.compact ? 10 : 16;
  const pad = o.compact ? 4 : 8;
  const height = rows * step + pad * 2;
  const x = o.x ?? WIDTH - width;
  const y = o.y ?? BOX_Y - height;
  let i = o.start ?? 0;
  let top = 0;
  const layer = {
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
      drawFrame(ctx, x, y, width, height);
      for (let r = 0; r < rows; r++) {
        const k = top + r;
        if (k >= items.length) break;
        drawText(ctx, items[k], x + 16, y + pad + r * step);
        if (k === i) drawText(ctx, "▶", x + 8, y + pad + r * step);
      }
      if (top > 0) drawText(ctx, "▲", x + width - 12, y + 2);
      if (top + rows < items.length) drawText(ctx, "▼", x + width - 12, y + height - 10);
    },
  };
  game.push(layer);
  const input = game.input;
  await game.frame();
  try {
    for (;;) {
      if (input.repeat("up") && items.length > 1) {
        i = (i + items.length - 1) % items.length;
        game.audio.playSfx("select");
        o.onMove?.(i);
      } else if (input.repeat("down") && items.length > 1) {
        i = (i + 1) % items.length;
        game.audio.playSfx("select");
        o.onMove?.(i);
      } else if (input.pressed("a")) {
        game.audio.playSfx("select");
        return i;
      } else if (o.sides && input.pressed("left")) {
        return -2;
      } else if (o.sides && input.pressed("right")) {
        return -3;
      } else if (input.pressed("b") && o.cancel !== false) {
        game.audio.playSfx("cancel");
        return -1;
      }
      if (i < top) top = i;
      if (i >= top + rows) top = i - rows + 1;
      await game.frame();
    }
  } finally {
    game.remove(layer);
  }
}

/**
 * A YES/NO box beside the text box. B answers no.
 * @param {Game} game
 */
export async function yesNo(game) {
  const i = await choose(game, ["YES", "NO"], { x: WIDTH - 48, y: BOX_Y - 48, width: 48 });
  return i === 0;
}

/**
 * Pick a number with up and down (left/right by ten), like a shop's quantity.
 * @param {Game} game
 * @param {{min?: number, max: number, each?: number}} o each: a price per unit to show the total
 * @returns {Promise<number>} the number, or 0 if cancelled
 */
export async function askNumber(game, o) {
  const min = o.min ?? 1;
  let n = min;
  const width = o.each != null ? 88 : 48;
  const layer = {
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
      drawFrame(ctx, WIDTH - width, BOX_Y - 32, width, 32);
      drawText(ctx, "×" + String(n).padStart(2, "0"), WIDTH - width + 8, BOX_Y - 20);
      if (o.each != null) drawText(ctx, "$" + String(n * o.each).padStart(6, " "), WIDTH - 56, BOX_Y - 20);
    },
  };
  game.push(layer);
  const input = game.input;
  await game.frame();
  try {
    for (;;) {
      if (input.repeat("up")) n = n >= o.max ? min : n + 1;
      else if (input.repeat("down")) n = n <= min ? o.max : n - 1;
      else if (input.repeat("right")) n = Math.min(o.max, n + 10);
      else if (input.repeat("left")) n = Math.max(min, n - 10);
      else if (input.pressed("a")) return n;
      else if (input.pressed("b")) return 0;
      await game.frame();
    }
  } finally {
    game.remove(layer);
  }
}
