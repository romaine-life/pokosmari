import { test } from "node:test";
import assert from "node:assert/strict";
import { MOVES, STRUGGLE, getMove } from "../static/src/data/moves.js";
import { ITEMS, ITEM_BY_ID, evolutionItem } from "../static/src/data/items.js";
import { TYPES } from "../static/src/data/types.js";
import { HANDLED_EFFECTS } from "../static/src/battle/engine.js";
import { dex } from "./battle-helpers.mjs";

// Names the game must not borrow (a sample of the well-known ones).
const BORROWED_MOVES = ["tackle", "scratch", "growl", "ember", "water gun", "vine whip", "thunderbolt", "thunder", "surf",
  "flamethrower", "hyper beam", "quick attack", "bite", "crunch", "psychic", "earthquake", "fly", "dig", "rest", "protect",
  "haze", "struggle", "swords dance", "agility", "sing", "hypnosis", "leech seed", "wrap", "bind", "absorb", "mega drain",
  "solar beam", "double-edge", "body slam", "confuse ray", "thunder wave", "toxic", "will-o-wisp", "recover", "roost",
  "ice beam", "blizzard", "hydro pump", "fire blast", "shadow ball", "dragon claw", "moonblast", "flash", "cut", "strength",
  "waterfall", "rock slide", "stone edge", "iron tail", "metal claw", "sludge bomb", "aerial ace", "gust", "peck", "leer"];
const BORROWED_ITEMS = ["poke ball", "poké ball", "great ball", "ultra ball", "master ball", "potion", "super potion",
  "hyper potion", "max potion", "full restore", "revive", "max revive", "antidote", "burn heal", "ice heal", "awakening",
  "paralyze heal", "full heal", "ether", "max ether", "elixir", "x attack", "x defense", "x speed", "repel", "super repel",
  "escape rope", "rare candy", "bicycle", "old rod", "good rod", "town map"];

test("moves are well formed", () => {
  const ids = new Set();
  for (const mv of [...MOVES, STRUGGLE]) {
    assert.ok(!ids.has(mv.id), `duplicate ${mv.id}`);
    ids.add(mv.id);
    assert.ok(TYPES.includes(/** @type {any} */ (mv.type)), `${mv.id} type`);
    assert.ok(["physical", "special", "status"].includes(mv.category), mv.id);
    assert.ok(mv.pp > 0 && Number.isInteger(mv.pp), mv.id);
    assert.ok(mv.accuracy === null || (mv.accuracy > 0 && mv.accuracy <= 100), mv.id);
    assert.ok(mv.description.length > 0, mv.id);
    const flat = mv.effect?.fixed !== undefined || mv.effect?.levelDamage;
    if (mv.category === "status") assert.equal(mv.power, 0, mv.id);
    else if (!flat) assert.ok(mv.power >= 15 && mv.power <= 120, `${mv.id} power ${mv.power}`);
    for (const k of Object.keys(mv.effect || {})) assert.ok(HANDLED_EFFECTS.includes(k), `${mv.id}: unhandled effect ${k}`);
    if (mv.category === "status") assert.ok(mv.effect && Object.keys(mv.effect).length, `${mv.id} does nothing`);
    assert.ok(!BORROWED_MOVES.includes(mv.name.toLowerCase()), `${mv.name} is borrowed`);
  }
  assert.ok(MOVES.length >= 140, `${MOVES.length} moves`);
  assert.throws(() => getMove("nope"));
});

test("every type has at least five moves, with weak, mid and late damage", () => {
  for (const t of TYPES) {
    const of = MOVES.filter((m) => m.type === t);
    assert.ok(of.length >= 5, `${t}: ${of.length}`);
    const powers = of.filter((m) => m.category !== "status").map((m) => m.power);
    assert.ok(powers.some((p) => p >= 35 && p <= 50), `${t} early`);
    assert.ok(powers.some((p) => p >= 60 && p <= 85), `${t} mid`);
    assert.ok(powers.some((p) => p >= 90), `${t} late`);
  }
});

test("items are well formed", () => {
  const ids = new Set();
  const kinds = ["heal", "cure", "revive", "pp", "stat", "ball", "repel", "escape", "evolve", "level", "key"];
  for (const it of ITEMS) {
    assert.ok(!ids.has(it.id), `duplicate ${it.id}`);
    ids.add(it.id);
    assert.ok(["items", "balls", "key"].includes(it.pocket), it.id);
    assert.ok(it.price >= 0, it.id);
    assert.ok(it.description.length > 0, it.id);
    for (const e of [it.battle, it.field]) if (e) assert.ok(kinds.includes(e.kind), `${it.id} ${e.kind}`);
    if (it.pocket === "balls") assert.equal(it.battle?.kind, "ball", it.id);
    if (it.pocket === "key") assert.equal(it.price, 0, it.id);
    assert.ok(!BORROWED_ITEMS.includes(it.name.toLowerCase()), `${it.name} is borrowed`);
  }
});

test("the items the game needs exist", () => {
  const need = ["brush-cutter", "tide-board", "power-gloves", "lantern", "wing-whistle", "bicycle", "old-rod", "good-rod",
    "town-map", "lab-parcel", "spire-pass", "syndicate-keycard", "storm-bell"];
  for (const id of need) assert.equal(ITEM_BY_ID.get(id)?.pocket, "key", id);
  const balls = ITEMS.filter((i) => i.battle?.kind === "ball");
  assert.equal(balls.filter((b) => !(/** @type {any} */ (b.battle)).guaranteed).length, 3);
  assert.equal(balls.filter((b) => (/** @type {any} */ (b.battle)).guaranteed).length, 1);
  const heals = ITEMS.filter((i) => i.field?.kind === "heal").map((i) => (/** @type {any} */ (i.field)).hp);
  for (const hp of [20, 60, 120]) assert.ok(heals.includes(hp), `heal ${hp}`);
  for (const s of ["brn", "psn", "par", "slp", "frz", "all"]) {
    assert.ok(ITEMS.some((i) => i.field?.kind === "cure" && i.field.status === s), `cure ${s}`);
  }
  for (const k of ["revive", "pp", "repel", "escape", "level"]) assert.ok(ITEMS.some((i) => i.field?.kind === k), k);
  for (const st of ["atk", "def", "spa", "spd", "spe", "acc"]) {
    assert.ok(ITEMS.some((i) => i.battle?.kind === "stat" && i.battle.stat === st), st);
  }
  assert.equal(ITEMS.filter((i) => i.field?.kind === "repel").length, 2);
});

test("every species' evolution item exists", () => {
  for (const sp of dex.list) {
    if (!sp.evolution?.item) continue;
    const it = evolutionItem(sp.evolution.item);
    assert.ok(it, `${sp.id} evolves with ${sp.evolution.item}, which isn't an item`);
    assert.equal(it.name, sp.evolution.item);
  }
});
