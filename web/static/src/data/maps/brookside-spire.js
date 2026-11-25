// @ts-check
// Brookside Spire: three floors' worth of greenhouse rooms climbing to Warden Tamsin.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "brookside-spire",
  name: "Brookside Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    "%%%%%%%%%%%%",
    "%p########p%",
    "%##########%",
    "%##########%",
    "%%%%%##%%%%%",
    "%p########p%",
    "%##########%",
    "%##########%",
    "%%%%%##%%%%%",
    "%##########%",
    "%##########%",
    "%p########p%",
    "%####mm####%",
  ],
  spawns: { door: { x: 5, y: 12, dir: "up" } },
  warps: [
    { x: 5, y: 12, dir: "down", to: { map: "brookside", x: 4, y: 5 } },
    { x: 6, y: 12, dir: "down", to: { map: "brookside", x: 4, y: 5 } },
  ],
  npcs: [
    {
      id: "guide", x: 3, y: 12, sprite: "gentleman", dir: "right", move: "still",
      text: "Welcome, challenger! Warden Tamsin grows grass creatures, tough and patient.\fFire burns them and flying beaks peck them. Bring a Tonic or two!",
    },
    { id: "gardener", x: 9, y: 10, sprite: "hiker", dir: "left", move: "still", trainer: "bspire-hollis", sight: 4 },
    { id: "picnicker", x: 2, y: 6, sprite: "lass", dir: "right", move: "still", trainer: "bspire-wren", sight: 4 },
    {
      id: "tamsin", x: 5, y: 1, sprite: "warden1", dir: "down", move: "still",
      script: async (g) => {
        if (g.flag("trainer:tamsin")) {
          await g.say("Tamsin: The guard on the woods trail will wave you through now.\fWhisper Woods is full of bugs. Bring something that isn't afraid of them!");
          return;
        }
        await g.say("Tamsin: Welcome to my garden, {PLAYER}.\fI'm Tamsin, Warden of Brookside Spire.\fRoots hold fast through any storm. Let's see if yours do!");
        if (!(await g.battle("tamsin"))) return;
        await g.say("Tamsin: You've grown strong roots already. Take this.");
        await g.badge("tamsin", "Thicket Badge");
        await g.say("Tamsin: The Thicket Badge tells everyone you can look after yourself.\fThe guard at Whisper Woods will let you pass now.");
      },
    },
  ],
  items: [
    { x: 10, y: 2, item: "tonic" },
  ],
};
