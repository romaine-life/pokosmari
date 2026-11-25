// @ts-check
// The champion's room: Kip. Beating him is the end of the story: Linden arrives, takes
// them to the hall of fame (summit-hall), the credits roll, and the player wakes up at home.

import { ROOM_ROWS } from "./_summit.js";

/** @param {import("../../script/context.js").ScriptContext} g */
async function champion(g) {
  if (g.flag("champion")) {
    g.facePlayer("kip");
    await g.say("{RIVAL}: Champion {PLAYER}. Ha! It suits you.\fI'll take it back one day, you know. Probably. Maybe.");
    return;
  }
  g.music("rival");
  await g.approach("kip");
  await g.say("{RIVAL}: Hey, {PLAYER}.\fI beat the Council an hour ago. Sorry! You know me.\fBut a champion's nothing without a challenger.\fRemember Fernhollow? Two kids, two creatures, one lab.\fLook how far we came. Now let's see who's the best!");
  if (!(await g.battle("kip-champion"))) return;
  await g.say("{RIVAL}: ...Yeah. Yeah, that feels right.\fI wanted to be champion so bad. Turns out I wanted to lose to you more. Weird, huh?");
  g.setFlag("champion");
  await g.approach("linden");
  await g.say("Linden: There you both are! I ran all the way up Victory Road. Well, walked. Slowly.\f{RIVAL}, you fought splendidly.\f{PLAYER}... the kid who couldn't find my lab door is the champion of the Osmari Isles!\fI'm so proud of you. Of both of you.\fCome. There's a room up ahead where champions are remembered. Let's add a name to it.");
  await g.warp("summit-hall", 5, 5, "up");
  await g.approach("linden");
  await g.say("Linden: This is the hall of fame. Every champion's team is kept here, forever.\fLet's record yours: the friends who carried you all the way from Fernhollow.");
  await g.ending();
  g.healParty();
  await g.warp("fernhollow-home", 3, 3, "down");
  await g.say("Mom: {PLAYER}! You're home!\fThe whole town watched on the radio. {RIVAL}'s mom cried. So did I! Then we both cried about that.\fSit down, I'm making your favorite. A champion still has to eat.");
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "summit-champion",
  name: "Champion's Hall",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: ROOM_ROWS,
  spawns: { entrance: { x: 5, y: 9, dir: "up" } },
  warps: [{ x: 5, y: 0, to: { map: "summit-hall", at: "entrance" } }],
  reaches: ["summit-hall", "fernhollow-home"],
  triggers: [
    { x: 1, y: 6, w: 9, unless: "champion", script: champion },
    {
      x: 5,
      y: 1,
      unless: "champion",
      script: async (g) => {
        await g.say("{RIVAL}: Hey! Where are you going? I'm right here!");
        await g.move("player", "D");
      },
    },
    { x: 5, y: 9, unless: "champion", script: (g) => g.say("The door has sealed behind you. The only way is forward.") },
  ],
  npcs: [
    { id: "kip", x: 5, y: 3, sprite: "rival", dir: "down", move: "still", script: champion },
    { id: "linden", x: 4, y: 8, sprite: "professor", dir: "up", move: "still", showIf: "champion", text: "Linden: Champion! I still can't quite believe it. Well, I can. I just like saying it." },
  ],
};
