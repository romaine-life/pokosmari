// @ts-check
// Skyreach Peak: the switchback trail from Frostmere up to the summit.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "skyreach-peak",
  name: "Skyreach Peak",
  theme: "snow",
  music: "snow",
  rows: [
    'TTTTTTTTT::TTTTTTTTT',
    'TTRRnnnnn::nnnnnRRTT',
    'TTnn"""nn::nn"""nnTT',
    'TTnn"""nn::nn"""nnTT',
    'TTnnnnnnn::nnnnnnnTT',
    'TT^^^^^^^^^^^^^nnnTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTn""""nnnnnn""""nTT',
    'TTn""""nnnnnn""""nTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTnnn^^^^^^^^^^^^^TT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTvvvvvvvvvvnnnnnnTT',
    'TTnnnnnnnnnnnn""nnTT',
    'TTnn""""nnRRnn""nnTT',
    'TTnn""""nnnnnn""nnTT',
    'TT^^^^^^^^^^^^^nnnTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTnnnnn"""""nnnnnnTT',
    'TTnnnnn"""""nnnnnnTT',
    'TTnnn^^^^^^^^^^^^^TT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'nnnnnnnnnnnnnnnnnnTT',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  connections: { north: { map: "skyreach-peak-summit", offset: 0 } },
  spawns: { "from-frostmere": { x: 0, y: 23, dir: "right" } },
  warps: [
    { x: 0, y: 23, dir: "left", to: { map: "frostmere", at: "from-skyreach-peak" } },
  ],
  signs: [
    { x: 3, y: 22, text: "SKYREACH PEAK\nThe summit is above\nthe clouds." },
  ],
  npcs: [
    { id: "grunt-1", x: 17, y: 17, sprite: "grunt-m", dir: "left", move: "still", trainer: "peak-grunt-1", sight: 4 },
    { id: "hiker", x: 3, y: 11, sprite: "hiker", dir: "right", move: "still", trainer: "peak-hiker-borg", sight: 4 },
    { id: "grunt-2", x: 16, y: 4, sprite: "grunt-f", dir: "down", move: "still", trainer: "peak-grunt-2", sight: 3 },
    { id: "climber", x: 9, y: 9, sprite: "ace-f", move: "wander",
      script: async (g) => {
        if (g.flag("halvard-defeated")) await g.say("The storm's gone!\nYou can see all the\nway to Skyreach.");
        else await g.say("A man in a long\ncoat ran past with\na big bronze bell.\fHe was heading for\nthe summit. Straight\nup the trail!");
      } },
  ],
  items: [
    { x: 4, y: 1, item: "grand-tonic" },
    { x: 17, y: 14, item: "prime-orb" },
    { x: 11, y: 22, item: "deep-focus", hidden: true },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "flutteveil", min: 38, max: 41, weight: 15 },
        { species: "skytick", min: 38, max: 42, weight: 15 },
        { species: "sleetiwing", min: 39, max: 42, weight: 10 },
        { species: "snowaplop", min: 38, max: 41, weight: 15 },
        { species: "slatapike", min: 38, max: 41, weight: 10 },
        { species: "mudofang", min: 39, max: 43, weight: 10 },
        { species: "luminik", min: 38, max: 41, weight: 10 },
        { species: "flintulynx", min: 40, max: 43, weight: 5 },
        { species: "crowothane", min: 38, max: 42, weight: 10 },
      ],
    },
  },
};
