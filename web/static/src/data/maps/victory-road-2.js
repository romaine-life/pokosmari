// @ts-check
// Victory Road 2F: an underground lake splits the floor in two (Tide Board).

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "victory-road-2",
  name: "VICTORY ROAD",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    "OOOOOOOOOOOOOOOOOOOO", // 0
    "OOooooooOOOOoooLooOO",
    "OOooooooooooooooooOO",
    "OOoooRRoooooooooooOO",
    "OOooooooooooooooooOO",
    "OOwwwwwwwwwwwwwwwwOO", // 5
    "OOwwwwwwwwwwwwwwwwOO",
    "OOwwwwwRRwwwwwwwwwOO",
    "OOwwwwwwwwwwwwwwwwOO",
    "OOooooooooooooooooOO",
    "OOooooooooooooooooOO", // 10
    "OOooooOOOOOOooooooOO",
    "OOooooOOOOOOooooooOO",
    "OOoooooooooooooRooOO",
    "OOoLooooooooooooooOO",
    "OOOOOOOOOOOOOOOOOOOO", // 15
  ],
  spawns: {
    "from-1": { x: 4, y: 14, dir: "right" },
    "from-3": { x: 15, y: 2, dir: "down" },
  },
  warps: [
    { x: 3, y: 14, to: { map: "victory-road", at: "from-2" } },
    { x: 15, y: 1, to: { map: "victory-road-3", at: "from-2" } },
  ],
  npcs: [
    { id: "blackbelt", x: 13, y: 10, sprite: "blackbelt", dir: "left", move: "still", trainer: "vr-blackbelt", sight: 4 },
    { id: "ace-m", x: 3, y: 2, sprite: "ace-m", dir: "right", move: "still", trainer: "vr-ace-m", sight: 4 },
  ],
  items: [
    { x: 2, y: 1, item: "dawn-bloom" },
    { x: 17, y: 1, item: "grand-tonic" },
    { x: 2, y: 13, item: "prime-orb", hidden: true },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "slatorca", min: 43, max: 46, weight: 15 },
        { species: "dojoqueen", min: 43, max: 46, weight: 15 },
        { species: "mudofang", min: 43, max: 46, weight: 15 },
        { species: "granamoth", min: 43, max: 45, weight: 15 },
        { species: "flintulynx", min: 43, max: 46, weight: 15 },
        { species: "crowothane", min: 43, max: 46, weight: 15 },
        { species: "ryuslith", min: 45, max: 47, weight: 5 },
        { species: "dracolith", min: 44, max: 47, weight: 5 },
      ],
    },
    water: {
      rate: 0.1,
      table: [
        { species: "brinapard", min: 42, max: 44, weight: 35 },
        { species: "rippleray", min: 42, max: 45, weight: 30 },
        { species: "brinahorn", min: 43, max: 46, weight: 20 },
        { species: "umbrahorn", min: 44, max: 46, weight: 15 },
      ],
    },
    oldRod: { rate: 0.1, table: [{ species: "splasiray", min: 25, max: 30, weight: 1 }] },
    goodRod: {
      rate: 0.1,
      table: [
        { species: "brinapard", min: 40, max: 44, weight: 40 },
        { species: "hydray", min: 40, max: 44, weight: 35 },
        { species: "umbrastag", min: 42, max: 45, weight: 25 },
      ],
    },
  },
};
