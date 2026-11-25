// @ts-check
// The hall of fame at the top of the Summit Citadel. The champion's script brings the
// player here for the ending; afterwards its stairs lead back down to the entrance hall.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "summit-hall",
  name: "Hall of Fame",
  theme: "spire",
  music: "hall",
  indoor: true,
  rows: [
    "%%%%%%%%%%%",
    "%%#######%%",
    "%#########%",
    "%#########%",
    "%#########%",
    "%#########%", // 5
    "%#########%",
    "%%%%###%%%%",
    "%%%%%m%%%%%",
  ],
  spawns: { entrance: { x: 5, y: 7, dir: "up" } },
  warps: [{ x: 5, y: 8, dir: "down", to: { map: "summit-citadel", at: "from-hall" } }],
  signs: [{ x: 5, y: 1, text: "HALL OF FAME\nThe champions of the Osmari Isles and the creatures who stood with them." }],
  npcs: [
    {
      id: "linden",
      x: 5,
      y: 3,
      sprite: "professor",
      dir: "down",
      move: "still",
      showIf: "champion",
      script: async (g) => {
        await g.say("Linden: Your names are up there now, with every champion before you.\fBut the dex isn't finished, is it? Plenty of the Isles left to explore!");
      },
    },
  ],
};
