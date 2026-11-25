// @ts-check
// Old Hazel the woodcutter's house, by the spire: the Brush Cutter, for whoever beats Bram.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "cinderford-house",
  name: "Cinderford",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__pp|",
    "|______|",
    "|__xx__|",
    "|______|",
    "|______|",
    "|p_____|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "cinderford", x: 3, y: 4 } },
    { x: 4, y: 7, dir: "down", to: { map: "cinderford", x: 3, y: 4 } },
  ],
  npcs: [
    {
      id: "hazel", x: 5, y: 3, sprite: "oldwoman", dir: "left", move: "still",
      script: async (g) => {
        if (g.has("brush-cutter")) {
          await g.say("Hazel: Small trees grow back the moment you turn your back.\fThat's the forest for you. Stubborn, like me.");
          return;
        }
        if (!g.state.badges.includes("bram")) {
          await g.say("Hazel: The trail east is choked with saplings, and I'm too old to clear it.\fI've a Brush Cutter that would do it, but I don't lend it to just anyone.\fBeat Bram up at the spire. Then we'll talk.");
          return;
        }
        await g.say("Hazel: Is that Bram's Kiln Badge? Well, well!\fThen you've earned this. It cuts through any sapling in your way.");
        await g.give("brush-cutter");
        await g.say("Hazel: Face a small tree and press A. Route 3 is east of town.\fPort Saltry's on the far side. Mind Ember Grotto, it's hot in there.");
      },
    },
  ],
};
