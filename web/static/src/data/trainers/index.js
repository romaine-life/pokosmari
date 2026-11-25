// @ts-check
// Every trainer, merged from one file per part of the world. A trainer's id is global: map
// files name it on an NPC (`trainer: "<id>"`) and scripts battle it with g.battle("<id>").

/**
 * A creature in a trainer's party. `species` is a species id, or for the rival "@rival1",
 * "@rival2" or "@rival3": that stage of the starter family strong against the player's.
 * @typedef {{species: string, level: number, moves?: string[]}} TrainerMon
 */

/**
 * @typedef {object} TrainerDef
 * @property {string} id
 * @property {string} name              e.g. "Tamsin"
 * @property {string} className         e.g. "Warden", "Bug Catcher"
 * @property {string} sprite            character sprite id; its portrait shows in battle
 * @property {TrainerMon[]} party
 * @property {"basic"|"smart"|"expert"} [ai]   basic for route trainers, expert for Wardens and the Council
 * @property {number} [reward]          money per level of their last creature (default by class)
 * @property {Record<string, number>} [items]  items the AI may use
 * @property {string} intro             said in the overworld before the battle
 * @property {string} defeat            said in battle when beaten
 * @property {string} after             said when talked to after being beaten
 * @property {string} [win]             said if the player loses to them
 * @property {string} [music]           battle song (default by class: battle-trainer)
 */

import fernhollow from "./fernhollow.js";
import early from "./early.js";
import middle from "./middle.js";
import late from "./late.js";
import endgame from "./endgame.js";

/** @type {Record<string, TrainerDef>} */
export const TRAINERS = {};
for (const list of [fernhollow, early, middle, late, endgame]) {
  for (const t of list) {
    if (TRAINERS[t.id]) throw new Error(`trainer ${t.id} is defined twice`);
    TRAINERS[t.id] = t;
  }
}
