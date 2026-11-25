// @ts-check
// A house east of the spire: a hot-spring keeper and her well-fed pet.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "cinderford-house-2",
  name: "Cinderford",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__bb|",
    "|______|",
    "|xx____|",
    "|______|",
    "|______|",
    "|p____p|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "cinderford", x: 15, y: 4 } },
    { x: 4, y: 7, dir: "down", to: { map: "cinderford", x: 15, y: 4 } },
  ],
  npcs: [
    {
      id: "keeper", x: 4, y: 3, sprite: "lass", move: "still",
      script: async (g) => {
        if (g.flag("early-cinder-salve")) {
          await g.say("Creatures that live near the springs barely notice a burn.\fYours might, though. Keep that salve handy!");
          return;
        }
        await g.say("You look like you've walked a long way. Here, from the spring shop.");
        await g.give("burn-salve", 2);
        g.setFlag("early-cinder-salve");
      },
    },
    {
      id: "creature", x: 2, y: 5, sprite: "creature", move: "wander",
      text: "Pyrapip: Pip! Pip!\fIt's warm, and a little smoky.",
    },
  ],
};
