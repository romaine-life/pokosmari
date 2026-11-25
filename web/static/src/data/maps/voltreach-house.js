// @ts-check

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "voltreach-house",
  name: "House",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb_Pxp|",
    "|______|",
    "|_xx___|",
    "|______|",
    "|p____p|",
    "|______|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "voltreach", x: 11, y: 9 } },
    { x: 4, y: 7, dir: "down", to: { map: "voltreach", x: 11, y: 9 } },
  ],
  npcs: [
    {
      id: "oldman", x: 2, y: 2, sprite: "oldman", dir: "down", move: "still",
      script: async (g) => {
        if (g.flag("middle:voltreach-house-gift")) {
          await g.say("Zap! Ha. I still do that to myself.\fHollowmere is past the cave. Lovely mist. Spooky folk.");
          return;
        }
        await g.say("I worked at the power plant forty years. Static's in my bones!\fHere, take these from my drawer. Shocking, isn't it?");
        await g.give("nerve-balm", 3);
        g.setFlag("middle:voltreach-house-gift");
      },
    },
    { id: "girl", x: 5, y: 4, sprite: "girl", move: "wander",
      text: "Grandpa's hair stands up when he hugs me. It's funny!" },
  ],
};
