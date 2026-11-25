// @ts-check
// Voltreach: the city of inventors. Ozzie's spire, Dr. Elm's lab (the Lantern after badge
// 4), and on the island in the eastern water the sealed ruins where Zapashark sleeps (open
// once the player is champion).

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "voltreach",
  name: "Voltreach",
  theme: "city",
  music: "city",
  town: true,
  flyTo: { x: 3, y: 6 },
  rows: [
    "TTTTTTT::TTTTTTTTTTTTTTT",
    "T......::......TTTTTTTTT",
    "T......::......TTTTTTTTT",
    "T.....F::......S~~~~~~~~",
    "T.....F::......S~~~~~~~~",
    "T......::......S~~~SSSS~",
    "T::::::::::::::S~~~SSSS~",
    "T..............S~~~SSSS~",
    "::............FS~~~SSSS~",
    "::............FS~~~SSSS~",
    "::.............S~~~~~~~~",
    ":::::::::::::::S~~~~~~~~",
    "T.......:......S~~~~~~~~",
    "T.......:......S~~~~~~~~",
    "T.......:......S~~~~~~~~",
    "T.......:......S~~~~~~~~",
    "T.......:......S~~~~~~~~",
    "T::::::::::::::S~~~~~~~~",
    "T...F.......F..S~~~~~~~~",
    "TTTTTTTTTTTTTTTTTTTTTTTT",
  ],
  buildings: [
    { kind: "center", x: 1, y: 2, to: { map: "voltreach-center", at: "door" } },
    { kind: "mart", x: 10, y: 2, to: { map: "voltreach-mart", at: "door" } },
    { kind: "house", x: 10, y: 7, to: { map: "voltreach-house", at: "door" } },
    { kind: "spire", x: 1, y: 12, to: { map: "voltreach-spire", at: "door" } },
    { kind: "lab", x: 9, y: 12, to: { map: "voltreach-lab", at: "door" } },
    { kind: "cave", x: 20, y: 6, to: { map: "voltreach-ruins", at: "door" } },
  ],
  connections: {
    west: { map: "route-4", offset: -1 },
    north: { map: "route-5", offset: -2 },
  },
  signs: [
    { x: 2, y: 7, text: "VOLTREACH\fThe city that never powers down." },
    { x: 7, y: 16, text: "SPARK SPIRE\fWarden: Ozzie. \"Ask me about my inventions!\"" },
    { x: 14, y: 16, text: "VOLTREACH LAB\fDr. Elm, director." },
    { x: 9, y: 1, text: "ROUTE 5 north to Hollowmere Cave." },
  ],
  npcs: [
    { id: "scientist", x: 6, y: 10, sprite: "scientist", move: "wander",
      text: "Voltreach runs on creature power!\fWell, mostly. Some of it's a very big battery." },
    { id: "youngster", x: 12, y: 18, sprite: "youngster", move: "turn",
      text: "Hollowmere Cave up north is pitch black. Dr. Elm's been building a lantern for it!" },
    { id: "beauty", x: 13, y: 10, sprite: "beauty", move: "turn",
      text: "See the island out there? Old ruins. The lab sealed them.\fPeople say the ground hums at night." },
    { id: "guard", x: 20, y: 8, sprite: "scientist", dir: "down", move: "still", hideIf: "champion",
      text: "Halt! These ruins are sealed by the Voltreach Lab.\fSomething enormous sleeps in there. Sparks fly off the walls!\fOnly the champion of the Isles could face it safely." },
  ],
  items: [
    { x: 22, y: 9, item: "great-orb", count: 2 },
    { x: 14, y: 1, item: "mega-tonic", hidden: true },
  ],
  encounters: {
    water: { rate: 0.08, table: [
      { species: "voltosquid", min: 19, max: 23, weight: 35 },
      { species: "brinip", min: 19, max: 23, weight: 35 },
      { species: "wavapaw", min: 19, max: 23, weight: 30 },
    ] },
    oldRod: { rate: 0.1, table: [
      { species: "brinip", min: 10, max: 15, weight: 60 },
      { species: "splasiray", min: 10, max: 15, weight: 40 },
    ] },
    goodRod: { rate: 0.1, table: [
      { species: "rippleray", min: 21, max: 26, weight: 40 },
      { species: "hydray", min: 21, max: 26, weight: 30 },
      { species: "voltosquid", min: 21, max: 26, weight: 30 },
    ] },
  },
};
