// @ts-check
// The bike shop. The Syndicate kept "borrowing" bikes; once the warehouse is cleared the
// owner gives the player the Trail Bike (key item "bicycle").

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "port-saltry-bikes",
  name: "Spokes & Sails",
  theme: "indoor",
  music: "mart",
  indoor: true,
  rows: [
    "||||||||",
    "|bb__xx|",
    "|______|",
    "|cccc__|",
    "|______|",
    "|x____p|",
    "|______|",
    "|__mm__|",
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "port-saltry", x: 3, y: 10 } },
    { x: 4, y: 7, dir: "down", to: { map: "port-saltry", x: 3, y: 10 } },
  ],
  npcs: [
    {
      id: "owner", x: 2, y: 2, sprite: "worker", dir: "down", move: "still",
      script: async (g) => {
        if (g.has("bicycle")) {
          await g.say("How's the Trail Bike? Press SELECT to hop on and off.\fFaster than any Syndicate thug, I promise!");
          return;
        }
        if (!g.flag("middle:warehouse-cleared")) {
          await g.say("Welcome to Spokes & Sails... sigh.\fThe Syndicate keep taking my bikes for \"inspection\". They never bring them back.\fThey stash them in the dock warehouse. If only someone could stop them...");
          return;
        }
        await g.say("You ran the Syndicate out of the warehouse? And my bikes came back!\fI don't know how to thank you. Yes I do! Take my best model!");
        await g.give("bicycle");
        await g.say("Press SELECT to ride it. It's twice as fast as walking!");
      },
    },
    { id: "boy", x: 5, y: 4, sprite: "boy", move: "wander",
      text: "I'm saving up for a bike. I've got three coins so far." },
  ],
};
