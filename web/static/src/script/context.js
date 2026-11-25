// @ts-check
// The one way map content touches the game. A map's scripts are async functions that take
// a ScriptContext `g`: g.say("..."), await g.battle("trainer-id"), g.setFlag("..."), and so on.
// It also holds the overworld's built-in events: picking up items, trainers spotting the
// player, wild encounters, cutting, surfing, boulders, the storage PC and healing.

import { say, close, choose, yesNo } from "../ui/text.js";
import { DELTA, OPPOSITE } from "../world/map.js";
import { TRAINERS } from "../data/trainers/index.js";
import { ITEM_BY_ID } from "../data/items.js";
import { MOVE_BY_ID } from "../data/moves.js";
import { makeCreature, pickEncounter } from "../battle/spawn.js";
import { runBattle } from "../battle/scene.js";
import { addItem, markDex, receiveCreature } from "../game/state.js";
import { statsOf, displayName } from "../game/creature.js";
import { openShop, openPc, nameEntry, chooseFromParty, evolve, flyMenu, hallOfFame } from "../ui/screens.js";
import { save as writeSave } from "../game/save.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("../world/overworld.js").Overworld} Overworld */
/** @typedef {import("../world/overworld.js").Actor} Actor */
/** @typedef {import("../game/state.js").Dir} Dir */
/** @typedef {import("../game/creature.js").Creature} Creature */
/** @typedef {import("../data/trainers/index.js").TrainerDef} TrainerDef */

/** Thrown to end a script early: the player lost a battle and has been sent to a center. */
export class ScriptEnd extends Error {}

/** The starter families, and which one each beats: Kip takes the one strong against yours. */
export const STARTERS = ["sproufawn", "flaropaw", "hydrefry"];
const RIVAL_OF = { sproufawn: "flaropaw", flaropaw: "hydrefry", hydrefry: "sproufawn" };

/** Money a class earns per level of its last creature, when the trainer doesn't say. */
const PAY = { Warden: 100, Council: 120, Champion: 150, Rival: 40, Director: 80, Admin: 60 };

/**
 * The item's display name.
 * @param {string} id
 */
export function itemName(id) {
  return ITEM_BY_ID.get(id)?.name ?? id;
}

export class ScriptContext {
  /**
   * @param {Game} game
   * @param {Overworld} world
   * @param {Actor|null} [self] the person whose script this is
   */
  constructor(game, world, self = null) {
    this.game = game;
    this.world = world;
    this.self = self;
  }

  get state() {
    return /** @type {import("../game/state.js").State} */ (this.game.state);
  }

  // Text and choices

  /** @param {string} text */
  say(text) {
    return say(this.game, text);
  }

  /**
   * Ask a question; resolves to the index of the answer (or -1 if B when cancel allowed).
   * @param {string} text @param {string[]} answers
   */
  async ask(text, answers) {
    await say(this.game, text, { keep: true });
    const i = await choose(this.game, answers, { cancel: false });
    close(this.game);
    return i;
  }

  /** @param {string} text */
  async yesNo(text) {
    await say(this.game, text, { keep: true });
    const yes = await yesNo(this.game);
    close(this.game);
    return yes;
  }

  // Flags

  /** @param {string} name */
  flag(name) {
    return this.state.flags[name];
  }

  /** @param {string} name @param {boolean|number|string} [v] */
  setFlag(name, v = true) {
    this.state.flags[name] = v;
    this.world.refreshVisibility();
  }

  /** @param {string} name */
  clearFlag(name) {
    delete this.state.flags[name];
    this.world.refreshVisibility();
  }

  // Items and money

  /** @param {string} item @param {number} [n] */
  has(item, n = 1) {
    return (this.state.bag[item] ?? 0) >= n;
  }

  /**
   * Give an item with its jingle and a line saying so.
   * @param {string} item @param {number} [n]
   */
  async give(item, n = 1) {
    const def = ITEM_BY_ID.get(item);
    if (!def) throw new Error(`unknown item ${item}`);
    addItem(this.state, item, n);
    const key = def.pocket === "key";
    this.game.audio.jingle(key ? "key-item" : "item");
    await this.say(`{PLAYER} received ${n > 1 ? n + "× " : ""}${itemName(item)}!`);
  }

