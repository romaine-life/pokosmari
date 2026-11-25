// @ts-check
// Frostmere Glacier: a deep ice cave under the town, open to the champion. Brrropede
// sleeps at the bottom and stays until it's caught.

/** @type {import("../../world/map.js").Script} */
async function brrropede(g) {
  await g.say("Brrrrrooo...!");
  const res = await g.wild("brrropede", 55, { music: "battle-legend" });
  if (res === "caught") {
    g.setFlag("frostmere-brrropede-caught");
  } else {
    await g.say("Brrropede curled up\nin the ice again.");
  }
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere-glacier",
  name: "Frostmere Glacier",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    'OOOOOOOooOOOOOOO',
    'OOOooooooooooOOO',
    'OOOooooooooooOOO',
    'OOOOOOOOOOooOOOO',
    'OOooooooooooooOO',
    'OOoowwwwwwwoooOO',
    'OOoowwwwwwwoooOO',
    'OOoooooooooooOOO',
    'OOooOOOOOOOOOOOO',
    'OOooOOOOOOOOOOOO',
    'OOooooooooooooOO',
    'OOooooooRRooooOO',
    'OOooooooooooooOO',
    'OOOOOOOOOOOoOOOO',
    'OOOOOOOOOOOoOOOO',
    'OOooooooooooooOO',
    'OOooooooooooooOO',
    'OOOOOOoooooOOOOO',
    'OOOOOOoooooOOOOO',
    'OOOOOOOOOOOOOOOO',
  ],
  spawns: { door: { x: 7, y: 0, dir: "down" } },
  warps: [
    { x: 7, y: 0, dir: "up", to: { map: "frostmere", x: 16, y: 9 } },
    { x: 8, y: 0, dir: "up", to: { map: "frostmere", x: 16, y: 9 } },
  ],
  npcs: [
    { id: "boulder", x: 11, y: 13, sprite: "boulder" },
    { id: "brrropede", x: 8, y: 17, sprite: "creature", dir: "down", move: "still",
      showIf: "champion", hideIf: "frostmere-brrropede-caught", script: brrropede },
  ],
  items: [
    { x: 12, y: 1, item: "growth-candy" },
    { x: 2, y: 16, item: "dawn-bloom" },
    { x: 13, y: 7, item: "prime-orb", hidden: true },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "snowooze", min: 45, max: 50, weight: 20 },
        { species: "sleetiwing", min: 45, max: 50, weight: 15 },
        { species: "slatorca", min: 46, max: 51, weight: 20 },
        { species: "mudofang", min: 46, max: 51, weight: 15 },
        { species: "flintulynx", min: 47, max: 52, weight: 10 },
        { species: "wispogolem", min: 45, max: 50, weight: 20 },
      ],
    },
    water: {
      rate: 0.08,
      table: [
        { species: "brinahorn", min: 45, max: 50, weight: 50 },
        { species: "wavabeast", min: 45, max: 50, weight: 50 },
      ],
    },
  },
};
