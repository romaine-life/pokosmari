// @ts-check
// A Frostmere house: the Observatory's astronomer, locked out of her own telescope.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere-house",
  name: "House",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    '||||||||',
    '|bbP_xx|',
    '|______|',
    '|_x____|',
    '|______|',
    '|p____p|',
    '|______|',
    '|__mm__|',
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "frostmere", x: 14, y: 14 } },
    { x: 4, y: 7, dir: "down", to: { map: "frostmere", x: 14, y: 14 } },
  ],
  npcs: [
    {
      id: "astronomer", x: 4, y: 3, sprite: "scientist", move: "still",
      script: async (g) => {
        if (g.flag("frostmere-house-gift")) {
          await g.say("Tonight I'll finally\nsee the comet. All\nthanks to you!");
          return;
        }
        if (!g.flag("frostmere-obs-cleared")) {
          await g.say("I'm the astronomer.\nThe Syndicate threw\nme out of my own\fObservatory!\fThey aimed my\ntelescope at the\npeak, not the stars.\fTheir doors upstairs\nneed a keycard. The\nadmin by the front\fdesk carries one.\nPlease, get my\nObservatory back!");
          return;
        }
        await g.say("You chased them out!\nMy telescope is\nmine again!\fPlease, take this.\nI found it on a\nclear night.");
        await g.give("prime-orb", 3);
        g.setFlag("frostmere-house-gift");
      },
    },
    { id: "cat", x: 2, y: 5, sprite: "creature", move: "turn",
      text: "Snowablob: Bloop!\nIt's warming itself\nby the window." },
  ],
};
