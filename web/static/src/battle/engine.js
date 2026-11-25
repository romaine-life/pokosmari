// @ts-check
// The battle rules. Pure and deterministic given the RNG: no drawing, sound or timers.
// The scene calls start(), plays the events, reads `request`, collects the player's choice
// and passes it to act(), which returns the next events.
//
// The engine mutates the player's creature records (hp, status, sleep, PP, exp, level,
// moves) since those persist; battle-only state (stat stages, confusion, binding...) lives
// in the sides here and is dropped when the battle ends.

import { displayName, levelForExp, MAX_LEVEL, statsOf } from "../game/creature.js";
import { effectiveness } from "../data/types.js";
import { getMove, STRUGGLE } from "../data/moves.js";
import { ITEM_BY_ID } from "../data/items.js";
import { movesLearnedAt } from "../data/learnsets.js";
import {
  accuracyMultiplier, baseExpYield, catchRate, CRIT_CHANCE, damage, escapeChance, expGain,
  HIGH_CRIT_CHANCE, rollCatch, stageMultiplier,
} from "./formulas.js";
import { chooseAction, chooseReplacement, statusImmune } from "./ai.js";

/** @typedef {import("../game/creature.js").Creature} Creature */
/** @typedef {import("../game/creature.js").Status} Status */
/** @typedef {import("../game/dex.js").Dex} Dex */
/** @typedef {import("../core/rng.js").Rng} Rng */
/** @typedef {import("../data/moves.js").Move} Move */
/** @typedef {import("../data/moves.js").BattleStat} BattleStat */

/**
 * @typedef {{t: "text", text: string}
 *   | {t: "sendout", side: SideId, index: number}
 *   | {t: "withdraw", side: SideId}
 *   | {t: "use", side: SideId, move: string}
 *   | {t: "hp", side: SideId, hp: number, max: number}
 *   | {t: "status", side: SideId, status: Status|null}
 *   | {t: "stat", side: SideId, stat: BattleStat, stages: number}
 *   | {t: "faint", side: SideId}
 *   | {t: "exp", uid: string, gained: number}
 *   | {t: "levelup", uid: string, level: number}
 *   | {t: "learned", uid: string, move: string}
 *   | {t: "ball", item: string, shakes: number, caught: boolean}
 *   | {t: "money", amount: number}
 *   | {t: "effectiveness", value: number}
 *   | {t: "crit"}
 *   | {t: "miss", side: SideId}} BattleEvent
 * stat.stages is the change applied (+1, -2...), not the resulting stage.
 */

/** @typedef {"player"|"foe"} SideId */

/**
 * @typedef {{type: "move", index: number}
 *   | {type: "switch", index: number}
 *   | {type: "item", item: string, target?: number, move?: number}
 *   | {type: "run"}
 *   | {type: "learn", replace: number}} Choice
 * A move choice when every move is out of PP uses Desperation (the struggle move).
 */

/**
 * @typedef {{kind: "action"}
 *   | {kind: "switch"}
 *   | {kind: "learn", uid: string, move: string}
 *   | {kind: "end", result: "win"|"lose"|"run"|"caught", caught?: Creature, money: number, evolutions: string[]}} Request
 */

/**
 * @typedef {object} Volatile  battle-only state of the active creature; reset on switch
 * @property {number} confusion   turns left
 * @property {boolean} flinch
 * @property {boolean} protect
 * @property {number} protectChain
 * @property {boolean} recharge
 * @property {number} charging    move slot being charged, or -1
 * @property {number} bind        turns left
 * @property {string} bindName
 * @property {boolean} leech
 * @property {number} toxic       the next toxic tick in sixteenths
 * @property {boolean} fainted    the faint has been announced
 */

/**
 * @typedef {object} Side
 * @property {SideId} id
 * @property {Creature[]} party
 * @property {number} active
 * @property {Record<BattleStat, number>} stages
 * @property {Volatile} vol
 * @property {Record<string, number>} items   the player's bag (mutated in place) or the trainer's items (a copy)
 * @property {number} itemUses
 * @property {number} switchedTurn
 */

/**
 * @typedef {object} Trainer
 * @property {string} id
 * @property {string} name
 * @property {string} className
 * @property {"basic"|"smart"|"expert"} ai
 * @property {Record<string, number>} [items]
 * @property {number} reward    money paid to the player on a win
 */

/**
 * @typedef {object} BattleState
 * @property {"wild"|"trainer"} kind
 * @property {Dex} dex
 * @property {Rng} rng
 * @property {number} turn
 * @property {Side} player
 * @property {Side} foe
 * @property {Trainer|null} trainer
 * @property {string} playerName
 * @property {number} money
 * @property {boolean} canRun
 * @property {boolean} canCatch
 * @property {number} runAttempts
 * @property {{uid: string, move: string}[]} pendingLearn
 * @property {Map<number, Set<string>>} participants   foe party index → player uids that faced it
 * @property {Set<string>} leveled
 * @property {Creature|null} caught
 * @property {string|null} result
 * @property {boolean} started
 */

/**
 * @typedef {object} Battle
 * @property {BattleState} state
 * @property {Request} request
 * @property {() => BattleEvent[]} start
 * @property {(choice: Choice) => BattleEvent[]} act
 */

