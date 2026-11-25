// @ts-check
// Route 6: north from Hollowmere up through the cliffs to Ironvale. Kip waits at the top.

/** @type {import("../../world/map.js").Script} */
async function kipBattle(g) {
  g.music("rival");
  await g.exclaim("kip");
  await g.approach("kip");
  await g.say("{RIVAL}: {PLAYER}! Took you long\nenough!\fI've been up and down\nthese cliffs twice.\nLegs of steel!\fAnd my partner just\nreached its final\nform. Look at it!\fFive badges, five\ncreatures. Let's see\nwho's ahead now!");
  await g.battle("kip-4");
  await g.say("{RIVAL}: ...Okay. You're\ngood. Really good.\fHey, I heard the\nSyndicate's digging\nin the Ironvale mine.\fThe Foreman up there\nwas yelling about it.\nGo be a hero!\fI'm off to get\nstronger. See ya!");
  await g.move("kip", "U5");
  g.hide("kip");
  g.mapMusic();
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-6",
  name: "Route 6",
  theme: "meadow",
  music: "route-2",
  rows: [
    'TTTTTTTTT::TTTTTTTTT',
    'TTF......::......FTT',
    'TT.""""..::.."""".TT',
    'TT.""""..::.."""".TT',
    'TT.......::.......TT',
    'TT^^^^^^.::.^^^^^^TT',
    'TT^^^^^^.::.^^^^^^TT',
    'TT.......::.......TT',
    'TT."""...::...""".TT',
    'TT."""...::...""".TT',
    'TTvvvvv..::..vvvvvTT',
    'TT.......::.......TT',
    'TT.fffff.::.~~~~..TT',
    'TT.F.F.F.::.~~~~..TT',
    'TT.......::.~~~~..TT',
    'TT.""""..::..SS...TT',
    'TT.""""..::.......TT',
    'TT.""""..::.."""".TT',
    'TT.......::.."""".TT',
    'TT^^^^...::...^^^^TT',
    'TT^^^^...::...^^^^TT',
    'TT.......::.......TT',
    'TT.""""".::.......TT',
    'TT.""""".::...RR..TT',
    'TT.""""".::.......TT',
    'TTvvvvvvv::vvvvvvvTT',
    'TT.......::.......TT',
    'TT.."""..::.."""..TT',
    'TT.."""..::.."""..TT',
    'TT.."""..::.."""..TT',
    'TT.......::.......TT',
    'TTTT.....::.....TTTT',
    'TTTT.""".::.""".TTTT',
    'TTTT.""".::.""".TTTT',
    'TTTT.....::.....TTTT',
    'TTTTT.F..::..F.TTTTT',
    'TTTTT....::....TTTTT',
    'TTTTTTT..::..TTTTTTT',
    'TTTTTTTT.::.TTTTTTTT',
    'TTTTTTTTT::TTTTTTTTT',
  ],
  connections: { north: { map: "ironvale", offset: 0 } },
  spawns: { "from-hollowmere": { x: 9, y: 39, dir: "up" } },
  warps: [
    { x: 9, y: 39, dir: "down", to: { map: "hollowmere", at: "from-route-6" } },
    { x: 10, y: 39, dir: "down", to: { map: "hollowmere", at: "from-route-6" } },
  ],
  signs: [
    { x: 8, y: 37, text: "ROUTE 6\nNorth: Ironvale\nSouth: Hollowmere" },
    { x: 8, y: 1, text: "ROUTE 6\nSouth: Hollowmere" },
  ],
  npcs: [
    { id: "kip", x: 9, y: 2, sprite: "rival", dir: "down", move: "still", hideIf: "trainer:kip-4",
      script: async (g) => { await kipBattle(g); } },
    { id: "hiker", x: 8, y: 33, sprite: "hiker", dir: "right", move: "still", trainer: "r6-hiker-bruno", sight: 3 },
    { id: "beauty", x: 11, y: 28, sprite: "beauty", dir: "left", move: "still", trainer: "r6-beauty-cass", sight: 3 },
    { id: "blackbelt", x: 5, y: 21, sprite: "blackbelt", dir: "right", move: "still", trainer: "r6-blackbelt-tomo", sight: 4 },
    { id: "fisher", x: 16, y: 14, sprite: "fisher", dir: "down", move: "still", trainer: "r6-fisher-wren", sight: 3 },
    { id: "ace", x: 7, y: 8, sprite: "ace-f", dir: "right", move: "still", trainer: "r6-ace-delia", sight: 3 },
    { id: "boy", x: 12, y: 11, sprite: "boy", move: "wander",
      text: "Jump down the\nledges to get back\nsouth in a hurry!" },
  ],
  items: [
    { x: 2, y: 13, item: "tonic-plus" },
    { x: 17, y: 3, item: "great-orb", count: 2 },
    { x: 16, y: 24, item: "wake-bloom", hidden: true },
    { x: 13, y: 15, item: "remedy-spray", hidden: true },
  ],
  triggers: [
    { x: 8, y: 6, w: 4, h: 1, unless: "trainer:kip-4", script: kipBattle },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "mudox", min: 28, max: 31, weight: 20 },
        { species: "mudofawn", min: 28, max: 29, weight: 10 },
        { species: "crowonip", min: 28, max: 30, weight: 15 },
        { species: "crowothane", min: 30, max: 32, weight: 5 },
        { species: "kikawing", min: 29, max: 32, weight: 15 },
        { species: "kindlacada", min: 28, max: 31, weight: 15 },
        { species: "skytick", min: 29, max: 32, weight: 10 },
        { species: "gearojay", min: 30, max: 32, weight: 5 },
        { species: "dappostag", min: 28, max: 31, weight: 5 },
      ],
    },
    water: {
      rate: 0.08,
      table: [
        { species: "brinapard", min: 28, max: 31, weight: 60 },
        { species: "wavaboar", min: 29, max: 32, weight: 40 },
      ],
    },
    oldRod: { rate: 0.1, table: [{ species: "brinip", min: 20, max: 25, weight: 1 }] },
    goodRod: {
      rate: 0.1,
      table: [
        { species: "brinapard", min: 28, max: 32, weight: 60 },
        { species: "splasiray", min: 29, max: 32, weight: 40 },
      ],
    },
  },
};
