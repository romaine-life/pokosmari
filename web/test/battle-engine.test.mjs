import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../static/src/core/rng.js";
import { createBattle } from "../static/src/battle/engine.js";
import { statusImmune } from "../static/src/battle/ai.js";
import { damage } from "../static/src/battle/formulas.js";
import { makeCreature, pickEncounter } from "../static/src/battle/spawn.js";
import { MOVES, getMove } from "../static/src/data/moves.js";
import { effectiveness } from "../static/src/data/types.js";
import { statsOf, expForLevel, levelForExp } from "../static/src/game/creature.js";
import { dex, mon, playOut } from "./battle-helpers.mjs";

const maxHp = (/** @type {any} */ c) => statsOf(dex.get(c.species), c).hp;
const texts = (/** @type {any[]} */ ev) => ev.filter((e) => e.t === "text").map((e) => e.text);

/** @param {any} o */
function wild(o) {
  return createBattle({
    dex,
    rng: createRng(o.seed ?? 1),
    kind: "wild",
    player: { name: "Ari", party: o.party, bag: o.bag ?? {}, money: o.money ?? 0 },
    foe: { party: o.foe },
    ...(o.extra || {}),
  });
}

/** @param {any} o */
function trainer(o) {
  return createBattle({
    dex,
    rng: createRng(o.seed ?? 1),
    kind: "trainer",
    player: { name: "Ari", party: o.party, bag: o.bag ?? {}, money: o.money ?? 0 },
    foe: { party: o.foe, trainer: { id: "t", name: "Bo", className: "Hiker", ai: o.ai ?? "smart", items: o.items, reward: o.reward ?? 300 } },
  });
}

test("makeCreature: IVs, full HP, the last four moves, exp for its level", () => {
  const c = makeCreature(dex, "sproufang", 50, createRng(3), { ot: "Ari", metAt: "route-1", ball: "capture-orb" });
  assert.equal(c.level, 50);
  assert.equal(c.exp, expForLevel(50));
  assert.equal(c.hp, maxHp(c));
  assert.equal(c.moves.length, 4);
  for (const v of Object.values(c.ivs)) assert.ok(v >= 0 && v <= 31);
  assert.equal(c.ot, "Ari");
  assert.equal(c.metAt, "route-1");
  assert.equal(c.ball, "capture-orb");
  for (const m of c.moves) assert.equal(m.pp, getMove(m.id).pp);
});

test("pickEncounter honours weights and level ranges", () => {
  const rng = createRng(9);
  const table = [{ species: "skyjay", min: 3, max: 5, weight: 3 }, { species: "brinip", min: 7, max: 7, weight: 1 }];
  const n = { skyjay: 0, brinip: 0 };
  for (let i = 0; i < 4000; i++) {
    const p = pickEncounter(table, rng);
    n[p.species]++;
    if (p.species === "skyjay") assert.ok(p.level >= 3 && p.level <= 5);
    else assert.equal(p.level, 7);
  }
  assert.ok(Math.abs(n.skyjay / 4000 - 0.75) < 0.03);
});

test("a wild battle opens with the foe, then the player's lead", () => {
  const b = wild({ party: [mon("sproufawn", 5)], foe: [mon("skyjay", 3)] });
  const ev = b.start();
  assert.deepEqual(texts(ev), ["A wild Skyjay appeared!", "Go, Sproufawn!"]);
  assert.deepEqual(ev.filter((e) => e.t === "sendout").map((e) => e.side), ["foe", "player"]);
  assert.deepEqual(b.request, { kind: "action" });
  assert.throws(() => b.start());
});

test("the engine's hits land inside the formula's range", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const p = mon("pudutick", 30, seed);
    p.moves = [{ id: "bump", pp: 35 }];
    const f = mon("dappocub", 30, seed + 1000);
    f.moves = [{ id: "grumble", pp: 40 }];
    const b = wild({ seed, party: [p], foe: [f] });
    b.start();
    const before = f.hp;
    const ev = b.act({ type: "move", index: 0 });
    if (ev.some((e) => e.t === "miss")) continue;
    const took = before - f.hp;
    const ps = statsOf(dex.get(p.species), p), fs = statsOf(dex.get(f.species), f);
    const atk = ps.atk; // the foe's Grumble may land first: the low end allows -1 Attack
    const lo = damage({ level: 30, power: 40, atk: Math.floor(atk * 2 / 3), def: fs.def, roll: 85, stab: true });
    const hi = damage({ level: 30, power: 40, atk, def: fs.def, roll: 100, stab: true, crit: true });
    assert.ok(took >= lo && took <= hi, `seed ${seed}: ${took} not in ${lo}-${hi}`);
  }
});

