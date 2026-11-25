// @ts-check
// How a battler picks its action. basic: a random usable move. smart: weighted toward the
// move that does the most expected damage, with sensible status use. expert: smart, plus
// switching out of a bad matchup and healing below a quarter of its HP (twice at most).
//
// Works for either side, so tests can let the AI play the player too.

import { statsOf } from "../game/creature.js";
import { getMove } from "../data/moves.js";
import { getItem } from "../data/items.js";
import { effectiveness } from "../data/types.js";
import { damage, stageMultiplier } from "./formulas.js";

/** @typedef {"basic"|"smart"|"expert"} AiLevel */
/** @typedef {import("./engine.js").Battle} Battle */
/** @typedef {import("./engine.js").Side} Side */
/** @typedef {import("./engine.js").Choice} Choice */
/** @typedef {import("../data/moves.js").Move} Move */

/** Items an expert uses this many times in one battle at most. */
export const EXPERT_ITEM_USES = 2;

/**
 * @param {Battle} battle
 * @param {"player"|"foe"} side
 */
function sides(battle, side) {
  const st = battle.state;
  return { me: st[side], them: st[side === "player" ? "foe" : "player"] };
}

/**
 * The damage a move is expected to do now: average roll, no crit, accuracy and hit count
 * folded in, halved for moves that cost an extra turn.
 * @param {Battle} battle
 * @param {Side} attacker
 * @param {Side} defender
 * @param {Move} move
 */
export function expectedDamage(battle, attacker, defender, move) {
  if (move.category === "status") return 0;
  const dex = battle.state.dex;
  const ac = attacker.party[attacker.active];
  const dc = defender.party[defender.active];
  const asp = dex.get(ac.species);
  const dsp = dex.get(dc.species);
  const e = move.effect || {};
  const eff = e.struggle ? 1 : effectiveness(move.type, dsp.types);
  if (eff === 0) return 0;
  let d;
  if (e.fixed) d = e.fixed;
  else if (e.levelDamage) d = ac.level;
  else {
    const as = statsOf(asp, ac);
    const ds = statsOf(dsp, dc);
    const phys = move.category === "physical";
    let atk = as[phys ? "atk" : "spa"] * stageMultiplier(attacker.stages[phys ? "atk" : "spa"]);
    if (phys && ac.status === "brn") atk /= 2;
    const def = ds[phys ? "def" : "spd"] * stageMultiplier(defender.stages[phys ? "def" : "spd"]);
    d = damage({ level: ac.level, power: move.power, atk: Math.floor(atk), def: Math.floor(def), roll: 92, stab: !e.struggle && asp.types.includes(move.type), effectiveness: eff });
  }
  const hits = e.hits ? (e.hits[0] === e.hits[1] ? e.hits[0] : 3.1) : 1;
  const acc = move.accuracy == null ? 1 : move.accuracy / 100;
  const slow = e.charge || e.recharge ? 0.5 : 1;
  return d * hits * acc * slow;
}

/**
 * The best type multiplier any of an attacker's damaging moves gets on a defender.
 * @param {Battle} battle
 * @param {import("../game/creature.js").Creature} attacker
 * @param {import("../game/creature.js").Creature} defender
 */
function bestEffectiveness(battle, attacker, defender) {
  const dsp = battle.state.dex.get(defender.species);
  let best = 0;
  for (const slot of attacker.moves) {
    const mv = getMove(slot.id);
    if (mv.category === "status" || mv.effect?.fixed || mv.effect?.levelDamage) continue;
    best = Math.max(best, effectiveness(mv.type, dsp.types));
  }
  // A creature with only status or fixed moves still threatens a little.
  return attacker.moves.length && best === 0 ? 0.5 : best;
}

/**
 * How a party member would fare against the opponent's active creature: higher is better.
 * @param {Battle} battle
 * @param {import("../game/creature.js").Creature} mine
 * @param {import("../game/creature.js").Creature} theirs
 */
function matchup(battle, mine, theirs) {
  return bestEffectiveness(battle, mine, theirs) - bestEffectiveness(battle, theirs, mine);
}

/**
 * @param {Battle} battle
 * @param {Side} me
 * @param {Side} them
 * @param {Move} move
 */
function scoreMove(battle, me, them, move) {
  const c = me.party[me.active];
  const t = them.party[them.active];
  const dex = battle.state.dex;
  const max = statsOf(dex.get(c.species), c).hp;
  const tsp = dex.get(t.species);
  const e = move.effect || {};
  if (move.category !== "status") {
    const d = expectedDamage(battle, me, them, move);
    let s = (Math.min(d, t.hp) / Math.max(1, t.hp)) * 100;
    if (d >= t.hp) s += 50;
    if (e.recoil && c.hp < max / 4) s *= 0.6;
    if (e.bind && !them.vol.bind) s += 10;
    return s;
  }
  if (e.protect) return 4;
  if (e.haze) {
    const theirs = Object.values(them.stages).reduce((a, b) => a + Math.max(0, b), 0);
    const mine = Object.values(me.stages).reduce((a, b) => a + Math.max(0, b), 0);
    return theirs - mine >= 2 ? 45 : 0;
  }
  if (e.rest) return c.hp < max * 0.35 ? 55 : 0;
  if (e.heal) return c.hp < max * 0.4 ? 60 : c.hp < max * 0.7 ? 10 : 0;
  if (e.leech) return !them.vol.leech && !tsp.types.includes("grass") ? 30 : 0;
  if (e.status) {
    if (t.status || statusImmune(tsp.types, e.status.id)) return 0;
    if (move.type === "electric" && effectiveness("electric", tsp.types) === 0) return 0;
    const base = e.status.id === "slp" || e.status.id === "par" ? 40 : 32;
    return base * ((move.accuracy ?? 100) / 100);
  }
  if (e.confuse) return them.vol.confusion ? 0 : 25;
  if (e.stat) {
    const entries = Object.entries(e.stat.stages);
    if (e.stat.who === "target") {
      return entries.some(([k, v]) => them.stages[k] > -2 && v < 0) ? 14 : 0;
    }
    if (c.hp < max * 0.6) return 3;
    return entries.some(([k, v]) => v > 0 && me.stages[k] < 2) ? 24 : 2;
  }
  return 1;
}

