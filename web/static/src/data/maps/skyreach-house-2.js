// @ts-check
// A retired Council-watcher with notes on each member.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "skyreach-house-2",
  name: "Skyreach House",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|b__bbb|",
    "|______|",
    "|___xx_|",
    "|___xx_|",
    "|______|",
    "|_____p|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "skyreach", x: 6, y: 15 } },
    { x: 4, y: 7, dir: "down", to: { map: "skyreach", x: 6, y: 15 } },
  ],
  npcs: [
    {
      id: "gentleman",
      x: 2,
      y: 4,
      sprite: "gentleman",
      move: "turn",
      text: "I've watched every Council battle for thirty years.\fBrakka hits hard, Selene thinks hard, Mordecai fights dirty, and Lumi...\fLumi smiles the whole time. That's the scary part.",
    },
    {
      id: "boy",
      x: 5,
      y: 5,
      sprite: "boy",
      move: "wander",
      text: "Grandpa says the champion changes when somebody new wins. I want to be next!",
    },
  ],
};
