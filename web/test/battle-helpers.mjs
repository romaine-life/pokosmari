// Shared setup for the battle and data tests: the dex from disk and a battle driver.
import { readFileSync } from "node:fs";
import { makeDex } from "../static/src/game/dex.js";
import { createRng } from "../static/src/core/rng.js";
import { makeCreature } from "../static/src/battle/spawn.js";
import { createBattle } from "../static/src/battle/engine.js";
import { chooseAction, chooseReplacement } from "../static/src/battle/ai.js";

export const dex = makeDex(JSON.parse(readFileSync(new URL("../static/data/species.json", import.meta.url), "utf8")));

/**
 * @param {string} species @param {number} level @param {number} seed
 */
export function mon(species, level, seed = 1) {
  return makeCreature(dex, species, level, createRng(seed), { ot: "Test" });
}

/**
 * Plays a battle to its end. The player side is driven by the AI, with some random
 * switches, items, runs and orbs thrown in; every event is checked as it comes.
 * @param {import("../static/src/battle/engine.js").Battle} battle
 * @param {import("../static/src/core/rng.js").Rng} rng  drives the player's choices
 * @param {"basic"|"smart"|"expert"} level
 */
export function playOut(battle, rng, level = "smart") {
  const all = [...battle.start()];
  let steps = 0;
  while (battle.request.kind !== "end") {
    if (++steps > 3000) throw new Error("battle did not end in 3000 choices");
    const r = battle.request;
    /** @type {any} */
    let choice;
    if (r.kind === "learn") choice = { type: "learn", replace: rng.int(-1, 3) };
    else if (r.kind === "switch") choice = { type: "switch", index: chooseReplacement(battle, "player", level) };
    else {
      const p = battle.state.player;
      const x = rng.next();
      const bagIds = Object.keys(p.items).filter((k) => p.items[k] > 0);
      if (x < 0.03) choice = { type: "run" };
      else if (x < 0.08 && bagIds.length) choice = { type: "item", item: rng.pick(bagIds), target: rng.int(0, p.party.length - 1), move: 0 };
      else if (x < 0.12) choice = { type: "switch", index: rng.int(0, p.party.length - 1) };
      else choice = chooseAction(battle, "player", level);
    }
    const ev = battle.act(choice);
    if (r.kind === "action" && ev.length === 0) throw new Error("an action produced no events");
    all.push(...ev);
  }
  return all;
}