test("determinism: the same seed replays the same battle", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const party = [mon("flaropaw", 20, seed), mon("brinip", 18, seed + 1)];
    const foe = [mon("gnateslith", 19, seed + 2), mon("ampup", 18, seed + 3)];
    const run = () => playOut(trainer({ seed, party: structuredClone(party), foe: structuredClone(foe), ai: "expert", items: { "tonic-plus": 2 } }), createRng(seed * 7));
    assert.deepEqual(run(), run());
  }
});

/**
 * A foe that the move can affect: not immune to its type or status, not grass for seeds.
 * @param {import("../static/src/data/moves.js").Move} mv
 */
function targetFor(mv) {
  const e = mv.effect || {};
  const byHp = [...dex.list].filter((s) => !s.legendary).sort((a, b) => b.base.hp - a.base.hp);
  return byHp.find((s) => {
    if (mv.category !== "status" && !e.struggle && effectiveness(mv.type, s.types) === 0) return false;
    if (e.status && statusImmune(s.types, e.status.id)) return false;
    if (e.status && mv.type === "electric" && effectiveness("electric", s.types) === 0) return false;
    if (e.leech && s.types.includes("grass")) return false;
    return true;
  });
}

test("every move's effect is handled", () => {
  for (const [n, mv] of MOVES.entries()) {
    const e = mv.effect || {};
    const p = mon("gnatooze", 50, n + 1);
    p.moves = [{ id: mv.id, pp: mv.pp }];
    if (e.heal || e.drain || e.rest) p.hp = Math.floor(p.hp / 2);
    const f = mon(targetFor(mv).id, 50, n + 500);
    f.moves = [{ id: "grumble", pp: 40 }];
    const fMax = f.hp;
    const b = wild({ seed: n + 1, party: [p], foe: [f] });
    b.start();
    /** @type {any[]} */
    const ev = [];
    for (let turn = 0; turn < 8 && b.request.kind === "action"; turn++) ev.push(...b.act({ type: "move", index: 0 }));
    const t = texts(ev).join("\n");
    const foeHp = ev.filter((x) => x.t === "hp" && x.side === "foe");
    const where = `${mv.id}:\n${t}`;
    assert.ok(t.includes(`Gnatooze used ${mv.name}!`), where);
    if (mv.category !== "status") assert.ok(foeHp.length > 0, `${where}\nnever hit`);
    if (e.fixed !== undefined) assert.equal(foeHp[0].hp, fMax - e.fixed, where);
    if (e.levelDamage) assert.equal(foeHp[0].hp, fMax - 50, where);
    if (e.hits && e.hits[0] !== 1) assert.match(t, /Hit \d times!/, where);
    if (e.recoil) assert.match(t, /hit with recoil/, where);
    if (e.drain) assert.match(t, /had its energy drained/, where);
    if (e.bind) assert.match(t, /was trapped by/, where);
    if (e.recharge) assert.match(t, /must recharge/, where);
    if (e.charge) assert.match(t, /gathering power/, where);
    if (e.protect) assert.match(t, /guarding itself/, where);
    if (e.haze) assert.match(t, /wiped away/, where);
    if (e.leech) assert.match(t, /was seeded/, where);
    if (e.rest) assert.ok(ev.some((x) => x.t === "status" && x.side === "player" && x.status === "slp"), where);
    if (e.heal) assert.match(t, /restored its HP/, where);
    if (mv.category === "status" && e.status) assert.ok(ev.some((x) => x.t === "status" && x.side === "foe" && x.status === e.status.id), where);
    if (mv.category === "status" && e.confuse) assert.match(t, /became confused/, where);
    if (mv.category === "status" && e.stat) {
      const side = e.stat.who === "self" ? "player" : "foe";
      assert.ok(ev.some((x) => x.t === "stat" && x.side === side), where);
    }
  }
});

test("with no PP left a creature uses Desperation and takes recoil", () => {
  const p = mon("pudutick", 20);
  for (const m of p.moves) m.pp = 0;
  const f = mon("gnatoglop", 20);
  f.moves = [{ id: "grumble", pp: 40 }];
  const b = wild({ party: [p], foe: [f] });
  b.start();
  const t = texts(b.act({ type: "move", index: 2 })).join("\n");
  assert.match(t, /used Desperation!/);
  assert.match(t, /hit with recoil/);
});

test("a move with no PP is refused while others have some", () => {
  const p = mon("pudutick", 20);
  p.moves[0].pp = 0;
  const b = wild({ party: [p], foe: [mon("gnatoglop", 20)] });
  b.start();
  const ev = b.act({ type: "move", index: 0 });
  assert.deepEqual(texts(ev), ["There's no PP left for that move!"]);
  assert.deepEqual(b.request, { kind: "action" });
});

