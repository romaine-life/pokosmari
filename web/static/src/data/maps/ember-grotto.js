// @ts-check
// Ember Grotto: an optional warm cave off Route 3, with rock and fire creatures and a few finds.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ember-grotto",
  name: "Ember Grotto",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    "OOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOooooooooooOOOOOOOOOOO",
    "OOOoooooooooooooRooooOOO",
    "OOOoooOOOOOOoooooooooOOO",
    "OOOoooOOOOOOoooooooooOOO",
    "OOOoooOOoooooooooooooOOO",
    "OOOoooOOoRoooooooooooOOO",
    "OOOoooOOoooooooooooRoOOO",
    "OOOoooOOOOOOOOOOoooooOOO",
    "OOOoooOOOOOOOOOOoooooOOO",
    "OOOoooOOOOOOOOOOoooooOOO",
    "OOOooRoooooooooooooooOOO",
    "OOOooooooooooooooooooOOO",
    "OOOOOOOOOOooooOOOOOOOOOO",
    "OOOOOOOOOOooooOOOOOOOOOO",
    "OOOOOOOOOOooooOOOOOOOOOO",
    "OOOOOOOOOOooooOOOOOOOOOO",
  ],
  spawns: { door: { x: 11, y: 17, dir: "up" } },
  warps: [
    { x: 11, y: 17, dir: "down", to: { map: "route-3", x: 19, y: 2 } },
    { x: 12, y: 17, dir: "down", to: { map: "route-3", x: 19, y: 2 } },
  ],
  npcs: [
    { id: "hiker", x: 13, y: 5, sprite: "hiker", dir: "down", move: "still", trainer: "grotto-odo", sight: 3 },
    {
      id: "scientist", x: 18, y: 12, sprite: "scientist", move: "wander",
      text: "The rocks here are warm to the touch. There's magma not far below.\fGranagrubs nibble the minerals. They're everywhere once you start looking.",
    },
  ],
  items: [
    { x: 8, y: 8, item: "hyper-stone" },
    { x: 3, y: 2, item: "great-orb", count: 2 },
    { x: 20, y: 3, item: "wake-bloom" },
    { x: 4, y: 13, item: "focus-drop", hidden: true },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "granagrub", min: 14, max: 18, weight: 30 },
        { species: "dunulump", min: 14, max: 17, weight: 22 },
        { species: "pyrapip", min: 14, max: 17, weight: 18 },
        { species: "toxibean", min: 15, max: 18, weight: 15 },
        { species: "dojopupa", min: 15, max: 18, weight: 10 },
        { species: "pyrakid", min: 18, max: 18, weight: 5 },
      ],
    },
  },
};
