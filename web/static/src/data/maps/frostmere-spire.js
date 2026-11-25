// @ts-check
// The Rime Spire: Warden Yuki (ice). Open whenever the player arrives in Frostmere.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere-spire",
  name: "Rime Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    '%%%%%%%%%%%%',
    '%%%%####%%%%',
    '%##########%',
    '%##########%',
    '%##%%%%%%%%%',
    '%##########%',
    '%####%%####%',
    '%##########%',
    '%%%%%%%%%##%',
    '%##########%',
    '%##########%',
    '%%%%%##%%%%%',
    '%##########%',
    '%##########%',
    '%%%%%mm%%%%%',
  ],
  spawns: { door: { x: 5, y: 14, dir: "up" } },
  warps: [
    { x: 5, y: 14, dir: "down", to: { map: "frostmere", x: 4, y: 5 } },
    { x: 6, y: 14, dir: "down", to: { map: "frostmere", x: 4, y: 5 } },
  ],
  npcs: [
    { id: "guide", x: 8, y: 13, sprite: "gentleman", dir: "left", move: "still",
      text: "Brr! Welcome,\nchallenger!\fYuki's ice hits\nhard, but fire,\nfighting, rock and\fsteel moves crack\nit right open.\fGood luck!" },
    { id: "beauty", x: 3, y: 9, sprite: "beauty", dir: "right", move: "still", trainer: "fspire-beauty-ines", sight: 4 },
    { id: "ace", x: 8, y: 5, sprite: "ace-m", dir: "left", move: "still", trainer: "fspire-ace-dag", sight: 4 },
    {
      id: "yuki", x: 5, y: 1, sprite: "warden7", dir: "down", move: "still",
      script: async (g) => {
        if (g.state.badges.includes("yuki")) {
          await g.say("YUKI: Seven badges!\nOnly Corvin in\nSkyreach is left.\fBut that storm on\nthe peak... please\nbe careful.");
          return;
        }
        await g.say("YUKI: Oh! A visitor!\nI'm Yuki, Warden of\nthe Rime Spire.\fThey say snow is\ncold. I think it's\nthe softest thing\fin the world, right\nup until it isn't.\fShall we see which\nkind you get?");
        if (!(await g.battle("yuki"))) return;
        await g.say("YUKI: What a lovely\nbattle! You've\nearned this.");
        await g.badge("yuki", "Rime Badge");
        await g.say("YUKI: The Rime Badge.\nSeven of eight!\fThe last spire is in\nSkyreach, north past\nRoute 8.\fBut nobody gets\nthrough while the\nstorm sits on the\fpeak. If you mean to\nstop it, I believe\nyou can.");
      },
    },
  ],
  items: [
    { x: 10, y: 2, item: "thaw-gel", count: 2 },
  ],
};