/**
 * @typedef {object} BattleOptions
 * @property {Dex} dex
 * @property {Rng} rng
 * @property {"wild"|"trainer"} kind
 * @property {{name: string, party: Creature[], bag: Record<string, number>, money?: number}} player
 *   money is only read to work out what a loss costs
 * @property {{party: Creature[], trainer?: Trainer}} foe
 * @property {boolean} [canRun]    default: true for wild battles
 * @property {boolean} [canCatch]  default: true for wild battles
 */

export const STAGE_STATS = /** @type {BattleStat[]} */ (["atk", "def", "spa", "spd", "spe", "acc", "eva"]);
const STAT_LABEL = { atk: "Attack", def: "Defense", spa: "Sp. Atk", spd: "Sp. Def", spe: "Speed", acc: "accuracy", eva: "evasiveness" };
const STATUS_TEXT = {
  brn: "was burned!",
  psn: "was poisoned!",
  tox: "was badly poisoned!",
  par: "is paralyzed! It may not be able to move!",
  slp: "fell asleep!",
  frz: "was frozen solid!",
};
const ALREADY_TEXT = {
  brn: "is already burned!", psn: "is already poisoned!", tox: "is already poisoned!",
  par: "is already paralyzed!", slp: "is already asleep!", frz: "is already frozen!",
};
const SHAKE_TEXT = [
  "It broke free at once!",
  "It broke out! Not even close!",
  "Argh! It almost stayed in!",
  "No! It was so close!",
];

/** Every MoveEffect key the engine applies; the tests hold the move data to it. */
export const HANDLED_EFFECTS = [
  "stat", "status", "confuse", "flinch", "recoil", "drain", "heal", "hits", "fixed", "levelDamage",
  "highCrit", "protect", "recharge", "charge", "bind", "leech", "rest", "haze", "struggle",
];

/** @returns {Volatile} */
function freshVolatile() {
  return { confusion: 0, flinch: false, protect: false, protectChain: 0, recharge: false, charging: -1, bind: 0, bindName: "", leech: false, toxic: 1, fainted: false };
}

/** @returns {Record<BattleStat, number>} */
function freshStages() {
  return { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };
}

/**
 * @param {SideId} id
 * @param {Creature[]} party
 * @param {Record<string, number>} items
 * @returns {Side}
 */
function makeSide(id, party, items) {
  return { id, party, active: 0, stages: freshStages(), vol: freshVolatile(), items, itemUses: 0, switchedTurn: -99 };
}

/**
 * @param {BattleOptions} opts
 * @returns {Battle}
 */
