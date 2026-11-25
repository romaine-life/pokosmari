// @ts-check
// The Anvil Spire: Warden Gideon (steel). Opens once the mine is clear.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ironvale-spire",
  name: "Anvil Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    '%%%%%%%%%%%%',
    '%%%%####%%%%',
    '%##########%',
    '%##%####%##%',
    '%%%%%%%%%##%',
    '%##########%',
    '%##########%',
    '%##%%%%%%%%%',
    '%##########%',
    '%#%######%#%',
    '%%%%%##%%%%%',
    '%##########%',
    '%##########%',
    '%%%%%mm%%%%%',
  ],
  spawns: { door: { x: 5, y: 13, dir: "up" } },
  warps: [
    { x: 5, y: 13, dir: "down", to: { map: "ironvale", x: 14, y: 5 } },
    { x: 6, y: 13, dir: "down", to: { map: "ironvale", x: 14, y: 5 } },
  ],
  npcs: [
    { id: "guide", x: 8, y: 12, sprite: "gentleman", dir: "left", move: "still",
      text: "Welcome, challenger!\fGideon's steel\nshrugs off a lot,\fbut fire, ground\nand fighting moves\nbite deep.\fGood luck!" },
    { id: "smith", x: 8, y: 8, sprite: "worker", dir: "left", move: "still", trainer: "ispire-worker-rhett", sight: 4 },
    { id: "ace", x: 3, y: 5, sprite: "ace-f", dir: "right", move: "still", trainer: "ispire-ace-mara", sight: 4 },
    {
      id: "gideon", x: 5, y: 1, sprite: "warden6", dir: "down", move: "still",
      script: async (g) => {
        if (g.state.badges.includes("gideon")) {
          await g.say("The old courier in\ntown will want to\nsee that badge.\fAnd Frostmere lies\neast, past the snow.\nStay sharp.");
          return;
        }
        await g.say("GIDEON: You came!\nGood.\fDown in the mine you\nfought for my town.\nHere, you fight me.\fSteel doesn't bend\nfor kindness. Show\nme your mettle!");
        if (!(await g.battle("gideon"))) return;
        await g.say("GIDEON: Ha! A clean\nbreak! You've earned\nthis.");
        await g.badge("gideon", "Anvil Badge");
        await g.say("GIDEON: The Anvil\nBadge. Six down!\fThe old courier in\ntown has been waiting\nfor someone like you.\fShow him the badge.\nHe has a whistle\nyou'll want.");
      },
    },
  ],
  items: [
    { x: 10, y: 2, item: "mega-tonic" },
  ],
};
