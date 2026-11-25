// @ts-check
// Route 7: the snowfields east of Ironvale, the road to Frostmere.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-7",
  name: "Route 7",
  theme: "snow",
  music: "route-3",
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTnnnnnnnnnnnTTTTTTTnnnnnnnnnnnnnnTTTT',
    'TTTTn""""nnRRnnTTTTTTTn"""""nnnnnnnnTTTT',
    'TTTTn""""nnnnnnnnnnnnnn"""""nnnRRnnnTTTT',
    'TTTTn""""nnnnnnnnnnnnnn"""""nnnnnnnnTTTT',
    'TTTTvvvvvvvvvvvnnnvvvvvvvvvvvvvnnvvvTTTT',
    'TTnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnTT',
    'TTnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnTT',
    'nnnnnnnnnnnnn""""nnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnn""""nnnnnnnnnnnnnnnnnnnnnnn',
    'TTnnnnnnnnnnn""""nnnnnnnnnnnnnnnnnnnnnTT',
    'TTTTnnnnnnnnnnnnnnnnnnnnRRnnnnnnnnnTTTTT',
    'TTTTn"""""nnnnn~~~~nn""""""nnnn""""TTTTT',
    'TTTTn"""""nnnnn~~~~nn""""""nnnn""""TTTTT',
    'TTTTnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  connections: {
    west: { map: "ironvale", offset: 0 },
    east: { map: "frostmere", offset: 0 },
  },
  signs: [
    { x: 2, y: 8, text: "ROUTE 7\nWest: Ironvale\nEast: Frostmere" },
    { x: 37, y: 8, text: "ROUTE 7\nWest: Ironvale" },
  ],
  npcs: [
    { id: "hiker", x: 12, y: 8, sprite: "hiker", dir: "down", move: "still", trainer: "r7-hiker-olaf", sight: 3 },
    { id: "psychic", x: 27, y: 2, sprite: "psychic", dir: "down", move: "still", trainer: "r7-psychic-rune", sight: 3 },
    { id: "ace", x: 25, y: 10, sprite: "ace-m", dir: "left", move: "still", trainer: "r7-ace-viktor", sight: 4 },
    { id: "lass", x: 10, y: 14, sprite: "lass", dir: "right", move: "still", trainer: "r7-lass-pia", sight: 4 },
    { id: "channeler", x: 33, y: 12, sprite: "channeler", dir: "left", move: "still", trainer: "r7-channeler-esme", sight: 4 },
    { id: "girl", x: 20, y: 8, sprite: "girl", move: "wander",
      text: "The Observatory in\nFrostmere went dark\na week ago.\fNow there are men\nin black on its\nroof. Creepy!" },
  ],
  items: [
    { x: 4, y: 2, item: "prime-orb" },
    { x: 35, y: 5, item: "mega-tonic" },
    { x: 19, y: 13, item: "focus-drop", hidden: true },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "snowablob", min: 33, max: 35, weight: 15 },
        { species: "snowaplop", min: 34, max: 37, weight: 15 },
        { species: "sleetiwing", min: 35, max: 37, weight: 5 },
        { species: "crowothane", min: 33, max: 36, weight: 15 },
        { species: "luminik", min: 33, max: 36, weight: 15 },
        { species: "kikawing", min: 34, max: 37, weight: 10 },
        { species: "mudox", min: 33, max: 34, weight: 10 },
        { species: "mudofang", min: 35, max: 37, weight: 5 },
        { species: "skytick", min: 33, max: 36, weight: 10 },
      ],
    },
    water: {
      rate: 0.08,
      table: [
        { species: "brinapard", min: 33, max: 36, weight: 50 },
        { species: "wavaboar", min: 33, max: 36, weight: 50 },
      ],
    },
    oldRod: { rate: 0.1, table: [{ species: "brinip", min: 25, max: 30, weight: 1 }] },
    goodRod: {
      rate: 0.1,
      table: [
        { species: "brinapard", min: 33, max: 37, weight: 50 },
        { species: "wavabeast", min: 35, max: 37, weight: 20 },
        { species: "rippleray", min: 34, max: 37, weight: 30 },
      ],
    },
  },
};
