import { test } from "node:test";
import assert from "node:assert/strict";
import { learnsetFor, movesLearnedAt } from "../static/src/data/learnsets.js";
import { MOVE_BY_ID } from "../static/src/data/moves.js";
import { previousStage } from "../static/src/game/dex.js";
import { movesAtLevel } from "../static/src/battle/spawn.js";
import { dex } from "./battle-helpers.mjs";

test("every species' learnset is valid", () => {
  for (const sp of dex.list) {
    const ls = learnsetFor(dex, sp.id);
    assert.ok(ls.filter((e) => e.level === 1).length >= 2, `${sp.id} level 1`);
    const ids = ls.map((e) => e.move);
    assert.equal(new Set(ids).size, ids.length, `${sp.id} repeats a move`);
    for (let i = 0; i < ls.length; i++) {
      assert.ok(MOVE_BY_ID.has(ls[i].move) && ls[i].move !== "struggle", `${sp.id}: ${ls[i].move}`);
      if (i) assert.ok(ls[i].level >= ls[i - 1].level, `${sp.id} levels out of order`);
    }
    const levels = [...new Set(ls.map((e) => e.level))];
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 7, `${sp.id} gap ${levels[i - 1]}->${levels[i]}`);
    assert.ok(levels[levels.length - 1] >= 55, `${sp.id} stops at ${levels[levels.length - 1]}`);
    const moves = ids.map((id) => MOVE_BY_ID.get(id));
    const status = moves.filter((m) => m.category === "status").length;
    assert.ok(status >= 1 && status <= 3, `${sp.id} has ${status} status moves`);
    const stab = moves.filter((m) => m.category !== "status" && sp.types.includes(m.type)).length;
    assert.ok(stab >= 3, `${sp.id} has ${stab} STAB moves`);
    assert.ok(moves.some((m) => m.category !== "status" && !sp.types.includes(m.type) && m.type !== "normal"), `${sp.id} has no coverage`);
    assert.deepEqual(learnsetFor(dex, sp.id), ls, "deterministic");
  }
});

test("an evolved stage keeps its pre-evolution's moves at the same levels and adds stronger ones", () => {
  for (const sp of dex.list) {
    const prev = previousStage(dex, sp.id);
    if (!prev) continue;
    const mine = learnsetFor(dex, sp.id);
    const theirs = learnsetFor(dex, prev.id);
    for (const e of theirs) assert.ok(mine.some((x) => x.level === e.level && x.move === e.move), `${sp.id} lost ${e.move}@${e.level}`);
    const extra = mine.filter((x) => !theirs.some((e) => e.move === x.move));
    assert.ok(extra.length >= 1, `${sp.id} adds nothing`);
    for (const x of extra) assert.ok(MOVE_BY_ID.get(x.move).power >= 70, `${sp.id} adds weak ${x.move}`);
  }
});

test("a level-5 creature has a damaging move; movesLearnedAt and movesAtLevel agree", () => {
  for (const sp of dex.list) {
    const known = movesAtLevel(dex, sp.id, 5);
    assert.ok(known.length >= 2 && known.length <= 4);
    assert.ok(known.some((id) => MOVE_BY_ID.get(id).category !== "status"), sp.id);
    assert.equal(movesAtLevel(dex, sp.id, 60).length, 4);
    for (const e of learnsetFor(dex, sp.id)) assert.ok(movesLearnedAt(dex, sp.id, e.level).includes(e.move));
  }
});
