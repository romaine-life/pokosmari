// @ts-check
// The sealed ruins east of Voltreach (optional, after the High Council): Zapashark, once.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "voltreach-ruins",
  name: "Voltreach Ruins",
  theme: "cave",
  music: "cave",
  border: "O",
  rows: [
    "OOOOOOOOOOOO",
    "OooooooooooO",
    "OooooooooooO",
    "OoOooooooOoO",
    "OooooooooooO",
    "OooooooooooO",
    "OooooooooooO",
    "OoOooooooOoO",
    "OooooooooooO",
    "OooooooooooO",
    "OooooooooooO",
    "OOOOOooOOOOO",
  ],
  spawns: { door: { x: 5, y: 10, dir: "up" } },
  warps: [
    { x: 5, y: 11, dir: "down", to: { map: "voltreach", x: 20, y: 8 } },
    { x: 6, y: 11, dir: "down", to: { map: "voltreach", x: 20, y: 8 } },
  ],
  npcs: [
    {
      id: "zapashark", x: 5, y: 2, sprite: "creature", dir: "down", move: "still", hideIf: "middle:zapashark-met",
      script: async (g) => {
        await g.say("The air crackles. Every hair on your neck stands up...");
        await g.say("Zzzrrraaaak!");
        await g.wild("zapashark", 50, { music: "battle-legend" });
        g.setFlag("middle:zapashark-met");
        await g.say("The ruins fall quiet. The storm has passed.");
      },
    },
  ],
  items: [
    { x: 1, y: 1, item: "prime-orb", count: 3 },
    { x: 10, y: 10, item: "grand-tonic", hidden: true },
  ],
};
