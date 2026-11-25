// @ts-check
// Route 8: the cliff road from Frostmere up to Skyreach, terrace by terrace, with ledges
// as the quick way back down.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-8",
  name: "ROUTE 8",
  theme: "meadow",
  music: "route-3",
  rows: [
    "TTTTTTTTT::TTTTTTTTT", // 0
    "TTFF.....::.....FFTT",
    'T..."""".::.""""...T',
    'T..."""".::.""""...T',
    "T........::........T",
    "T..R.....::.....R..T", // 5
    "T........::........T",
    "T^^^^^^^^::^^^^^^^^T",
    "T........::.....^..T",
    'T.""""""..:......t^T',
    'T.""""""..:::::....T', // 10
    'T.""""""......:....T',
    "T.............:....T",
    "T..R.....R....:..R.T",
    "T.............:....T",
    "T.............:::..T", // 15
    "T^^vvvvv^^^^^^^^::^T",
    "T...............::.T",
    'T.""""""".......:..T',
    'T.""""""".......:..T',
    'T.""""""".......:..T', // 20
    "T.....::::::::::::.T",
    "T.....:............T",
    "T.FF..:...R....R...T",
    "T^^^^^:^^^^^vvvv^^^T",
    "T.....:............T", // 25
    "T.....:.....~~~~~..T",
    'T.""".:....~~~.~~..T',
    'T.""".:....~~~~~~..T',
    'T.""".:.....~~~~...T',
    "T.....:............T", // 30
    "T^^vv^:^^^^^^^^^^^^T",
    "T.....:::::........T",
    'T.""""....:..""""".T',
    'T.""""....:..""""".T',
    'T.""""....:..""""".T', // 35
    "T.........:........T",
    "T..R......:....R...T",
    "T........::........T",
    "TFF......::......FFT",
    "TTT......::......TTT", // 40
    "TTTT.....::.....TTTT",
    "TTTTTTTTT::TTTTTTTTT",
  ],
  connections: { north: { map: "skyreach", offset: 0 } },
  spawns: { "from-frostmere": { x: 9, y: 42, dir: "up" } },
  warps: [
    { x: 9, y: 42, dir: "down", to: { map: "frostmere", at: "from-route-8" } },
    { x: 10, y: 42, dir: "down", to: { map: "frostmere", at: "from-route-8" } },
  ],
  signs: [
    { x: 11, y: 40, text: "ROUTE 8\nNorth: Skyreach\nSouth: Frostmere" },
    { x: 11, y: 6, text: "SKYREACH\nJust ahead!\nThe city above the\nclouds." },
  ],
  npcs: [
    { id: "hiker", x: 13, y: 36, sprite: "hiker", dir: "left", move: "still", trainer: "route8-hiker", sight: 3 },
    { id: "beauty", x: 9, y: 28, sprite: "beauty", dir: "left", move: "still", trainer: "route8-beauty", sight: 3 },
    { id: "blackbelt", x: 3, y: 22, sprite: "blackbelt", dir: "right", move: "still", trainer: "route8-blackbelt", sight: 3 },
    { id: "psychic", x: 12, y: 18, sprite: "psychic", dir: "right", move: "still", trainer: "route8-psychic", sight: 4 },
    { id: "ace-f", x: 11, y: 12, sprite: "ace-f", dir: "right", move: "still", trainer: "route8-ace-f", sight: 3 },
    { id: "ace-m", x: 13, y: 4, sprite: "ace-m", dir: "left", move: "still", trainer: "route8-ace-m", sight: 4 },
    {
      id: "oldman",
      x: 4,
      y: 30,
      sprite: "oldman",
      move: "turn",
      text: "These cliffs only go one way: up. The ledges are for when you're in a hurry to come down.",
    },
  ],
  items: [
    { x: 18, y: 8, item: "dawn-bloom" },
    { x: 14, y: 27, item: "deep-focus" },
    { x: 17, y: 3, item: "prime-orb" },
    { x: 1, y: 25, item: "grand-tonic", hidden: true },
    { x: 18, y: 36, item: "mega-tonic", hidden: true },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "crowothane", min: 38, max: 41, weight: 20 },
        { species: "dappohorn", min: 39, max: 42, weight: 15 },
        { species: "wisporca", min: 38, max: 41, weight: 15 },
        { species: "skyjay", min: 38, max: 40, weight: 15 },
        { species: "verdabeast", min: 38, max: 41, weight: 12 },
        { species: "granamoth", min: 38, max: 40, weight: 10 },
        { species: "mudofang", min: 40, max: 42, weight: 7 },
        { species: "dracolith", min: 40, max: 42, weight: 6 },
      ],
    },
    water: {
      rate: 0.08,
      table: [
        { species: "brinapard", min: 38, max: 41, weight: 50 },
        { species: "rippleray", min: 38, max: 41, weight: 35 },
        { species: "umbrastag", min: 39, max: 42, weight: 15 },
      ],
    },
    oldRod: {
      rate: 0.1,
      table: [{ species: "splasiray", min: 20, max: 25, weight: 1 }],
    },
    goodRod: {
      rate: 0.1,
      table: [
        { species: "brinapard", min: 36, max: 40, weight: 50 },
        { species: "hydray", min: 36, max: 40, weight: 30 },
        { species: "umbrastag", min: 38, max: 41, weight: 20 },
      ],
    },
  },
};
