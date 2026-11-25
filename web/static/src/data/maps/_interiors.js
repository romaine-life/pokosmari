// @ts-check
// The rooms every town shares the layout of: the healing center and the mart. A town's
// center file is `export default center("brookside-center", { map: "brookside", x, y })`,
// where x, y is the center's door on the town map. Files starting with "_" aren't maps.

/** @typedef {import("../../world/map.js").MapDef} MapDef */
/** @typedef {import("../../world/map.js").Dest} Dest */

/**
 * A healing center: the nurse heals, the computer is the storage PC.
 * @param {string} id @param {Dest} exit the town map's door tile
 * @param {{npcs?: MapDef["npcs"], name?: string}} [extra] townsfolk inside
 * @returns {MapDef}
 */
export function center(id, exit, extra = {}) {
  return {
    id,
    name: extra.name ?? "Healing Center",
    theme: "indoor",
    music: "center",
    indoor: true,
    rows: [
      "||||||||||",
      "|P__H__bb|",
      "|________|",
      "|_ccccc__|",
      "|________|",
      "|p______p|",
      "|________|",
      "|___mm___|",
    ],
    heal: { x: 4, y: 4 },
    spawns: { door: { x: 4, y: 7, dir: "up" } },
    warps: [
      { x: 4, y: 7, dir: "down", to: exit },
      { x: 5, y: 7, dir: "down", to: exit },
    ],
    npcs: [
      { id: "nurse", x: 4, y: 2, sprite: "nurse", move: "still", script: (g) => g.healCenter() },
      ...(extra.npcs ?? []),
    ],
  };
}

/**
 * A mart: the clerk sells `stock` (item ids).
 * @param {string} id @param {Dest} exit the town map's door tile @param {string[]} stock
 * @param {{npcs?: MapDef["npcs"], clerk?: import("../../world/map.js").Script}} [extra]
 *   clerk: a script that replaces the clerk's (for a story beat), which should end in g.shop(stock)
 * @returns {MapDef}
 */
export function mart(id, exit, stock, extra = {}) {
  return {
    id,
    name: "Mart",
    theme: "indoor",
    music: "mart",
    indoor: true,
    rows: [
      "||||||||",
      "|bb__bb|",
      "|______|",
      "|cc____|",
      "|______|",
      "|xx__xx|",
      "|______|",
      "|__mm__|",
    ],
    spawns: { door: { x: 3, y: 7, dir: "up" } },
    warps: [
      { x: 3, y: 7, dir: "down", to: exit },
      { x: 4, y: 7, dir: "down", to: exit },
    ],
    npcs: [
      { id: "clerk", x: 1, y: 2, sprite: "clerk", move: "still", script: extra.clerk ?? ((g) => g.shop(stock)) },
      ...(extra.npcs ?? []),
    ],
  };
}
