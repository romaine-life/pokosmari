import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../static/src/core/rng.js";
import { expForLevel, levelForExp } from "../static/src/game/creature.js";
import {
  baseDamage, damage, catchProbability, catchRate, rollCatch, escapeChance, expGain, baseExpYield,
  stageMultiplier, accuracyMultiplier,
} from "../static/src/battle/formulas.js";
import { dex } from "./battle-helpers.mjs";

test("damage ranges", () => {
  assert.equal(baseDamage(50, 80, 100, 100), 37);
  const lo = damage({ level: 50, power: 80, atk: 100, def: 100, roll: 85, stab: true, effectiveness: 2 });
  const hi = damage({ level: 50, power: 80, atk: 100, def: 100, roll: 100, stab: true, effectiveness: 2 });
  assert.equal(lo, 92); // floor(37*.85)=31, *1.5=46, *2=92
  assert.equal(hi, 110); // 37, 55, 110
  assert.equal(damage({ level: 50, power: 80, atk: 100, def: 100, roll: 100, crit: true }), 55);
  assert.equal(damage({ level: 50, power: 80, atk: 100, def: 100, effectiveness: 0 }), 0);
  assert.equal(damage({ level: 1, power: 10, atk: 1, def: 999, effectiveness: 0.25 }), 1);
  // A level-5 starter's first STAB move against a level-3 wild creature takes a fair bite.
  const d = damage({ level: 5, power: 40, atk: 11, def: 9, roll: 92, stab: true });
  assert.ok(d >= 4 && d <= 8, `${d}`);
});

test("stat stages", () => {
  assert.equal(stageMultiplier(0), 1);
  assert.equal(stageMultiplier(2), 2);
  assert.equal(stageMultiplier(6), 4);
  assert.equal(stageMultiplier(-6), 0.25);
  assert.equal(accuracyMultiplier(-6), 1 / 3);
  assert.equal(accuracyMultiplier(6), 3);
  assert.equal(accuracyMultiplier(9), 3);
});

test("catch rates come from legendary, stage and total", () => {
  for (const sp of dex.list) {
    const r = catchRate(sp);
    assert.ok(r >= 3 && r <= 255, sp.id);
    if (sp.legendary) assert.equal(r, 3);
  }
  assert.ok(catchRate(dex.get("gnatoglop")) > catchRate(dex.get("gnatooze")));
  assert.equal(catchRate(dex.get("sproufawn")), 45);
});

test("catch probability sanity", () => {
  const base = { maxHp: 100, hp: 100, rate: 190, ball: 1, status: null };
  const full = catchProbability(base);
  const low = catchProbability({ ...base, hp: 1 });
  assert.ok(full > 0.1 && full < 0.5, `full HP ${full}`);
  assert.ok(low > full);
  assert.ok(catchProbability({ ...base, status: "slp" }) > catchProbability({ ...base, status: "par" }));
  assert.ok(catchProbability({ ...base, status: "par" }) > full);
  assert.ok(catchProbability({ ...base, ball: 2 }) > catchProbability({ ...base, ball: 1.5 }));
  assert.ok(catchProbability({ ...base, ball: 1.5 }) > full);
  assert.ok(catchProbability({ ...base, rate: 3 }) < 0.05, "legendary at full HP");
  assert.equal(catchProbability({ ...base, rate: 255, hp: 1, status: "slp" }), 1);
  // The rolls match the probability.
  const rng = createRng(7);
  const o = { ...base, hp: 40 };
  let caught = 0;
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const r = rollCatch(rng, o);
    assert.ok(r.shakes >= 0 && r.shakes <= 3);
    if (r.caught) {
      assert.equal(r.shakes, 3);
      caught++;
    }
  }
  assert.ok(Math.abs(caught / N - catchProbability(o)) < 0.02, `${caught / N} vs ${catchProbability(o)}`);
});

test("run formula", () => {
  assert.equal(escapeChance(50, 50, 1), 1);
  assert.equal(escapeChance(80, 50, 1), 1);
  const a = escapeChance(20, 100, 1);
  const b = escapeChance(20, 100, 2);
  assert.ok(a > 0 && a < b && b < 1);
  assert.equal(a, (Math.floor((20 * 128) / 100) + 30) / 256);
  assert.equal(escapeChance(20, 100, 9), 1);
});

