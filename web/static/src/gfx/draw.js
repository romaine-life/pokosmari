// @ts-check
// Putting art on a canvas. Every Pixels is rendered once to an offscreen canvas (made
// lazily, so importing this module never touches the DOM) and drawn from there after.

import { Grid, memo, mix } from "./grid.js";
import { fontGlyph } from "./font.js";
import { themePalette, UI } from "./palettes.js";

/** @typedef {import("./grid.js").Pixels} Pixels */
/** @typedef {import("../game/dex.js").Species} Species */
/** @typedef {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} Ctx */
/** @typedef {HTMLCanvasElement | OffscreenCanvas} AnyCanvas */

/**
 * A new canvas: an OffscreenCanvas where there is one, else a <canvas> element.
 * @param {number} w @param {number} h
 * @returns {AnyCanvas}
 */
function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** @param {string} hex '#rrggbb' or '#rrggbbaa' @returns {number[]} */
function rgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) : 255;
  return [r, g, b, a];
}

/**
 * Render rows of base-36 palette indexes to a canvas ('0' is transparent).
 * @param {number} w @param {number} h
 * @param {(x: number, y: number) => string} at the index character at a pixel
 * @param {string[]} palette
 * @returns {AnyCanvas}
 */
function rasterise(w, h, at, palette) {
  const canvas = makeCanvas(w, h);
  const ctx = /** @type {Ctx} */ (canvas.getContext("2d"));
  const img = ctx.createImageData(w, h);
  const colors = palette.map((c, i) => (i === 0 || !c ? [0, 0, 0, 0] : rgba(c)));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = parseInt(at(x, y), 36);
      if (!i) continue;
      const c = colors[i];
      if (!c) continue;
      img.data.set(c, (y * w + x) * 4);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** @type {WeakMap<Pixels, AnyCanvas>} */
const plain = new WeakMap();
/** @type {WeakMap<Pixels, AnyCanvas>} */
const flipped = new WeakMap();

/**
 * The cached canvas for a Pixels, mirrored or not.
 * @param {Pixels} p @param {boolean} [flipX]
 * @returns {AnyCanvas}
 */
export function pixelsCanvas(p, flipX = false) {
  const cache = flipX ? flipped : plain;
  let c = cache.get(p);
  if (!c) {
    c = rasterise(p.w, p.h, flipX ? (x, y) => p.rows[y][p.w - 1 - x] : (x, y) => p.rows[y][x], p.palette);
    cache.set(p, c);
  }
  return c;
}

/**
 * Draw any Pixels with its top-left at (x, y).
 * @param {Ctx} ctx @param {Pixels} pixels @param {number} x @param {number} y
 * @param {{flipX?: boolean}} [opts]
 */
export function drawPixels(ctx, pixels, x, y, opts = {}) {
  ctx.drawImage(pixelsCanvas(pixels, !!opts.flipX), Math.round(x), Math.round(y));
}

/**
 * Draw text in the 8x8 font, one character per 8 pixels; "\n" starts a new line 16
 * pixels down (the text box's line spacing).
 * @param {Ctx} ctx @param {string} text @param {number} x @param {number} y
 * @param {"dark"|"light"} [color]
 */
export function drawText(ctx, text, x, y, color = "dark") {
  let cx = x;
  let cy = y;
  for (const ch of text) {
    if (ch === "\n") {
      cx = x;
      cy += 16;
      continue;
    }
    if (ch !== " ") drawPixels(ctx, fontGlyph(ch, color), cx, cy);
    cx += 8;
  }
}

// The window border: a dark line, a blue band with a lit edge, a dark line, then the
// light inside. One corner and one edge; the rest are mirrors.
const CORNER = ["..dddddd", ".dLLLLLL", "dLFFFFFF", "dLFddddd", "dLFdllll", "dLFdllll", "dLFdllll", "dLFdllll"];
const EDGE = ["dddddddd", "LLLLLLLL", "FFFFFFFF", "dddddddd", "llllllll", "llllllll", "llllllll", "llllllll"];
const FRAME_MAP = { d: UI.dark, L: UI.frameLight, F: UI.frame, l: UI.light };

const framePiece = memo((key) => {
  const [piece, fx, fy] = JSON.parse(key);
  let rows = piece === "corner" ? CORNER : piece === "top" ? EDGE : EDGE.map((_, i) => EDGE.map((r) => r[i]).join(""));
  if (fy) rows = rows.slice().reverse();
  if (fx) rows = rows.map((r) => [...r].reverse().join(""));
  return new Grid(8, 8).stamp(rows, FRAME_MAP).toPixels();
});

/**
 * A text window: a light box with a border, all in pixels (w and h multiples of 8, at
 * least 16).
 * @param {Ctx} ctx @param {number} x @param {number} y @param {number} w @param {number} h
 */
export function drawFrame(ctx, x, y, w, h) {
  ctx.fillStyle = UI.light;
  ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
  const piece = (/** @type {string} */ p, fx = 0, fy = 0) => framePiece(JSON.stringify([p, fx, fy]));
  drawPixels(ctx, piece("corner"), x, y);
  drawPixels(ctx, piece("corner", 1), x + w - 8, y);
  drawPixels(ctx, piece("corner", 0, 1), x, y + h - 8);
  drawPixels(ctx, piece("corner", 1, 1), x + w - 8, y + h - 8);
  for (let i = x + 8; i < x + w - 8; i += 8) {
    drawPixels(ctx, piece("top"), i, y);
    drawPixels(ctx, piece("top", 0, 1), i, y + h - 8);
  }
  for (let j = y + 8; j < y + h - 8; j += 8) {
    drawPixels(ctx, piece("side"), x, j);
    drawPixels(ctx, piece("side", 1), x + w - 8, j);
  }
}

/** Where the two creatures stand on the battle screen: the centres of their platforms. */
export const BATTLE_LAYOUT = {
  foe: { x: 116, y: 58 },
  player: { x: 44, y: 90 },
};

const battleCache = memo((theme) => {
  const pal = themePalette(theme);
  const g = new Grid(160, 144, mix(pal.g1, "#ffffff", 0.75));
  // soft bands toward the horizon
  g.rect(0, 0, 160, 10, mix(pal.g1, "#ffffff", 0.55));
  g.rect(0, 12, 160, 3, mix(pal.g1, "#ffffff", 0.55));
  g.rect(0, 18, 160, 1, mix(pal.g1, "#ffffff", 0.55));
  /**
   * @param {number} cx @param {number} cy @param {number} rx @param {number} ry
   */
  const platform = (cx, cy, rx, ry) => {
    g.ellipse(cx, cy + 1, rx, ry, pal.g4);
    g.ellipse(cx, cy, rx - 1, ry - 1, pal.g3);
    g.ellipse(cx, cy - 1, rx - 3, ry - 2, pal.g2);
    g.ellipse(cx - 4, cy - 2, rx - 12, ry - 4, pal.g1);
    // a few tufts around the rim
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (0.15 + (i * 0.7) / 6);
      const x = Math.round(cx + Math.cos(a) * (rx - 4));
      const y = Math.round(cy + Math.sin(a) * (ry - 2) - 1);
      g.set(x, y, pal.g3).set(x + 2, y, pal.g3).set(x + 1, y + 1, pal.g3);
    }
  };
  platform(BATTLE_LAYOUT.foe.x, BATTLE_LAYOUT.foe.y, 36, 9);
  platform(BATTLE_LAYOUT.player.x, BATTLE_LAYOUT.player.y, 40, 8);
  // the bottom 48 rows are the text box's
  g.rect(0, 96, 160, 48, UI.light);
  return g.toPixels();
});