  /** @param {string} item @param {number} [n] */
  take(item, n = 1) {
    addItem(this.state, item, -n);
  }

  /** @param {number} delta */
  money(delta) {
    this.state.money = Math.max(0, Math.min(999999, this.state.money + delta));
  }

  // Creatures

  /**
   * Give the player a creature, offering a nickname. Resolves false if there was no room.
   * @param {string} species @param {number} level
   */
  async giveCreature(species, level) {
    const g = this.game;
    const c = makeCreature(g.dex, species, level, g.rng, { ot: this.state.name, metAt: this.world.map?.id ?? "" });
    const where = receiveCreature(this.state, c);
    if (where === "full") {
      await this.say("There's no room for it: the storage PC is full.");
      return false;
    }
    markDex(this.state, species, true);
    g.audio.jingle("caught");
    await this.say(`{PLAYER} received ${g.dex.get(species).name}!`);
    await this.offerNickname(c);
    if (where === "box") await this.say(`${displayName(g.dex, c)} was sent to the storage PC.`);
    return true;
  }

  /** @param {Creature} c */
  async offerNickname(c) {
    const name = this.game.dex.get(c.species).name;
    if (await this.yesNo(`Give a nickname to ${name}?`)) {
      const nick = await nameEntry(this.game, `${name}'s nickname?`, name, 10);
      if (nick && nick !== name) c.nickname = nick;
    }
  }

  /** @param {string} species */
  partyHas(species) {
    return this.state.party.some((c) => c.species === species);
  }

  /** The player's starter species (stage 1), once chosen. */
  starter() {
    return /** @type {string} */ (this.state.flags.starter ?? "");
  }

  /** Heal every creature in the party fully. */
  healParty() {
    for (const c of this.state.party) {
      const sp = this.game.dex.get(c.species);
      c.hp = statsOf(sp, c).hp;
      c.status = null;
      c.sleep = 0;
      for (const m of c.moves) m.pp = maxPP(m.id);
    }
  }

  /** The healing center's nurse: heal, with the machine's jingle, and remember this center. */
  async healCenter() {
    const g = this.game;
    if (!(await this.yesNo("Welcome! Shall I restore your creatures to full health?"))) {
      await this.say("We hope to see you again!");
      return;
    }
    await this.say("I'll take your creatures for a few seconds.", );
    await g.fadeTo(0.5, 6);
    g.audio.jingle("heal");
    await g.wait(110);
    this.healParty();
    await g.fadeTo(0, 6);
    const m = this.world.map;
    const spot = m?.def.heal;
    if (m && spot) this.state.lastCenter = { map: m.id, x: spot.x, y: spot.y };
    await this.say("Your creatures are fighting fit! We hope to see you again!");
  }

  // Battles

  /**
   * Battle a trainer. Resolves true on a win; a loss sends the player to the last center and
   * ends the script.
   * @param {string} id
   * @param {{canLose?: boolean}} [o] canLose: losing continues the story (resolves false) instead of a blackout
   */
  async battle(id, o = {}) {
    const t = TRAINERS[id];
    if (!t) throw new Error(`unknown trainer ${id}`);
    const g = this.game;
    const party = t.party.map((m) => {
      const species = this.resolveSpecies(m.species);
      const c = makeCreature(g.dex, species, m.level, g.rng, { ot: t.name, metAt: "" });
      if (m.moves) c.moves = m.moves.map((mid) => ({ id: mid, pp: maxPP(mid) }));
      return c;
    });
    for (const c of party) markDex(this.state, c.species, false);
    const res = await runBattle(g, {
      kind: "trainer",
      foeParty: party,
      trainer: { id: t.id, name: t.sprite === "rival" ? this.state.rival : t.name, className: t.className, sprite: t.sprite, ai: t.ai ?? "basic", items: { ...(t.items ?? {}) },
        reward: (t.reward ?? PAY[t.className] ?? 20) * t.party[t.party.length - 1].level, defeat: t.defeat },
      music: t.music ?? defaultMusic(t.className),
      canLose: !!o.canLose,
      theme: this.world.map?.def.theme ?? "meadow",
    });
    const won = res.result === "win";
    if (won) this.state.flags[`trainer:${id}`] = true;
    await this.afterBattle(res, !!o.canLose);
    return won;
  }

