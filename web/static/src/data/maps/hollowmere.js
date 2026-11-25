// @ts-check
// Hollowmere: a misty forest town. The Stillwater Shrine keeps the Storm Bell until the
// Syndicate steals it ("bell-stolen"); Vesper's spire opens after that, and the road east
// to Route 6 after her badge ("middle:badge-vesper").

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "hollowmere",
  name: "Hollowmere",
  theme: "forest",
  music: "town-2",
  town: true,
  flyTo: { x: 4, y: 6 },
  rows: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T...........F......T",
    "T..................T",
    "T..................T",
    "T..................T",
    "T..................T",
    "T::::::::::::::::::T",
    "TF.......::F......::",
    "T.......FF:........T",
    "T........::......F.T",
    "T........::......F.T",
    "T........::........T",
    "T........::........T",
    "T:::::::::::::::::.T",
    "TTTT.....::....~~~~T",
    "TTTTTTTT....TTT~~~~T",
    "TTTTTTTT....TTT~~~~T",
    "TTTTTTTT....TTT....T",
  ],
  buildings: [
    { kind: "center", x: 2, y: 2, to: { map: "hollowmere-center", at: "door" } },
    { kind: "mart", x: 8, y: 2, to: { map: "hollowmere-mart", at: "door" } },
    { kind: "spire", x: 13, y: 1, to: { map: "hollowmere-spire", at: "door" } },
    { kind: "bighouse", x: 2, y: 9, to: { map: "hollowmere-shrine", at: "door" } },
    { kind: "house", x: 12, y: 9, to: { map: "hollowmere-house", at: "door" } },
    { kind: "cave", x: 9, y: 15, to: { map: "hollowmere-cave", at: "north" } },
  ],
  spawns: {
    "from-route-6": { x: 19, y: 7, dir: "left" },
  },
  warps: [
    { x: 19, y: 7, dir: "right", to: { map: "route-6", at: "from-hollowmere" } },
  ],
  signs: [
    { x: 11, y: 16, text: "HOLLOWMERE\fWhere the mist remembers." },
    { x: 8, y: 12, text: "STILLWATER SHRINE\fHome of the Storm Bell." },
    { x: 17, y: 8, text: "ROUTE 6 east, to Ironvale." },
  ],
  npcs: [
    { id: "acolyte", x: 15, y: 6, sprite: "channeler", dir: "down", move: "still", hideIf: "bell-stolen",
      text: "Lady Vesper is in a trance. She said:\f\"Something stirs at the shrine. Let the challenger go there first.\"\fThe shrine is the big house to the southwest." },
    {
      id: "ranger", x: 18, y: 7, sprite: "guard", dir: "left", move: "still", hideIf: "middle:badge-vesper",
      script: async (g) => {
        if (!g.flag("bell-stolen")) {
          await g.say("The cliff road east is rough going.\fVisit the shrine and our Warden before you head out, traveller.");
        } else {
          await g.say("The Syndicate ran east with the bell?\fThat road is too rough for anyone without Vesper's badge. Earn it first!");
        }
      },
    },
    { id: "oldwoman", x: 6, y: 7, sprite: "oldwoman", move: "turn",
      text: "The mist never lifts here. My laundry has been damp for forty years." },
    { id: "girl", x: 14, y: 13, sprite: "girl", move: "wander",
      text: "Ghost creatures love Hollowmere. They hide in the cave and the mist." },
  ],
  items: [
    { x: 18, y: 17, item: "dawn-bloom", hidden: true },
    { x: 1, y: 12, item: "great-orb" },
  ],
  encounters: {
    water: { rate: 0.08, table: [
      { species: "umbrapup", min: 26, max: 29, weight: 60 },
      { species: "wavapaw", min: 26, max: 29, weight: 40 },
    ] },
    oldRod: { rate: 0.1, table: [
      { species: "brinip", min: 12, max: 16, weight: 100 },
    ] },
    goodRod: { rate: 0.1, table: [
      { species: "umbrapup", min: 26, max: 29, weight: 50 },
      { species: "hydray", min: 26, max: 29, weight: 25 },
      { species: "rippleray", min: 26, max: 29, weight: 25 },
    ] },
  },
};
