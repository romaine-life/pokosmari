// @ts-check
// The Summit Citadel's entrance hall: a nurse and a clerk for the last preparations, then
// the door north to the High Council. Once through it there's no way back until the
// champion is beaten; losing on the way sends the player back here and the run starts over.

import { RUN_FLAGS } from "./_summit.js";

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "summit-citadel",
  name: "Summit Citadel",
  theme: "indoor",
  music: "spire",
  indoor: true,
  rows: [
    "|||||__|||||", // 0: the door to the Council
    "|_H_|__|bb_|",
    "|___|__|___|",
    "|ccc____cc_|",
    "|__________|",
    "|p________p|", // 5
    "|__________|",
    "|__________|",
    "|____mm____|",
  ],
  heal: { x: 2, y: 4 },
  spawns: {
    entrance: { x: 5, y: 8, dir: "up" },
    "from-hall": { x: 6, y: 6, dir: "up" },
  },
  warps: [
    { x: 5, y: 8, dir: "down", to: { map: "victory-road-3", at: "from-citadel" } },
    { x: 6, y: 8, dir: "down", to: { map: "victory-road-3", at: "from-citadel" } },
    { x: 5, y: 0, to: { map: "summit-brakka", at: "entrance" } },
    { x: 6, y: 0, to: { map: "summit-brakka", at: "entrance" } },
  ],
  onEnter: async (g) => {
    // Until the champion falls, every visit here (a blackout included) starts the run over.
    if (g.flag("champion")) return;
    for (const f of RUN_FLAGS) if (g.flag(f)) g.clearFlag(f);
    if (g.flag("endgame-council-ready")) g.clearFlag("endgame-council-ready");
  },
  triggers: [
    {
      x: 5,
      y: 2,
      w: 2,
      unless: "endgame-council-ready",
      script: async (g) => {
        if (g.flag("champion")) return;
        g.face("guard", "right");
        const go = await g.yesNo("Guard: Past this door wait the four of the High Council, then the champion.\fOnce you go in, there's no coming back out until it's done. Ready?");
        if (!go) {
          await g.say("Guard: Take your time. The nurse and the clerk are right here.");
          await g.move("player", "D");
          return;
        }
        g.save();
        await g.jingle("save");
        await g.say("{PLAYER} saved the game.\fGuard: Good luck, trainer!");
        g.setFlag("endgame-council-ready");
      },
    },
  ],
  npcs: [
    { id: "nurse", x: 2, y: 2, sprite: "nurse", move: "still", script: (g) => g.healCenter() },
    {
      id: "clerk",
      x: 9,
      y: 2,
      sprite: "clerk",
      move: "still",
      script: (g) => g.shop(["prime-orb", "grand-tonic", "mega-tonic", "panacea", "wake-bloom", "dawn-bloom", "remedy-spray", "deep-focus", "long-ward-mist"]),
    },
    {
      id: "guard",
      x: 4,
      y: 3,
      sprite: "guard",
      dir: "right",
      move: "still",
      script: async (g) => {
        if (g.flag("champion")) await g.say("Guard: Champion! The Council would be glad of a rematch, I'm sure. Well, Brakka would.");
        else await g.say("Guard: The High Council fights one after another, no rest in between. Heal up and stock up first!");
      },
    },
    {
      id: "ace",
      x: 9,
      y: 6,
      sprite: "ace-f",
      move: "turn",
      text: "I lost to Mordecai. Twice. Dark moves hit my psychic team so hard... Bring fighting or fairy types for him!",
    },
  ],
};