  /**
   * A wild battle the story sets up (a legendary). Resolves to how it ended.
   * @param {string} species @param {number} level @param {{canRun?: boolean, music?: string}} [o]
   */
  async wild(species, level, o = {}) {
    const g = this.game;
    const c = makeCreature(g.dex, species, level, g.rng, { ot: "", metAt: this.world.map?.id ?? "" });
    markDex(this.state, species, false);
    const res = await runBattle(g, { kind: "wild", foeParty: [c], canRun: o.canRun ?? true, music: o.music ?? "battle-wild",
      theme: this.world.map?.def.theme ?? "meadow" });
    await this.afterBattle(res, false);
    return res.result;
  }

  /**
   * After any battle: money, a caught creature, evolutions, or a blackout.
   * @param {import("../battle/scene.js").BattleOutcome} res @param {boolean} canLose
   */
  async afterBattle(res, canLose) {
    const g = this.game;
    const s = this.state;
    this.world.game.audio.playMusic(this.world.music());
    if (res.result === "lose") {
      if (canLose) {
        this.healParty();
        return;
      }
      // The battle has said what was dropped; it's taken here.
      s.money = Math.max(0, s.money + Math.min(0, res.money));
      await this.say("{PLAYER} hurried back to a healing center...");
      this.healParty();
      await this.world.warp({ ...s.lastCenter, dir: "up" }, "none");
      throw new ScriptEnd();
    }
    if (res.money > 0) s.money = Math.min(999999, s.money + res.money);
    if (res.result === "caught" && res.caught) {
      const c = res.caught;
      c.ot = s.name;
      markDex(s, c.species, true);
      await this.offerNickname(c);
      const where = receiveCreature(s, c);
      if (where === "box") await this.say(`${displayName(g.dex, c)} was sent to the storage PC.`);
      if (where === "full") await this.say("The storage PC is full, so it was released.");
    }
    for (const uid of res.evolutions ?? []) {
      const c = s.party.find((x) => x.uid === uid);
      const evo = c && g.dex.get(c.species).evolution;
      if (c && evo?.level && c.level >= evo.level) await evolve(g, c, evo.to);
    }
  }

  /** @param {string} species */
  resolveSpecies(species) {
    if (!species.startsWith("@rival")) return species;
    const mine = this.starter() || "sproufawn";
    let id = RIVAL_OF[/** @type {keyof typeof RIVAL_OF} */ (mine)];
    const stage = Number(species.slice(6)) || 1;
    for (let i = 1; i < stage; i++) id = this.game.dex.get(id).evolution?.to ?? id;
    return id;
  }

  // People and movement

  /** @param {string} id */
  npc(id) {
    return this.world.actor(id);
  }

  /**
   * Walk someone (or "player") along a path of moves: "U", "D", "L", "R", each optionally
   * followed by a count ("U3R2").
   * @param {string} id @param {string} path
   */
  async move(id, path) {
    const a = this.world.actor(id);
    for (const [, letter, count] of path.matchAll(/([UDLR])(\d*)/g)) {
      /** @type {Dir} */
      const dir = { U: "up", D: "down", L: "left", R: "right" }[letter];
      for (let i = 0; i < (Number(count) || 1); i++) await this.world.walk(a, dir, { force: id !== "player" });
    }
  }

  /** @param {string} id @param {Dir} dir */
  face(id, dir) {
    this.world.actor(id).dir = dir;
  }

  /** Turn someone toward the player. @param {string} id */
  facePlayer(id) {
    const a = this.world.actor(id), p = this.world.player;
    const dx = p.x - a.x, dy = p.y - a.y;
    a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
  }

  /**
   * Walk someone up to the player (stopping beside them), facing them.
   * @param {string} id
   */
  async approach(id) {
    const a = this.world.actor(id), p = this.world.player;
    for (let guard = 0; guard < 40; guard++) {
      const dx = p.x - a.x, dy = p.y - a.y;
      if (Math.abs(dx) + Math.abs(dy) <= 1) break;
      /** @type {Dir} */
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      await this.world.walk(a, dir, { force: true });
    }
    this.facePlayer(id);
    p.dir = OPPOSITE[a.dir];
  }

