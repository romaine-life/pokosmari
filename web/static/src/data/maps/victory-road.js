// @ts-check
// Victory Road 1F: in from Skyreach, a boulder plugs the only corridor north (Power
// Gloves), and a small tree hides the ladder up (Brush Cutter).

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "victory-road",
  name: "VICTORY ROAD",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    "OOOOOOOOOOOOOOOOOOOO", // 0
    "OOOOOOOOOOOOOOOOOOOO",
    "OOoooooooooooOOOOOOO",
    "OOoooooooooooOoooLOO",
    "OOoooRoooooootoooooO",
    "OOoooooooooooOoooooO", // 5
    "OOoooooooooooOOOOOOO",
    "OOOOOOOOOoOOOOOOOOOO",
    "OOOOOOOOOoOOOOOOOOOO",
    "OOOOOOOOOoOOOOOOOOOO",
    "OOooooooooooooooooOO", // 10
    "OOooooooooooooooooOO",
    "OOooRRooooooooooooOO",
    "OOooooooooooooRRooOO",
    "OOooooooooooooooooOO",
    "OOOOOOOOoooOOOOOOOOO", // 15
    "OOOOOOOOoooOOOOOOOOO",
    "OOOOOOOOOoOOOOOOOOOO",
  ],
  spawns: {
    entrance: { x: 9, y: 17, dir: "up" },
    "from-2": { x: 16, y: 3, dir: "left" },
  },
  warps: [
    { x: 9, y: 17, dir: "down", to: { map: "skyreach", x: 8, y: 2 } },
    { x: 17, y: 3, to: { map: "victory-road-2", at: "from-1" } },
  ],
  npcs: [
    { id: "boulder", x: 9, y: 8, sprite: "boulder" },
    { id: "hiker", x: 15, y: 11, sprite: "hiker", dir: "left", move: "still", trainer: "vr-hiker", sight: 4 },
    { id: "ace-f", x: 3, y: 3, sprite: "ace-f", dir: "down", move: "still", trainer: "vr-ace-f", sight: 3 },
  ],
  items: [
    { x: 17, y: 14, item: "prime-orb" },
    { x: 2, y: 6, item: "wake-bloom" },
    { x: 18, y: 5, item: "grand-tonic" },
    { x: 2, y: 10, item: "panacea", hidden: true },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "granamoth", min: 42, max: 45, weight: 15 },
        { species: "moputitan", min: 43, max: 46, weight: 15 },
        { species: "dojoqueen", min: 43, max: 46, weight: 12 },
        { species: "slatorca", min: 42, max: 45, weight: 12 },
        { species: "ampoboar", min: 42, max: 44, weight: 12 },
        { species: "mudofang", min: 43, max: 46, weight: 12 },
        { species: "flintulynx", min: 42, max: 46, weight: 10 },
        { species: "ampothane", min: 45, max: 47, weight: 5 },
        { species: "ryuslith", min: 44, max: 46, weight: 4 },
        { species: "dracolith", min: 43, max: 46, weight: 3 },
      ],
    },
  },
};
