// @ts-check
// Route 3: an overgrown forest trail from Cinderford east to Port Saltry. Saplings block it
// until the Brush Cutter; the north path passes Ember Grotto, a short cut runs through the middle.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-3",
  name: "Route 3",
  theme: "forest",
  music: "route-3",
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTT..TTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTT..."""...............TTTTTTTTTTTT',
    'TTTTTTTTTTT:::::::::::::::::::::TTTTTTTTTTTT',
    'TTTTTTTTTTT...........""""""..::TTTTTTTTTTTT',
    'TTT.""""...::TTTTTTTTTTTTTTTT.::.TTTTTT.""TT',
    'TTT.""""...::TTTTTTTTTTTTTTTT.::.TTTTTT.""TT',
    'TTT.""""...::TT""""TTTTTTTTTT.::.TTTTTT.""TT',
    '::t::::::::::.......t.........::.TTTTTT:::::',
    '::t::::::::::.......t.........::.TTTTTT:::::',
    'TTT..........TTTTTTTTTT""""TT.::.""""""::.TT',
    'TTT."""""....TTTTTTTTTTTTTTTT.::.""""""::.TT',
    'TTT."""""....TTTTTTTTTTTTTTTT::::::::::::TTT',
    'TTT..........TTTTTTTTTTTTTTTT::::::::::::TTT',
    'TTTTTtTTTTTTTTTTTTTTTTTTTTTTTTTT."""""".TTTT',
    'TTTT.""".TTTTTTTTTTTTTTTTTTTTTTT."""""".TTTT',
    'TTTT.....TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  buildings: [
    { kind: "cave", x: 19, y: 1, to: { map: "ember-grotto", at: "door" } },
  ],
  connections: {
    west: { map: "cinderford", offset: 0 },
  },
  warps: [
    { x: 43, y: 8, dir: "right", to: { map: "port-saltry", at: "from-route-3" } },
    { x: 43, y: 9, dir: "right", to: { map: "port-saltry", at: "from-route-3" } },
  ],
  spawns: {
    "from-port-saltry": { x: 42, y: 8, dir: "left" },
  },
  signs: [
    { x: 4, y: 10, text: "ROUTE 3\nEast: Port Saltry\nWest: Cinderford" },
    { x: 21, y: 2, text: "EMBER GROTTO\nHot, dark and full\nof rocks." },
    { x: 39, y: 7, text: "ROUTE 3\nEast: Port Saltry" },
  ],
  npcs: [
    { id: "hiker", x: 9, y: 5, sprite: "hiker", dir: "down", move: "still", trainer: "route3-lark", sight: 3 },
    { id: "youngster", x: 24, y: 2, sprite: "youngster", dir: "down", move: "still", trainer: "route3-pip", sight: 2 },
    { id: "lass", x: 29, y: 7, sprite: "lass", dir: "right", move: "still", trainer: "route3-tess", sight: 3 },
    { id: "blackbelt", x: 32, y: 14, sprite: "blackbelt", dir: "up", move: "still", trainer: "route3-gus", sight: 2 },
    { id: "beauty", x: 41, y: 10, sprite: "beauty", dir: "left", move: "still", trainer: "route3-nadia", sight: 3 },
    {
      id: "worker", x: 7, y: 9, sprite: "worker", move: "still", dir: "left",
      text: "Those saplings grow back the second you leave.\fThe trail through the middle saves a lot of walking, if you've got a cutter.",
    },
  ],
  items: [
    { x: 6, y: 16, item: "tonic-plus" },
    { x: 14, y: 8, item: "wake-bloom" },
    { x: 39, y: 5, item: "nerve-balm", hidden: true },
    { x: 38, y: 15, item: "great-orb" },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "pyrapip", min: 13, max: 16, weight: 15 },
        { species: "buzzimite", min: 13, max: 16, weight: 14 },
        { species: "toxibean", min: 13, max: 16, weight: 13 },
        { species: "beetloworm", min: 14, max: 16, weight: 12 },
        { species: "mopip", min: 14, max: 17, weight: 12 },
        { species: "voltupupa", min: 14, max: 16, weight: 10 },
        { species: "dojopupa", min: 14, max: 17, weight: 10 },
        { species: "dunulump", min: 15, max: 17, weight: 8 },
        { species: "granagrub", min: 15, max: 17, weight: 6 },
      ],
    },
  },
};
