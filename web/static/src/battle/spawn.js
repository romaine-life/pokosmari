// @ts-check
// Making creatures: wild ones, trainers' and gifts. A new creature has random IVs, full HP
// and the last four distinct moves its species learns at or below its level.

import { expForLevel, newUid, statsOf, STAT_IDS } from "../game/creature.js";
import { learnsetFor } from "../data/learnsets.js";
import { getMove } from "../data/moves.js";

export { catchRate, baseExpYield } from "./formulas.js";

/** @typedef {import("../game/creature.js").Creature} Creature */
/** @typedef {import("../game/dex.js").Dex} Dex */
/** @typedef {import("../core/rng.js").Rng} Rng */

/**
 * The moves a creature of this species knows at a level: the last four distinct moves
 * learned at or below it, in the order learned.
 * @param {Dex} dex
 * @param {string} speciesId
 * @param {number} level
 * @returns {string[]}
 */
export function movesAtLevel(dex, speciesId, level) {
  /** @type {string[]} */
  const known = [];
  for (const e of learnsetFor(dex, speciesId)) {
    if (e.level > level) break;
    const i = known.indexOf(e.move);
    if (i >= 0) known.splice(i, 1);
    known.push(e.move);
  }
  return known.slice(-4);
}

/**
 * @param {Dex} dex
 * @param {string} speciesId
 * @param {number} level
 * @param {Rng} rng
 * @param {{ot: string, metAt?: string, ball?: string}} opts
 * @returns {Creature}
 */
export function makeCreature(dex, speciesId, level, rng, opts) {
  const sp = dex.get(speciesId);
  /** @type {any} */
  const ivs = {};
  for (const id of STAT_IDS) ivs[id] = rng.int(0, 31);
  /** @type {Creature} */
  const c = {
    uid: newUid(rng),
    species: speciesId,
    level,
    exp: expForLevel(level),
    ivs,
    hp: 0,
    status: null,
    sleep: 0,
    moves: movesAtLevel(dex, speciesId, level).map((id) => ({ id, pp: getMove(id).pp })),
    ot: opts.ot,
    metLevel: level,
  };
  if (opts.metAt) c.metAt = opts.metAt;
  if (opts.ball) c.ball = opts.ball;
  c.hp = statsOf(sp, c).hp;
  return c;
}

/** @typedef {{species: string, min: number, max: number, weight: number}} EncounterSlot */

/**
 * Picks a wild encounter from a table by weight, with a level in the slot's range.
 * @param {EncounterSlot[]} table
 * @param {Rng} rng
 * @returns {{species: string, level: number}}
 */
export function pickEncounter(table, rng) {
  const total = table.reduce((n, s) => n + s.weight, 0);
  let r = rng.next() * total;
  let slot = table[table.length - 1];
  for (const s of table) {
    if (r < s.weight) {
      slot = s;
      break;
    }
    r -= s.weight;
  }
  return { species: slot.species, level: rng.int(slot.min, slot.max) };
}