  /** Show "!" over someone's head for a moment. @param {string} id */
  async exclaim(id) {
    const a = this.world.actor(id);
    a.emote = "!";
    this.game.audio.playSfx("encounter");
    await this.game.wait(36);
    a.emote = null;
  }

  /** @param {string} id */
  hide(id) {
    this.world.actor(id).hidden = true;
  }

  /** @param {string} id */
  show(id) {
    this.world.actor(id).hidden = false;
  }

  /** @param {number} frames */
  wait(frames) {
    return this.game.wait(frames);
  }

  /** @param {string} id */
  music(id) {
    this.game.audio.playMusic(id);
  }

  /** Back to the map's own music. */
  mapMusic() {
    this.game.audio.playMusic(this.world.music());
  }

  /** @param {string} id */
  sfx(id) {
    this.game.audio.playSfx(id);
  }

  /** @param {string} id */
  async jingle(id) {
    await this.game.audio.jingle(id);
  }

  /**
   * @param {string} map @param {number} x @param {number} y @param {Dir} [dir]
   */
  warp(map, x, y, dir) {
    return this.world.warp({ map, x, y, dir }, "door");
  }

  // Services

  /** @param {string[]} items */
  shop(items) {
    return openShop(this.game, items);
  }

  pc() {
    return openPc(this.game);
  }

  /**
   * Award a Warden's badge: the jingle and the line.
   * @param {string} wardenId @param {string} badgeName
   */
  async badge(wardenId, badgeName) {
    if (!this.state.badges.includes(wardenId)) this.state.badges.push(wardenId);
    this.game.audio.jingle("badge");
    await this.say(`{PLAYER} received the ${badgeName}!`);
  }

  /** @param {string} name e.g. "the rival's name?" @param {string} def @param {number} [max] */
  nameEntry(name, def, max = 7) {
    return nameEntry(this.game, name, def, max);
  }

  /** Pick a creature from the party; resolves to its index or -1. @param {string} prompt */
  chooseFromParty(prompt) {
    return chooseFromParty(this.game, prompt);
  }

  /** Save without asking (the game's own save before the High Council, say). */
  save() {
    writeSave(this.game.store, this.state);
  }

  /** The end of the game: the hall of fame and the credits. */
  async ending() {
    await hallOfFame(this.game);
  }

  /** How many species the player has caught. */
  caughtCount() {
    return this.state.dex.caught.length;
  }
}

/** A move's full PP. @param {string} moveId */
export function maxPP(moveId) {
  const m = MOVE_BY_ID.get(moveId);
  if (!m) throw new Error(`unknown move ${moveId}`);
  return m.pp;
}

/** @param {string} cls */
function defaultMusic(cls) {
  if (cls === "Warden") return "battle-warden";
  if (cls === "Council") return "battle-council";
  if (cls === "Champion") return "battle-champion";
  if (cls === "Grunt" || cls === "Admin" || cls === "Director") return "battle-villain";
  return "battle-trainer";
}

/**
 * The overworld's built-in events, run through a ScriptContext.
 */
export class Scripts {
  /** @param {Game} game @param {Overworld} world */
  constructor(game, world) {
    this.game = game;
    this.world = world;
  }

  /**
   * Run a content script. A ScriptEnd (a blackout) just stops it. Resolves true if the
   * script ran to its end.
   * @param {import("../world/map.js").Script} fn @param {string} where @param {Actor} [self]
   */
  async run(fn, where, self) {
    const g = new ScriptContext(this.game, this.world, self ?? null);
    try {
      await fn(g);
      return true;
    } catch (e) {
      if (e instanceof ScriptEnd) return false;
      throw new Error(`script ${where}: ${e instanceof Error ? e.message : e}`, { cause: e });
    } finally {
      close(this.game);
    }
  }

  /** @param {string} text */
  say(text) {
    return say(this.game, text);
  }

  /** @param {string} item @param {number} count @param {string} flag */
  async pickUp(item, count, flag) {
    const s = /** @type {import("../game/state.js").State} */ (this.game.state);
    s.flags[flag] = true;
    addItem(s, item, count);
    this.game.audio.jingle(ITEM_BY_ID.get(item)?.pocket === "key" ? "key-item" : "item");
    await say(this.game, `{PLAYER} found ${count > 1 ? count + "× " : ""}${itemName(item)}!`);
  }

