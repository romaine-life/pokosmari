// @ts-check
// A house by the south path: a grandmother with a spare Great Orb and a word about stones.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "brookside-house-2",
  name: "Brookside",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__pp|",
    "|______|",
    "|______|",
    "|xx____|",
    "|______|",
    "|p_____|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "brookside", x: 15, y: 15 } },
    { x: 4, y: 7, dir: "down", to: { map: "brookside", x: 15, y: 15 } },
  ],
  npcs: [
    {
      id: "oldwoman", x: 4, y: 3, sprite: "oldwoman", move: "still",
      script: async (g) => {
        if (g.flag("early-brook-orb")) {
          await g.say("Some creatures don't grow up with training at all.\fThey change when they touch the right stone. Isn't that something?");
          return;
        }
        await g.say("Oh, a young trainer! My grandson left one of these behind when he moved to the city.\fYou'll put it to better use than my sock drawer.");
        await g.give("great-orb");
        g.setFlag("early-brook-orb");
      },
    },
  ],
};
