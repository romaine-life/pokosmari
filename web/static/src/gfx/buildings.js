// @ts-check
// Whole buildings, drawn at their size in tiles (BUILDINGS in data/tiles.js) with the door
// in the tile the data names. The pixels around a roof's edge are transparent: the map's
// tiles under the building show there.

import { Grid, memo } from "./grid.js";
import { themePalette } from "./palettes.js";
import { BUILDINGS } from "../data/tiles.js";

/** @typedef {import("./grid.js").Pixels} Pixels */
/** @typedef {import("./palettes.js").ThemePalette} ThemePalette */

/**
 * A shingled roof shaped as a trapezoid: `inset` pixels narrower at the ridge.
 * @param {Grid} g @param {ThemePalette} pal
 * @param {number} x @param {number} y @param {number} w @param {number} h
 * @param {{light: string, mid: string, dark: string, ink: string}} c
 * @param {number} [inset]
 */
function roof(g, pal, x, y, w, h, c, inset = 6) {
  for (let j = 0; j < h; j++) {
    const k = Math.round(inset * (1 - j / Math.max(1, h - 3)));
    const left = x + Math.max(0, k);
    const right = x + w - 1 - Math.max(0, k);
    for (let i = left; i <= right; i++) {
      let col = c.mid;
      const band = (j - 2) % 5;
      if (j < 2) col = c.light;
      else if (band === 4) col = c.dark;
      else if (band === 0 && (i + Math.floor((j - 2) / 5) * 3) % 6 === 0) col = c.dark;
      else if (i - left < 2) col = c.light;
      if (j >= h - 2) col = c.dark;
      g.set(i, y + j, col);
    }
    g.set(left, y + j, c.ink);
    g.set(right, y + j, c.ink);
  }
  for (let i = x + inset; i < x + w - inset; i++) g.set(i, y, c.ink);
  for (let i = x; i < x + w; i++) g.set(i, y + h - 1, c.ink);
  void pal;
}

/**
 * A plain wall with a dark base line and an outline.
 * @param {Grid} g @param {number} x @param {number} y @param {number} w @param {number} h
 * @param {{light: string, mid: string, dark: string, ink: string}} c
 */
function wall(g, x, y, w, h, c) {
  g.rect(x, y, w, h, c.light);
  g.rect(x, y, w, 2, c.mid);
  g.rect(x, y + h - 3, w, 2, c.mid);
  g.rect(x, y + h - 1, w, 1, c.dark);
  g.rect(x, y, 1, h, c.ink).rect(x + w - 1, y, 1, h, c.ink);
}

/**
 * A window: frame, glass, a glint.
 * @param {Grid} g @param {ThemePalette} pal @param {number} x @param {number} y @param {number} w @param {number} h
 */
function windowAt(g, pal, x, y, w, h) {
  g.rect(x, y, w, h, pal.ink);
  g.rect(x + 1, y + 1, w - 2, h - 2, pal.glass1);
  g.rect(x + 1, y + Math.floor(h / 2), w - 2, h - 1 - Math.floor(h / 2), pal.glass2);
  g.rect(x + Math.floor(w / 2), y + 1, 1, h - 2, pal.ink);
  g.set(x + 2, y + 2, "#ffffff");
  g.rect(x - 1, y + h, w + 2, 1, pal.wall3);
}

/**
 * A wooden door filling most of its tile, with a step.
 * @param {Grid} g @param {ThemePalette} pal @param {number} tx @param {number} ty door tile
 */
function door(g, pal, tx, ty) {
  const x = tx * 16;
  const y = ty * 16;
  g.rect(x + 2, y + 1, 12, 15, pal.ink);
  g.rect(x + 3, y + 2, 10, 13, pal.door1);
  g.rect(x + 3, y + 2, 10, 1, pal.door2);
  g.rect(x + 5, y + 4, 6, 4, pal.door2);
  g.rect(x + 6, y + 5, 4, 2, pal.glass1);
  g.rect(x + 3, y + 9, 10, 1, pal.door2);
  g.set(x + 11, y + 11, "#f8d860");
  g.rect(x + 1, y + 15, 14, 1, pal.r3);
  g.rect(x + 2, y + 15, 12, 1, pal.r2);
}

/**
 * Sliding glass doors for the shops.
 * @param {Grid} g @param {ThemePalette} pal @param {number} tx @param {number} ty @param {string} frame
 */
