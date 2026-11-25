// @ts-check
// Ironvale Mine, upper level: the cave-in left a boulder in the only way through. The
// Power Gloves push it aside; the ladder leads down to the Syndicate's dig.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ironvale-mine",
  name: "Ironvale Mine",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    'OOOOOOOOOOOOOOOOOOOO',
    'OOOOOOOOOOOOOooooOOO',
    'OOoooOOOOOOOOooLoOOO',
    'OOoooOOOOOOOOooooOOO',
    'OOoooOOOOOOOOOooOOOO',
    'OOOoOOOOOOOOOOooOOOO',
    'OOoooooooooooooooOOO',
    'OOoooooooooooooooOOO',
    'OOoooOOooooooOOooOOO',
    'OOoooooooooooooooOOO',
    'OOoooooooooooooooOOO',
    'OOOOOOOOOoOOOOOOOOOO',
    'OOOooooooooooooooOOO',
    'OOOooooooooooooooOOO',
    'OOOoooOOooooOOoooOOO',
    'OOOooooooooooooooOOO',
    'OOOOOOooooooooOOOOOO',
    'OOOOOOOOOooOOOOOOOOO',
  ],
  spawns: {
    door: { x: 9, y: 17, dir: "up" },
    ladder: { x: 15, y: 2, dir: "down" },
  },
  warps: [
    { x: 9, y: 17, dir: "down", to: { map: "ironvale", x: 2, y: 2 } },
    { x: 10, y: 17, dir: "down", to: { map: "ironvale", x: 2, y: 2 } },
    { x: 15, y: 2, to: { map: "ironvale-mine-b2", at: "ladder" } },
  ],
  npcs: [
    { id: "boulder-1", x: 9, y: 11, sprite: "boulder" },
    { id: "boulder-2", x: 3, y: 5, sprite: "boulder" },
    { id: "miner", x: 12, y: 15, sprite: "worker", dir: "left", move: "still",
      script: async (g) => {
        if (g.has("power-gloves")) {
          await g.say("The Foreman's\ngloves! Push that\nboulder, quick!\fThe Syndicate went\ndown the ladder at\nthe far end.");
        } else {
          await g.say("The ceiling came\ndown and now that\nboulder's stuck in\fthe gap. Only the\nForeman's gloves\ncould shift it.");
        }
      } },
    { id: "grunt-1", x: 6, y: 13, sprite: "grunt-m", dir: "right", move: "still", trainer: "mine-grunt-1", sight: 3 },
    { id: "grunt-2", x: 15, y: 6, sprite: "grunt-f", dir: "down", move: "still", trainer: "mine-grunt-2", sight: 3 },
  ],
  items: [
    { x: 2, y: 2, item: "mega-tonic" },
    { x: 16, y: 15, item: "great-orb", hidden: true },
    { x: 13, y: 1, item: "rouse-salts" },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "slatafry", min: 30, max: 31, weight: 15 },
        { species: "slatapike", min: 31, max: 34, weight: 15 },
        { species: "mechecoatl", min: 30, max: 33, weight: 15 },
        { species: "mudox", min: 30, max: 33, weight: 20 },
        { species: "wispogolem", min: 31, max: 34, weight: 10 },
        { species: "granagrub", min: 30, max: 32, weight: 15 },
        { species: "flintulynx", min: 32, max: 34, weight: 5 },
        { species: "gearojay", min: 31, max: 33, weight: 5 },
      ],
    },
  },
};
