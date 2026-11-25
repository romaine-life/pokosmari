// @ts-check
// Cinderford: a hot-spring town on the volcano's flank. Bram's spire; the woodcutter's house
// where the Brush Cutter waits for whoever beats him; the trail east to Route 3.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "cinderford",
  name: "Cinderford",
  theme: "volcanic",
  music: "town-2",
  town: true,
  flyTo: { x: 4, y: 13 },
  rows: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T.R................T",
    "T..................T",
    "T..................T",
    "T..................T",
    "T..:...........:...T",
    "T..::::::::::::::..T",
    "T........::........T",
    "T........::.........",
    "T........:::::::::::",
    "T........::........T",
    "T........::........T",
    "T........::........T",
    "T...:....::........T",
    "T...:::::::...:..R.T",
    "T.R......::.......RT",
    "T........::........T",
    "TTTTTTTTT::TTTTTTTTT",
  ],
  buildings: [
    { kind: "spire", x: 7, y: 1, to: { map: "cinderford-spire", at: "door" } },
    { kind: "house", x: 2, y: 2, to: { map: "cinderford-house", at: "door" } },
    { kind: "house", x: 14, y: 2, to: { map: "cinderford-house-2", at: "door" } },
    { kind: "center", x: 2, y: 9, to: { map: "cinderford-center", at: "door" } },
    { kind: "mart", x: 13, y: 10, to: { map: "cinderford-mart", at: "door" } },
  ],
  connections: {
    south: { map: "route-2", offset: 0 },
    east: { map: "route-3", offset: 0 },
  },
  signs: [
    { x: 11, y: 16, text: "CINDERFORD\nHot springs, warm\nhearts, hotter spire." },
    { x: 6, y: 5, text: "CINDERFORD SPIRE\nWarden: Bram\nThe forge never cools." },
    { x: 17, y: 7, text: "East: Route 3\nto Port Saltry" },
  ],
  npcs: [
    {
      id: "worker", x: 12, y: 12, sprite: "worker", move: "wander",
      text: "The trail east to Port Saltry is all overgrown.\fOld Hazel in the house by the spire has a cutter, but she only lends it to trainers Bram respects.",
    },
    {
      id: "oldwoman", x: 16, y: 16, sprite: "oldwoman", move: "turn",
      text: "Feel that warmth underfoot? The hot springs run under the whole town.\fThe fire creatures love it. So do my bones.",
    },
    {
      id: "boy", x: 7, y: 8, sprite: "boy", move: "wander",
      text: "A loud kid ran into the spire this morning, yelling your name.\fHe came out again pretty fast.",
    },
  ],
  items: [
    { x: 1, y: 16, item: "burn-salve", hidden: true },
  ],
};
