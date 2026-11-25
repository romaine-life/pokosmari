// @ts-check
// Route 4: the sea between Port Saltry and Voltreach, crossed on the Tide Board. Swimmers
// in the water, sailors on the islets, and Kip waiting on the landing before Voltreach.

/** @param {import("../../script/context.js").ScriptContext} g */
async function kip(g) {
  g.music("rival");
  await g.exclaim("kip");
  await g.approach("kip");
  await g.say("{PLAYER}! Took you long enough!\fI caught the ferry. You rode a board? Ha! Respect.\fLet's see if your team got wet or got strong!");
  await g.battle("kip-3");
  await g.say("Okay, okay. You're getting good.\fVoltreach is just ahead. Their Warden makes gadgets that go boom.\fSee you around. If you can keep up!");
  g.sfx("run");
  g.hide("kip");
  g.mapMusic();
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-4",
  name: "Route 4",
  theme: "beach",
  music: "beach",
  rows: [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTTTTT",
    "TTTTTTT~~~~~~~~~~~~~~~~~~~~~~~SSSSST~~~~~TTTTTTTTT",
    "TTTT~~~~SSSSSS~~~~~~~~~~~~~~~~S\"\"\"SS~~R~~TTTTTTTTT",
    "TTTT~~~~S\"\"\"\"S~~~~~~~~~~~~~~~~S\"\"\"SS~~~~~TTTTTTTTT",
    "T~~~~~~~S\"\"\"\"S~~~~~~~~~~~~~~~~SSSSSS~~~~~SSSSFFFST",
    "T~~~~~~~SSSSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~SSSSFFFST",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SSSSSSSST",
    "T~~~~~~~~~~~~~~~RR~~~~~~~~~~~~~~~~~~~~~~~SSS::::::",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~R~~~~~~~~~~~~SSS::::::",
    "T~~~~R~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SSS::::::",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SSS::::::",
    "T~~~~~~~~~~~~~~~~~~~SSSSSSS~~~~~~~~~~~~~~SSSSS\"\"ST",
    "~~~~~~~~~~~~~~~~~~~~S\"\"\"\"\"S~~~~~~~~~~~~~~SSSSS\"\"ST",
    "~~~~~~~~~~~~~~~~~~~~S\"\"\"\"\"S~~~~~~~~~~~~~~SSSSSSSST",
    "~~~R~~~~~~~~~~~~~~~~SSSSSSS~~~~~~~~~~~~~~SSSTTTTTT",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~R~~~~TTTTTTTTT",
    "~~~~~~~~~~~~R~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTTTTT",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~R~~~~~~~TTTTTTTTT",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TTTTTTTTT",
  ],
  connections: {
    west: { map: "port-saltry", offset: 1 },
    east: { map: "voltreach", offset: 1 },
  },
  signs: [
    { x: 42, y: 8, text: "ROUTE 4\fWest: Port Saltry. East: Voltreach." },
  ],
  npcs: [
    { id: "swimmer1", x: 14, y: 11, sprite: "swimmer", dir: "left", move: "still", trainer: "route4-swimmer-1", sight: 3 },
    { id: "swimmer2", x: 25, y: 8, sprite: "swimmer", dir: "down", move: "still", trainer: "route4-swimmer-2", sight: 3 },
    { id: "swimmer3", x: 33, y: 14, sprite: "swimmer", dir: "left", move: "still", trainer: "route4-swimmer-3", sight: 3 },
    { id: "swimmer4", x: 38, y: 10, sprite: "swimmer", dir: "left", move: "still", trainer: "route4-swimmer-4", sight: 3 },
    { id: "sailor1", x: 8, y: 6, sprite: "sailor", dir: "right", move: "still", trainer: "route4-sailor-1", sight: 3 },
    { id: "sailor2", x: 20, y: 14, sprite: "sailor", dir: "right", move: "still", trainer: "route4-sailor-2", sight: 3 },
    { id: "kip", x: 45, y: 10, sprite: "rival", dir: "left", move: "still", hideIf: "trainer:kip-3", script: kip },
    { id: "fisher", x: 44, y: 14, sprite: "fisher", dir: "left", move: "still",
      text: "The islets out there have tall grass. Fluffy things hide in it." },
  ],
  triggers: [
    { x: 41, y: 6, w: 1, h: 11, unless: "trainer:kip-3", script: kip },
  ],
  items: [
    { x: 13, y: 4, item: "great-orb" },
    { x: 26, y: 16, item: "tonic-plus" },
    { x: 34, y: 5, item: "focus-drop", hidden: true },
    { x: 48, y: 15, item: "rouse-salts" },
  ],
  encounters: {
    water: { rate: 0.08, table: [
      { species: "brinip", min: 18, max: 22, weight: 30 },
      { species: "wavapaw", min: 18, max: 21, weight: 20 },
      { species: "splasiray", min: 19, max: 22, weight: 15 },
      { species: "voltosquid", min: 18, max: 21, weight: 18 },
      { species: "voltomaw", min: 21, max: 23, weight: 5 },
      { species: "brinapard", min: 21, max: 23, weight: 7 },
      { species: "wavaboar", min: 22, max: 23, weight: 5 },
    ] },
    grass: { rate: 0.1, table: [
      { species: "plumawing", min: 18, max: 22, weight: 35 },
      { species: "pudutick", min: 18, max: 22, weight: 35 },
      { species: "piplop", min: 19, max: 22, weight: 30 },
    ] },
    oldRod: { rate: 0.1, table: [
      { species: "brinip", min: 10, max: 15, weight: 60 },
      { species: "splasiray", min: 10, max: 15, weight: 40 },
    ] },
    goodRod: { rate: 0.1, table: [
      { species: "rippleray", min: 20, max: 25, weight: 40 },
      { species: "hydray", min: 20, max: 25, weight: 25 },
      { species: "splasiray", min: 20, max: 25, weight: 35 },
    ] },
  },
};
