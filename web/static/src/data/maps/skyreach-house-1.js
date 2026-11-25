// @ts-check
// An old woman who has watched trainers climb past her window for fifty years.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "skyreach-house-1",
  name: "Skyreach House",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__pp|",
    "|______|",
    "|_xx___|",
    "|_xx___|",
    "|______|",
    "|p_____|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "skyreach", x: 2, y: 15 } },
    { x: 4, y: 7, dir: "down", to: { map: "skyreach", x: 2, y: 15 } },
  ],
  npcs: [
    {
      id: "oldwoman",
      x: 4,
      y: 2,
      sprite: "oldwoman",
      move: "turn",
      script: async (g) => {
        if (g.flag("endgame-candy")) {
          await g.say("Fifty years I've watched trainers climb past my window. You look like one who'll make it.");
          return;
        }
        await g.say("Oh, a visitor! Most trainers rush past to the spire.\fHere, dear. A sweet for whichever of yours works hardest.");
        await g.give("growth-candy");
        g.setFlag("endgame-candy");
      },
    },
  ],
};
