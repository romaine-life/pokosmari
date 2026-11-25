// @ts-check
// Ironvale Mine, lower level: the Syndicate's dig site. Gideon has the last diggers
// cornered; beating them clears the mine and opens his spire.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ironvale-mine-b2",
  name: "Ironvale Mine B2",
  theme: "cave",
  music: "cave",
  indoor: true,
  rows: [
    'OOOOOOOOOOOOOOOOOOOO',
    'OOLooOOOOOOOOOOOOOOO',
    'OOoooooooooooooOOOOO',
    'OOoooooooooooooOOOOO',
    'OOOOOOOOOOOOOoOOOOOO',
    'OOOOOOOOOOOOOoOOOOOO',
    'OOoooooooooooooooOOO',
    'OOoooooooooooooooOOO',
    'OOooOOOOOOOOOOOOOOOO',
    'OOooOOOOOOOOOOOOOOOO',
    'OOoooooooooooooooOOO',
    'OOoooooooooooooooOOO',
    'OOooooooRRoooooooOOO',
    'OOoooooooooooooooOOO',
    'OOOOOOOOOOOOOOOOOOOO',
  ],
  spawns: { ladder: { x: 2, y: 1, dir: "down" } },
  warps: [
    { x: 2, y: 1, to: { map: "ironvale-mine", at: "ladder" } },
  ],
  npcs: [
    { id: "boulder", x: 13, y: 4, sprite: "boulder" },
    { id: "grunt-3", x: 11, y: 7, sprite: "grunt-m", dir: "left", move: "still", trainer: "mine-grunt-3", sight: 4 },
    { id: "grunt-4", x: 8, y: 11, sprite: "grunt-f", dir: "left", move: "still", trainer: "mine-grunt-4", sight: 4 },
    {
      id: "gideon", x: 15, y: 11, sprite: "warden6", dir: "left", move: "still", hideIf: "ironvale-mine-cleared",
      script: async (g) => {
        if (!g.flag("trainer:mine-grunt-4")) {
          await g.say("GIDEON: Careful!\nOne of them is\nstill prowling here,\fand my team is\nspent. Can you deal\nwith her?");
          return;
        }
        await g.say("GIDEON: Hah! Good\nwork, young one.\fI'm Gideon, Warden\nof the Ironvale\nSpire.\fThey were digging\nfor skysteel, the\nore that rings like\fa bell. The rest\nran off up the back\nshaft with a chunk.\fWhat would they\nwant with it...?\fNo matter. You\nheld your own down\nhere.\fCome find me at the\nspire. I'd like to\ntest that steel\fof yours properly.");
        g.setFlag("ironvale-mine-cleared");
        await g.move("gideon", "U");
        g.hide("gideon");
      },
    },
  ],
  items: [
    { x: 16, y: 6, item: "homing-thread" },
    { x: 9, y: 13, item: "growth-candy", hidden: true },
  ],
  encounters: {
    cave: {
      rate: 0.08,
      table: [
        { species: "slatapike", min: 32, max: 34, weight: 20 },
        { species: "mechecoatl", min: 31, max: 34, weight: 20 },
        { species: "mudox", min: 31, max: 34, weight: 20 },
        { species: "wispogolem", min: 32, max: 34, weight: 15 },
        { species: "granamoth", min: 32, max: 34, weight: 10 },
        { species: "flintulynx", min: 32, max: 34, weight: 5 },
        { species: "mechecoil", min: 30, max: 31, weight: 10 },
      ],
    },
  },
};
