// @ts-check
// The Tide Spire: Warden Nerys (water). After the badge she gives the Tide Board.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "port-saltry-spire",
  name: "Tide Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    "%%%%%%%%%%",
    "%~~####~~%",
    "%~~####~~%",
    "%~~####~~%",
    "%########%",
    "%########%",
    "%#~~~~~~#%",
    "%#~~~~~~#%",
    "%#~~~~~~#%",
    "%########%",
    "%%%%##%%%%",
    "%########%",
    "%########%",
    "%%%%mm%%%%",
  ],
  spawns: { door: { x: 4, y: 13, dir: "up" } },
  warps: [
    { x: 4, y: 13, dir: "down", to: { map: "port-saltry", x: 18, y: 5 } },
    { x: 5, y: 13, dir: "down", to: { map: "port-saltry", x: 18, y: 5 } },
  ],
  npcs: [
    { id: "guide", x: 6, y: 12, sprite: "gentleman", dir: "left", move: "still",
      text: "Hello, challenger!\fNerys loves water types. Grass and electric moves make them squirm.\fGo get 'em!" },
    { id: "swimmer", x: 3, y: 5, sprite: "swimmer", dir: "left", move: "still", trainer: "saltry-spire-1", sight: 2 },
    { id: "sailor", x: 6, y: 5, sprite: "sailor", dir: "right", move: "still", trainer: "saltry-spire-2", sight: 2 },
    {
      id: "nerys", x: 4, y: 1, sprite: "warden3", dir: "down", move: "still",
      script: async (g) => {
        if (g.state.badges.includes("nerys")) {
          if (!g.has("tide-board")) await g.give("tide-board");
          await g.say("Ride the sea with the Tide Board: face the water and press A.\fRoute 4, east of the port, leads to Voltreach.");
          return;
        }
        await g.say("I'm Nerys, Warden of the Tide Spire.\fYou won back my key from those louts. Thank you.\fBut the sea gives nothing for free. Show me your tide!");
        if (!(await g.battle("nerys"))) return;
        await g.say("The tide turns... and it turned for you. Take this.");
        await g.badge("nerys", "Tideglass Badge");
        await g.say("The Tideglass Badge shows you can ride any wave. And to ride one, you need this.");
        await g.give("tide-board");
        await g.say("Face the water and press A to ride it.\fRoute 4 is the sea east of the port. Voltreach is on the far shore.");
      },
    },
  ],
  items: [
    { x: 8, y: 11, item: "tonic-plus" },
  ],
};
