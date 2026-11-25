// @ts-check
// Port Saltry: a fishing port. The Syndicate has seized the dock warehouse and taken the
// Warden Nerys's spire key; she waits at her door until it's cleared
// ("middle:warehouse-cleared"), then goes in ("middle:nerys-key").

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "port-saltry",
  name: "Port Saltry",
  theme: "beach",
  music: "city",
  town: true,
  flyTo: { x: 4, y: 6 },
  rows: [
    "TTTTTTTTTTTTTTTTTTTTTTTT",
    "T............FF........T",
    "T............F.........T",
    "T......................T",
    "T......................T",
    "T......................T",
    "T::::::::::::::::::::::T",
    "T.F..F....F..:..F...FF.T",
    "T............:.........T",
    ":::..........:........FT",
    ":::..........:........FT",
    "T::::::::::::::::::::::T",
    "T.......:...SSSSSSSSTTTT",
    "T.......:.SS~~~~~~~~~~~~",
    "T.......:.SS~~~~~~~~~~~~",
    "T.......:.SS====~~~~~~~~",
    "T.......:.SS~~~~~~~~~~~~",
    "T:::::::::SS~~~~~~~~~~~~",
    "TSSSSSSSSSSS~~~~~~~~~~~~",
    "TTTTTTTTTTTT~~~~~~~~~~~~",
  ],
  buildings: [
    { kind: "center", x: 2, y: 2, to: { map: "port-saltry-center", at: "door" } },
    { kind: "mart", x: 9, y: 2, to: { map: "port-saltry-mart", at: "door" } },
    { kind: "spire", x: 16, y: 1, to: { map: "port-saltry-spire", at: "door" } },
    { kind: "house", x: 2, y: 8, to: { map: "port-saltry-bikes", at: "door" } },
    { kind: "house", x: 7, y: 8, to: { map: "port-saltry-house", at: "door" } },
    { kind: "house", x: 15, y: 8, to: { map: "port-saltry-fisher", at: "door" } },
    { kind: "bighouse", x: 2, y: 13, to: { map: "saltry-warehouse", at: "door" } },
  ],
  spawns: {
    "from-route-3": { x: 1, y: 9, dir: "right" },
  },
  warps: [
    { x: 0, y: 9, dir: "left", to: { map: "route-3", at: "from-port-saltry" } },
    { x: 0, y: 10, dir: "left", to: { map: "route-3", at: "from-port-saltry" } },
  ],
  connections: {
    east: { map: "route-4", offset: -1 },
  },
  signs: [
    { x: 1, y: 8, text: "PORT SALTRY\fSalt in the air, fish on the table." },
    { x: 15, y: 5, text: "TIDE SPIRE\fWarden: Nerys. \"The deep keeps its own counsel.\"" },
    { x: 9, y: 16, text: "DOCK WAREHOUSE\fKeep out! (By order of the Syndicate)" },
    { x: 11, y: 12, text: "ROUTE 4 is east, across the sea. No bridge, sorry!" },
  ],
  npcs: [
    {
      id: "nerys", x: 18, y: 6, sprite: "warden3", dir: "down", move: "still", hideIf: "middle:nerys-key",
      script: async (g) => {
        if (!g.flag("middle:warehouse-cleared")) {
          await g.say("I'm Nerys, Warden of this spire.\fThe Syndicate took my spire key and holed up in the dock warehouse, south by the water.\fIf you're after my badge, help me get it back?");
          return;
        }
        await g.say("You got my key back! The port owes you one.\fI'll be at the top of my spire. Come challenge me!");
        g.setFlag("middle:nerys-key");
      },
    },
    { id: "sailor", x: 15, y: 15, sprite: "sailor", dir: "right", move: "still",
      text: "Can't cross the sea without a board or a boat.\fNerys has a Tide Board. Earn it!" },
    { id: "girl", x: 20, y: 9, sprite: "girl", move: "wander",
      text: "The bike shop man looks so sad lately. The Syndicate keep bothering him." },
    { id: "oldman", x: 11, y: 7, sprite: "oldman", move: "turn",
      text: "Smell that? Salt, fish, and trouble. That warehouse... hmph." },
    { id: "grunt", x: 5, y: 17, sprite: "grunt-m", dir: "left", move: "still", hideIf: "middle:warehouse-cleared",
      text: "Move along! Nothing to see at the warehouse!\f...Okay, there's lots to see. But move along!" },
  ],
  items: [
    { x: 22, y: 1, item: "great-orb" },
    { x: 1, y: 18, item: "tonic-plus", hidden: true },
  ],
  encounters: {
    water: { rate: 0.08, table: [
      { species: "brinip", min: 16, max: 19, weight: 50 },
      { species: "splasiray", min: 16, max: 19, weight: 30 },
      { species: "wavapaw", min: 17, max: 19, weight: 20 },
    ] },
    oldRod: { rate: 0.1, table: [
      { species: "brinip", min: 10, max: 15, weight: 70 },
      { species: "splasiray", min: 10, max: 15, weight: 30 },
    ] },
    goodRod: { rate: 0.1, table: [
      { species: "splasiray", min: 20, max: 24, weight: 50 },
      { species: "rippleray", min: 20, max: 24, weight: 30 },
      { species: "brinapard", min: 21, max: 24, weight: 20 },
    ] },
  },
};
