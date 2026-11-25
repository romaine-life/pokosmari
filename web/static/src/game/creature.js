// @ts-check
// A creature someone owns: the record saves hold, and the formulas every part of the game
// shares (stats, experience). The battle engine works on these records directly.

/** @typedef {import("./dex.js").Stats} Stats */
/** @typedef {import("./dex.js").StatId} StatId */
/** @typedef {import("./dex.js").Dex} Dex */
/** @typedef {"brn"|"psn"|"tox"|"par"|"slp"|"frz"} Status */

/**
 * @typedef {object} Creature
 * @property {string} uid          unique for the save's lifetime
 * @property {string} species
 * @property {string} [nickname]
 * @property {number} level        1-100
 * @property {number} exp          total experience; level follows from it
 * @property {Stats} ivs           0-31 each, fixed at birth
 * @property {number} hp           current HP
 * @property {Status|null} status
 * @property {number} sleep        turns of sleep left when status is slp
 * @property {{id: string, pp: number}[]} moves  one to four
 * @property {string} ot           who caught it: the player's name, or a trainer's
 * @property {string} [metAt]      map id where it was caught or received
 * @property {number} [metLevel]
 * @property {string} [ball]       item id it was caught in
 */

export const STAT_IDS = /** @type {StatId[]} */ (["hp", "atk", "def", "spa", "spd", "spe"]);
export const MAX_LEVEL = 100;

/**
 * Stats at a level: the third-generation formula without natures or effort values.
 * @param {import("./dex.js").Species} sp
 * @param {Creature} c
 * @returns {Stats}
 */
export function statsOf(sp, c) {
  /** @type {any} */
  const out = {};
  for (const id of STAT_IDS) {
    const core = Math.floor(((2 * sp.base[id] + c.ivs[id]) * c.level) / 100);
    out[id] = id === "hp" ? core + c.level + 10 : core + 5;
  }
  return out;
}

/**
 * Total experience to reach a level: every species grows at the same "medium" rate.
 * @param {number} level
 */
export function expForLevel(level) {
  return level <= 1 ? 0 : level ** 3;
}

/**
 * The level a total of experience reaches.
 * @param {number} exp
 */
export function levelForExp(exp) {
  return Math.min(MAX_LEVEL, Math.max(1, Math.floor(Math.cbrt(exp + 0.5))));
}

/**
 * The name a creature is shown by.
 * @param {Dex} dex
 * @param {Creature} c
 */
export function displayName(dex, c) {
  return c.nickname || dex.get(c.species).name;
}

let uidCounter = 0;
/**
 * A uid unique within this page load and across saves (time, a counter and randomness).
 * @param {import("../core/rng.js").Rng} rng
 */
export function newUid(rng) {
  uidCounter++;
  return `${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.floor(rng.next() * 1e9).toString(36)}`;
}
