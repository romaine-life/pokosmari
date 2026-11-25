// @ts-check
// Whisper Woods: a winding forest of bug catchers, and the first Eclipse Syndicate grunts,
// cornering a researcher in a clearing.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "whisper-woods",
  name: "Whisper Woods",
  theme: "forest",
  music: "forest",
  rows: [
    "TTTTTTTTT::TTTTTTTTT",
    "TT......:::.......TT",
    'TT.""""..:..""""..TT',
    'TT.""""..:..""""..TT',
    "TT.......:........TT",
    "TT.TT....:....TT..TT",
    "TT.TT....:....TT..TT",
    "TT.......:.......FTT",
    "TT..::::::........TT",
    "TT..:.............TT",
    "TTT.:TTTTTTTTTTTTTTT",
    "TTT.:TTTTTTTTTTTTTTT",
    "TT..::::::::::....TT",
    'TT.""""..TTTT.:...TT',
    'TT.""""..TTTT.:.F.TT',
    "TT.......TTTT.:...TT",
    "TTTTTTTTTTTTT.:.TTTT",
    'TT....""""""..:..TTT',
    'TT....""""""..:...TT',
    "TT..TTTTTTTTTT:...TT",
    "TT..TTTTTTTTTT:...TT",
    "TT..::::::::::....TT",
    "TT..:.............TT",
    'TT..:..""""""..TTTTT',
    'TT..:..""""""..T...T',
    "TTTT:TTTTTTTT..T...T",
    'TT..:....""""......T',
    'TT..:....""""..T...T',
    "TT..:..........TTTTT",
    "TT..:::::::....TTTTT",
    "TTTTTTTTT:TTTTTTTTTT",
    'T""".....:....."""TT',
    'T""".TT..:..TT."""TT',
    "T....TT..:..TT....TT",
    "T........:........TT",
    "TT.F.....:.....F..TT",
    "TTTT.....:....TTTTTT",
    "TTTTTT...:...TTTTTTT",
    "TTTTTTTT.:.TTTTTTTTT",
    "TTTTTTTTT:TTTTTTTTTT",
  ],
  connections: {
    north: { map: "route-2", offset: 0 },
    south: { map: "brookside", offset: 0 },
  },
  signs: [
    { x: 10, y: 38, text: "WHISPER WOODS\nKeep to the trail.\nMind the bugs." },
    { x: 11, y: 1, text: "WHISPER WOODS\nNorth: Route 2" },
  ],
  npcs: [
    { id: "bug-1", x: 13, y: 34, sprite: "bugcatcher", dir: "left", move: "still", trainer: "ww-bug-tobi", sight: 4 },
    { id: "bug-2", x: 8, y: 22, sprite: "bugcatcher", dir: "left", move: "still", trainer: "ww-bug-pell", sight: 4 },
    { id: "bug-3", x: 13, y: 4, sprite: "bugcatcher", dir: "left", move: "still", trainer: "ww-bug-sasha", sight: 4 },
    { id: "grunt-1", x: 16, y: 13, sprite: "grunt-m", dir: "left", move: "still", trainer: "ww-grunt-1", sight: 3, hideIf: "early-ww-saved" },
    { id: "grunt-2", x: 16, y: 15, sprite: "grunt-f", dir: "left", move: "still", trainer: "ww-grunt-2", sight: 3, hideIf: "early-ww-saved" },
    {
      id: "researcher", x: 17, y: 14, sprite: "scientist", dir: "left", move: "still",
      script: async (g) => {
        if (g.flag("early-ww-saved")) {
          await g.say("I study the bugs of these woods. Gnateworms, Beetloworms...\fBut why would the Syndicate care about my notes on the old spires?");
          return;
        }
        if (!g.flag("trainer:ww-grunt-1") || !g.flag("trainer:ww-grunt-2")) {
          await g.say("Help! These people want my research notes!\fThey say the Eclipse Syndicate needs them. I don't even know who that is!");
          return;
        }
        await g.say("They ran off! Thank you, thank you!\fThey called themselves the Eclipse Syndicate. They wanted everything I'd written about the spires and the old guardian.");
        await g.say("I've nothing much to offer but these. Please, take them!");
        g.setFlag("early-ww-saved");
        await g.give("tonic-plus", 2);
        await g.say("If you see those coats again, be careful. They weren't here for the bugs.");
      },
    },
  ],
  items: [
    { x: 18, y: 24, item: "capture-orb", count: 2 },
    { x: 2, y: 13, item: "antivenom" },
    { x: 17, y: 1, item: "tonic", hidden: true },
    { x: 1, y: 33, item: "ward-mist" },
  ],
  encounters: {
    grass: {
      rate: 0.12,
      table: [
        { species: "gnateworm", min: 5, max: 8, weight: 22 },
        { species: "beetloworm", min: 6, max: 9, weight: 18 },
        { species: "gnatoglop", min: 6, max: 9, weight: 16 },
        { species: "leafonit", min: 6, max: 9, weight: 12 },
        { species: "verdapup", min: 7, max: 10, weight: 10 },
        { species: "wispuguppy", min: 6, max: 9, weight: 10 },
        { species: "toxibean", min: 7, max: 10, weight: 8 },
        { species: "buzzimite", min: 8, max: 10, weight: 4 },
      ],
    },
  },
};
