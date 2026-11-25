// @ts-check
// Ironvale: a mining town. The Syndicate is digging in the mine; the Foreman lends the
// Power Gloves, Gideon is down there, and his spire waits until the mine is clear.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ironvale",
  name: "Ironvale",
  theme: "city",
  music: "city",
  town: true,
  flyTo: { x: 4, y: 15 },
  rows: [
    'TTTTTTTTTTTTTTTTTTTT',
    'TR+++RR++::+++++++RT',
    'TR+++RR++::+++++++RT',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++:::::::::::',
    'T++++++++:::::::::::',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'T++++++++::++++++++T',
    'TFF++FF++::++FF++FFT',
    'TTTTTTTTT::TTTTTTTTT',
  ],
  connections: {
    south: { map: "route-6", offset: 0 },
    east: { map: "route-7", offset: 0 },
  },
  buildings: [
    { kind: "cave", x: 2, y: 1, to: { map: "ironvale-mine", at: "door" } },
    { kind: "spire", x: 12, y: 1, to: { map: "ironvale-spire", at: "door" } },
    { kind: "bighouse", x: 2, y: 4, to: { map: "ironvale-foreman", at: "door" } },
    { kind: "center", x: 2, y: 11, to: { map: "ironvale-center", at: "door" } },
    { kind: "mart", x: 11, y: 12, to: { map: "ironvale-mart", at: "door" } },
    { kind: "house", x: 15, y: 11, to: { map: "ironvale-house", at: "door" } },
  ],
  signs: [
    { x: 8, y: 16, text: "IRONVALE\nHammer, pick and\nstone." },
    { x: 1, y: 3, text: "IRONVALE MINE\nShift in progress.\nHelmets on!" },
    { x: 7, y: 8, text: "FOREMAN'S OFFICE" },
    { x: 17, y: 6, text: "IRONVALE SPIRE\nWarden: Gideon\nThe Unbending" },
    { x: 18, y: 8, text: "ROUTE 7\nEast: Frostmere" },
  ],
  npcs: [
    {
      id: "miner", x: 4, y: 2, sprite: "worker", dir: "left", move: "still",
      script: async (g) => {
        if (g.flag("ironvale-mine-cleared")) {
          await g.say("The mine's ours\nagain! Gideon chased\nthose diggers off.");
        } else if (g.has("power-gloves")) {
          await g.say("Those are the\nForeman's gloves!\fShove the boulders\nout of the way and\nfind Gideon!");
        } else {
          await g.say("Hold it! You can't\ngo in there!\fA crew in black\nuniforms marched in\nwith shovels.\fThe Eclipse\nSyndicate, digging\nfor some ore!\fThey brought the\nceiling down behind\nthem. Boulders\feverywhere! Gideon\nwent in after them\nand isn't back.\fSomeone tell the\nForeman! His office\nis just south.");
          g.setFlag("ironvale-heard-syndicate");
        }
      },
    },
    {
      id: "spire-guard", x: 14, y: 6, sprite: "worker", move: "still", hideIf: "ironvale-mine-cleared",
      text: "The spire's shut.\nGideon went down\nthe mine after some\fSyndicate diggers.\nNo Warden, no\nbattles. Sorry!",
    },
    { id: "oldman", x: 7, y: 11, sprite: "oldman", move: "wander",
      text: "East of town is\nRoute 7. The snow\nstarts there.\fFrostmere is past\nit. Pack a scarf!" },
    { id: "girl", x: 16, y: 7, sprite: "girl", move: "wander",
      text: "My dad digs in the\nmine. He says the\nore hums when the\fweather turns.\nWeird, right?" },
    { id: "hiker", x: 12, y: 10, sprite: "hiker", move: "wander",
      text: "Beat Gideon and\nvisit the old\ncourier's house.\fHe gives his Wing\nWhistle only to the\nworthy, I hear." },
  ],
  items: [
    { x: 18, y: 3, item: "ward-mist", hidden: true },
  ],
};
