// @ts-check
// Route 2: rolling meadow from Whisper Woods up to Cinderford, ledges stepping down south.
// Kip is waiting halfway with his second battle.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-2",
  name: "Route 2",
  theme: "meadow",
  music: "route-2",
  rows: [
    "TTTTTTTTT::TTTTTTTTT",
    "T........::.....F..T",
    'T.""""...::..""""".T',
    'T.""""...::..""""".T',
    "T........::........T",
    "TTvvvvvvv::vvvvvvvTT",
    "T........::........T",
    'T..ff....::...""""TT',
    'T........::...""""TT',
    'T.""""...::........T',
    'T.""""...:::::.....T',
    'T."""".......:.....T',
    "TT...........:...TTT",
    "TT.RR........:...TTT",
    "T............:.....T",
    "T......::::::::....T",
    "T......:...........T",
    "T......:...........T",
    'T.F....:....""""".FT',
    'T......:....""""".TT',
    "T......:...........T",
    "TvvvvvT:TvvvvvvvvvvT",
    "T......:...........T",
    'T.""""":...........T',
    'T.""""":::::::.....T',
    'T.""""".....:..ff..T',
    "T...........:......T",
    "TT.F........:....TTT",
    'TT..""""....:....TTT',
    'TT..""""....::::...T',
    'T..."""".......:...T',
    "TvvvvvvvvvvvvT:vvvvT",
    "T.............:....T",
    'T.."""".......:..""T',
    'T.."""".....:::..""T',
    "T...........:......T",
    "T.F.......:::....F.T",
    "T.........:........T",
    "T........::........T",
    "TTTTTTTTT::TTTTTTTTT",
  ],
  connections: {
    north: { map: "cinderford", offset: 0 },
    south: { map: "whisper-woods", offset: 0 },
  },
  signs: [
    { x: 8, y: 38, text: "ROUTE 2\nNorth: Cinderford\nSouth: Whisper Woods" },
    { x: 11, y: 1, text: "ROUTE 2\nSouth: Whisper Woods" },
  ],
  npcs: [
    { id: "camper", x: 16, y: 35, sprite: "boy", dir: "left", move: "still", trainer: "route2-brin", sight: 4 },
    { id: "lass", x: 2, y: 29, sprite: "lass", dir: "right", move: "still", trainer: "route2-juno", sight: 4 },
    { id: "hiker", x: 4, y: 16, sprite: "hiker", dir: "right", move: "still", trainer: "route2-cole", sight: 3 },
    { id: "blackbelt", x: 16, y: 10, sprite: "blackbelt", dir: "left", move: "still", trainer: "route2-oda", sight: 3 },
    {
      // Hidden until the trigger below brings him out; after a loss he waits here for a rematch.
      id: "kip", x: 10, y: 17, sprite: "rival", dir: "down", move: "still", trainer: "kip-2", sight: 0,
      showIf: "early-kip2-met", hideIf: "early-kip2-gone",
    },
    {
      id: "girl", x: 17, y: 25, sprite: "girl", move: "wander",
      text: "Cinderford's Warden, Bram, keeps fire creatures.\fWater douses them, and rock and ground types shrug off the heat!",
    },
  ],
  items: [
    { x: 18, y: 1, item: "capture-orb", count: 2 },
    { x: 1, y: 14, item: "rouse-salts" },
    { x: 18, y: 32, item: "tonic", hidden: true },
    { x: 13, y: 26, item: "nerve-balm", hidden: true },
  ],
  triggers: [
    {
      x: 1, y: 20, w: 18, once: "early-kip2", unless: "trainer:kip-2",
      script: async (g) => {
        g.setFlag("early-kip2-met");
        g.music("rival");
        await g.exclaim("kip");
        await g.approach("kip");
        await g.say("{RIVAL}: There you are, {PLAYER}! I've been waiting ages.\fI breezed through Whisper Woods. Did the bugs give you trouble?\fLet me show you how much stronger I've gotten!");
        await g.battle("kip-2");
        await g.say("{RIVAL}: Fine, fine. You got lucky again.\fI'm going to Cinderford to beat Bram before you. See ya!");
        await g.move("kip", "U4");
        g.setFlag("early-kip2-gone");
      },
    },
  ],
  encounters: {
    grass: {
      rate: 0.1,
      table: [
        { species: "dappocub", min: 9, max: 12, weight: 18 },
        { species: "skyjay", min: 9, max: 12, weight: 16 },
        { species: "mopip", min: 10, max: 12, weight: 14 },
        { species: "wispuguppy", min: 9, max: 12, weight: 12 },
        { species: "nibakit", min: 10, max: 13, weight: 10 },
        { species: "verdapup", min: 10, max: 13, weight: 10 },
        { species: "voltupupa", min: 10, max: 13, weight: 10 },
        // A rock creature before the fire spire, so every starter has an answer to Bram.
        { species: "granagrub", min: 10, max: 12, weight: 10 },
        { species: "dojopupa", min: 11, max: 13, weight: 10 },
      ],
    },
  },
};
