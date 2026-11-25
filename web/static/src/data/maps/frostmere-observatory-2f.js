// @ts-check
// Frostmere Observatory 2F: the Syndicate's labs. A keycard door splits the floor.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere-observatory-2f",
  name: "Observatory 2F",
  theme: "indoor",
  music: "hideout",
  indoor: true,
  rows: [
    '||||||||||||||',
    '|L__P__PP____|',
    '|____________|',
    '|_xx____xx___|',
    '|____________|',
    '|____________|',
    '||||||||||_|||',
    '|____________|',
    '|_P__xx__P___|',
    '|____________|',
    '|___________L|',
    '||||||||||||||',
  ],
  spawns: {
    "stairs-down": { x: 1, y: 1, dir: "down" },
    "stairs-up": { x: 12, y: 10, dir: "left" },
  },
  warps: [
    { x: 1, y: 1, to: { map: "frostmere-observatory", at: "stairs" } },
    { x: 12, y: 10, to: { map: "frostmere-observatory-3f", at: "stairs" } },
  ],
  signs: [
    { x: 9, y: 5, text: "SECURITY DOOR\nKeycard holders\nonly." },
  ],
  triggers: [
    {
      x: 10, y: 6, unless: "frostmere-door-2f",
      script: async (g) => {
        if (g.has("syndicate-keycard")) {
          g.sfx("door");
          await g.say("{PLAYER} used the\nSyndicate Keycard.\fThe door slid open!");
          g.setFlag("frostmere-door-2f");
        } else {
          g.sfx("error");
          await g.say("The door is locked.\nThere's a slot for\na keycard.");
          await g.move("player", "U");
        }
      },
    },
  ],
  npcs: [
    { id: "grunt-3", x: 5, y: 4, sprite: "grunt-m", dir: "right", move: "still", trainer: "obs-grunt-3", sight: 4 },
    { id: "admin-2", x: 11, y: 9, sprite: "grunt-f", dir: "left", move: "still", trainer: "obs-admin-2", sight: 4 },
    { id: "researcher", x: 12, y: 2, sprite: "scientist", dir: "left", move: "still",
      text: "They made me\nrecalibrate the\ntelescope all night.\fAll it showed was\none spot near the\nsummit of Skyreach." },
  ],
  items: [
    { x: 2, y: 9, item: "mega-tonic" },
  ],
};
