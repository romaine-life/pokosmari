// @ts-check
// Voltreach Lab: Dr. Elm gives the Lantern once the player has Ozzie's badge.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "voltreach-lab",
  name: "Voltreach Lab",
  theme: "indoor",
  music: "lab",
  indoor: true,
  rows: [
    "||||||||||",
    "|PPbb_bbP|",
    "|________|",
    "|_xx__xx_|",
    "|________|",
    "|p_xx___p|",
    "|________|",
    "|___mm___|",
  ],
  spawns: { door: { x: 4, y: 7, dir: "up" } },
  warps: [
    { x: 4, y: 7, dir: "down", to: { map: "voltreach", x: 11, y: 15 } },
    { x: 5, y: 7, dir: "down", to: { map: "voltreach", x: 11, y: 15 } },
  ],
  npcs: [
    {
      id: "elm", x: 5, y: 2, sprite: "scientist", dir: "down", move: "still",
      script: async (g) => {
        if (g.has("lantern")) {
          await g.say("The Lantern lights dark cave floors all on its own.\fHollowmere Cave is north, past Route 5. Mind the ladders!");
          return;
        }
        if (!g.state.badges.includes("ozzie")) {
          await g.say("I'm Dr. Elm. This is my Lantern: it lights up the darkest cave!\fI promised Ozzie it goes to someone who can beat him.\fHis spire is by the south road. Good luck!");
          return;
        }
        await g.say("Ozzie's badge! You beat him? He must be sulking in his workshop. Ha!\fA promise is a promise. Here!");
        await g.give("lantern");
        await g.say("Carry it and dark cave floors light up by themselves.\fHollowmere Cave is north, past Route 5. Good luck!");
      },
    },
    { id: "aide", x: 7, y: 4, sprite: "scientist", move: "turn",
      text: "The ruins on the island? Something electric sleeps there.\fOur meters go wild every thunderstorm." },
    { id: "aide2", x: 2, y: 6, sprite: "scientist", move: "turn",
      text: "Ozzie and Dr. Elm have a rivalry. His inventions explode. Hers don't." },
  ],
};
