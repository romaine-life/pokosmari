// @ts-check
// The title logo: POKOSMARI in tall bevelled letters on a wave, a gold fill fading to
// orange inside a deep blue outline, with a drop shadow and a star.

import { Grid, memo, mix } from "./grid.js";

/** @typedef {import("./grid.js").Pixels} Pixels */

// Letter shapes on a 6x7 grid (7x7 for M), drawn at 2x horizontally and 4x vertically.
/** @type {Record<string, string[]>} */
const LETTERS = {
  P: ["#####.", "##..##", "##..##", "#####.", "##....", "##....", "##...."],
  O: [".####.", "##..##", "##..##", "##..##", "##..##", "##..##", ".####."],
  K: ["##..##", "##.##.", "####..", "###...", "####..", "##.##.", "##..##"],
  S: [".#####", "##....", "##....", ".####.", "....##", "....##", "#####."],
  M: ["##...##", "###.###", "#######", "##.#.##", "##...##", "##...##", "##...##"],
  A: ["..##..", ".####.", "##..##", "##..##", "######", "##..##", "##..##"],
  R: ["#####.", "##..##", "##..##", "#####.", "####..", "##.##.", "##..##"],
  I: ["######", "..##..", "..##..", "..##..", "..##..", "..##..", "######"],
};

const WORD = "POKOSMARI";
const SX = 2;
const SY = 4;
const GAP = 3;
const W = 160;
const H = 48;

const OUTLINE = "#1c3a2c";
const SHADOW = "#0c1c14";
const TOP = "#d8f0a0";
const BOTTOM = "#38a058";

const titleCache = memo(() => {
  const fill = new Grid(W, H);
  const widths = [...WORD].map((c) => LETTERS[c][0].length * SX);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (WORD.length - 1);
  let x = Math.floor((W - total) / 2);
  const top = 6;
  [...WORD].forEach((c, i) => {
    const dy = Math.round(Math.sin(i * 0.75) * 2);
    LETTERS[c].forEach((row, j) => {
      for (let k = 0; k < row.length; k++) {
        if (row[k] !== "#") continue;
        for (let b = 0; b < SY; b++) {
          const y = top + dy + j * SY + b;
          const t = (j * SY + b) / (7 * SY - 1);
          for (let a = 0; a < SX; a++) fill.set(x + k * SX + a, y, mix(TOP, BOTTOM, t));
        }
      }
    });
    x += widths[i] + GAP;
  });
  // a bevel: a light line along each letter's top edge
  const bevel = fill.copy();
  for (let y = 1; y < H; y++)
    for (let x2 = 0; x2 < W; x2++) if (fill.get(x2, y) && !fill.get(x2, y - 1)) bevel.set(x2, y, "#ffffff");
  // outline twice for weight, then a drop shadow under everything
  const outlined = bevel.copy().outline(OUTLINE, true).outline(OUTLINE);
  const out = new Grid(W, H);
  for (let y = 0; y < H; y++)
    for (let x2 = 0; x2 < W; x2++) if (outlined.get(x2, y)) out.set(x2 + 2, y + 2, SHADOW);
  out.blit(outlined, 0, 0);
  // a swoosh under the word and a four-point star at its end
  for (let i = 18; i < 142; i++) {
    const y = 42 + Math.round(Math.sin((i - 18) / 124 * Math.PI) * -3);
    out.set(i, y, OUTLINE).set(i, y + 1, "#e8c070").set(i, y + 2, OUTLINE);
  }
  out.stamp(
    ["...o...", "..oyo..", "ooyWyoo", "..oyo..", "...o..."],
    { o: OUTLINE, y: "#d8f0a0", W: "#ffffff" },
    141,
    39,
  );
  return out.toPixels();
});

/**
 * The 160x48 title logo.
 * @returns {Pixels}
 */
export function titlePixels() {
  return titleCache("title");
}
