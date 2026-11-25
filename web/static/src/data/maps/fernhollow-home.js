// @ts-check
// The player's house: a new game starts here. Mom sends them off, and heals the party later.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "fernhollow-home",
  name: "Fernhollow",
  theme: "indoor",
  music: "town-home",
  indoor: true,
  rows: [
    "||||||||||",
    "|bbP___pb|",
    "|________|",
    "|________|",
    "|_____xx_|",
    "|_____xx_|",
    "|________|",
    "|__mm____|",
  ],
  spawns: {
    start: { x: 3, y: 3, dir: "down" },
    door: { x: 3, y: 7, dir: "up" },
  },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "fernhollow", x: 4, y: 5 } },
    { x: 4, y: 7, dir: "down", to: { map: "fernhollow", x: 4, y: 5 } },
  ],
  npcs: [
    {
      id: "mom", x: 5, y: 4, sprite: "mom", dir: "right", move: "still",
      script: async (g) => {
        if (!g.starter()) {
          await g.say("Mom: Morning, sleepyhead!\fProfessor Linden came by. He wants to see you at the lab, and he looked excited.\fDon't keep him waiting!");
          return;
        }
        if (g.flag("champion")) {
          await g.say("Mom: My {PLAYER}, the Champion! I told the whole street.\fTwice. Now sit and rest a moment.");
        } else {
          await g.say("Mom: There's my trainer! You all look worn out.\fCome here, let's get you rested.");
        }
        await g.jingle("heal");
        g.healParty();
        await g.say("Mom: There! Good as new.\fCome home whenever you need a rest. The door's always open.");
      },
    },
  ],
  triggers: [
    {
      // The first time out of the door.
      x: 1, y: 6, w: 8, once: "fern-mom-bye",
      script: async (g) => {
        await g.say("Mom: Off to the lab already?\fWear your good shoes, and say thank you to the professor.");
        await g.say("Mom: And {PLAYER}...\fWhatever's out there, I'm proud of you. Go on, now!");
      },
    },
  ],
};