/**
 * The 160x144 battle backdrop for a map theme, as data (the text box area is plain).
 * @param {string} theme
 * @returns {Pixels}
 */
export function battleBackgroundPixels(theme) {
  return battleCache(theme);
}

/**
 * Draw the battle backdrop: a pale sky and the two ground platforms, the foe's top-right
 * and the player's bottom-left, leaving the bottom 48 pixels for the text box.
 * @param {Ctx} ctx @param {string} theme
 */
export function drawBattleBackground(ctx, theme) {
  drawPixels(ctx, battleBackgroundPixels(theme), 0, 0);
}

/** @type {Map<string, AnyCanvas>} */
const creatures = new Map();

/**
 * A species' sprite on a canvas; the back view is the front mirrored.
 * @param {Species} species
 * @param {{back?: boolean}} [opts]
 * @returns {AnyCanvas}
 */
export function creatureCanvas(species, opts = {}) {
  const back = !!opts.back;
  const key = `${species.id}|${back}`;
  let c = creatures.get(key);
  if (!c) {
    const { width: w, height: h, palette, pixels } = species.sprite;
    c = rasterise(w, h, back ? (x, y) => pixels[y * w + (w - 1 - x)] : (x, y) => pixels[y * w + x], palette);
    creatures.set(key, c);
  }
  return c;
}