test("trainer battles: no running, no catching, the next creature comes out, prize money", () => {
  const p = mon("sproufang", 60);
  const b = trainer({ party: [p], foe: [mon("gnatoglop", 5, 2), mon("gnatoglop", 5, 3)], bag: { "capture-orb": 2 }, reward: 420 });
  const intro = texts(b.start());
  assert.deepEqual(intro.slice(0, 2), ["Hiker Bo wants to battle!", "Hiker Bo sent out Gnatoglop!"]);
  assert.deepEqual(texts(b.act({ type: "run" })), ["No! You can't run from a trainer battle!"]);
  assert.match(texts(b.act({ type: "item", item: "capture-orb" }))[0], /knocked the orb away/);
  assert.equal(b.state.player.items["capture-orb"], 2, "not consumed");
  let all = [];
  while (b.request.kind !== "end") {
    const r = b.request;
    all.push(...b.act(r.kind === "learn" ? { type: "learn", replace: -1 } : { type: "move", index: p.moves.findIndex((m) => getMove(m.id).category !== "status") }));
  }
  const t = texts(all);
  assert.ok(t.includes("Hiker Bo sent out Gnatoglop!"));
  assert.ok(t.includes("Ari got $420 for winning!"));
  assert.equal(b.request.result, "win");
  assert.equal(b.request.money, 420);
  assert.ok(all.some((e) => e.t === "money" && e.amount === 420));
});

test("catching: the orb is used up and the creature comes back in the result", () => {
  const bag = { "sovereign-orb": 1 };
  const f = mon("trancedome", 40);
  const b = wild({ party: [mon("sproufawn", 5)], foe: [f], bag });
  b.start();
  const ev = b.act({ type: "item", item: "sovereign-orb" });
  assert.deepEqual(ev.find((e) => e.t === "ball"), { t: "ball", item: "sovereign-orb", shakes: 3, caught: true });
  assert.equal(bag["sovereign-orb"], undefined);
  assert.equal(b.request.kind, "end");
  assert.equal(b.request.result, "caught");
  assert.equal(b.request.caught, f);
  assert.equal(f.ot, "Ari");
  assert.equal(f.ball, "sovereign-orb");
});

test("canCatch false refuses the orb; canRun false refuses running", () => {
  const b = wild({ party: [mon("sproufawn", 5)], foe: [mon("trancedome", 40)], bag: { "capture-orb": 1 }, extra: { canRun: false, canCatch: false } });
  b.start();
  assert.deepEqual(texts(b.act({ type: "item", item: "capture-orb" })), ["The orb won't work here!"]);
  assert.deepEqual(texts(b.act({ type: "run" })), ["There's no way out!"]);
});

test("running from a slower creature always works", () => {
  const b = wild({ party: [mon("plumawing", 30)], foe: [mon("gnatoglop", 3)] });
  b.start();
  assert.ok(texts(b.act({ type: "run" })).includes("Got away safely!"));
  assert.equal(b.request.result, "run");
  assert.equal(b.request.money, 0);
});

test("losing costs half the player's money", () => {
  const p = mon("gnatoglop", 2);
  const b = wild({ party: [p], foe: [mon("trancedome", 60)], money: 1001 });
  b.start();
  while (b.request.kind === "action") b.act({ type: "move", index: 0 });
  assert.equal(b.request.result, "lose");
  assert.equal(b.request.money, -500);
});

test("items: heal in battle uses the turn and the bag", () => {
  const p = mon("sproufawn", 10);
  p.hp = 5;
  const bag = { tonic: 2, "grand-tonic": 1 };
  const f = mon("gnatoglop", 3);
  f.moves = [{ id: "grumble", pp: 40 }];
  const b = wild({ party: [p], foe: [f], bag });
  b.start();
  const ev = b.act({ type: "item", item: "tonic" });
  assert.equal(p.hp, 25);
  assert.equal(bag.tonic, 1);
  assert.ok(texts(ev).some((x) => x.includes("Wild Gnatoglop used Grumble!")), "the foe still moves");
  p.hp = maxHp(p);
  assert.deepEqual(texts(b.act({ type: "item", item: "grand-tonic" })), ["It won't have any effect."]);
  assert.equal(bag["grand-tonic"], 1);
});

