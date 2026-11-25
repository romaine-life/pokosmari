// @ts-check
// Frostmere Observatory 1F: the Syndicate's front desk. The admin behind it carries the
// Syndicate Keycard that opens the doors upstairs.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere-observatory",
  name: "Observatory 1F",
  theme: "indoor",
  music: "hideout",
  indoor: true,
  rows: [
    '||||||||||||||',
    '|L_b__PP__b__|',
    '|____________|',
    '|_xx______xx_|',
    '|____________|',
    '|_ccccc______|',
    '|____________|',
    '|p__________p|',
    '|____________|',
    '|_____mm_____|',
  ],
  spawns: {
    door: { x: 6, y: 9, dir: "up" },
    stairs: { x: 1, y: 1, dir: "down" },
  },
  warps: [
    { x: 6, y: 9, dir: "down", to: { map: "frostmere", x: 14, y: 4 } },
    { x: 7, y: 9, dir: "down", to: { map: "frostmere", x: 14, y: 4 } },
    { x: 1, y: 1, to: { map: "frostmere-observatory-2f", at: "stairs-down" } },
  ],
  npcs: [
    { id: "grunt-1", x: 10, y: 6, sprite: "grunt-m", dir: "left", move: "still", trainer: "obs-grunt-1", sight: 4 },
    { id: "grunt-2", x: 3, y: 2, sprite: "grunt-f", dir: "right", move: "still", trainer: "obs-grunt-2", sight: 4 },
    {
      id: "admin", x: 4, y: 4, sprite: "grunt-m", dir: "down", move: "still",
      script: async (g) => {
        if (!g.flag("trainer:obs-admin-1")) {
          await g.say("SORREL: Welcome to\nthe Observatory!\nWe're closed.\fForever, actually.\nThe Director's\nbusy upstairs.\fWant to go up?\nYou'll need my\nkeycard. Come\fand take it, if\nyou can!");
          await g.battle("obs-admin-1");
        }
        if (!g.has("syndicate-keycard")) {
          await g.say("SORREL: Fine, fine.\nA deal's a deal.");
          await g.give("syndicate-keycard");
          await g.say("SORREL: It opens\nevery locked door\nupstairs.\fNot that it'll do\nyou any good. The\nDirector is ready.");
          return;
        }
        await g.say("SORREL: Go on up.\nI'm on break.");
      },
    },
    { id: "sign-guard", x: 12, y: 8, sprite: "grunt-f", dir: "left", move: "still",
      script: async (g) => {
        if (g.flag("frostmere-obs-cleared")) await g.say("We're packing up.\nThe Director left\nus behind. Typical.");
        else await g.say("I'm on door duty.\nI don't battle.\nI just glare.\f...Glare.");
      } },
  ],
  items: [
    { x: 12, y: 2, item: "thaw-gel", count: 2 },
  ],
};
