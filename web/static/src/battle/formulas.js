// @ts-check
// The battle's numbers: damage, stat stages, catching, escaping and experience. Pure
// functions; the engine and the AI share them and the tests check them directly.

/** @typedef {import("../game/dex.js").Species} Species */

/**
 * The multiplier a stat stage gives Attack, Defense, Sp. Atk, Sp. Def or Speed (-6..+6).
 * @param {number} stage
 */
export function stageMultiplier(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

/**
 * The multiplier for accuracy minus evasion stages (clamped to -6..+6).
 * @param {number} stage
 */
export function accuracyMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage));
  return s >= 0 ? (3 + s) / 3 : 3 / (3 - s);
}

/**
 * Third-generation damage before modifiers.
 * @param {number} level
 * @param {number} power
 * @param {number} atk
 * @param {number} def
 */
export function baseDamage(level, power, atk, def) {
  return Math.floor(Math.floor((Math.floor((2 * level) / 5 + 2) * power * atk) / Math.max(1, def)) / 50) + 2;
}

/**
 * Full damage: base, then critical (×1.5), the random roll (85-100 %), STAB (×1.5) and
 * type effectiveness, flooring at each step as the handhelds do. At least 1 unless immune.
 * @param {{level: number, power: number, atk: number, def: number, crit?: boolean, roll?: number, stab?: boolean, effectiveness?: number}} o
 *   roll is 85-100 (default 100)
 */
export function damage(o) {
  const eff = o.effectiveness ?? 1;
  if (eff === 0) return 0;
  let d = baseDamage(o.level, o.power, o.atk, o.def);
  if (o.crit) d = Math.floor(d * 1.5);
  d = Math.floor((d * (o.roll ?? 100)) / 100);
  if (o.stab) d = Math.floor(d * 1.5);
  d = Math.floor(d * eff);
  return Math.max(1, d);
}

/** Critical hit chance: 1/16, or 1/8 for a high-crit move. */
export const CRIT_CHANCE = 1 / 16;
export const HIGH_CRIT_CHANCE = 1 / 8;

/**
 * A species' catch rate (1-255): from legendary status, starter role, stage and total.
 * @param {Species} sp
 */
export function catchRate(sp) {
  if (sp.legendary) return 3;
  if (sp.role === "starter") return 45;
  const t = sp.total;
  let r = t <= 300 ? 255 : t <= 340 ? 190 : t <= 420 ? 120 : t <= 470 ? 90 : t <= 520 ? 60 : 45;
  if (sp.stages > 1 && sp.stage === sp.stages) r = Math.min(r, 60);
  else if (sp.stage > 1) r = Math.min(r, 120);
  return r;
}

/**
 * The third-generation catch value `a`: at 255 or more the catch is certain.
 * @param {{maxHp: number, hp: number, rate: number, ball: number, status: string|null}} o
 */
export function catchValue(o) {
  const bonus = o.status === "slp" || o.status === "frz" ? 2 : o.status ? 1.5 : 1;
  return Math.floor(Math.floor(((3 * o.maxHp - 2 * o.hp) * o.rate * o.ball) / (3 * o.maxHp)) * bonus);
}

/**
 * The shake threshold out of 65536 for each of the four checks.
 * @param {number} a
 */
export function shakeThreshold(a) {
  if (a >= 255) return 65536;
  if (a <= 0) return 0;
  return Math.floor(1048560 / Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680 / a))))));
}

/**
 * The chance a throw catches (all four shake checks pass).
 * @param {{maxHp: number, hp: number, rate: number, ball: number, status: string|null}} o
 */
export function catchProbability(o) {
  const b = shakeThreshold(catchValue(o));
  return Math.min(1, (b / 65536) ** 4);
}

/**
 * Throw: four shake checks. Returns shakes 0-3 for the animation and whether it caught.
 * @param {import("../core/rng.js").Rng} rng
 * @param {{maxHp: number, hp: number, rate: number, ball: number, status: string|null}} o
 */
export function rollCatch(rng, o) {
  const b = shakeThreshold(catchValue(o));
  let passed = 0;
  while (passed < 4 && rng.int(0, 65535) < b) passed++;
  return { shakes: Math.min(3, passed), caught: passed === 4 };
}

/**
 * The third-generation chance of running from a wild battle.
 * @param {number} playerSpeed
 * @param {number} foeSpeed
 * @param {number} attempts  this attempt included (1 on the first)
 */
export function escapeChance(playerSpeed, foeSpeed, attempts) {
  if (playerSpeed >= foeSpeed) return 1;
  const f = Math.floor((playerSpeed * 128) / Math.max(1, foeSpeed)) + 30 * attempts;
  return f > 255 ? 1 : f / 256;
}

/** Base experience yield per point of species total squared. Tuned by the progression test. */
export const YIELD_SCALE = 1 / 1300;

/**
 * A species' base experience yield, from its total.
 * @param {Species} sp
 */
export function baseExpYield(sp) {
  return Math.round(sp.total * sp.total * YIELD_SCALE);
}

/** Trainer creatures give this much more experience. */
export const TRAINER_BONUS = 1.5;
/** A party member that didn't fight gets this share. */
export const BENCH_SHARE = 0.5;

/**
 * Experience for defeating a creature, fifth-generation style: scaled by the level gap.
 * @param {{yield: number, foeLevel: number, level: number, trainer: boolean, participant: boolean}} o
 */
export function expGain(o) {
  const base = (o.yield * o.foeLevel) / 5;
  const scale = ((2 * o.foeLevel + 10) / (o.foeLevel + o.level + 10)) ** 2.5;
  let e = base * scale;
  if (o.trainer) e *= TRAINER_BONUS;
  if (!o.participant) e *= BENCH_SHARE;
  return Math.max(1, Math.floor(e));
}
