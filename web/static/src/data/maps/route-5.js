// @ts-check
// Route 5: meadow north of Voltreach up to Hollowmere Cave. Gus's brother fishes the pond
// and gives the Sturdy Rod (key item "good-rod").

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "route-5",
  name: "Route 5",
  theme: "meadow",
  music: "route-2",
  rows: [
    "TTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTT..TTTTTTTTT",
    "TTTTTTTTT..TTTTTTTTT",
    "TTTT.....::.....TTTT",
    "TTTT.....::.....TTTT",
    "T....FF..::.\"\"\"\"\"..T",
    "T....FF..::.\"\"\"\"\"..T",
    "T........::.\"\"\"\"\"..T",
    "T........::.\"\"\"\"\"..T",
    "T.\"\"\"\"\"\".::........T",
    "T.\"\"\"\"\"\".::........T",
    "T.\"\"\"\"\"\".::........T",
    "T.\"\"\"\"\"\".::........T",
    "T.\"\"\"\"\"\".::SSSSSSSST",
    "T........::S~~~~~~ST",
    "T........::S~~~~~~ST",
    "TTT......::S~~~~~~ST",
    "TTT......::S~~~~~~ST",
    "TTT......::S~~~~~~ST",
    "T........::S~~~~~~ST",
    "T........::SSSSSSSST",
    "Tvvvvvvvv::TTTTTTTTT",
    "T........::........T",
    "T........::.\"\"\"\"\"\".T",
    "T........::.\"\"\"\"\"\".T",
    "T.\"\"\"\"\"\".::.\"\"\"\"\"\".T",
    "T.\"\"\"\"\"\".::.\"\"\"\"\"\".T",
    "T.\"\"\"\"\"\".::........T",
    "T.\"\"\"\"\"\".::........T",
    "T.\"\"\"\"\"\".::........T",
    "T........::..TT....T",
    "T........::........T",
    "T.\"\"\"\"\"..::........T",
    "T.\"\"\"\"\"..::....FFF.T",
    "T.\"\"\"\"\"..::....FFF.T",
    "T.\"\"\"\"\"..::........T",
    "T........::........T",
    "T........::........T",
    "TTTTTTTTT::TTTTTTTTT",
  ],
  buildings: [
    { kind: "cave", x: 9, y: 2, to: { map: "hollowmere-cave", at: "south" } },
  ],
  connections: {
    south: { map: "voltreach", offset: 2 },
  },
  signs: [
    { x: 8, y: 37, text: "ROUTE 5\fSouth: Voltreach. North: Hollowmere Cave." },
    { x: 11, y: 5, text: "HOLLOWMERE CAVE\fNo light, no entry! (Seriously.)" },
  ],
  npcs: [
    { id: "youngster", x: 8, y: 34, sprite: "youngster", dir: "right", move: "still", trainer: "route5-youngster", sight: 3 },
    { id: "lass", x: 11, y: 28, sprite: "lass", dir: "left", move: "still", trainer: "route5-lass", sight: 3 },
    { id: "bugcatcher", x: 8, y: 24, sprite: "bugcatcher", dir: "right", move: "still", trainer: "route5-bugcatcher", sight: 3 },
    { id: "beauty", x: 8, y: 12, sprite: "beauty", dir: "right", move: "still", trainer: "route5-beauty", sight: 3 },
    { id: "hiker", x: 11, y: 8, sprite: "hiker", dir: "left", move: "still", trainer: "route5-hiker", sight: 4 },
    {
      id: "angler", x: 11, y: 17, sprite: "fisher", dir: "right", move: "still",
      script: async (g) => {
        if (g.has("good-rod")) {
          await g.say("Better fish bite on a Sturdy Rod. Try every pond and cave lake!");
          return;
        }
        if (g.has("old-rod")) {
          await g.say("Is that one of Gus's Worn Rods? My big brother!\fHe still tells the one about the one that got away, eh?\fHere. A real rod for a real angler.");
        } else {
          await g.say("Shh! The fish are listening.\fOh, you look like you'd fish. Have a rod. I've got plenty.");
        }
        await g.give("good-rod");
        await g.say("Bigger creatures bite on the Sturdy Rod. Face the water and press A!");
      },
    },
    { id: "boy", x: 4, y: 7, sprite: "boy", move: "wander",
      text: "Some creatures here spark when they sneeze. Ampups are rock-hard, too!" },
  ],
  items: [
    { x: 2, y: 20, item: "great-orb" },
    { x: 17, y: 30, item: "tonic-plus" },
    { x: 17, y: 8, item: "bloomstone" },
    { x: 1, y: 37, item: "remedy-spray", hidden: true },
    { x: 16, y: 21, item: "rouse-salts", hidden: true },
  ],
  encounters: {
    grass: { rate: 0.1, table: [
      { species: "ampup", min: 23, max: 26, weight: 16 },
      { species: "vennibit", min: 23, max: 26, weight: 14 },
      { species: "clovepip", min: 23, max: 26, weight: 12 },
      { species: "sprounip", min: 23, max: 26, weight: 12 },
      { species: "plumawing", min: 23, max: 27, weight: 12 },
      { species: "pudutick", min: 23, max: 27, weight: 12 },
      { species: "piplop", min: 23, max: 26, weight: 8 },
      { species: "cosmupaw", min: 23, max: 25, weight: 8 },
      { species: "cosmustag", min: 25, max: 27, weight: 3 },
      { species: "ampoboar", min: 26, max: 27, weight: 3 },
    ] },
    water: { rate: 0.08, table: [
      { species: "wavapaw", min: 23, max: 26, weight: 50 },
      { species: "voltosquid", min: 23, max: 26, weight: 30 },
      { species: "wavaboar", min: 25, max: 27, weight: 20 },
    ] },
    oldRod: { rate: 0.1, table: [
      { species: "brinip", min: 10, max: 15, weight: 60 },
      { species: "splasiray", min: 10, max: 15, weight: 40 },
    ] },
    goodRod: { rate: 0.1, table: [
      { species: "hydray", min: 23, max: 27, weight: 30 },
      { species: "rippleray", min: 23, max: 27, weight: 30 },
      { species: "umbrapup", min: 23, max: 26, weight: 30 },
      { species: "brinapard", min: 25, max: 27, weight: 10 },
    ] },
  },
};
