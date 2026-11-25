// @ts-check
// Cinderford Spire: a switchback climb through the forge rooms to Warden Bram.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "cinderford-spire",
  name: "Cinderford Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    "%%%%%%%%%%%%",
    "%p########p%",
    "%##########%",
    "%%%%%%%%%##%",
    "%##########%",
    "%##########%",
    "%##%%%%%%%%%",
    "%##########%",
    "%##########%",
    "%%%%%%%%%##%",
    "%##########%",
    "%p########p%",
    "%####mm####%",
  ],
  spawns: { door: { x: 5, y: 12, dir: "up" } },
  warps: [
    { x: 5, y: 12, dir: "down", to: { map: "cinderford", x: 9, y: 5 } },
    { x: 6, y: 12, dir: "down", to: { map: "cinderford", x: 9, y: 5 } },
  ],
  npcs: [
    {
      id: "guide", x: 3, y: 12, sprite: "gentleman", dir: "right", move: "still",
      text: "Hot in here, isn't it? Warden Bram keeps fire creatures.\fWater puts them out, and rock and ground stand firm against the flames!",
    },
    { id: "stoker", x: 5, y: 7, sprite: "worker", dir: "down", move: "still", trainer: "cspire-flint", sight: 1 },
    { id: "beauty", x: 6, y: 5, sprite: "beauty", dir: "up", move: "still", trainer: "cspire-ash", sight: 1 },
    {
      id: "bram", x: 5, y: 1, sprite: "warden2", dir: "down", move: "still",
      script: async (g) => {
        if (g.flag("trainer:bram")) {
          await g.say("Bram: Go and see Old Hazel, in the house beside the spire.\fShe's got a Brush Cutter with your name on it.");
          return;
        }
        await g.say("Bram: Ha! Another challenger, sweating already!\fI'm Bram, Warden of Cinderford. My creatures were raised in the forge.\fShow me you won't melt!");
        if (!(await g.battle("bram"))) return;
        await g.say("Bram: Ha ha! You've got fire of your own. Here, you've earned it.");
        await g.badge("bram", "Kiln Badge");
        await g.say("Bram: Show the Kiln Badge to Old Hazel, by the spire.\fShe'll lend you her Brush Cutter, and Route 3 will open right up.");
      },
    },
  ],
  items: [
    { x: 1, y: 10, item: "burn-salve" },
  ],
};
