// Every Warden, Council member and the champion can be beaten with any starter by a
// team a player would have at that point: the starter at the planned level and creatures
// caught on the routes before it, a few levels lower, played by the expert AI (which heals
// and switches) with a few potions. Fixed seeds, so the rates are exact, not flaky.
//
// The floor is low on purpose: a type-disadvantaged Warden (grass against fire) should be a
// real fight, as on the Game Boy, not a coin flip a player can't win.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeDex } from "../static/src/game/dex.js";
import { createBattle } from "../static/src/battle/engine.js";
import { chooseAction, chooseReplacement } from "../static/src/battle/ai.js";
import { makeCreature } from "../static/src/battle/spawn.js";
import { createRng } from "../static/src/core/rng.js";
import { TRAINERS } from "../static/src/data/trainers/index.js";

const dex = makeDex(JSON.parse(readFileSync(new URL("../static/data/species.json", import.meta.url), "utf8")));
const stageAt = (root, level) => {
  let s = dex.get(root);
  while (s.evolution?.level && level >= s.evolution.level) s = dex.get(s.evolution.to);
  return s.id;
};

/** [trainer, the starter's level, the rest of the team as "species:levels below the starter"] */
const plan = [
  ["tamsin", 14, ["skyjay:-3"]],
  ["bram", 19, ["granagrub:-3", "voltupupa:-4", "dojopupa:-4"]],
  ["nerys", 24, ["voltupupa:-3", "leafonit:-3", "dojopupa:-4"]],
  ["ozzie", 29, ["mudofawn:-3", "brinip:-3", "dojopupa:-4", "leafonit:-4"]],
  ["vesper", 34, ["umbrapup:-3", "ampup:-3", "dojopupa:-4", "brinip:-4", "cosmupaw:-4"]],
  ["gideon", 39, ["dunulump:-3", "mudofawn:-3", "umbrapup:-4", "ampup:-4", "brinip:-4"]],
  ["yuki", 44, ["pyrapip:-3", "dojopupa:-3", "slatafry:-4", "ampup:-4", "brinip:-4"]],
  ["corvin", 48, ["snowablob:-3", "dojopupa:-3", "slatafry:-4", "ampup:-4", "umbrapup:-4"]],
  ["council-brakka", 51, ["cosmupaw:-2", "crowonip:-3", "snowablob:-3", "slatafry:-3", "ampup:-4"]],
  ["council-selene", 52, ["cosmupaw:-2", "crowonip:-3", "snowablob:-3", "slatafry:-3", "ampup:-4"]],
  ["council-mordecai", 52, ["cosmupaw:-2", "crowonip:-3", "snowablob:-3", "slatafry:-3", "ampup:-4"]],
  ["council-lumi", 53, ["cosmupaw:-2", "crowonip:-3", "snowablob:-3", "slatafry:-3", "ampup:-4"]],
  ["kip-champion", 55, ["cosmupaw:-2", "crowonip:-2", "snowablob:-3", "slatafry:-3", "ampup:-3"]],
];

const SEEDS = 40;
const FLOOR = 0.3;

for (const starter of ["sproufawn", "flaropaw", "hydrefry"]) {
  test(`every boss can be beaten with ${starter}`, () => {
    const rivalOf = { sproufawn: "flaropaw", flaropaw: "hydrefry", hydrefry: "sproufawn" }[starter];
    const low = [];
    for (const [tid, lead, others] of plan) {
      const t = TRAINERS[tid];
      let wins = 0;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const rng = createRng(seed * 7919);
        const party = [makeCreature(dex, stageAt(starter, lead), lead, rng, { ot: "P" })];
        for (const o of others) {
          const [sp, d] = o.split(":");
          const L = lead + Number(d);
          party.push(makeCreature(dex, stageAt(sp, L), L, rng, { ot: "P" }));
        }
        const foe = t.party.map((m) => makeCreature(dex, m.species.startsWith("@rival") ? stageAt(rivalOf, m.level) : m.species, m.level, rng, { ot: "F" }));
        const bag = lead < 25 ? { tonic: 3, "tonic-plus": 2 } : lead < 40 ? { "mega-tonic": 4 } : { "grand-tonic": 4, "mega-tonic": 4 };
        const b = createBattle({ dex, rng, kind: "trainer", player: { name: "P", party, bag },
          foe: { party: foe, trainer: { id: t.id, name: t.name, className: t.className, ai: t.ai ?? "basic", items: { ...(t.items ?? {}) }, reward: 0 } } });
        b.start();
        for (let i = 0; i < 400 && b.request.kind !== "end"; i++) {
          const r = b.request;
          if (r.kind === "action") b.act(chooseAction(b, "player", "expert"));
          else if (r.kind === "switch") b.act({ type: "switch", index: chooseReplacement(b, "player", "expert") });
          else if (r.kind === "learn") b.act({ type: "learn", replace: -1 });
        }
        if (b.request.kind === "end" && b.request.result === "win") wins++;
      }
      if (wins / SEEDS < FLOOR) low.push(`${tid} ${Math.round((100 * wins) / SEEDS)}%`);
    }
    assert.deepEqual(low, [], `bosses a ${starter} player wins under ${FLOOR * 100}% of the time`);
  });
}
