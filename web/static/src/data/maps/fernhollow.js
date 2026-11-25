// @ts-check
// Fernhollow: the player's home town. Mom's house, Kip's house and Professor Linden's lab.
// Nobody walks north into the tall grass without a creature of their own.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "fernhollow",
  name: "Fernhollow",
  theme: "meadow",
  music: "town-home",
  town: true,
  flyTo: { x: 4, y: 6 },
  rows: [
    "TTTTTTTTT::TTTTTTTTT",
    "T........::........T",
    "T.FF.....::.....FF.T",
    "T........::........T",
    "T........::........T",
    "T........::........T",
    "T...:....::...:....T",
    "T...::::::::::::...T",
    "T.F............:.F.T",
    "T..............:...T",
    "T..............:...T",
    "T.ff...........:.ffT",
    "T..............:...T",
    "T.F......:::::::...T",
    "T..................T",
    "T..~~~~....FF..FF..T",
    "T..~~~~............T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  buildings: [
    { kind: "house", x: 3, y: 3, to: { map: "fernhollow-home", at: "door" } },
    { kind: "house", x: 13, y: 3, to: { map: "fernhollow-kip-home", at: "door" } },
    { kind: "lab", x: 7, y: 9, to: { map: "fernhollow-lab", at: "door" } },
  ],
  connections: {
    north: { map: "route-1", offset: 0 },
  },
  spawns: {
    home: { x: 4, y: 6, dir: "down" },
  },
  signs: [
    { x: 11, y: 2, text: "FERNHOLLOW\nWhere every journey\nputs down roots." },
    { x: 7, y: 5, text: "{PLAYER}'s house" },
    { x: 12, y: 5, text: "{RIVAL}'s house" },
    { x: 16, y: 13, text: "LINDEN CREATURE LAB\nKnock if the door's\nstuck. It's stuck." },
  ],
  npcs: [
    {
      id: "girl", x: 5, y: 14, sprite: "girl", move: "wander",
      text: "Professor Linden studies how people and creatures get along.\fBig words, but he's the kindest man in town.",
    },
    {
      id: "fisher", x: 7, y: 16, sprite: "fisher", dir: "left", move: "still",
      text: "Nothing bites in this pond with a bare hook.\fThey say the fishers down in Port Saltry hand out rods.",
    },
  ],
  triggers: [
    {
      // The tall grass north of town: not without a creature.
      x: 9, y: 1, w: 2, unless: "starter",
      script: async (g) => {
        await g.say("Wait! {PLAYER}!\fIt's Professor Linden's voice, from back in town...");
        await g.say("Tall grass is no place to wander without a creature of your own!\fCome see me at the lab. Your partner is waiting!");
        await g.move("player", "D");
      },
    },
  ],
};