function glassDoor(g, pal, tx, ty, frame) {
  const x = tx * 16;
  const y = ty * 16;
  g.rect(x + 1, y + 1, 14, 15, pal.ink);
  g.rect(x + 2, y + 2, 12, 13, frame);
  g.rect(x + 3, y + 3, 4, 12, pal.glass1);
  g.rect(x + 9, y + 3, 4, 12, pal.glass1);
  g.rect(x + 3, y + 9, 4, 6, pal.glass2);
  g.rect(x + 9, y + 9, 4, 6, pal.glass2);
  g.rect(x + 8, y + 2, 1, 13, pal.ink);
  g.set(x + 4, y + 4, "#ffffff");
  g.set(x + 10, y + 4, "#ffffff");
  g.rect(x, y + 15, 16, 1, pal.r3);
}

/**
 * @param {ThemePalette} pal
 * @returns {{light: string, mid: string, dark: string, ink: string}}
 */
const roofColors = (pal) => ({ light: pal.roof1, mid: pal.roof2, dark: pal.roof3, ink: pal.ink });
/** @param {ThemePalette} pal */
const wallColors = (pal) => ({ light: pal.wall1, mid: pal.wall2, dark: pal.wall3, ink: pal.ink });

/** @type {Record<string, (pal: ThemePalette, w: number, h: number, door: number[]) => Grid>} */
const DRAW = {
  house(pal, W, H, d) {
    const g = new Grid(W, H);
    wall(g, 2, 26, W - 4, H - 26, wallColors(pal));
    roof(g, pal, 0, 0, W, 28, roofColors(pal));
    // a chimney
    g.rect(W - 18, 0, 6, 6, pal.ink).rect(W - 17, 1, 4, 5, pal.r2).rect(W - 17, 1, 4, 1, pal.r1);
    windowAt(g, pal, 38, 31, 12, 9);
    door(g, pal, d[0], d[1]);
    return g;
  },
  bighouse(pal, W, H, d) {
    const g = new Grid(W, H);
    wall(g, 2, 30, W - 4, H - 30, wallColors(pal));
    roof(g, pal, 0, 0, W, 32, roofColors(pal), 8);
    g.rect(14, 0, 6, 8, pal.ink).rect(15, 1, 4, 7, pal.r2).rect(15, 1, 4, 1, pal.r1);
    // a dormer window in the roof
    g.rect(40, 9, 16, 14, pal.ink).rect(41, 10, 14, 12, pal.wall1);
    windowAt(g, pal, 43, 12, 10, 8);
    windowAt(g, pal, 8, 36, 14, 10);
    windowAt(g, pal, 58, 36, 14, 10);
    windowAt(g, pal, 76, 36, 14, 10);
    // flower boxes
    for (const x of [8, 58, 76]) {
      g.rect(x, 47, 14, 2, pal.door2);
      for (let i = 0; i < 14; i += 3) g.set(x + i + 1, 46, i % 2 ? pal.fl1 : pal.fl2);
    }
    door(g, pal, d[0], d[1]);
    return g;
  },
  center(pal, W, H, d) {
    const g = new Grid(W, H);
    const roofC = { light: "#78d8c8", mid: "#38a8a0", dark: "#1c6c70", ink: pal.ink };
    wall(g, 2, 26, W - 4, H - 26, { light: "#f8f8f8", mid: "#d8e0e8", dark: "#98a8b8", ink: pal.ink });
    roof(g, pal, 0, 0, W, 28, roofC, 4);
    // the heart sign on the roof
    g.rect(28, 3, 24, 18, pal.ink).rect(29, 4, 22, 16, "#f8f8f8");
    const heart = [
      ".hh...hh.",
      "hHhh.hhhh",
      "hHhhhhhhh",
      "hhhhhhhhh",
      ".hhhhhhh.",
      "..hhhhh..",
      "...hhh...",
      "....h....",
    ];
    g.stamp(heart, { h: "#e84868", H: "#ffb0c0" }, 36, 8);
    // a red stripe across the wall
    g.rect(3, 29, W - 6, 3, "#e84868");
    windowAt(g, pal, 8, 36, 20, 10);
    windowAt(g, pal, 52, 36, 20, 10);
    glassDoor(g, pal, d[0], d[1], "#e84868");
    return g;
  },
  mart(pal, W, H, d) {
    const g = new Grid(W, H);
    const roofC = { light: "#f8c060", mid: "#e09030", dark: "#a05c18", ink: pal.ink };
    wall(g, 2, 24, W - 4, H - 24, { light: "#f8f0e0", mid: "#e0d0b8", dark: "#a89070", ink: pal.ink });
    roof(g, pal, 0, 0, W, 26, roofC, 4);
    // the bag sign
    g.rect(22, 3, 20, 18, pal.ink).rect(23, 4, 18, 16, "#f8f8f8");
    const bag = [
      "...bbbb...",
      "..b....b..",
      "..b....b..",
      "BBBBBBBBBB",
      "BbbbbbbbbB",
      "BbbbwwbbbB",
      "BbbbwwbbbB",
      "BbbbbbbbbB",
      "BbbbbbbbbB",
      "BBBBBBBBBB",
    ];
    g.stamp(bag, { b: "#4878e0", B: "#284090", w: "#f8f8f8" }, 27, 7);
    // a striped awning over the front
    for (let i = 3; i < W - 3; i++) g.rect(i, 28, 1, 4, Math.floor((i - 3) / 4) % 2 ? "#f8f8f8" : "#4878e0");
    g.rect(2, 32, W - 4, 1, pal.ink);
    windowAt(g, pal, 38, 38, 20, 12);
    glassDoor(g, pal, d[0], d[1], "#4878e0");
    return g;
  },
  lab(pal, W, H, d) {
    const g = new Grid(W, H);
    const wc = { light: "#e8f0f8", mid: "#c0d0e0", dark: "#8898b0", ink: pal.ink };
    wall(g, 2, 18, W - 4, H - 18, wc);
    // a flat roof with a parapet
    g.rect(0, 10, W, 10, pal.ink).rect(1, 11, W - 2, 8, "#9aa8bc").rect(1, 11, W - 2, 2, "#c8d4e4");
    g.rect(1, 17, W - 2, 1, "#6c7890");
    // a dish antenna on the roof
    g.rect(70, 4, 2, 7, pal.ink);
    g.stamp(["..dddd..", ".dDDDDd.", "dDDDDDDd", ".dddddd."], { d: pal.ink, D: "#e0e8f0" }, 63, 0);
    g.rect(22, 3, 4, 8, pal.ink).rect(23, 4, 2, 6, "#d84848");
    // a long band of windows
    for (const x of [6, 22, 54, 70]) windowAt(g, pal, x, 24, 14, 10);
    windowAt(g, pal, 6, 40, 14, 10);
    windowAt(g, pal, 70, 40, 14, 10);
    g.rect(52, 42, 14, 7, pal.ink).rect(53, 43, 12, 5, "#3c7c5c");
    g.rect(55, 45, 8, 1, "#a8e8b8");
    glassDoor(g, pal, d[0], d[1], "#8898b0");
    return g;
  },
  spire(pal, W, H, d) {
    const g = new Grid(W, H);
    const s1 = pal.sp1;
    const s2 = pal.sp2;
    const s3 = pal.sp3;
    const s4 = pal.sp4;
    const ink = pal.ink;
    // the base, full width
    g.rect(0, 40, W, H - 40, ink).rect(1, 41, W - 2, H - 42, s2);
    for (let y = 44; y < H - 2; y += 6) {
      g.rect(1, y, W - 2, 1, s3);
      for (let x = (y / 6) % 2 ? 6 : 1; x < W - 1; x += 10) g.rect(x, y - 5, 1, 5, s3);
    }
    g.rect(1, 41, W - 2, 2, s1);
    // the tower
    g.rect(16, 8, W - 32, 34, ink).rect(17, 9, W - 34, 32, s2);
    g.rect(17, 9, 3, 32, s1).rect(W - 20, 9, 3, 32, s3);
    // battlements
    for (let x = 16; x < W - 16; x += 8) g.rect(x, 3, 5, 6, ink).rect(x + 1, 4, 3, 5, s1);
    for (let x = 0; x < W; x += 8) g.rect(x, 36, 5, 5, ink).rect(x + 1, 37, 3, 4, s1);
    g.rect(0, 40, W, 1, ink);
    // the Wardens' emblem: a gold eight-point star in a ring
    g.ellipse(W / 2, 24, 11, 11, ink).ellipse(W / 2, 24, 10, 10, s4).ellipse(W / 2, 24, 8, 8, s3);
    const star = [
      ".....g.....",
      "..g..g..g..",
      "...g.g.g...",
      "....GgG....",
      ".gggGWGggg.",
      "....GgG....",
      "...g.g.g...",
      "..g..g..g..",
      ".....g.....",
    ];
    g.stamp(star, { g: pal.spg, G: "#c08820", W: "#fff8d0" }, W / 2 - 5, 20);
    // banners either side of the door
    for (const x of [18, 70]) {
      g.rect(x, 46, 8, 16, ink).rect(x + 1, 47, 6, 14, s4).rect(x + 3, 50, 2, 6, pal.spg);
      g.set(x + 1, 61, ink).set(x + 6, 61, ink);
    }
    // the great door
    const x = d[0] * 16;
    const y = d[1] * 16;
    g.rect(x - 2, y - 8, 20, 24, ink);
    g.ellipse(x + 8, y - 2, 9, 7, ink);
    g.rect(x - 1, y - 6, 18, 22, s4);
    g.ellipse(x + 8, y - 2, 8, 6, s4);
    g.rect(x + 7, y - 7, 2, 23, ink);
    g.set(x + 5, y + 6, pal.spg).set(x + 10, y + 6, pal.spg);
    g.rect(x - 3, y + 15, 22, 1, s1);
    return g;
  },
  gate(pal, W, H, d) {
    const g = new Grid(W, H);
    wall(g, 2, 16, W - 4, H - 16, { light: "#e8e8e0", mid: "#c8c8c0", dark: "#909088", ink: pal.ink });
    // a flat roof with a striped band
    g.rect(0, 8, W, 10, pal.ink).rect(1, 9, W - 2, 8, pal.roof2).rect(1, 9, W - 2, 2, pal.roof1);
    for (let i = 1; i < W - 1; i++) g.rect(i, 13, 1, 3, Math.floor(i / 4) % 2 ? "#f8f8f8" : "#e8b830");
    // a lamp on the roof
    g.rect(28, 2, 8, 7, pal.ink).rect(29, 3, 6, 5, "#f8e070").rect(29, 3, 6, 1, "#fff8c0");
    windowAt(g, pal, 38, 22, 18, 11);
    // a barrier arm beside the window
    g.rect(36, 37, 22, 3, pal.ink).rect(37, 38, 20, 1, "#e84848");
    for (let i = 39; i < 57; i += 6) g.rect(i, 38, 3, 1, "#f8f8f8");
    door(g, pal, d[0], d[1]);
    return g;
  },
  cave(pal, W, H, d) {
    const g = new Grid(W, H);
    g.ellipse(W / 2, H / 2 + 3, W / 2, H / 2 + 2, pal.r2);
    g.rect(0, H - 8, W, 8, pal.r2);
    g.ellipse(W / 2 - 4, H / 2, W / 2 - 7, H / 2 - 5, pal.r1);
    g.ellipse(W / 2 + 3, H / 2 + 4, W / 2 - 6, H / 2 - 6, pal.r2);
    for (const [x, y] of [
      [20, 6],
      [8, 12],
      [25, 16],
      [5, 20],
    ])
      g.rect(x, y, 3, 1, pal.r3);
    g.rect(0, H - 2, W, 2, pal.r3);
    g.outline(pal.ink);
    // the mouth, in the door tile
    const x = d[0] * 16;
    const y = d[1] * 16;
    g.ellipse(x + 8, y + 6, 7, 8, pal.ink);
    g.rect(x + 1, y + 6, 14, 10, pal.ink);
    g.ellipse(x + 8, y + 7, 6, 7, "#000000");
    g.rect(x + 2, y + 7, 12, 9, "#000000");
    return g;
  },
};

const buildingCache = memo((key) => {
  const [kind, theme] = JSON.parse(key);
  const def = /** @type {Record<string, {w: number, h: number, door: number[]}>} */ (BUILDINGS)[kind];
  if (!def) throw new Error(`unknown building ${kind}`);
  const pal = themePalette(theme);
  return DRAW[kind](pal, def.w * 16, def.h * 16, def.door).toPixels();
});

/**
 * A whole building at its size in tiles (16px each), its door in the tile BUILDINGS names.
 * @param {string} kind a key of BUILDINGS
 * @param {string} theme one of THEMES
 * @returns {Pixels}
 */
export function buildingPixels(kind, theme) {
  return buildingCache(JSON.stringify([kind, theme]));
}