  /**
   * A trainer: spotted (walks over first) or talked to.
   * @param {Actor} a @param {boolean} spotted
   */
  async trainer(a, spotted) {
    const d = /** @type {import("../world/map.js").NpcDef} */ (a.def);
    const t = TRAINERS[/** @type {string} */ (d.trainer)];
    if (!t) throw new Error(`unknown trainer ${d.trainer}`);
    const s = /** @type {import("../game/state.js").State} */ (this.game.state);
    const g = new ScriptContext(this.game, this.world, a);
    if (s.flags[`trainer:${t.id}`]) {
      await g.say(t.after);
      return;
    }
    if (spotted) {
      this.game.audio.playMusic(defaultMusic(t.className) === "battle-villain" ? "villain" : "rival");
      await g.exclaim(a.id);
      await g.approach(a.id);
    }
    await g.say(t.intro);
    try {
      await g.battle(t.id);
    } catch (e) {
      if (e instanceof ScriptEnd) return;
      throw e;
    }
  }

  /** @param {import("../world/map.js").EncounterTable} table */
  async wildEncounter(table) {
    const game = this.game;
    const s = /** @type {import("../game/state.js").State} */ (game.state);
    const pick = pickEncounter(table.table, game.rng);
    const lead = s.party.find((c) => c.hp > 0);
    if (s.repel > 0 && lead && pick.level < lead.level) return;
    const g = new ScriptContext(game, this.world);
    try {
      await g.wild(pick.species, pick.level);
    } catch (e) {
      if (!(e instanceof ScriptEnd)) throw e;
    }
  }

  /** @param {import("../world/map.js").WorldMap} m @param {number} x @param {number} y */
  async cutTree(m, x, y) {
    const s = /** @type {import("../game/state.js").State} */ (this.game.state);
    if (!s.bag["brush-cutter"]) {
      await say(this.game, "This tree looks like it could be cut down.");
      return;
    }
    await say(this.game, "{PLAYER} used the Brush Cutter!", { auto: 30 });
    this.game.audio.playSfx("cut");
    m.cut.add(`${x},${y}`);
  }

  async water() {
    const s = /** @type {import("../game/state.js").State} */ (this.game.state);
    const g = new ScriptContext(this.game, this.world);
    const rod = s.bag["good-rod"] ? "goodRod" : s.bag["old-rod"] ? "oldRod" : null;
    const opts = [];
    if (s.bag["tide-board"]) opts.push("Ride the board");
    if (rod) opts.push("Fish");
    if (!opts.length) {
      await g.say("The water is a deep blue.");
      return;
    }
    const i = await g.ask("The water is a deep blue.", [...opts, "Cancel"]);
    const choice = opts[i];
    if (choice === "Ride the board") {
      await g.say("{PLAYER} got on the Tide Board!", );
      s.surfing = true;
      s.biking = false;
      this.world.player.sprite = "surf";
      this.game.audio.playMusic("surf");
      const p = this.world.player;
      await this.world.walk(p, p.dir, { force: true });
    } else if (choice === "Fish" && rod) {
      const table = this.world.map?.def.encounters?.[rod];
      await g.say("{PLAYER} cast the line...", );
      await g.wait(40);
      if (!table || !this.game.rng.chance(rod === "goodRod" ? 0.85 : 0.7)) {
        await g.say("Not even a nibble...");
        return;
      }
      await g.say("Something's on the line!");
      const pick = pickEncounter(table.table, this.game.rng);
      try {
        await g.wild(pick.species, pick.level);
      } catch (e) {
        if (!(e instanceof ScriptEnd)) throw e;
      }
    }
  }

  /** @param {Actor} a */
  async boulder(a) {
    const s = /** @type {import("../game/state.js").State} */ (this.game.state);
    if (!s.bag["power-gloves"]) {
      await say(this.game, "It's a big boulder. It won't budge.");
      return;
    }
    const dir = this.world.player.dir;
    const [dx, dy] = DELTA[dir];
    if (!this.world.passable(a, a.x + dx, a.y + dy)) {
      this.game.audio.playSfx("bump");
      return;
    }
    this.game.audio.playSfx("push");
    await this.world.walk(a, dir);
  }

  pc() {
    return openPc(this.game);
  }
}

export { flyMenu };
