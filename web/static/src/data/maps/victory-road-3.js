// @ts-check
// Victory Road 3F: pitch-black tunnels (Lantern), then the way out to the Summit Citadel,
// where Kip is waiting for one last battle on the road.

/** @param {import("../../script/context.js").ScriptContext} g */
async function kip(g) {
  g.music("rival");
  await g.exclaim("kip");
  await g.approach("kip");
  await g.say("{PLAYER}! Took you long enough!\fI've been waiting here since lunch. Two lunches, really.\fLast stop before the Council. Let's make it count!");
  if (!(await g.battle("kip-5"))) return;
  await g.say("Whew. Remember when we couldn't even find the lab door?\fThe Council's just through there. I'm going in first!\fDon't keep me waiting, {PLAYER}!");
  g.setFlag("endgame-kip5-gone");
  g.mapMusic();
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "victory-road-3",
  name: "VICTORY ROAD",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    "OOOOOOOOOooOOOOOOOOO", // 0
    "OOOOOOOOOooOOOOOOOOO",
    "OOoooooooooooooooOOO",
    "OOoooooooooooooooOOO",
    "OOOOOOOOOOOOOOOdOOOO",
    "OOddddddddOOOOOdOOOO", // 5
    "OOdOOOOOOdOOOOOdOOOO",
    "OOdOOOOOOddddddddOOO",
    "OOdOOOOOOOOOOOOOOOOO",
    "OOddddddOOOOOOOOOOOO",
    "OOOOOOOdOOOOOOOOOOOO", // 10
    "OOOOOOOdOOOOOOOOOOOO",
    "OOoooooooooooooooOOO",
    "OOoooooooooooooooOOO",
    "OOoooRRoooooooooLOOO",
    "OOOOOOOOOOOOOOOOOOOO", // 15
  ],
  spawns: {
    "from-2": { x: 15, y: 14, dir: "left" },
    "from-citadel": { x: 9, y: 1, dir: "down" },
  },
  warps: [
    { x: 16, y: 14, to: { map: "victory-road-2", at: "from-3" } },
    { x: 9, y: 0, dir: "up", to: { map: "summit-citadel", at: "entrance" } },
    { x: 10, y: 0, dir: "up", to: { map: "summit-citadel", at: "entrance" } },
  ],
  triggers: [{ x: 8, y: 2, w: 4, h: 2, unless: "trainer:kip-5", script: kip }],
  npcs: [
    { id: "kip", x: 13, y: 2, sprite: "rival", dir: "left", move: "still", hideIf: "endgame-kip5-gone", script: kip },
    { id: "psychic", x: 12, y: 13, sprite: "psychic", dir: "left", move: "still", trainer: "vr-psychic", sight: 4 },
    { id: "channeler", x: 3, y: 2, sprite: "channeler", dir: "right", move: "still", trainer: "vr-channeler", sight: 4 },
  ],
  items: [
    { x: 16, y: 7, item: "dawn-bloom" },
    { x: 16, y: 12, item: "grand-tonic" },
    { x: 2, y: 13, item: "deep-focus", hidden: true },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "slatorca", min: 44, max: 47, weight: 15 },
        { species: "crowothane", min: 44, max: 47, weight: 15 },
        { species: "murkasp", min: 44, max: 47, weight: 12 },
        { species: "boolanaga", min: 45, max: 48, weight: 8 },
        { species: "flintulynx", min: 44, max: 47, weight: 15 },
        { species: "dojoqueen", min: 44, max: 47, weight: 12 },
        { species: "ampothane", min: 45, max: 48, weight: 10 },
        { species: "ryuslith", min: 46, max: 48, weight: 7 },
        { species: "dracolith", min: 45, max: 48, weight: 6 },
      ],
    },
  },
};
