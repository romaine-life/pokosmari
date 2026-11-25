// @ts-check
// An Ironvale house: a retired courier gives the Wing Whistle to whoever beats Gideon.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "ironvale-house",
  name: "House",
  theme: "indoor",
  music: "town-2",
  indoor: true,
  rows: [
    '||||||||',
    '|bb__xx|',
    '|______|',
    '|_x____|',
    '|______|',
    '|p____p|',
    '|______|',
    '|__mm__|',
  ],
  spawns: { door: { x: 3, y: 7, dir: "up" } },
  warps: [
    { x: 3, y: 7, dir: "down", to: { map: "ironvale", x: 16, y: 13 } },
    { x: 4, y: 7, dir: "down", to: { map: "ironvale", x: 16, y: 13 } },
  ],
  npcs: [
    {
      id: "gentleman", x: 4, y: 2, sprite: "gentleman", move: "still",
      script: async (g) => {
        if (g.has("wing-whistle")) {
          await g.say("Blow the Wing\nWhistle outdoors and\na flock will carry\fyou to any town\nyou've visited with\na healing center.");
          return;
        }
        if (!g.state.badges.includes("gideon")) {
          await g.say("I carried letters\nacross the Isles for\nforty years.\fOn wings, mind you!\nI still have my old\nwhistle.\fBeat Gideon, and\nI'll know you're\nready for it.");
          return;
        }
        await g.say("Oh! The Anvil Badge!\nGideon doesn't hand\nthose out lightly.\fThen you're ready.\nTake my old whistle,\nwith my thanks.");
        await g.give("wing-whistle");
        await g.say("It calls a flock to\nfly you to any town\nyou've been to,\fas long as it has a\nhealing center.");
      },
    },
    { id: "oldwoman", x: 2, y: 4, sprite: "oldwoman", move: "still",
      text: "He tells the same\nstories every day.\nI love them anyway." },
  ],
};
