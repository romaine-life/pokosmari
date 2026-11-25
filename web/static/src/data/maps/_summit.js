// @ts-check
// The Summit Citadel's Council rooms share one layout: in at the bottom (the door seals
// behind), the Council member in the middle, and the door north that opens once they're
// beaten. Files starting with "_" aren't maps.

/** @typedef {import("../../world/map.js").MapDef} MapDef */

export const ROOM_ROWS = [
  "%%%%%#%%%%%", // 0: the door north
  "%%%%%#%%%%%",
  "%%#######%%",
  "%#########%",
  "%#%#####%#%",
  "%#########%", // 5
  "%#%#####%#%",
  "%#########%",
  "%%%%###%%%%",
  "%%%%%#%%%%%", // 9: in from the room before
];

/** Every Council and champion battle flag: losing the run (or leaving it) clears them. */
export const RUN_FLAGS = [
  "trainer:council-brakka",
  "trainer:council-selene",
  "trainer:council-mordecai",
  "trainer:council-lumi",
  "trainer:kip-champion",
];

/**
 * A Council member's room.
 * @param {{id: string, name: string, trainer: string, sprite: string, next: string, blocked: string}} o
 *   next: the map the north door leads to; blocked: what the member says if the player tries the door first
 * @returns {MapDef}
 */
export function councilRoom(o) {
  return {
    id: o.id,
    name: o.name,
    theme: "spire",
    music: "spire",
    indoor: true,
    rows: ROOM_ROWS,
    spawns: { entrance: { x: 5, y: 9, dir: "up" } },
    warps: [{ x: 5, y: 0, to: { map: o.next, at: "entrance" } }],
    triggers: [
      {
        x: 5,
        y: 1,
        unless: `trainer:${o.trainer}`,
        script: async (g) => {
          await g.say(o.blocked);
          await g.move("player", "D");
        },
      },
      { x: 5, y: 9, script: (g) => g.say("The door has sealed\nbehind you. The only\nway is forward.") },
    ],
    npcs: [{ id: "council", x: 5, y: 3, sprite: o.sprite, dir: "down", move: "still", trainer: o.trainer, sight: 4 }],
  };
}
