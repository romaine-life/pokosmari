// @ts-check
// The Spark Spire: Warden Ozzie (electric). His badge is what Dr. Elm wants to see before
// she hands over the Lantern.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "voltreach-spire",
  name: "Spark Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    "%%%%%%%%%%",
    "%%%####%%%",
    "%%%####%%%",
    "%########%",
    "%#%%%%%%%%",
    "%########%",
    "%%%#%%%%#%",
    "%########%",
    "%#%%%%#%%%",
    "%########%",
    "%%%%##%%%%",
    "%########%",
    "%########%",
    "%%%%mm%%%%",
  ],
  spawns: { door: { x: 4, y: 13, dir: "up" } },
  warps: [
    { x: 4, y: 13, dir: "down", to: { map: "voltreach", x: 3, y: 16 } },
    { x: 5, y: 13, dir: "down", to: { map: "voltreach", x: 3, y: 16 } },
  ],
  npcs: [
    { id: "guide", x: 6, y: 12, sprite: "gentleman", dir: "left", move: "still",
      text: "Hello, challenger!\fOzzie's creatures are all sparks. Ground types laugh at lightning. Bring one if you can!" },
    { id: "sci1", x: 6, y: 8, sprite: "scientist", dir: "up", move: "still", trainer: "volt-spire-1", sight: 1 },
    { id: "sci2", x: 3, y: 6, sprite: "scientist", dir: "down", move: "still", trainer: "volt-spire-2", sight: 1 },
    {
      id: "ozzie", x: 4, y: 1, sprite: "warden4", dir: "down", move: "still",
      script: async (g) => {
        if (g.state.badges.includes("ozzie")) {
          await g.say("Go see Dr. Elm at the lab. She built something bright for you.\fDon't tell her I said it was good.");
          return;
        }
        await g.say("Ozzie here! Warden, tinkerer, inventor of self-buttering toast.\fIt doesn't work. But my creatures do! Let's go!");
        if (!(await g.battle("ozzie"))) return;
        await g.say("Overloaded! Ha, that was electric! You've earned this.");
        await g.badge("ozzie", "Dynamo Badge");
        await g.say("Now go see Dr. Elm at the lab. She promised her Lantern to whoever beat me.\fYou'll need it for Hollowmere Cave, north up Route 5.");
      },
    },
  ],
  items: [
    { x: 8, y: 3, item: "nerve-balm" },
  ],
};
