// @ts-check
// Hollowmere Cave, upper floor: dark (the Lantern lights it). The south half (from Route 5)
// and the north half (out to Hollowmere) only meet through the lower floor's ladders.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "hollowmere-cave",
  name: "Hollowmere Cave",
  theme: "cave",
  music: "cave",
  border: "O",
  rows: [
    "OOOOOOOOOooOOOOOOOOO",
    "OOOOOOOOOooOOOOOOOOO",
    "OOdddddddoodddddddOO",
    "OOddddddddddddddddOO",
    "OOddddddddddddddddOO",
    "OOdddOOOddddddddddOO",
    "OOdddOOOdddOOdddddOO",
    "OOdddddddddOOdddddOO",
    "OOdddddddddOOdddLdOO",
    "OOddddddddddddddddOO",
    "OOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOO",
    "OOddddddddddddddddOO",
    "OOdLddddddddOOddddOO",
    "OOddddOOddddOOddddOO",
    "OOddddOOddddOOddddOO",
    "OOddddddddddddddddOO",
    "OOddddddddddddddddOO",
    "OOddddddddddddOOOdOO",
    "OOdddddddoodddddddOO",
    "OOdddddddoodddddddOO",
    "OOOOOOOOOooOOOOOOOOO",
  ],
  spawns: {
    south: { x: 9, y: 22, dir: "up" },
    north: { x: 9, y: 1, dir: "down" },
  },
  warps: [
    { x: 9, y: 23, dir: "down", to: { map: "route-5", x: 9, y: 4 } },
    { x: 10, y: 23, dir: "down", to: { map: "route-5", x: 9, y: 4 } },
    { x: 9, y: 0, dir: "up", to: { map: "hollowmere", x: 9, y: 17 } },
    { x: 10, y: 0, dir: "up", to: { map: "hollowmere", x: 9, y: 17 } },
    { x: 3, y: 15, to: { map: "hollowmere-cave-b2", x: 4, y: 20, dir: "right" } },
    { x: 16, y: 8, to: { map: "hollowmere-cave-b2", x: 15, y: 3, dir: "left" } },
  ],
  npcs: [
    { id: "hiker", x: 14, y: 18, sprite: "hiker", dir: "left", move: "still", trainer: "cave-hiker-1", sight: 4 },
    { id: "channeler", x: 14, y: 4, sprite: "channeler", dir: "left", move: "still", trainer: "cave-channeler", sight: 4 },
    {
      id: "explorer", x: 10, y: 20, sprite: "hiker", dir: "up", move: "still",
      script: async (g) => {
        if (g.has("lantern")) {
          await g.say("Whoa, a Lantern! Now I can see the ladder in the west corner.\fThat's the only way on. The north exit is past the lower floor.");
        } else {
          await g.say("I can't see my own boots! Dr. Elm in Voltreach makes lanterns, I hear.\fThe way on is down a ladder somewhere in the west...");
        }
      },
    },
  ],
  items: [
    { x: 16, y: 21, item: "great-orb" },
    { x: 2, y: 2, item: "wake-bloom", hidden: true },
    { x: 17, y: 3, item: "mega-tonic" },
  ],
  encounters: {
    cave: { rate: 0.1, table: [
      { species: "booling", min: 24, max: 27, weight: 22 },
      { species: "murkasp", min: 24, max: 27, weight: 15 },
      { species: "ampup", min: 24, max: 27, weight: 18 },
      { species: "vennibit", min: 24, max: 27, weight: 15 },
      { species: "cosmupaw", min: 24, max: 26, weight: 12 },
      { species: "granagrub", min: 24, max: 27, weight: 10 },
      { species: "ampoboar", min: 26, max: 28, weight: 5 },
      { species: "booladder", min: 27, max: 28, weight: 3 },
    ] },
  },
};
