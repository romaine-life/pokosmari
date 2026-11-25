import { test } from "node:test";
import assert from "node:assert/strict";
import { migrate } from "../static/src/game/save.js";
import { newState, STATE_VERSION } from "../static/src/game/state.js";

test("a version 1 save's Leaf Stones become Bloomstones", () => {
  const old = { ...newState(), version: 1, bag: { "leaf-stone": 2, bloomstone: 1, "great-orb": 3 } };
  const s = migrate(JSON.parse(JSON.stringify(old)));
  assert.equal(s.version, STATE_VERSION);
  assert.deepEqual(s.bag, { bloomstone: 3, "great-orb": 3 });
});

test("a current save passes through unchanged", () => {
  const s = newState();
  assert.deepEqual(migrate(JSON.parse(JSON.stringify(s))), s);
});
