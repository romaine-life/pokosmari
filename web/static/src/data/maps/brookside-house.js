// @ts-check
// A house by the spire: a retired trainer with a tip about catching.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "brookside-house",
  name: "Brookside",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__bb|",
    "|______|",
    "|__xx__|",
    "|__xx__|",
    "|______|",
    "|p____p|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "brookside", x: 13, y: 4 } },
    { x: 4, y: 7, dir: "down", to: { map: "brookside", x: 13, y: 4 } },
  ],
  npcs: [
    {
      id: "gentleman", x: 5, y: 3, sprite: "gentleman", dir: "left", move: "still",
      text: "In my day we caught creatures with nothing but patience.\fWeaken it first, then throw your orb. A sleeping creature hardly struggles at all.",
    },
    {
      id: "creature", x: 2, y: 5, sprite: "creature", move: "wander",
      text: "Dappocub: Mrrp!\fIt seems to want its ears scratched.",
    },
  ],
};
