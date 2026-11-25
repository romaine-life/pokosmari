// @ts-check
// Hollowmere Cave, lower floor: a dark underground lake between the two ladders up.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "hollowmere-cave-b2",
  name: "Hollowmere Cave B2",
  theme: "cave",
  music: "cave",
  border: "O",
  rows: [
    "OOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOO",
    "OddddddddddddddddddO",
    "OdddddddddddddddLddO",
    "OddOOddddddddddddddO",
    "OddOOddddddddddddddO",
    "OddddddddddddddddddO",
    "OddddddddddddddddddO",
    "OdddddwwwwwwwwdddddO",
    "OdddddwwwwwwwwdddddO",
    "OdddddwwwddwwwdddddO",
    "OdddddwwwddwwwdddddO",
    "OdddddwwwwwwwwdOOddO",
    "OdddddwwwwwwwwdOOddO",
    "OddddddddddddddOOddO",
    "OddddddddddddddOOddO",
    "OdddOOOddddddddddddO",
    "OdddOOOddddddddddddO",
    "OdddddddddddOOdddddO",
    "OdddddddddddOOdddddO",
    "OddLdddddddddddddddO",
    "OddddddddddddddddddO",
    "OOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOO",
  ],
  warps: [
    { x: 3, y: 20, to: { map: "hollowmere-cave", x: 4, y: 15, dir: "right" } },
    { x: 16, y: 3, to: { map: "hollowmere-cave", x: 15, y: 8, dir: "left" } },
  ],
  npcs: [
    { id: "hiker", x: 11, y: 17, sprite: "hiker", dir: "left", move: "still", trainer: "cave-hiker-2", sight: 4 },
    { id: "psychic", x: 14, y: 6, sprite: "psychic", dir: "left", move: "still", trainer: "cave-psychic", sight: 4 },
  ],
  items: [
    { x: 9, y: 10, item: "growth-candy" },
    { x: 17, y: 20, item: "great-orb", count: 2 },
    { x: 1, y: 2, item: "long-ward-mist", hidden: true },
  ],
  encounters: {
    cave: { rate: 0.1, table: [
      { species: "booling", min: 25, max: 29, weight: 22 },
      { species: "murkasp", min: 25, max: 29, weight: 18 },
      { species: "ampup", min: 25, max: 28, weight: 15 },
      { species: "vennibit", min: 25, max: 28, weight: 13 },
      { species: "cosmustag", min: 26, max: 29, weight: 10 },
      { species: "ampoboar", min: 27, max: 29, weight: 8 },
      { species: "booladder", min: 27, max: 29, weight: 6 },
      { species: "vennichamp", min: 27, max: 29, weight: 4 },
      { species: "umbrapup", min: 25, max: 28, weight: 4 },
    ] },
    water: { rate: 0.08, table: [
      { species: "umbrapup", min: 25, max: 28, weight: 45 },
      { species: "brinapard", min: 25, max: 29, weight: 30 },
      { species: "umbrastag", min: 27, max: 29, weight: 10 },
      { species: "hydray", min: 25, max: 28, weight: 15 },
    ] },
    oldRod: { rate: 0.1, table: [
      { species: "brinip", min: 12, max: 16, weight: 100 },
    ] },
    goodRod: { rate: 0.1, table: [
      { species: "umbrapup", min: 25, max: 28, weight: 60 },
      { species: "hydray", min: 25, max: 28, weight: 40 },
    ] },
  },
};
