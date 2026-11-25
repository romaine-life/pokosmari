// @ts-check
// Frostmere: the snow town under Skyreach Peak. The Syndicate holds the Observatory; the
// road up the peak (east) opens once it's cleared, the road to Route 8 (north) once
// Halvard is beaten. The glacier cave is open to the champion.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere",
  name: "Frostmere",
  theme: "snow",
  music: "snow",
  town: true,
  flyTo: { x: 4, y: 15 },
  rows: [
    'TTTTTTTTTnTTTTTTTTTT',
    'TTnnnnnnTnnTnnnnnnTT',
    'TTnnnnnnTnnTnnnnnnTT',
    'TTnnnnnnTnnTnnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::::::::nn',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    '::::::::::::nnnnnnTT',
    '::::::::::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTnnnnnn::::nnnnnnTT',
    'TTFFnnnnnnnnnnnFFnTT',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  connections: { west: { map: "route-7", offset: 0 } },
  spawns: {
    "from-route-8": { x: 9, y: 0, dir: "down" },
    "from-skyreach-peak": { x: 19, y: 6, dir: "left" },
  },
  warps: [
    { x: 9, y: 0, dir: "up", to: { map: "route-8", at: "from-frostmere" } },
    { x: 19, y: 6, dir: "right", to: { map: "skyreach-peak", at: "from-frostmere" } },
  ],
  buildings: [
    { kind: "spire", x: 2, y: 1, to: { map: "frostmere-spire", at: "door" } },
    { kind: "lab", x: 12, y: 1, to: { map: "frostmere-observatory", at: "door" } },
    { kind: "cave", x: 16, y: 8, to: { map: "frostmere-glacier", at: "door" } },
    { kind: "center", x: 2, y: 11, to: { map: "frostmere-center", at: "door" } },
    { kind: "mart", x: 8, y: 12, to: { map: "frostmere-mart", at: "door" } },
    { kind: "house", x: 13, y: 12, to: { map: "frostmere-house", at: "door" } },
  ],
  signs: [
    { x: 2, y: 8, text: "FROSTMERE\nWhere the stars\ncome down to visit." },
    { x: 7, y: 6, text: "FROSTMERE SPIRE\nWarden: Yuki\nThe First Snow" },
    { x: 11, y: 5, text: "FROSTMERE\nOBSERVATORY\nClosed. (Not by us.)" },
    { x: 17, y: 7, text: "East: Skyreach Peak" },
    { x: 8, y: 4, text: "North: Route 8\nand Skyreach" },
  ],
  npcs: [
    { id: "guard-north", x: 9, y: 1, sprite: "guard", move: "still", hideIf: "halvard-defeated",
      text: "Route 8 is closed.\fSince that storm\nstarted brewing over\nthe peak, the pass\fhas been buried in\nsnow. Nobody goes\nnorth until it\fclears. Whatever's\nup on that peak is\ncausing it." },
    { id: "peak-grunt", x: 18, y: 6, sprite: "grunt-m", dir: "left", move: "still", hideIf: "frostmere-obs-cleared",
      text: "Skyreach Peak is\nclosed! Director's\norders!\fWhat Director? The\nDirector! He's in\nthe Observatory!\fWait. I wasn't\nsupposed to say\nthat." },
    { id: "ranger", x: 16, y: 10, sprite: "guard", move: "still", hideIf: "champion",
      text: "The glacier cave is\ndeep and the ice is\nrestless.\fSomething huge is\nsleeping down there.\fOnly the Isles'\nchampion goes in.\nRules are rules." },
    { id: "oldwoman", x: 6, y: 9, sprite: "oldwoman", move: "wander",
      text: "Legend says the\nStorm Bell's ring\nwakes Trancedome on\fthe peak. It's kept\nthe weather fair\nfor a thousand\fyears, as long as\nnobody bothers it." },
    { id: "boy", x: 14, y: 7, sprite: "boy", move: "wander",
      script: async (g) => {
        if (g.flag("halvard-defeated")) {
          await g.say("The sky's clear\nagain! I can see\nall the stars!");
        } else if (g.flag("frostmere-obs-cleared")) {
          await g.say("The bad guys ran up\nthe peak! The trail\nstarts east of\ftown. Be careful!");
        } else {
          await g.say("The Syndicate took\nthe Observatory.\nThey're using our\ftelescope to find\nsomething on the\npeak!");
        }
      } },
  ],
  items: [
    { x: 17, y: 16, item: "thaw-gel", hidden: true },
  ],
};