test("experience: a bigger, higher-level foe gives more; overlevelled creatures get less", () => {
  const small = baseExpYield(dex.get("gnatoglop"));
  const big = baseExpYield(dex.get("gnatooze"));
  assert.ok(big > small);
  const at = (/** @type {number} */ level, trainer = false, participant = true) => expGain({ yield: 100, foeLevel: 20, level, trainer, participant });
  assert.ok(at(10) > at(20) && at(20) > at(30));
  assert.ok(at(20, true) > at(20));
  assert.equal(at(20, false, false), Math.floor(at(20) / 2) || 1);
  for (let L = 1; L < 100; L++) assert.equal(levelForExp(expForLevel(L)), L);
});

// The world's level curve, as the maps are planned: each segment ends at a Warden whose ace
// is at the listed level. Route trainers sit a few levels under the ace, wild creatures a
// little lower still. The player battles most route trainers and some wild creatures, the
// starter leading every battle (full share), and never grinds.
const WARDEN_ACES = [14, 19, 24, 29, 34, 39, 44, 48];
const TRAINERS_PER_SEGMENT = 6;
const CREATURES_PER_TRAINER = 2;
const WILD_PER_SEGMENT = 8;

/** A foe's species total by progress (0 at the start, 1 at the champion). @param {number} t */
const foeTotal = (t) => 300 + 200 * t;

/**
 * @param {{exp: number, level: number}} lead @param {number} foeLevel @param {number} t @param {boolean} trainer
 */
function defeat(lead, foeLevel, t, trainer) {
  const y = baseExpYield(/** @type {any} */ ({ total: foeTotal(t) }));
  lead.exp += expGain({ yield: y, foeLevel, level: lead.level, trainer, participant: true });
  lead.level = Math.min(100, levelForExp(lead.exp));
}

/** Levels spread evenly from lo to hi. @param {number} lo @param {number} hi @param {number} n */
const spread = (lo, hi, n) => Array.from({ length: n }, (_, i) => Math.round(lo + ((hi - lo) * i) / Math.max(1, n - 1)));

test("progression: the lead lands within 3 levels of every Warden's ace without grinding", () => {
  const lead = { level: 5, exp: expForLevel(5) };
  const seen = [];
  const segments = WARDEN_ACES.length + 2;
  for (let i = 0; i < WARDEN_ACES.length; i++) {
    const ace = WARDEN_ACES[i];
    const lo = i === 0 ? 3 : WARDEN_ACES[i - 1] - 2;
    const hi = ace - 4;
    const t = i / segments;
    const wild = spread(lo - 2, hi - 2, WILD_PER_SEGMENT);
    const trainers = spread(lo, hi, TRAINERS_PER_SEGMENT);
    for (let k = 0; k < Math.max(wild.length, trainers.length); k++) {
      if (k < wild.length) defeat(lead, Math.max(2, wild[k]), t, false);
      if (k < trainers.length) for (let c = 0; c < CREATURES_PER_TRAINER; c++) defeat(lead, trainers[k] - 1 + c, t, true);
    }
    seen.push(`${lead.level}/${ace}`);
    assert.ok(Math.abs(lead.level - ace) <= 3, `before Warden ${i + 1}: lead ${lead.level}, ace ${ace} (${seen.join(" ")})`);
    const party = i < 2 ? [ace - 2, ace] : [ace - 3, ace - 2, ace];
    for (const l of party) defeat(lead, l, t, true);
  }
  // The road to the High Council, then the Council (50-55) and the champion (56-58).
  for (const l of spread(46, 50, 8)) defeat(lead, l, 0.85, true);
  seen.push(`${lead.level}/50-55`);
  assert.ok(lead.level >= 47 && lead.level <= 58, `before the Council: ${lead.level} (${seen.join(" ")})`);
  for (const member of [[50, 51, 52, 53], [51, 52, 53, 54], [52, 53, 54, 54], [53, 54, 55, 55]]) {
    for (const l of member) defeat(lead, l, 0.95, true);
  }
  seen.push(`${lead.level}/56-58`);
  assert.ok(lead.level >= 53 && lead.level <= 61, `before the champion: ${lead.level} (${seen.join(" ")})`);
});
