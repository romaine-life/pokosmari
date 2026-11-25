// @ts-check
// Route 1: the meadow between Fernhollow and Brookside. Ledges are the quick way home;
// Linden's aide waits by the south end with Capture Orbs for anyone carrying a dex.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-1",
  name: "Route 1",
  theme: "meadow",
  music: "route-1",
  rows: [
    "TTTTTTTTT::TTTTTTTTT",
    "T..F.....::......F.T",
    'T.""""...::..""""".T',
    'T.""""...::..""""".T',
    "T........::........T",
    "TTTTvvvvv::vvvvvTTTT",
    "T........::........T",
    'T..""""""::........T',
    'T..""""""::...ff...T',
    'T..""""""::........T',
    "T........:::::.....T",
    "T.TT.........:.....T",
    'T.TT..""""...:..TT.T',
    'T.....""""...:..TT.T',
    'T.....""""...:.....T',
    "TvvvvvvvvvvvT:vvvvvT",
    "T............:.....T",
    'T."""""......:.....T',
    'T."""""...:::::....T',
    'T."""""...:........T',
    'T.........:..""""".T',
    'TT........:.."""""TT',
    'TT..ff....:.."""""TT',
    "TT........:........T",
    "T.........:........T",
    'T....""""":.......FT',
    'T....""""":........T',
    'T....""""":........T',
    "TTTTvvvvvv:vvvvvTTTT",
    "T.........:........T",
    "T..F......:......F.T",
    "T.........::.......T",
    "T........:::.......T",
    "T........::........T",
    "T..F.....::.....F..T",
    "TTTTTTTTT::TTTTTTTTT",
  ],
  connections: {
    north: { map: "brookside", offset: 0 },
    south: { map: "fernhollow", offset: 0 },
  },
  signs: [
    { x: 8, y: 33, text: "ROUTE 1\nNorth: Brookside\nSouth: Fernhollow" },
    { x: 11, y: 2, text: "ROUTE 1\nSouth: Fernhollow" },
  ],
  npcs: [
    { id: "lass", x: 6, y: 10, sprite: "lass", dir: "right", move: "still", trainer: "route1-mira", sight: 3 },
    { id: "youngster", x: 16, y: 18, sprite: "youngster", dir: "left", move: "still", trainer: "route1-ned", sight: 4 },
    {
      id: "aide", x: 12, y: 31, sprite: "scientist", move: "still",
      script: async (g) => {
        if (!g.flag("dex")) {
          await g.say("I'm Professor Linden's aide! I hand out Capture Orbs to trainers carrying his dex.\fNo dex yet? The professor's working on it, I hear.");
          return;
        }
        if (!g.flag("early-r1-orbs")) {
          await g.say("Oh! That's the professor's new dex! Then these are yours.");
          await g.give("capture-orb", 5);
          g.setFlag("early-r1-orbs");
          return;
        }
        await g.say("Creatures in the grass here are weak. A perfect place to practise catching!");
      },
    },
    {
      id: "boy", x: 15, y: 6, sprite: "boy", move: "wander",
      text: "Jump down a ledge and you're halfway home!\fYou can't climb back up them, though.",
    },
  ],
  items: [
    { x: 1, y: 11, item: "tonic" },
    { x: 18, y: 24, item: "antivenom", hidden: true },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "dappocub", min: 2, max: 4, weight: 30 },
        { species: "skyjay", min: 2, max: 4, weight: 25 },
        { species: "gnateworm", min: 2, max: 3, weight: 20 },
        { species: "leafonit", min: 3, max: 4, weight: 15 },
        { species: "nibakit", min: 3, max: 4, weight: 10 },
      ],
    },
  },
};
