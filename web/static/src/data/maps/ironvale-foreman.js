// @ts-check
// The Foreman's office: he lends the Power Gloves once the player knows about the dig.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ironvale-foreman",
  name: "Foreman's Office",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    '||||||||||',
    '|bb__P_bb|',
    '|________|',
    '|__xxx___|',
    '|________|',
    '|p______p|',
    '|________|',
    '|___mm___|',
  ],
  spawns: { door: { x: 4, y: 7, dir: "up" } },
  warps: [
    { x: 4, y: 7, dir: "down", to: { map: "ironvale", x: 4, y: 7 } },
    { x: 5, y: 7, dir: "down", to: { map: "ironvale", x: 4, y: 7 } },
  ],
  npcs: [
    {
      id: "foreman", x: 4, y: 2, sprite: "worker", move: "still",
      script: async (g) => {
        if (g.flag("ironvale-mine-cleared")) {
          await g.say("FOREMAN: You and\nGideon cleared out\nmy mine! Hah!\fKeep the gloves.\nYou've earned every\nfinger of them.");
          return;
        }
        if (g.has("power-gloves")) {
          await g.say("FOREMAN: Walk into\na boulder and push.\nThe gloves do the\frest. Go find\nGideon!");
          return;
        }
        if (!g.flag("ironvale-heard-syndicate")) {
          await g.say("FOREMAN: Not now,\nkid! Half my crew\nis standing around\fat the mine and\nnobody will tell me\nwhy!");
          return;
        }
        await g.say("FOREMAN: The\nSyndicate?! In MY\nmine?!\fAnd they dropped\nthe ceiling? That's\nit.\fYou look like you\ncan handle a scrap.\nHere, take these.");
        await g.give("power-gloves");
        await g.say("FOREMAN: With the\nPower Gloves you can\npush big boulders.\fClear a path, find\nGideon, and kick\nthose diggers out\fof my tunnels!");
      },
    },
    { id: "clerk", x: 7, y: 4, sprite: "worker", move: "turn",
      text: "The Foreman yells a\nlot, but he'd lend\nhis last pickaxe to\fanyone who asked." },
  ],
};
