// @ts-check
// Skyreach: the city on the cliff top. Warden Corvin's spire, and north of town the mouth
// of Victory Road, where a guard lets only eight-badge trainers through.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "skyreach",
  name: "SKYREACH",
  theme: "city",
  music: "city",
  town: true,
  flyTo: { x: 14, y: 10 },
  rows: [
    "TTTTTTTTTTTTTTTTTTTT", // 0
    "T^^^^^^^..^^^^^^^^^T",
    "T^^^^^^^..^^^^^^^^^T",
    "T^^^^^^^++^^^^^^^^^T",
    "T.......++.........T",
    "TFF.....++.....FF..T", // 5
    "T.......++.........T",
    "T.......++.........T",
    "T.......++.........T",
    "T.......++.........T",
    "T.......++....+....T", // 10
    "T++++++++++++++++++T",
    "T.......++.........T",
    "T.......++.........T",
    "T.......++.........T",
    "T.......++.........T", // 15
    "T++++++++++++++++..T",
    "TFF.....++....F....T",
    "TTTTTTTTT++TTTTTTTTT",
  ],
  connections: { south: { map: "route-8", offset: 0 } },
  buildings: [
    { kind: "cave", x: 8, y: 1, to: { map: "victory-road", at: "entrance" } },
    { kind: "spire", x: 2, y: 6, to: { map: "skyreach-spire", at: "door" } },
    { kind: "center", x: 12, y: 6, to: { map: "skyreach-center", at: "door" } },
    { kind: "mart", x: 12, y: 12, to: { map: "skyreach-mart", at: "door" } },
    { kind: "house", x: 1, y: 13, to: { map: "skyreach-house-1", at: "door" } },
    { kind: "house", x: 5, y: 13, to: { map: "skyreach-house-2", at: "door" } },
  ],
  signs: [
    { x: 11, y: 17, text: "SKYREACH\nThe city above the\nclouds." },
    { x: 7, y: 12, text: "SKYREACH SPIRE\nWarden: Corvin\nThe sky is not the\nlimit." },
    { x: 6, y: 4, text: "VICTORY ROAD\nAhead: the Summit\nCitadel. Eight\nbadges only." },
  ],
  triggers: [
    {
      // The Victory Road guard: eight badges, or back you go.
      x: 8,
      y: 3,
      script: async (g) => {
        if (g.state.badges.length >= 8) {
          if (!g.flag("endgame-vr-guard-ok")) {
            g.facePlayer("guard");
            await g.say("Eight badges! I can hardly believe it.\fVictory Road needs every field tool you own. Good luck!");
            g.setFlag("endgame-vr-guard-ok");
          }
          return;
        }
        g.facePlayer("guard");
        await g.say(`Halt! Only trainers with all eight badges may enter Victory Road.\fYou have ${g.state.badges.length}. Come back with eight!`);
        await g.move("player", "D");
      },
    },
  ],
  npcs: [
    {
      id: "guard",
      x: 9,
      y: 3,
      sprite: "guard",
      move: "still",
      script: async (g) => {
        if (g.state.badges.length >= 8) await g.say("Go on through. The Council is waiting at the top.");
        else await g.say("Victory Road is for trainers with all eight badges. No exceptions!");
      },
    },
    {
      id: "girl",
      x: 16,
      y: 4,
      sprite: "girl",
      move: "wander",
      text: "Corvin's dragons fly loops round the spire at dawn. I wave every time!",
    },
    {
      id: "oldman",
      x: 11,
      y: 14,
      sprite: "oldman",
      move: "turn",
      text: "Victory Road is a mean old cave.\fBoulders, brambles, an underground lake, and tunnels black as pitch. Bring it all!",
    },
    {
      id: "worker",
      x: 17,
      y: 17,
      sprite: "worker",
      move: "turn",
      text: "Building up here means hauling every brick up Route 8. My legs are huge.",
    },
  ],
};
