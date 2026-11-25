// @ts-check
// Kip's house: his mom, and his sister, who hands over the Region Map once the player has a dex.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "fernhollow-kip-home",
  name: "Fernhollow",
  theme: "indoor",
  music: "town-home",
  indoor: true,
  rows: [
    "||||||||||",
    "|bb____bb|",
    "|________|",
    "|__xx____|",
    "|__xx____|",
    "|________|",
    "|p______p|",
    "|__mm____|",
  ],
  spawns: {
    door: { x: 3, y: 7, dir: "up" },
  },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "fernhollow", x: 14, y: 5 } },
    { x: 4, y: 7, dir: "down", to: { map: "fernhollow", x: 14, y: 5 } },
  ],
  npcs: [
    {
      id: "kip-mom", x: 5, y: 4, sprite: "beauty", dir: "left", move: "still",
      script: async (g) => {
        if (!g.starter()) {
          await g.say("{RIVAL}? He's been at the lab since sunrise. He couldn't sleep a wink.");
          return;
        }
        await g.say("Be kind to {RIVAL} out there, won't you?\fHe talks big, but he looks up to you more than he'd ever say.");
      },
    },
    {
      id: "sister", x: 6, y: 2, sprite: "girl", move: "turn",
      script: async (g) => {
        if (!g.flag("dex")) {
          await g.say("My brother ran out the door yelling about being the best in the Isles.\fIf you see him, tell him he forgot his lunch.");
          return;
        }
        if (!g.has("town-map")) {
          await g.say("Oh, you've got a dex too? Then you'll need to know where you're going.\fHere, {RIVAL} left this behind. He never reads maps anyway.");
          await g.give("town-map");
          await g.say("Open it from your bag to see where you are.");
          return;
        }
        await g.say("Brookside Spire's Warden grows grass creatures.\fFire and flying types cut right through grass. Just saying!");
      },
    },
  ],
};
