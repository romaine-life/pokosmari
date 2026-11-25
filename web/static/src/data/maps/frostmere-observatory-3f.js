// @ts-check
// Frostmere Observatory 3F: the telescope room, Director Halvard's first battle. He
// escapes to Skyreach Peak with the Storm Bell.

/** @type {import("../../world/map.js").Script} */
async function halvard(g) {
  g.music("villain");
  await g.exclaim("halvard");
  await g.approach("halvard");
  await g.say("HALVARD: So. The\nchild who keeps\nturning up.\fThe woods. The\ndocks. The shrine.\nThe mine.\fI am Halvard,\nDirector of the\nEclipse Syndicate.\fThis telescope has\nshown me where the\nStorm Bell must\fring: the summit of\nSkyreach, under the\nsleeping guardian.\fWith Ironvale's\nskysteel for its\nclapper, the bell\fwill wake Trancedome\nand Trancedome will\nanswer to me.\fEvery cloud over the\nIsles, mine to\ncommand.\fYou disagree. Of\ncourse you do.\nThen come.");
  await g.battle("halvard-1");
  await g.say("HALVARD: Hm. Strong.\fBut I only needed\ntime, and you have\ngiven it to me.\fThe bell is ready.\nThe peak is waiting.\fFollow me if you\nlike. You will be\njust in time to\fwatch.");
  await g.move("halvard", "R5");
  g.hide("halvard");
  g.sfx("door");
  g.setFlag("frostmere-obs-cleared");
  g.mapMusic();
  await g.say("Halvard escaped up\nthe roof hatch!");
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "frostmere-observatory-3f",
  name: "Observatory 3F",
  theme: "indoor",
  music: "hideout",
  indoor: true,
  rows: [
    '||||||||||||||',
    '|____PPPP____|',
    '|____________|',
    '|____________|',
    '|||||_||||||||',
    '|____________|',
    '|_xx______xx_|',
    '|____________|',
    '|L___________|',
    '||||||||||||||',
  ],
  spawns: { stairs: { x: 1, y: 8, dir: "right" } },
  warps: [
    { x: 1, y: 8, to: { map: "frostmere-observatory-2f", at: "stairs-up" } },
  ],
  signs: [
    { x: 4, y: 5, text: "DIRECTOR'S OFFICE\nKeycard holders\nonly." },
  ],
  triggers: [
    {
      x: 5, y: 4, unless: "frostmere-door-3f",
      script: async (g) => {
        if (g.has("syndicate-keycard")) {
          g.sfx("door");
          await g.say("{PLAYER} used the\nSyndicate Keycard.\fThe door slid open!");
          g.setFlag("frostmere-door-3f");
        } else {
          g.sfx("error");
          await g.say("The door is locked.\nThere's a slot for\na keycard.");
          await g.move("player", "D");
        }
      },
    },
    { x: 1, y: 3, w: 12, h: 1, unless: "frostmere-obs-cleared", script: halvard },
  ],
  npcs: [
    { id: "grunt-4", x: 9, y: 7, sprite: "grunt-f", dir: "left", move: "still", trainer: "obs-grunt-4", sight: 4 },
    { id: "halvard", x: 6, y: 2, sprite: "boss", dir: "down", move: "still", hideIf: "frostmere-obs-cleared",
      script: halvard },
    { id: "astronomer", x: 2, y: 2, sprite: "scientist", move: "still", showIf: "frostmere-obs-cleared",
      text: "The Syndicate kept\nme locked up here!\fTheir Director went\nout the roof toward\nSkyreach Peak.\fThe trail starts\neast of town. Hurry!" },
  ],
  items: [
    { x: 12, y: 2, item: "grand-tonic" },
  ],
};