/**
 * Whether a type set can't take a status.
 * @param {string[]} types
 * @param {string} status
 */
export function statusImmune(types, status) {
  if (status === "brn") return types.includes("fire");
  if (status === "psn" || status === "tox") return types.includes("poison") || types.includes("steel");
  if (status === "par") return types.includes("electric");
  if (status === "frz") return types.includes("ice");
  return false;
}

/**
 * Picks an action for a side.
 * @param {Battle} battle
 * @param {"player"|"foe"} side
 * @param {AiLevel} [level]  defaults to the foe trainer's, or basic for wild creatures
 * @returns {Choice}
 */
export function chooseAction(battle, side, level) {
  const st = battle.state;
  const rng = st.rng;
  const { me, them } = sides(battle, side);
  const lv = level ?? (side === "foe" ? st.trainer?.ai ?? "basic" : "smart");
  const c = me.party[me.active];
  const usable = c.moves.map((m, i) => ({ m, i })).filter((x) => x.m.pp > 0);
  if (!usable.length) return { type: "move", index: 0 };
  if (lv === "basic") return { type: "move", index: rng.pick(usable).i };

  if (lv === "expert") {
    const heal = expertHeal(battle, me);
    if (heal) return heal;
    const sw = expertSwitch(battle, me, them);
    if (sw) return sw;
  }

  const scored = usable.map((x) => ({ i: x.i, s: scoreMove(battle, me, them, getMove(x.m.id)) }));
  scored.sort((a, b) => b.s - a.s || a.i - b.i);
  if (scored[0].s <= 0 || rng.chance(0.75)) return { type: "move", index: scored[0].i };
  const total = scored.reduce((n, x) => n + Math.max(0, x.s) ** 2, 0);
  if (total <= 0) return { type: "move", index: scored[0].i };
  let r = rng.next() * total;
  for (const x of scored) {
    r -= Math.max(0, x.s) ** 2;
    if (r < 0) return { type: "move", index: x.i };
  }
  return { type: "move", index: scored[0].i };
}

/**
 * @param {Battle} battle
 * @param {Side} me
 * @returns {Choice|null}
 */
function expertHeal(battle, me) {
  const c = me.party[me.active];
  const max = statsOf(battle.state.dex.get(c.species), c).hp;
  if (c.hp >= max / 4 || me.itemUses >= EXPERT_ITEM_USES) return null;
  let best = null;
  for (const [id, n] of Object.entries(me.items)) {
    if (!(n > 0)) continue;
    const item = getItem(id);
    if (item.battle?.kind !== "heal") continue;
    if (!best || item.battle.hp > /** @type {any} */ (best.battle).hp) best = item;
  }
  return best ? { type: "item", item: best.id, target: me.active } : null;
}

/**
 * @param {Battle} battle
 * @param {Side} me
 * @param {Side} them
 * @returns {Choice|null}
 */
function expertSwitch(battle, me, them) {
  const st = battle.state;
  if (me.vol.bind || st.turn - me.switchedTurn < 2) return null;
  const c = me.party[me.active];
  const t = them.party[them.active];
  if (t.hp <= 0) return null;
  const threat = bestEffectiveness(battle, t, c);
  const mine = bestEffectiveness(battle, c, t);
  if (threat < 2 || mine > 1) return null;
  let best = -1, bestScore = matchup(battle, c, t);
  me.party.forEach((p, i) => {
    if (i === me.active || p.hp <= 0) return;
    const s = matchup(battle, p, t);
    if (s > bestScore + 0.5) {
      best = i;
      bestScore = s;
    }
  });
  if (best < 0 || !st.rng.chance(0.75)) return null;
  return { type: "switch", index: best };
}

/**
 * Which party member a side sends out after a faint. Smart and expert pick the best
 * matchup; basic takes the next in order.
 * @param {Battle} battle
 * @param {"player"|"foe"} side
 * @param {AiLevel} [level]
 * @returns {number}
 */
export function chooseReplacement(battle, side, level) {
  const st = battle.state;
  const { me, them } = sides(battle, side);
  const lv = level ?? (side === "foe" ? st.trainer?.ai ?? "basic" : "smart");
  const alive = me.party.map((p, i) => ({ p, i })).filter((x) => x.p.hp > 0 && x.i !== me.active);
  if (!alive.length) return -1;
  const t = them.party[them.active];
  if (lv === "basic" || !t || t.hp <= 0) return alive[0].i;
  let best = alive[0];
  let bestScore = -Infinity;
  for (const x of alive) {
    const s = matchup(battle, x.p, t) + x.p.level / 100;
    if (s > bestScore) {
      best = x;
      bestScore = s;
    }
  }
  return best.i;
}
