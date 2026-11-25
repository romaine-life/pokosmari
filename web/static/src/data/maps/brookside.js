// @ts-check
// Brookside: a little town split by its brook. The mart holds Linden's parcel; the spire
// opens to trainers with a dex; the guard on the Whisper Woods trail waits for Tamsin's badge.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "brookside",
  name: "Brookside",
  theme: "meadow",
  music: "town-2",
  town: true,
  flyTo: { x: 5, y: 13 },
  rows: [
    "TTTTTTTTT:TTTTTTTTTT",
    "T........:..F.....FT",
    "T........:.........T",
    "T........:.........T",
    "T........:.........T",
    "T........:...:.....T",
    "T...:....:::::...F.T",
    "T~~~~~~~~==~~~~~~~~T",
    "T........::........T",
    "T........::........T",
    "T........::........T",
    "T........::........T",
    "T........::........T",
    "T....:...::..:.....T",
    "T.FF.:...::........T",
    "T....::::::........T",
    "T........::....:...T",
    "TTTTTTTTT::TTTTTTTTT",
  ],
  buildings: [
    { kind: "spire", x: 2, y: 1, to: { map: "brookside-spire", at: "door" } },
    { kind: "house", x: 12, y: 2, to: { map: "brookside-house", at: "door" } },
    { kind: "center", x: 3, y: 9, to: { map: "brookside-center", at: "door" } },
    { kind: "mart", x: 12, y: 9, to: { map: "brookside-mart", at: "door" } },
    { kind: "house", x: 14, y: 13, to: { map: "brookside-house-2", at: "door" } },
  ],
  connections: {
    north: { map: "whisper-woods", offset: 0 },
    south: { map: "route-1", offset: 0 },
  },
  signs: [
    { x: 11, y: 16, text: "BROOKSIDE\nA babbling brook and\na busy little mart." },
    { x: 8, y: 5, text: "BROOKSIDE SPIRE\nWarden: Tamsin\nRooted and ready." },
    { x: 10, y: 1, text: "North: Whisper Woods" },
  ],
  npcs: [
    {
      id: "woods-guard", x: 9, y: 0, sprite: "guard", move: "still", hideIf: "trainer:tamsin",
      text: "Strange folks in black have been prowling the woods.\fI'll let you through once you've earned Warden Tamsin's badge.",
    },
    {
      id: "spire-guard", x: 4, y: 6, sprite: "guard", dir: "down", move: "still", hideIf: "dex",
      text: "The spire is open to registered trainers only.\fThat means a dex from Professor Linden in Fernhollow.",
    },
    {
      id: "youngster", x: 12, y: 8, sprite: "youngster", move: "wander",
      text: "Warden Tamsin's creatures are all grass types.\fA fire or flying creature would have a big edge!",
    },
    {
      id: "oldman", x: 16, y: 6, sprite: "oldman", dir: "down", move: "turn",
      text: "This brook runs all the way down from Cinderford's hot springs.\fWarm in winter. Good for the knees.",
    },
    {
      id: "lass", x: 2, y: 14, sprite: "lass", move: "wander",
      text: "Healing centers patch your creatures up for free.\fIf you faint, you'll wake up at the last one you visited.",
    },
  ],
  triggers: [
    {
      // The trail into Whisper Woods.
      x: 9, y: 1, unless: "trainer:tamsin",
      script: async (g) => {
        await g.say("Guard: Hold it, kid!\fPeople in black coats are bothering folks in Whisper Woods.\fShow me Warden Tamsin's badge and I'll know you can look after yourself.");
        await g.move("player", "D");
      },
    },
  ],
};
