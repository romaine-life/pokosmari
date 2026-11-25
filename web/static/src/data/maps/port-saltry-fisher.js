// @ts-check
// Old Gus the fisher gives the Worn Rod (key item "old-rod").

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "port-saltry-fisher",
  name: "Fisher's House",
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
    { x: 3, y: 7, dir: "down", to: { map: "port-saltry", x: 16, y: 10 } },
    { x: 4, y: 7, dir: "down", to: { map: "port-saltry", x: 16, y: 10 } },
  ],
  npcs: [
    {
      id: "gus", x: 4, y: 3, sprite: "fisher", dir: "down", move: "still",
      script: async (g) => {
        if (g.has("old-rod")) {
          await g.say("Face any water and cast your line.\fMy brother on Route 5 has a sturdier rod. Tell him Gus sent you!");
          return;
        }
        if (await g.yesNo("Ah, a visitor! Do you like fishing?")) {
          await g.say("I knew it! You have the look of an angler.");
        } else {
          await g.say("Pity! Well, take this anyway. You'll learn to love it.");
        }
        await g.give("old-rod");
        await g.say("Face the water and press A to fish. Creatures lurk where you can't see them!");
      },
    },
    { id: "wife", x: 6, y: 4, sprite: "oldwoman", move: "turn",
      text: "Gus has told me about the one that got away a hundred times. It grows a little each time." },
  ],
};
