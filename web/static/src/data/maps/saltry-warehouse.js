// @ts-check
// The dock warehouse the Syndicate seized: four grunts and Admin Marlow, who holds Nerys's
// spire key. Beating him sets "middle:warehouse-cleared" (Nerys can get into her spire, the
// bike shop gets its bikes back).

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "saltry-warehouse",
  name: "Dock Warehouse",
  theme: "indoor",
  music: "hideout",
  indoor: true,
  rows: [
    "||||||||||||",
    "|xx______xx|",
    "|x________x|",
    "|___xxxx___|",
    "|__________|",
    "|xxxx__xxxx|",
    "|__________|",
    "|___xxxx___|",
    "|x________x|",
    "|xx__xx__xx|",
    "|__________|",
    "|____mm____|",
  ],
  spawns: { door: { x: 5, y: 11, dir: "up" } },
  warps: [
    { x: 5, y: 11, dir: "down", to: { map: "port-saltry", x: 4, y: 16 } },
    { x: 6, y: 11, dir: "down", to: { map: "port-saltry", x: 4, y: 16 } },
  ],
  npcs: [
    { id: "grunt1", x: 1, y: 10, sprite: "grunt-m", dir: "right", move: "still", trainer: "saltry-grunt-1", sight: 3 },
    { id: "grunt2", x: 10, y: 6, sprite: "grunt-f", dir: "left", move: "still", trainer: "saltry-grunt-2", sight: 4 },
    { id: "grunt3", x: 1, y: 6, sprite: "grunt-m", dir: "right", move: "still", trainer: "saltry-grunt-3", sight: 3 },
    { id: "grunt4", x: 10, y: 4, sprite: "grunt-f", dir: "left", move: "still", trainer: "saltry-grunt-4", sight: 4 },
    {
      id: "admin", x: 5, y: 1, sprite: "grunt-m", dir: "down", move: "still", hideIf: "middle:warehouse-cleared",
      script: async (g) => {
        await g.say("Well, well. A kid wandering into Syndicate business.\fI'm Marlow, admin of the Eclipse Syndicate.\fThis port's boats will carry our cargo north. And that Warden stays locked out!\fYou want her key? Come and take it!");
        if (!(await g.battle("saltry-admin"))) return;
        await g.say("Fine! Keep your little port. The Director has bigger plans than boats anyway.\fHere, the Warden's key. Catch!");
        await g.say("{PLAYER} got Nerys's spire key back!");
        await g.say("Syndicate! Pull out! Leave the bikes, they're too slow anyway!");
        g.setFlag("middle:warehouse-cleared");
      },
    },
    {
      id: "worker", x: 9, y: 8, sprite: "worker", dir: "left", move: "still",
      script: async (g) => {
        if (g.flag("middle:warehouse-cleared")) {
          await g.say("They're gone! Our warehouse is ours again. Thank you!\fTake Nerys her key, will you? She's waiting by her spire.");
        } else {
          await g.say("They tied me to a crate! Okay, it was a loose knot.\fBut that admin in the back scares me.");
        }
      },
    },
  ],
  items: [
    { x: 10, y: 10, item: "great-orb", count: 2 },
    { x: 2, y: 2, item: "tonic-plus" },
    { x: 9, y: 1, item: "burn-salve", hidden: true },
  ],
};
