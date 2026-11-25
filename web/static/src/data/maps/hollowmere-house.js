// @ts-check

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "hollowmere-house",
  name: "House",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__xp|",
    "|______|",
    "|_xx___|",
    "|______|",
    "|p____p|",
    "|______|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "hollowmere", x: 13, y: 11 } },
    { x: 4, y: 7, dir: "down", to: { map: "hollowmere", x: 13, y: 11 } },
  ],
  npcs: [
    {
      id: "oldwoman", x: 1, y: 3, sprite: "oldwoman", dir: "right", move: "still",
      script: async (g) => {
        if (g.flag("middle:hollowmere-house-gift")) {
          await g.say("When I was a girl, the Storm Bell rang once. It rained for a week.\fThe mushrooms were magnificent.");
          return;
        }
        await g.say("Oh, a visitor! We don't get many. The mist puts folk off.\fTake these. Their petals wake even the sleepiest creature.");
        await g.give("wake-bloom", 2);
        g.setFlag("middle:hollowmere-house-gift");
      },
    },
    { id: "pet", x: 5, y: 5, sprite: "creature", move: "wander",
      text: "Pudu? The little creature snuggles your boot." },
  ],
};