export function createBattle(opts) {
  const { dex, rng } = opts;
  const trainer = opts.foe.trainer || null;
  if (opts.kind === "trainer" && !trainer) throw new Error("a trainer battle needs foe.trainer");
  /** @type {BattleState} */
  const state = {
    kind: opts.kind,
    dex,
    rng,
    turn: 0,
    player: makeSide("player", opts.player.party, opts.player.bag),
    foe: makeSide("foe", opts.foe.party, trainer ? { ...(trainer.items || {}) } : {}),
    trainer,
    playerName: opts.player.name,
    money: opts.player.money ?? 0,
    canRun: opts.canRun ?? opts.kind === "wild",
    canCatch: opts.canCatch ?? opts.kind === "wild",
    runAttempts: 0,
    pendingLearn: [],
    participants: new Map(),
    leveled: new Set(),
    caught: null,
    result: null,
    started: false,
  };
  const trainerName = trainer ? `${trainer.className} ${trainer.name}` : "";

  /** @type {Battle} */
  const battle = { state, request: { kind: "action" }, start, act };

  // ---- small helpers ----

  /** @param {Side} s */
  const other = (s) => (s === state.player ? state.foe : state.player);
  /** @param {Side} s */
  const active = (s) => s.party[s.active];
  /** @param {Creature} c */
  const speciesOf = (c) => dex.get(c.species);
  /** @param {Creature} c */
  const stats = (c) => statsOf(speciesOf(c), c);
  /** @param {Creature} c */
  const maxHp = (c) => stats(c).hp;
  /** @param {Side} s */
  const name = (s) => {
    const n = displayName(dex, active(s));
    if (s === state.player) return n;
    return state.kind === "wild" ? `Wild ${n}` : `Foe ${n}`;
  };
  /** @param {Side} s */
  const userName = (s) => (s === state.player ? state.playerName : trainerName);
  /** @param {BattleEvent[]} ev @param {string} text */
  const say = (ev, text) => ev.push({ t: "text", text });
  /** @param {Side} s @param {BattleEvent[]} ev */
  const hpEvent = (s, ev) => {
    const c = active(s);
    ev.push({ t: "hp", side: s.id, hp: c.hp, max: maxHp(c) });
  };
  /** @param {Side} s */
  const speed = (s) => {
    const c = active(s);
    let v = stats(c).spe * stageMultiplier(s.stages.spe);
    if (c.status === "par") v *= 0.25;
    return v;
  };
  /** @param {Side} s */
  const alive = (s) => s.party.some((c) => c.hp > 0);

  /** @param {Side} s */
  function lockedChoice(s) {
    if (s.vol.recharge) return { type: "recharge" };
    if (s.vol.charging >= 0) return { type: "move", index: s.vol.charging, charged: true };
    return null;
  }

  /** @param {number} foeIndex @param {Creature} c */
  function addParticipant(foeIndex, c) {
    if (!c || c.hp <= 0) return;
    let set = state.participants.get(foeIndex);
    if (!set) state.participants.set(foeIndex, (set = new Set()));
    set.add(c.uid);
  }

  // ---- flow ----

  function start() {
    if (state.started) throw new Error("battle already started");
    state.started = true;
    /** @type {BattleEvent[]} */
    const ev = [];
    const pi = state.player.party.findIndex((c) => c.hp > 0);
    const fi = state.foe.party.findIndex((c) => c.hp > 0);
    if (fi < 0) throw new Error("the foe has no creature that can fight");
    state.foe.active = fi;
    if (state.kind === "wild") {
      say(ev, `A wild ${displayName(dex, active(state.foe))} appeared!`);
      ev.push({ t: "sendout", side: "foe", index: fi });
    } else {
      say(ev, `${trainerName} wants to battle!`);
      say(ev, `${trainerName} sent out ${displayName(dex, active(state.foe))}!`);
      ev.push({ t: "sendout", side: "foe", index: fi });
    }
    if (pi >= 0) {
      state.player.active = pi;
      say(ev, `Go, ${name(state.player)}!`);
      ev.push({ t: "sendout", side: "player", index: pi });
      addParticipant(fi, active(state.player));
    }
    advance(ev);
    return ev;
  }

  /** @param {Choice} choice */
  function act(choice) {
    if (!state.started) throw new Error("call start() first");
    const req = battle.request;
    /** @type {BattleEvent[]} */
    const ev = [];
    if (req.kind === "end") throw new Error("the battle is over");
    if (req.kind === "learn") {
      if (choice.type !== "learn") throw new Error(`expected a learn choice, got ${choice.type}`);
      resolveLearn(choice.replace, ev);
    } else if (req.kind === "switch") {
      if (choice.type !== "switch") throw new Error(`expected a switch choice, got ${choice.type}`);
      if (!validSwitch(choice.index, ev, true)) return ev;
      sendOut(state.player, choice.index, ev);
    } else {
      if (choice.type === "learn") throw new Error("no move to learn now");
      if (!validAction(choice, ev)) return ev;
      runTurn(choice, ev);
    }
    advance(ev);
    for (let guard = 0; battle.request.kind === "action" && lockedChoice(state.player) && guard < 10; guard++) {
      runTurn(/** @type {any} */ (lockedChoice(state.player)), ev);
      advance(ev);
    }
    return ev;
  }

  /** Works out the next request after events settle. @param {BattleEvent[]} ev */
  function advance(ev) {
    if (state.result) return;
    if (state.pendingLearn.length) {
      const p = state.pendingLearn[0];
      const c = state.player.party.find((x) => x.uid === p.uid);
      const n = displayName(dex, c);
      say(ev, `${n} wants to learn ${getMove(p.move).name}.`);
      say(ev, `But ${n} already knows four moves.`);
      battle.request = { kind: "learn", uid: p.uid, move: p.move };
      return;
    }
    if (!alive(state.player)) return end("lose", ev);
    if (!alive(state.foe)) return end("win", ev);
    if (active(state.foe).hp <= 0) {
      const i = chooseReplacement(battle, "foe");
      say(ev, `${trainerName} sent out ${displayName(dex, state.foe.party[i])}!`);
      placeActive(state.foe, i, ev);
    }
    if (active(state.player).hp <= 0) {
      battle.request = { kind: "switch" };
      return;
    }
    battle.request = { kind: "action" };
  }

  /**
   * @param {"win"|"lose"|"run"|"caught"} result
   * @param {BattleEvent[]} ev
   */
  function end(result, ev) {
    let money = 0;
    if (result === "win" && trainer) {
      money = trainer.reward ?? 0;
      say(ev, `${state.playerName} defeated ${trainerName}!`);
      say(ev, `${state.playerName} got $${money} for winning!`);
      ev.push({ t: "money", amount: money });
    } else if (result === "lose") {
      money = -Math.floor(state.money / 2);
      say(ev, `${state.playerName} has no creatures left that can fight!`);
      if (money < 0) {
        say(ev, `${state.playerName} dropped $${-money} in the panic...`);
        ev.push({ t: "money", amount: money });
      }
      say(ev, "Everything went dark...");
    }
    for (const c of state.player.party) if (c.status === "tox") c.status = "psn";
    const evolutions = [...state.leveled].filter((uid) => {
      const c = state.player.party.find((x) => x.uid === uid);
      const evo = c && speciesOf(c).evolution;
      return c && c.hp > 0 && evo?.level !== undefined && c.level >= evo.level;
    });
    state.result = result;
    /** @type {Request} */
    const req = { kind: "end", result, money, evolutions };
    if (state.caught) req.caught = state.caught;
    battle.request = req;
  }

  // ---- validating the player's choice ----

  /** @param {number} index @param {BattleEvent[]} ev @param {boolean} forced */
  function validSwitch(index, ev, forced) {
    const p = state.player;
    const c = p.party[index];
    if (!c) throw new Error(`no party member ${index}`);
    if (c.hp <= 0) return say(ev, `${displayName(dex, c)} has no energy left to fight!`), false;
    if (index === p.active && !forced) return say(ev, `${displayName(dex, c)} is already out!`), false;
    if (index === p.active && active(p).hp > 0) return say(ev, `${displayName(dex, c)} is already out!`), false;
    if (!forced && p.vol.bind) return say(ev, `${name(p)} can't get away!`), false;
    return true;
  }

  /** @param {Choice} choice @param {BattleEvent[]} ev */
  function validAction(choice, ev) {
    const p = state.player;
    const c = active(p);
    switch (choice.type) {
      case "move": {
        if (c.moves.every((m) => m.pp <= 0)) return true;
        const slot = c.moves[choice.index];
        if (!slot) throw new Error(`no move ${choice.index}`);
        if (slot.pp <= 0) return say(ev, "There's no PP left for that move!"), false;
        return true;
      }
      case "switch":
        return validSwitch(choice.index, ev, false);
      case "run":
        if (state.kind === "trainer") return say(ev, "No! You can't run from a trainer battle!"), false;
        if (!state.canRun || p.vol.bind) return say(ev, "There's no way out!"), false;
        return true;
      case "item":
        return validItem(choice, ev);
      default:
        throw new Error(`unknown choice ${/** @type {any} */ (choice).type}`);
    }
  }

  /** @param {{type: "item", item: string, target?: number, move?: number}} choice @param {BattleEvent[]} ev */
  function validItem(choice, ev) {
    const p = state.player;
    const item = ITEM_BY_ID.get(choice.item);
    if (!item) throw new Error(`unknown item ${choice.item}`);
    if (!(p.items[choice.item] > 0)) return say(ev, `You don't have any ${item.name}.`), false;
    const e = item.battle;
    if (!e) return say(ev, "That can't be used here."), false;
    if (e.kind === "ball") {
      if (state.kind === "trainer") return say(ev, "The trainer knocked the orb away! You can't take someone's creature!"), false;
      if (!state.canCatch) return say(ev, "The orb won't work here!"), false;
      return true;
    }
    const ti = choice.target ?? p.active;
    const c = p.party[ti];
    if (!c) throw new Error(`no party member ${ti}`);
    const none = () => (say(ev, "It won't have any effect."), false);
    switch (e.kind) {
      case "heal":
        if (c.hp <= 0) return none();
        if (c.hp >= maxHp(c) && !(e.status === "all" && (c.status || (ti === p.active && p.vol.confusion)))) return none();
        return true;
      case "cure":
        if (c.hp <= 0) return none();
        if (e.status === "all") return c.status || (ti === p.active && p.vol.confusion) ? true : none();
        if (e.status === "psn") return c.status === "psn" || c.status === "tox" ? true : none();
        return c.status === e.status ? true : none();
      case "revive":
        return c.hp <= 0 ? true : none();
      case "pp": {
        const slot = c.moves[choice.move ?? 0];
        if (!slot) throw new Error(`no move ${choice.move}`);
        return slot.pp < getMove(slot.id).pp ? true : none();
      }
      case "stat":
        return p.stages[e.stat] < 6 ? true : none();
      default:
        return say(ev, "That can't be used here."), false;
    }
  }

  // ---- the turn ----

  /** @param {any} pChoice @param {BattleEvent[]} ev */
  function runTurn(pChoice, ev) {
    state.turn++;
    const P = state.player, Fo = state.foe;
    const fChoice = lockedChoice(Fo) || chooseAction(battle, "foe");

    // Running, switching and items happen before any move.
    if (pChoice.type === "run") {
      state.runAttempts++;
      if (rng.next() < escapeChance(stats(active(P)).spe, stats(active(Fo)).spe, state.runAttempts)) {
        say(ev, "Got away safely!");
        return end("run", ev);
      }
      say(ev, "Couldn't get away!");
    } else if (pChoice.type === "switch") {
      switchOut(P, pChoice.index, ev);
    } else if (pChoice.type === "item") {
      useItem(P, pChoice, ev);
      if (state.result) return;
    }
    if (fChoice.type === "switch") switchOut(Fo, fChoice.index, ev);
    else if (fChoice.type === "item") useItem(Fo, /** @type {any} */ (fChoice), ev);

    /** @type {{side: Side, choice: any, priority: number, speed: number, tie: number}[]} */
    const movers = [];
    for (const [s, ch] of /** @type {[Side, any][]} */ ([[P, pChoice], [Fo, fChoice]])) {
      if (ch.type !== "move" && ch.type !== "recharge") continue;
      const mv = ch.type === "move" ? moveFor(s, ch.index) : null;
      movers.push({ side: s, choice: ch, priority: mv ? mv.priority : 0, speed: speed(s), tie: rng.next() });
    }
    movers.sort((a, b) => b.priority - a.priority || b.speed - a.speed || a.tie - b.tie);
    for (const m of movers) {
      if (state.result) return;
      if (active(m.side).hp <= 0) continue;
      executeMove(m.side, m.choice, ev);
    }

    // End of turn: status damage, seeds and binding, the faster creature first.
    const order = speed(P) >= speed(Fo) ? [P, Fo] : [Fo, P];
    for (const s of order) residual(s, ev);
    for (const s of [P, Fo]) {
      s.vol.flinch = false;
      s.vol.protect = false;
    }
  }

  /** The move a slot uses: its move, or Desperation when nothing has PP. @param {Side} s @param {number} index */
  function moveFor(s, index) {
    const c = active(s);
    if (s.vol.charging >= 0) return getMove(c.moves[s.vol.charging].id);
    if (c.moves.every((m) => m.pp <= 0)) return STRUGGLE;
    return getMove(c.moves[index].id);
  }

  /** @param {Side} s @param {number} index @param {BattleEvent[]} ev */
  function switchOut(s, index, ev) {
    const n = name(s);
    if (s === state.player) say(ev, `${n}, come back!`);
    else say(ev, `${trainerName} withdrew ${displayName(dex, active(s))}!`);
    ev.push({ t: "withdraw", side: s.id });
    if (s === state.player) say(ev, `Go, ${displayName(dex, s.party[index])}!`);
    else say(ev, `${trainerName} sent out ${displayName(dex, s.party[index])}!`);
    placeActive(s, index, ev);
    s.switchedTurn = state.turn;
  }

  /** A forced send-out after a faint. @param {Side} s @param {number} index @param {BattleEvent[]} ev */
  function sendOut(s, index, ev) {
    say(ev, `Go, ${displayName(dex, s.party[index])}!`);
    placeActive(s, index, ev);
  }

  /** @param {Side} s @param {number} index @param {BattleEvent[]} ev */
  function placeActive(s, index, ev) {
    const o = other(s);
    o.vol.bind = 0; // whatever this side was binding is let go
    s.active = index;
    s.stages = freshStages();
    s.vol = freshVolatile();
    ev.push({ t: "sendout", side: s.id, index });
    if (s === state.player) addParticipant(state.foe.active, active(s));
    else addParticipant(index, active(state.player));
  }

  // ---- moves ----

  /** @param {Side} U @param {any} choice @param {BattleEvent[]} ev */
  function executeMove(U, choice, ev) {
    const T = other(U);
    const c = active(U);
    const vol = U.vol;
    const un = name(U);
    if (choice.type === "recharge") {
      vol.recharge = false;
      say(ev, `${un} must recharge!`);
      return;
    }
    const cancel = () => {
      vol.charging = -1;
    };
    if (c.status === "slp") {
      if (c.sleep > 0) {
        c.sleep--;
        say(ev, `${un} is fast asleep.`);
        return cancel();
      }
      c.status = null;
      ev.push({ t: "status", side: U.id, status: null });
      say(ev, `${un} woke up!`);
    }
    if (c.status === "frz") {
      if (!rng.chance(0.2)) {
        say(ev, `${un} is frozen solid!`);
        return cancel();
      }
      c.status = null;
      ev.push({ t: "status", side: U.id, status: null });
      say(ev, `${un} thawed out!`);
    }
    if (vol.flinch) {
      say(ev, `${un} flinched!`);
      return cancel();
    }
    if (vol.confusion > 0) {
      vol.confusion--;
      if (vol.confusion === 0) say(ev, `${un} snapped out of its confusion!`);
      else {
        say(ev, `${un} is confused!`);
        if (rng.chance(0.5)) {
          say(ev, "It hurt itself in its confusion!");
          const s = stats(c);
          let atk = Math.floor(s.atk * stageMultiplier(U.stages.atk));
          if (c.status === "brn") atk = Math.floor(atk / 2);
          const def = Math.floor(s.def * stageMultiplier(U.stages.def));
          hurt(U, damage({ level: c.level, power: 40, atk, def, roll: rng.int(85, 100) }), ev);
          checkFaint(U, ev);
          return cancel();
        }
      }
    }
    if (c.status === "par" && rng.chance(0.25)) {
      say(ev, `${un} is fully paralyzed!`);
      return cancel();
    }

    const charged = !!choice.charged;
    const struggling = !charged && c.moves.every((m) => m.pp <= 0);
    const slotIndex = charged ? vol.charging : choice.index;
    const move = struggling ? STRUGGLE : getMove(c.moves[slotIndex].id);
    const e = move.effect || {};
    if (!charged && !struggling) c.moves[slotIndex].pp = Math.max(0, c.moves[slotIndex].pp - 1);
    if (struggling) say(ev, `${un} has no moves left!`);
    say(ev, `${un} used ${move.name}!`);
    ev.push({ t: "use", side: U.id, move: move.id });
    if (e.charge && !charged) {
      vol.charging = slotIndex;
      say(ev, `${un} is gathering power!`);
      return;
    }
    vol.charging = -1;

    if (e.protect) {
      if (rng.chance(1 / 2 ** vol.protectChain)) {
        vol.protect = true;
        vol.protectChain++;
        say(ev, `${un} is guarding itself!`);
      } else {
        vol.protectChain = 0;
        say(ev, "But it failed!");
      }
      return;
    }
    vol.protectChain = 0;

    const t = active(T);
    const tn = name(T);
    const aimed = targetsFoe(move);
    if (aimed) {
      if (t.hp <= 0) return say(ev, "But there was no target...");
      if (T.vol.protect) return say(ev, `${tn} protected itself!`);
      if (move.accuracy != null) {
        const acc = move.accuracy * accuracyMultiplier(U.stages.acc - T.stages.eva);
        if (rng.next() * 100 >= acc) {
          ev.push({ t: "miss", side: U.id });
          say(ev, `${un}'s attack missed!`);
          return;
        }
      }
    }

    if (move.category === "status") return statusMove(U, T, move, ev);

    const tsp = speciesOf(t);
    const eff = e.struggle ? 1 : effectiveness(move.type, tsp.types);
    if (eff === 0) return say(ev, `It doesn't affect ${tn}...`);
    const flat = e.fixed !== undefined || e.levelDamage;
    let hits = 1;
    if (e.hits) {
      const [lo, hi] = e.hits;
      if (lo === hi) hits = lo;
      else {
        const r = rng.next();
        hits = r < 0.375 ? 2 : r < 0.75 ? 3 : r < 0.875 ? 4 : 5;
      }
    }
    let dealt = 0, landed = 0;
    for (let i = 0; i < hits && t.hp > 0; i++) {
      let amount;
      if (e.fixed !== undefined) amount = e.fixed;
      else if (e.levelDamage) amount = c.level;
      else {
        const crit = rng.chance(e.highCrit ? HIGH_CRIT_CHANCE : CRIT_CHANCE);
        const phys = move.category === "physical";
        const ak = phys ? "atk" : "spa", dk = phys ? "def" : "spd";
        const us = stats(c), ts = stats(t);
        let atk = Math.floor(us[ak] * stageMultiplier(crit ? Math.max(0, U.stages[ak]) : U.stages[ak]));
        if (phys && c.status === "brn") atk = Math.floor(atk / 2);
        const def = Math.floor(ts[dk] * stageMultiplier(crit ? Math.min(0, T.stages[dk]) : T.stages[dk]));
        const stab = !e.struggle && speciesOf(c).types.includes(move.type);
        amount = damage({ level: c.level, power: move.power, atk, def, crit, roll: rng.int(85, 100), stab, effectiveness: eff });
        if (crit) {
          ev.push({ t: "crit" });
          say(ev, "A critical hit!");
        }
      }
      dealt += hurt(T, amount, ev);
      landed++;
    }
    if (!flat && eff !== 1) {
      ev.push({ t: "effectiveness", value: eff });
      say(ev, eff > 1 ? "It's super effective!" : "It's not very effective...");
    }
    if (hits > 1) say(ev, landed === 1 ? "Hit 1 time!" : `Hit ${landed} times!`);
    if (t.hp > 0 && t.status === "frz" && move.type === "fire") {
      t.status = null;
      ev.push({ t: "status", side: T.id, status: null });
      say(ev, `${tn} thawed out!`);
    }
    checkFaint(T, ev);

    if (t.hp > 0) {
      if (e.status && rng.chance((e.status.chance ?? 100) / 100)) inflict(T, e.status.id, ev, true);
      if (e.confuse && rng.chance(e.confuse / 100)) confuse(T, ev, true);
      if (e.flinch && rng.chance(e.flinch / 100)) T.vol.flinch = true;
      if (e.stat?.who === "target" && rng.chance((e.stat.chance ?? 100) / 100)) changeStages(T, e.stat.stages, ev, true);
      if (e.bind && !T.vol.bind) {
        T.vol.bind = rng.int(2, 5);
        T.vol.bindName = move.name;
        say(ev, `${tn} was trapped by ${move.name}!`);
      }
    }
    if (c.hp > 0) {
      if (e.stat?.who === "self" && rng.chance((e.stat.chance ?? 100) / 100)) changeStages(U, e.stat.stages, ev, true);
      if (e.drain && dealt > 0) {
        const got = heal(U, Math.max(1, Math.floor(dealt * e.drain)), ev);
        if (got > 0) say(ev, `${tn} had its energy drained!`);
      }
      const recoil = e.struggle ? 0.25 : e.recoil;
      if (recoil && dealt > 0) {
        hurt(U, Math.max(1, Math.floor(dealt * recoil)), ev);
        say(ev, `${un} is hit with recoil!`);
        checkFaint(U, ev);
      }
      if (e.recharge) vol.recharge = true;
    }
  }

  /** @param {Move} move */
  function targetsFoe(move) {
    if (move.category !== "status") return true;
    const e = move.effect || {};
    return !!(e.status || e.confuse || e.leech || (e.stat && e.stat.who === "target"));
  }

  /** @param {Side} U @param {Side} T @param {Move} move @param {BattleEvent[]} ev */
  function statusMove(U, T, move, ev) {
    const e = move.effect || {};
    const c = active(U);
    const t = active(T);
    if (e.haze) {
      state.player.stages = freshStages();
      state.foe.stages = freshStages();
      say(ev, "Every stat change was wiped away!");
    }
    if (e.rest) {
      const max = maxHp(c);
      if (c.hp >= max) say(ev, "But it failed!");
      else {
        c.status = "slp";
        c.sleep = 2;
        U.vol.toxic = 1;
        ev.push({ t: "status", side: U.id, status: "slp" });
        heal(U, max, ev);
        say(ev, `${name(U)} fell into a deep sleep and recovered!`);
      }
    }
    if (e.heal) {
      if (c.hp >= maxHp(c)) say(ev, `${name(U)}'s HP is already full!`);
      else {
        heal(U, Math.floor(maxHp(c) * e.heal), ev);
        say(ev, `${name(U)} restored its HP!`);
      }
    }
    if (e.leech) {
      if (speciesOf(t).types.includes("grass")) say(ev, `It doesn't affect ${name(T)}...`);
      else if (T.vol.leech) say(ev, "But it failed!");
      else {
        T.vol.leech = true;
        say(ev, `${name(T)} was seeded!`);
      }
    }
    if (e.status) {
      if (move.type === "electric" && effectiveness("electric", speciesOf(t).types) === 0) say(ev, `It doesn't affect ${name(T)}...`);
      else inflict(T, e.status.id, ev, false);
    }
    if (e.confuse) confuse(T, ev, false);
    if (e.stat) changeStages(e.stat.who === "self" ? U : T, e.stat.stages, ev, false);
  }

  /**
   * @param {Side} T @param {Status} status @param {BattleEvent[]} ev
   * @param {boolean} quiet  a side effect fails silently
   */
  function inflict(T, status, ev, quiet) {
    const t = active(T);
    if (t.hp <= 0) return;
    if (t.status) {
      if (!quiet) say(ev, t.status === status ? `${name(T)} ${ALREADY_TEXT[status]}` : "But it failed!");
      return;
    }
    if (statusImmune(speciesOf(t).types, status)) {
      if (!quiet) say(ev, `It doesn't affect ${name(T)}...`);
      return;
    }
    t.status = status;
    if (status === "slp") t.sleep = rng.int(1, 3);
    if (status === "tox") T.vol.toxic = 1;
    ev.push({ t: "status", side: T.id, status });
    say(ev, `${name(T)} ${STATUS_TEXT[status]}`);
  }

  /** @param {Side} T @param {BattleEvent[]} ev @param {boolean} quiet */
  function confuse(T, ev, quiet) {
    if (active(T).hp <= 0) return;
    if (T.vol.confusion > 0) {
      if (!quiet) say(ev, `${name(T)} is already confused!`);
      return;
    }
    T.vol.confusion = rng.int(2, 5) + 1; // the first tick comes before its next move
    say(ev, `${name(T)} became confused!`);
  }

  /**
   * @param {Side} s @param {Partial<Record<BattleStat, number>>} stages @param {BattleEvent[]} ev
   * @param {boolean} quiet  a side effect at its limit says nothing
   */
  function changeStages(s, stages, ev, quiet) {
    const n = name(s);
    for (const [k, delta] of /** @type {[BattleStat, number][]} */ (Object.entries(stages))) {
      const cur = s.stages[k];
      const next = Math.max(-6, Math.min(6, cur + delta));
      const got = next - cur;
      if (got === 0) {
        if (!quiet) say(ev, `${n}'s ${STAT_LABEL[k]} won't go any ${delta > 0 ? "higher" : "lower"}!`);
        continue;
      }
      s.stages[k] = next;
      ev.push({ t: "stat", side: s.id, stat: k, stages: got });
      const how = got >= 3 ? "rose drastically" : got === 2 ? "rose sharply" : got === 1 ? "rose" : got === -1 ? "fell" : got === -2 ? "harshly fell" : "severely fell";
      say(ev, `${n}'s ${STAT_LABEL[k]} ${how}!`);
    }
  }

  /** Takes HP; returns what was taken. @param {Side} s @param {number} amount @param {BattleEvent[]} ev */
  function hurt(s, amount, ev) {
    const c = active(s);
    const got = Math.min(c.hp, Math.max(0, amount));
    c.hp -= got;
    hpEvent(s, ev);
    return got;
  }

  /** Restores HP; returns what was restored. @param {Side} s @param {number} amount @param {BattleEvent[]} ev */
  function heal(s, amount, ev) {
    const c = active(s);
    const got = Math.min(maxHp(c) - c.hp, Math.max(0, amount));
    if (got <= 0) return 0;
    c.hp += got;
    hpEvent(s, ev);
    return got;
  }

  /** @param {Side} s @param {BattleEvent[]} ev */
  function residual(s, ev) {
    const c = active(s);
    if (c.hp <= 0 || state.result) return;
    const max = maxHp(c);
    const n = name(s);
    if (c.status === "brn") {
      hurt(s, Math.max(1, Math.floor(max / 16)), ev);
      say(ev, `${n} is hurt by its burn!`);
    } else if (c.status === "psn") {
      hurt(s, Math.max(1, Math.floor(max / 8)), ev);
      say(ev, `${n} is hurt by poison!`);
    } else if (c.status === "tox") {
      hurt(s, Math.max(1, Math.floor((max * s.vol.toxic) / 16)), ev);
      s.vol.toxic = Math.min(15, s.vol.toxic + 1);
      say(ev, `${n} is hurt by poison!`);
    }
    if (checkFaint(s, ev)) return;
    const o = other(s);
    if (s.vol.leech && active(o).hp > 0) {
      const got = hurt(s, Math.max(1, Math.floor(max / 8)), ev);
      heal(o, got, ev);
      say(ev, `${n}'s health is sapped by the creeper!`);
      if (checkFaint(s, ev)) return;
    }
    if (s.vol.bind > 0) {
      hurt(s, Math.max(1, Math.floor(max / 16)), ev);
      say(ev, `${n} is hurt by ${s.vol.bindName}!`);
      s.vol.bind--;
      if (checkFaint(s, ev)) return;
      if (s.vol.bind === 0) say(ev, `${n} was freed from ${s.vol.bindName}!`);
    }
  }

  /** Announces a faint once and pays out experience. @param {Side} s @param {BattleEvent[]} ev */
  function checkFaint(s, ev) {
    const c = active(s);
    if (c.hp > 0) return false;
    if (s.vol.fainted) return true;
    const n = name(s);
    s.vol = { ...freshVolatile(), fainted: true };
    s.stages = freshStages();
    other(s).vol.bind = 0;
    c.status = null;
    c.sleep = 0;
    ev.push({ t: "faint", side: s.id });
    say(ev, `${n} fainted!`);
    if (s === state.foe) awardExp(s.active, c, ev);
    return true;
  }

  // ---- experience ----

  /** @param {number} foeIndex @param {Creature} foe @param {BattleEvent[]} ev */
  function awardExp(foeIndex, foe, ev) {
    const y = baseExpYield(speciesOf(foe));
    const fought = state.participants.get(foeIndex) || new Set();
    for (const c of state.player.party) {
      if (c.hp <= 0 || c.level >= MAX_LEVEL) continue;
      const gained = expGain({ yield: y, foeLevel: foe.level, level: c.level, trainer: state.kind === "trainer", participant: fought.has(c.uid) });
      c.exp += gained;
      ev.push({ t: "exp", uid: c.uid, gained });
      say(ev, `${displayName(dex, c)} gained ${gained} EXP!`);
      levelUp(c, ev);
    }
  }

  /** @param {Creature} c @param {BattleEvent[]} ev */
  function levelUp(c, ev) {
    const sp = speciesOf(c);
    const target = Math.min(MAX_LEVEL, levelForExp(c.exp));
    while (c.level < target) {
      const before = statsOf(sp, c).hp;
      c.level++;
      c.hp += statsOf(sp, c).hp - before;
      state.leveled.add(c.uid);
      ev.push({ t: "levelup", uid: c.uid, level: c.level });
      say(ev, `${displayName(dex, c)} grew to level ${c.level}!`);
      if (c === active(state.player)) hpEvent(state.player, ev);
      for (const id of movesLearnedAt(dex, c.species, c.level)) {
        if (c.moves.some((m) => m.id === id)) continue;
        if (c.moves.length < 4) {
          c.moves.push({ id, pp: getMove(id).pp });
          ev.push({ t: "learned", uid: c.uid, move: id });
          say(ev, `${displayName(dex, c)} learned ${getMove(id).name}!`);
        } else if (!state.pendingLearn.some((p) => p.uid === c.uid && p.move === id)) {
          state.pendingLearn.push({ uid: c.uid, move: id });
        }
      }
    }
  }

  /** @param {number} replace @param {BattleEvent[]} ev */
  function resolveLearn(replace, ev) {
    const p = state.pendingLearn.shift();
    const c = state.player.party.find((x) => x.uid === p.uid);
    const n = displayName(dex, c);
    const learn = getMove(p.move);
    if (Number.isInteger(replace) && replace >= 0 && replace < c.moves.length) {
      const old = getMove(c.moves[replace].id);
      c.moves[replace] = { id: learn.id, pp: learn.pp };
      if (c === active(state.player) && state.player.vol.charging === replace) state.player.vol.charging = -1;
      say(ev, `1, 2 and... Poof! ${n} forgot ${old.name}.`);
      ev.push({ t: "learned", uid: c.uid, move: learn.id });
      say(ev, `And... ${n} learned ${learn.name}!`);
    } else {
      say(ev, `${n} did not learn ${learn.name}.`);
    }
  }

  // ---- items ----

  /** @param {Side} s @param {{item: string, target?: number, move?: number}} choice @param {BattleEvent[]} ev */
  function useItem(s, choice, ev) {
    const item = ITEM_BY_ID.get(choice.item);
    const e = item.battle;
    s.items[choice.item]--;
    if (s.items[choice.item] <= 0) delete s.items[choice.item];
    s.itemUses++;
    if (e.kind === "ball") return throwBall(item.id, e, ev);
    say(ev, `${userName(s)} used ${item.name}!`);
    const ti = choice.target ?? s.active;
    const c = s.party[ti];
    const isActive = ti === s.active;
    const n = isActive ? name(s) : displayName(dex, c);
    const max = maxHp(c);
    const show = () => {
      if (isActive) hpEvent(s, ev);
    };
    const cureStatus = () => {
      if (!c.status) return;
      c.status = null;
      c.sleep = 0;
      if (isActive) ev.push({ t: "status", side: s.id, status: null });
    };
    switch (e.kind) {
      case "heal": {
        const got = Math.min(max - c.hp, e.hp);
        c.hp += got;
        show();
        if (got > 0) say(ev, c.hp >= max ? `${n}'s HP was fully restored!` : `${n} recovered ${got} HP!`);
        if (e.status === "all") {
          cureStatus();
          if (isActive) s.vol.confusion = 0;
        }
        break;
      }
      case "cure":
        cureStatus();
        if (e.status === "all" && isActive) s.vol.confusion = 0;
        say(ev, `${n} is feeling better!`);
        break;
      case "revive":
        c.hp = Math.max(1, Math.floor(max * e.fraction));
        say(ev, `${n} was revived!`);
        break;
      case "pp": {
        const slot = c.moves[choice.move ?? 0];
        slot.pp = Math.min(getMove(slot.id).pp, slot.pp + e.amount);
        say(ev, `${getMove(slot.id).name}'s PP was restored.`);
        break;
      }
      case "stat":
        changeStages(s, { [e.stat]: e.stages }, ev, false);
        break;
      default:
        say(ev, "Nothing happened.");
    }
  }

  /** @param {string} itemId @param {{multiplier: number, guaranteed?: boolean}} e @param {BattleEvent[]} ev */
  function throwBall(itemId, e, ev) {
    const item = ITEM_BY_ID.get(itemId);
    say(ev, `${state.playerName} threw a ${item.name}!`);
    const f = active(state.foe);
    const roll = e.guaranteed
      ? { shakes: 3, caught: true }
      : rollCatch(rng, { maxHp: maxHp(f), hp: f.hp, rate: catchRate(speciesOf(f)), ball: e.multiplier, status: f.status });
    ev.push({ t: "ball", item: itemId, shakes: roll.shakes, caught: roll.caught });
    if (!roll.caught) return say(ev, SHAKE_TEXT[roll.shakes]);
    say(ev, `Gotcha! ${displayName(dex, f)} was caught!`);
    f.ot = state.playerName;
    f.ball = itemId;
    f.metLevel = f.level;
    if (f.status === "tox") f.status = "psn";
    state.caught = f;
    end("caught", ev);
  }

  return battle;
}
