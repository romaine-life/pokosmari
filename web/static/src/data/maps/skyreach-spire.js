// @ts-check
// Skyreach Spire: Warden Corvin (dragon) at the top of a switchback climb.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "skyreach-spire",
  name: "Skyreach Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    "%%%%%%%%%%%%", // 0
    "%%%%####%%%%",
    "%%%%####%%%%",
    "%##########%",
    "%%%%%%%%%#%%",
    "%##########%", // 5
    "%#%%%%%%%%%%",
    "%##########%",
    "%%%%%%%%%#%%",
    "%##########%",
    "%#%%%%%%%%%%", // 10
    "%##########%",
    "%##########%",
    "%%%%%##%%%%%",
    "%%%%%mm%%%%%",
  ],
  spawns: { door: { x: 5, y: 14, dir: "up" } },
  warps: [
    { x: 5, y: 14, dir: "down", to: { map: "skyreach", x: 4, y: 10 } },
    { x: 6, y: 14, dir: "down", to: { map: "skyreach", x: 4, y: 10 } },
  ],
  npcs: [
    {
      id: "guide",
      x: 7,
      y: 12,
      sprite: "gentleman",
      move: "still",
      text: "Corvin's dragons are tough as old boots.\fIce moves sting them. So do other dragons, if you've got one!",
    },
    { id: "keeper", x: 8, y: 11, sprite: "ace-m", dir: "left", move: "still", trainer: "skyreach-spire-1", sight: 4 },
    { id: "rider-f", x: 10, y: 7, sprite: "ace-f", dir: "left", move: "still", trainer: "skyreach-spire-2", sight: 4 },
    { id: "rider-m", x: 10, y: 5, sprite: "ace-m", dir: "left", move: "still", trainer: "skyreach-spire-3", sight: 4 },
    {
      id: "corvin",
      x: 5,
      y: 1,
      sprite: "warden8",
      move: "still",
      script: async (g) => {
        if (g.state.badges.includes("corvin")) {
          await g.say("Eight badges. The road north of town is yours now.\fVictory Road will ask for every tool you carry. Then the Council asks for everything else.");
          return;
        }
        await g.say("I am Corvin, Warden of Skyreach.\fI saw the storm break over the peak. I saw who broke it.\fThe Isles owe you. I do not. Show me you can fly higher!");
        if (!(await g.battle("corvin"))) return;
        await g.say("Ha... I haven't been brought down like that in years.\fTake it. You've earned the sky.");
        await g.badge("corvin", "Gale Badge");
        await g.say("The Gale Badge is your eighth.\fThe guard north of town will let you into Victory Road. At its end: the Summit Citadel.");
      },
    },
  ],
};
