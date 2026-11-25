// @ts-check

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "port-saltry-house",
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
    { x: 3, y: 7, dir: "down", to: { map: "port-saltry", x: 8, y: 10 } },
    { x: 4, y: 7, dir: "down", to: { map: "port-saltry", x: 8, y: 10 } },
  ],
  npcs: [
    {
      id: "sailor", x: 5, y: 3, sprite: "sailor", dir: "left", move: "still",
      script: async (g) => {
        if (g.flag("middle:saltry-house-gift")) {
          await g.say("Voltreach is past the sea. Their Warden's creatures are all sparks.\fBring something that shrugs off lightning!");
          return;
        }
        await g.say("I sailed every sea in the Isles. Now my knees say no.\fHere, take this from my sea chest. I won't need it.");
        await g.give("long-ward-mist");
        g.setFlag("middle:saltry-house-gift");
      },
    },
    { id: "kid", x: 2, y: 5, sprite: "boy", move: "wander",
      text: "Grandpa says the sea route has islands with grass on them. I wanna see!" },
  ],
};