test("a fifth move asks to be learned; levels and evolutions are reported", () => {
  const p = mon("sproufawn", 15);
  p.moves = ["bump", "hard-stare", "twig-swipe", "sap-sip"].map((id) => ({ id, pp: getMove(id).pp }));
  p.exp = expForLevel(18) - 1; // still level 15 on the record; any win takes it to 18
  const bench = mon("brinip", 10);
  const b = wild({ party: [p, bench], foe: [mon("gnatoglop", 10)] });
  b.start();
  const all = [];
  while (b.request.kind === "action") all.push(...b.act({ type: "move", index: 2 }));
  assert.equal(b.request.kind, "learn");
  assert.equal(b.request.move, "bramble-lash");
  all.push(...b.act({ type: "learn", replace: 0 }));
  assert.equal(p.moves[0].id, "bramble-lash");
  assert.ok(all.some((e) => e.t === "levelup" && e.uid === p.uid && e.level === 18));
  assert.ok(all.some((e) => e.t === "learned" && e.move === "bramble-lash"));
  const benchExp = all.find((e) => e.t === "exp" && e.uid === bench.uid);
  const leadExp = all.find((e) => e.t === "exp" && e.uid === p.uid);
  assert.ok(benchExp && leadExp && benchExp.gained < leadExp.gained, "the bench gets a half share");
  assert.equal(b.request.kind, "end");
  assert.deepEqual(b.request.evolutions, [p.uid]);
  assert.equal(levelForExp(p.exp), p.level);
});

test("fainting asks for a switch; the new creature then fights", () => {
  const weak = mon("gnatoglop", 2);
  const strong = mon("sproufang", 60);
  const b = wild({ party: [weak, strong], foe: [mon("kindlacada", 40)] });
  b.start();
  while (b.request.kind === "action") b.act({ type: "move", index: 0 });
  assert.equal(b.request.kind, "switch");
  assert.match(texts(b.act({ type: "switch", index: 0 }))[0], /no energy left/);
  const ev = b.act({ type: "switch", index: 1 });
  assert.deepEqual(texts(ev), ["Go, Sproufang!"]);
  assert.equal(b.request.kind, "action");
});

/** @param {import("../static/src/core/rng.js").Rng} rng */
function randomSpecies(rng) {
  return rng.pick(dex.list).id;
}

test("fuzz: 600 wild and trainer battles run to the end", () => {
  const counts = { win: 0, lose: 0, run: 0, caught: 0 };
  for (let seed = 1; seed <= 600; seed++) {
    const rng = createRng(seed * 31);
    const isTrainer = seed % 2 === 0;
    const base = rng.int(3, 60);
    const party = Array.from({ length: rng.int(1, 4) }, () => makeCreature(dex, randomSpecies(rng), Math.max(1, base + rng.int(-3, 3)), rng, { ot: "Ari" }));
    const foe = Array.from({ length: isTrainer ? rng.int(1, 5) : 1 }, () => makeCreature(dex, randomSpecies(rng), Math.max(1, base + rng.int(-4, 4)), rng, { ot: "Foe" }));
    const bag = { "capture-orb": 3, "great-orb": 1, tonic: 2, "remedy-spray": 1, "wake-bloom": 1, "brawn-draught": 1, "focus-drop": 1, "growth-candy": 1 };
    const ai = /** @type {const} */ (["basic", "smart", "expert"])[seed % 3];
    const b = isTrainer
      ? trainer({ seed, party, foe, ai, items: { "tonic-plus": 2, "grand-tonic": 1 }, bag, money: 1000, reward: 500 })
      : wild({ seed, party, foe, bag, money: 1000 });
    const ev = playOut(b, createRng(seed), ai);
    const r = /** @type {any} */ (b.request);
    assert.equal(r.kind, "end");
    counts[r.result]++;
    if (isTrainer) assert.ok(r.result === "win" || r.result === "lose", `trainer battle ended ${r.result}`);
    if (r.result === "lose") assert.equal(r.money, -500);
    if (r.result === "win") assert.equal(r.money, isTrainer ? 500 : 0);
    if (r.result === "caught") assert.equal(r.caught, foe[0]);
    for (const e of ev) {
      if (e.t === "hp") assert.ok(e.hp >= 0 && e.hp <= e.max, `seed ${seed}: hp ${e.hp}/${e.max}`);
      if (e.t === "text") assert.ok(typeof e.text === "string" && e.text.length > 0 && !e.text.includes("undefined"), `seed ${seed}: "${e.text}"`);
      if (e.t === "ball") assert.ok(e.shakes >= 0 && e.shakes <= 3);
    }
    for (const c of party) {
      assert.ok(c.hp >= 0 && c.hp <= maxHp(c), `seed ${seed}: ${c.species} hp ${c.hp}`);
      assert.ok(c.moves.length >= 1 && c.moves.length <= 4);
      assert.equal(new Set(c.moves.map((m) => m.id)).size, c.moves.length, "no repeated moves");
      for (const m of c.moves) assert.ok(m.pp >= 0 && m.pp <= getMove(m.id).pp);
      assert.equal(c.level, Math.min(100, levelForExp(c.exp)));
      assert.notEqual(c.status, "tox", "bad poison ends with the battle");
      if (c.hp === 0) assert.equal(c.status, null);
    }
    for (const n of Object.values(bag)) assert.ok(n > 0);
  }
  assert.ok(counts.win > 50 && counts.lose > 50 && counts.run > 5 && counts.caught > 0, JSON.stringify(counts));
});
