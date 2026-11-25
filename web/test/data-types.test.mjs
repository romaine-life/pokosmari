import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveness, TYPES, CHART } from "../static/src/data/types.js";
import { dex } from "./battle-helpers.mjs";

test("the chart covers the dex's 18 types", () => {
  assert.deepEqual([...TYPES].sort(), dex.types.map((t) => t.id).sort());
  for (const row of Object.values(CHART)) for (const d of Object.keys(row)) assert.ok(TYPES.includes(/** @type {any} */ (d)), d);
});

test("familiar matchups", () => {
  assert.equal(effectiveness("water", ["fire"]), 2);
  assert.equal(effectiveness("fire", ["water"]), 0.5);
  assert.equal(effectiveness("normal", ["ghost"]), 0);
  assert.equal(effectiveness("electric", ["ground"]), 0);
  assert.equal(effectiveness("dragon", ["fairy"]), 0);
  assert.equal(effectiveness("ground", ["flying"]), 0);
  assert.equal(effectiveness("psychic", ["dark"]), 0);
  assert.equal(effectiveness("poison", ["steel"]), 0);
  assert.equal(effectiveness("fighting", ["ghost"]), 0);
  assert.equal(effectiveness("ghost", ["normal"]), 0);
  assert.equal(effectiveness("ice", ["grass", "ground"]), 4);
  assert.equal(effectiveness("grass", ["fire", "flying"]), 0.25);
  assert.equal(effectiveness("rock", ["fire", "flying"]), 4);
  assert.equal(effectiveness("fairy", ["dragon", "dark"]), 4);
  assert.equal(effectiveness("electric", ["water", "ground"]), 0);
  assert.equal(effectiveness("water", ["water", "fairy"]), 0.5);
  assert.equal(effectiveness("normal", ["normal"]), 1);
});

test("results are only 0, 1/4, 1/2, 1, 2 or 4", () => {
  const ok = new Set([0, 0.25, 0.5, 1, 2, 4]);
  for (const a of TYPES) for (const d1 of TYPES) for (const d2 of TYPES) {
    if (d1 === d2) continue;
    assert.ok(ok.has(effectiveness(a, [d1, d2])), `${a} on ${d1}/${d2}`);
  }
  assert.throws(() => effectiveness("sound", ["normal"]));
});
