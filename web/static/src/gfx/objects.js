// @ts-check
// Overworld objects that stand on a tile: an item orb, a pushable boulder, a signpost.

import { Grid, memo } from "./grid.js";
import { INK } from "./characters.js";

/** @typedef {import("./grid.js").Pixels} Pixels */

export const OBJECT_KINDS = ["itemball", "boulder", "sign"];

/** @type {Record<string, {rows: string[], map: Record<string, string>}>} */
const OBJECTS = {
  // A violet orb tied with a gold ribbon, like a wrapped gift.
  itemball: {
    rows: [
      "................",
      "................",
      "......ooo.......",
      ".....oyYyo......",
      "....ooooyoooo...",
      "...ollvvyvvvdo..",
      "..olwlvvyvvvvdo.",
      "..olvvvvyvvvvdo.",
      "..oyyyyyyyyyyyo.",
      "..ovvvvvyvvvvdo.",
      "..ovvvvvyvvvddo.",
      "...ovvvvyvvddo..",
      "....oodddddoo...",
      "......ooooo.....",
      "................",
      "................",
    ],
    map: { o: INK, v: "#9060d8", l: "#c8a0f8", d: "#5c3898", w: "#ffffff", y: "#f0c838", Y: "#fff0a0" },
  },
  boulder: {
    rows: [
      "................",
      ".....oooooo.....",
      "...oollllllloo..",
      "..ollllmmmmmmmo.",
      ".ollllmmmmmmmmdo",
      ".olllmmmmmmdmmdo",
      "olllmmmmmmmdmmdo",
      "ollmmmmmmmdmmmdo",
      "olmmmdmmmmmmmddo",
      "olmmmmddmmmmmddo",
      "ommmmmmmdmmmdddo",
      "ommmmmmmmmmddddo",
      ".ommmmmmmdddddo.",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
    ],
    map: { o: INK, l: "#d8d0c8", m: "#a89c90", d: "#706458" },
  },
  sign: {
    rows: [
      "................",
      "..oooooooooooo..",
      ".ollllllllllllo.",
      ".olkkkkkkkkkkmo.",
      ".ollllllllllllo.",
      ".olkkkkkkkkmmmo.",
      ".ollllllllllllo.",
      ".ommmmmmmmmmmmo.",
      "..oooooooooooo..",
      "......omdo......",
      "......omdo......",
      "......omdo......",
      "......omdo......",
      ".....oommdoo....",
      ".....oooooo.....",
      "................",
    ],
    map: { o: INK, l: "#e8b878", m: "#b07840", d: "#784820", k: "#8a5a30" },
  },
};

const objectCache = memo((kind) => {
  const o = OBJECTS[kind];
  if (!o) throw new Error(`unknown object ${kind}`);
  const g = new Grid(16, 16);
  g.stamp(o.rows, o.map);
  return g.toPixels();
});

/**
 * An overworld object: "itemball", "boulder" or "sign".
 * @param {string} kind
 * @returns {Pixels}
 */
export function objectPixels(kind) {
  return objectCache(kind);
}
