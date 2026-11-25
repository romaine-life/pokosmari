// @ts-check
// The Stillwater Shrine. The first time the player walks in, the Syndicate is taking the
// Storm Bell: a battle with Admin Sable (win or lose), then they escape ("bell-stolen").
// The keeper tells the legend of Trancedome, and takes the bell back once the player
// brings it down from Skyreach Summit ("bell-returned").

/** @param {import("../../script/context.js").ScriptContext} g */
async function returnBell(g) {
  await g.say("Keeper: That hum... the Storm Bell! You brought it home!");
  g.take("storm-bell");
  g.setFlag("bell-returned");
  g.sfx("statup");
  await g.say("{PLAYER} handed over the Storm Bell.");
  await g.say("Keeper: So it rang on the peak, and Trancedome woke calm.\fThen the old tales were true. A greedy hand rang it, and still no storm came.\fPerhaps because a calm heart was standing beside it.\fIt will rest here now, and ring for no one. Please, take this. It's all I have to give.");
  await g.give("dawn-bloom");
}

/** @param {import("../../script/context.js").ScriptContext} g */
async function heist(g) {
  await g.say("Keeper: Stop! You can't take that! The bell is sacred!");
  g.face("admin", "down");
  await g.exclaim("admin");
  await g.say("Sable: Oh? A kid, here? How sweet.");
  await g.approach("admin");
  await g.say("I'm Sable, admin of the Eclipse Syndicate.\fThe Storm Bell calls Trancedome. Whoever rings it commands the skies.\fDirector Halvard will ring it. And you won't stop us.");
  const won = await g.battle("hollowmere-admin", { canLose: true });
  if (won) {
    await g.say("Sable: Strong! But I only had to keep you busy.");
  } else {
    await g.say("Sable: Nap time's over, kid. We're leaving.");
  }
  await g.say("Grunts, now!");
  g.sfx("run");
  await g.say("A cloud of smoke fills the shrine!");
  g.hide("admin");
  g.hide("grunt1");
  g.hide("grunt2");
  g.setFlag("bell-stolen");
  await g.wait(30);
  await g.say("...The Syndicate are gone. And so is the Storm Bell.");
  await g.approach("keeper");
  await g.say("Keeper: Oh, no... the bell. Thank you for trying, child.\fListen. The bell is no ornament. It calls Trancedome, the guardian of the Isles.\fTrancedome sleeps on Skyreach Peak, far to the north.\fWhen the bell rings there, it wakes, and the weather wakes with it.\fThey think it will obey whoever rings it. But the old tales are clear:\fTrancedome answers only a calm heart. A greedy one gets a storm.\fPlease, go to Lady Vesper at the spire. She will know what must be done.");
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "hollowmere-shrine",
  name: "Stillwater Shrine",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    "||||||||||",
    "|p_bxxb_p|",
    "|________|",
    "|________|",
    "|p______p|",
    "|________|",
    "|________|",
    "|p______p|",
    "|________|",
    "|___mm___|",
  ],
  spawns: { door: { x: 4, y: 9, dir: "up" } },
  warps: [
    { x: 4, y: 9, dir: "down", to: { map: "hollowmere", x: 4, y: 12 } },
    { x: 5, y: 9, dir: "down", to: { map: "hollowmere", x: 4, y: 12 } },
  ],
  triggers: [
    { x: 1, y: 8, w: 8, h: 1, unless: "bell-stolen", script: heist },
  ],
  npcs: [
    {
      id: "keeper", x: 2, y: 3, sprite: "oldwoman", dir: "right", move: "still",
      script: async (g) => {
        if (!g.flag("bell-stolen")) {
          await g.say("Please, stop them!");
          return;
        }
        if (g.has("storm-bell")) {
          await returnBell(g);
          return;
        }
        if (g.flag("bell-returned")) {
          await g.say("Keeper: Hear how still the shrine is? The bell is home.\fWhen the weather is fair over the Isles, I think of you.");
          return;
        }
        await g.say("The bell calls Trancedome from its sleep on Skyreach Peak.\fTrancedome answers only a calm heart. Pray the Syndicate never learns that.\fLady Vesper waits at her spire.");
      },
    },
    { id: "admin", x: 4, y: 2, sprite: "grunt-f", dir: "up", move: "still", hideIf: "bell-stolen",
      text: "Mine now!" },
    { id: "grunt1", x: 3, y: 3, sprite: "grunt-m", dir: "up", move: "still", hideIf: "bell-stolen",
      text: "Heavy bell. Ugh." },
    { id: "grunt2", x: 6, y: 3, sprite: "grunt-m", dir: "up", move: "still", hideIf: "bell-stolen",
      text: "Is it gonna ring if I sneeze?" },
  ],
};
