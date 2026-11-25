// @ts-check
// The battle screen: draws the two sides, plays the engine's events in order with their
// animations and sounds, and asks the player for each decision.

import { createBattle } from "./engine.js";
import { drawFrame, drawText, drawBattleBackground, portraitPixels, drawPixels, objectPixels, BATTLE_LAYOUT } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";
import { say, choose, yesNo, close } from "../ui/text.js";
import { hpBar, expBar, statusLabel, drawCreature, page, partyLine, screen, over, PAPER } from "../ui/widgets.js";
import { summary } from "../ui/screens.js";
import { statsOf, displayName } from "../game/creature.js";
import { ITEM_BY_ID } from "../data/items.js";
import { MOVE_BY_ID } from "../data/moves.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("../game/creature.js").Creature} Creature */
/** @typedef {import("./engine.js").BattleEvent} BattleEvent */
/** @typedef {"player"|"foe"} SideId */

/**
 * @typedef {object} BattleOutcome
 * @property {"win"|"lose"|"run"|"caught"} result
 * @property {Creature} [caught]
 * @property {number} money
 * @property {string[]} evolutions
 */

/**
 * @typedef {object} BattleSetup
 * @property {"wild"|"trainer"} kind
 * @property {Creature[]} foeParty
 * @property {{id: string, name: string, className: string, sprite: string, ai: "basic"|"smart"|"expert", items: Record<string, number>, reward: number, defeat: string}} [trainer]
 * @property {boolean} [canRun]
 * @property {boolean} [canLose]  a story battle whose loss costs nothing
 * @property {string} music
 * @property {string} theme
 */

/**
 * What the screen shows for one side, kept from the events rather than read live: the
 * engine has already applied a whole turn by the time its events play.
 * @typedef {object} Shown
 * @property {Creature|null} c
 * @property {number} hp
 * @property {number} max
 * @property {import("../game/creature.js").Status|null} status
 * @property {number} level
 * @property {number} exp
 * @property {boolean} visible
 * @property {number} dy       sprite offset (fainting slides down)
 * @property {number} dx       sprite offset (sliding in, a hit's shake)
 * @property {boolean} blink   hidden this frame (being hit)
 */

/** @returns {Shown} */
const empty = () => ({ c: null, hp: 0, max: 1, status: null, level: 1, exp: 0, visible: false, dy: 0, dx: 0, blink: false });

/**
 * Run a battle to its end.
 * @param {Game} game @param {BattleSetup} setup
 * @returns {Promise<BattleOutcome>}
 */
export async function runBattle(game, setup) {
  const s = /** @type {import("../game/state.js").State} */ (game.state);
  const battle = createBattle({
    dex: game.dex,
    rng: game.rng,
    kind: setup.kind,
    player: { name: s.name, party: s.party, bag: s.bag, money: setup.canLose ? 0 : s.money },
    foe: { party: setup.foeParty, trainer: setup.trainer },
    canRun: setup.canRun ?? setup.kind === "wild",
    canCatch: setup.kind === "wild",
  });
  const scene = new Scene(game, setup);
  game.audio.playMusic(setup.music);
  await scene.intro();
  try {
    await scene.play(battle.start());
    for (;;) {
      const req = battle.request;
      if (req.kind === "end") {
        await scene.outro(req);
        return { result: req.result, caught: req.caught, money: req.money, evolutions: req.evolutions };
      }
      /** @type {import("./engine.js").Choice|null} */
      let choice = null;
      if (req.kind === "action") choice = await scene.chooseAction();
      else if (req.kind === "switch") choice = await scene.chooseSwitch(true);
      else if (req.kind === "learn") choice = await scene.chooseLearn(req.uid, req.move);
      if (!choice) continue;
      scene.snapshot();
      await scene.play(battle.act(choice));
    }
  } finally {
    scene.close();
  }
}

class Scene {
  /** @param {Game} game @param {BattleSetup} setup */
  constructor(game, setup) {
    this.game = game;
    this.setup = setup;
    /** @type {Record<SideId, Shown>} */
    this.shown = { player: empty(), foe: empty() };
    /** Each creature's HP, status, level and exp before the turn now playing. */
    /** @type {Map<string, {hp: number, status: any, level: number, exp: number}>} */
    this.before = new Map();
    /** The trainer's portrait (intro and outro), or the player's back during the intro. */
    this.portrait = { foe: "", foeX: WIDTH, player: "", playerX: -48 };
    /** @type {{x: number, y: number, item: string}|null} a thrown orb */
    this.orb = null;
    /** @type {import("../game/creature.js").Creature[]} */
    this.playerParty = /** @type {any} */ (game.state).party;
    this.foeParty = setup.foeParty;
    /** The menu entries last picked, so the cursor starts there next turn. */
    this.lastAction = 0;
    this.lastMove = 0;
    this.layer = { draw: (/** @type {CanvasRenderingContext2D} */ ctx) => this.draw(ctx) };
    game.push(this.layer);
    this.snapshot();
  }

  close() {
    this.game.remove(this.layer);
  }

  snapshot() {
    for (const c of [...this.playerParty, ...this.foeParty]) {
      this.before.set(c.uid, { hp: c.hp, status: c.status, level: c.level, exp: c.exp });
    }
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const game = this.game;
    drawBattleBackground(ctx, this.setup.theme);
    const { foe, player } = this.shown;
    if (this.portrait.foe) drawPixels(ctx, portraitPixels(this.portrait.foe), this.portrait.foeX, 4);
    if (this.portrait.player) drawPixels(ctx, portraitPixels("player-back"), this.portrait.playerX, 48);
    if (foe.visible && foe.c && !foe.blink) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, WIDTH, 56);
      ctx.clip();
      // 40×40 sprites drawn at 1.4×, standing on the foe's platform.
      drawCreature(ctx, game, foe.c.species, BATTLE_LAYOUT.foe.x - 28 + foe.dx, BATTLE_LAYOUT.foe.y - 52 + foe.dy, { scale: 1.4 });
      ctx.restore();
    }
    if (player.visible && player.c && !player.blink) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, WIDTH, HEIGHT - 48);
      ctx.clip();
      drawCreature(ctx, game, player.c.species, BATTLE_LAYOUT.player.x - 30 + player.dx, BATTLE_LAYOUT.player.y - 56 + player.dy, { back: true, scale: 1.5 });
      ctx.restore();
    }
    if (this.orb) drawPixels(ctx, objectPixels("itemball"), this.orb.x, this.orb.y);
    if (foe.visible && foe.c) {
      drawText(ctx, displayName(game.dex, foe.c), 8, 4);
      drawText(ctx, statusLabel(foe.status) || `:L${foe.level}`, 24, 14);
      hpBar(ctx, 24, 26, foe.hp, foe.max);
      ctx.fillStyle = "#202820";
      ctx.fillRect(6, 32, 70, 1);
      ctx.fillRect(76, 26, 1, 7);
    }
    if (player.visible && player.c) {
      // The player's box sits on a panel of its own, clear of the foe's platform.
      ctx.fillStyle = PAPER;
      ctx.fillRect(76, 60, WIDTH - 76, 36);
      ctx.fillStyle = "#202820";
      ctx.fillRect(76, 60, 1, 36);
      drawText(ctx, displayName(game.dex, player.c), 80, 62);
      drawText(ctx, statusLabel(player.status) || `:L${player.level}`, 80, 72);
      drawText(ctx, `${String(Math.max(0, player.hp)).padStart(3)}/${String(player.max).padStart(3)}`, 104, 72);
      hpBar(ctx, 96, 83, player.hp, player.max);
      expBar(ctx, 80, 91, 76, { ...player.c, level: player.level, exp: player.exp });
    }
  }

  // The start and the end

  async intro() {
    const game = this.game;
    const setup = this.setup;
    game.audio.playSfx("encounter");
    for (let i = 0; i < 3; i++) {
      game.flash = 1;
      await game.wait(4);
      game.flash = 0;
      await game.wait(4);
    }
    await game.fadeTo(1, 10);
    this.portrait.player = "player-back";
    if (setup.trainer) this.portrait.foe = setup.trainer.sprite;
    else this.setShown("foe", this.foeParty[0], true);
    this.shown.foe.dx = setup.trainer ? 0 : -110;
    this.portrait.foeX = setup.trainer ? -48 : WIDTH;
    await game.fadeTo(0, 10);
    // Both sides slide into place.
    for (let f = 0; f <= 30; f++) {
      const t = f / 30;
      this.portrait.playerX = Math.round(-48 + (12 + 48) * t);
      if (setup.trainer) this.portrait.foeX = Math.round(-48 + (100 + 48) * t);
      else this.shown.foe.dx = Math.round(-110 * (1 - t));
      await game.frame();
    }
    if (!setup.trainer) game.audio.playCry(this.foeParty[0].species);
  }

  /** @param {import("./engine.js").Request & {kind: "end"}} req */
  async outro(req) {
    const game = this.game;
    if (req.result === "win" && this.setup.trainer) {
      game.audio.playMusic(this.setup.trainer.className === "Warden" || this.setup.trainer.className === "Council" || this.setup.trainer.className === "Champion" ? "victory-warden" : "victory-trainer");
      this.portrait.foe = this.setup.trainer.sprite;
      for (let f = 0; f <= 20; f++) {
        this.portrait.foeX = Math.round(WIDTH - (WIDTH - 100) * (f / 20));
        await game.frame();
      }
      await say(game, this.setup.trainer.defeat);
    } else if (req.result === "win") {
      game.audio.playMusic("victory-wild");
    }
    await game.fadeTo(1, 14);
    game.fade = 0;
  }

  /**
   * @param {SideId} side @param {Creature} c @param {boolean} visible
   */
  setShown(side, c, visible) {
    const b = this.before.get(c.uid) ?? { hp: c.hp, status: c.status, level: c.level, exp: c.exp };
    const sp = this.game.dex.get(c.species);
    const max = statsOf(sp, { ...c, level: b.level }).hp;
    this.shown[side] = { c, hp: b.hp, max, status: b.status, level: b.level, exp: b.exp, visible, dx: 0, dy: 0, blink: false };
  }

  // Playing events

  /** @param {BattleEvent[]} events */
  async play(events) {
    const game = this.game;
    for (const e of events) {
      switch (e.t) {
        case "text":
          await say(game, e.text, { auto: 70 });
          break;
        case "sendout": {
          const party = e.side === "player" ? this.playerParty : this.foeParty;
          const c = party[e.index];
          if (e.side === "player" && this.portrait.player) {
            for (let f = 0; f < 16; f++) {
              this.portrait.playerX -= 4;
              await game.frame();
            }
            this.portrait.player = "";
          }
          if (e.side === "foe" && this.portrait.foe) {
            for (let f = 0; f < 16; f++) {
              this.portrait.foeX += 5;
              await game.frame();
            }
            this.portrait.foe = "";
          }
          this.setShown(e.side, c, true);
          const sh = this.shown[e.side];
          sh.dy = 30;
          game.audio.playSfx("ball-click");
          for (let f = 0; f < 10; f++) {
            sh.dy = Math.round(30 * (1 - f / 10));
            await game.frame();
          }
          sh.dy = 0;
          game.audio.playCry(c.species);
          await game.wait(20);
          break;
        }
        case "withdraw": {
          const sh = this.shown[e.side];
          for (let f = 0; f < 10; f++) {
            sh.dy = f * 3;
            await game.frame();
          }
          sh.visible = false;
          break;
        }
        case "use": {
          const sh = this.shown[e.side];
          const dir = e.side === "player" ? 1 : -1;
          for (let f = 0; f < 8; f++) {
            sh.dx = dir * (f < 4 ? f * 2 : (8 - f) * 2);
            await game.frame();
          }
          sh.dx = 0;
          break;
        }
        case "hp": {
          const sh = this.shown[e.side];
          if (e.hp < sh.hp) {
            // The hit: the creature blinks.
            for (let f = 0; f < 4; f++) {
              sh.blink = !sh.blink;
              await game.wait(4);
            }
            sh.blink = false;
          }
          sh.max = e.max;
          const from = sh.hp;
          const frames = Math.min(48, Math.max(8, Math.abs(e.hp - from)));
          for (let f = 1; f <= frames; f++) {
            sh.hp = Math.round(from + ((e.hp - from) * f) / frames);
            await game.frame();
          }
          sh.hp = e.hp;
          break;
        }
        case "effectiveness":
          game.audio.playSfx(e.value > 1 ? "hit-super" : e.value < 1 ? "hit-weak" : "hit");
          break;
        case "crit":
          game.audio.playSfx("hit-super");
          break;
        case "miss":
          break;
        case "status":
          this.shown[e.side].status = e.status;
          if (e.status) game.audio.playSfx("status");
          break;
        case "stat":
          game.audio.playSfx(e.stages > 0 ? "statup" : "statdown");
          await game.wait(20);
          break;
        case "faint": {
          const sh = this.shown[e.side];
          if (sh.c) game.audio.playCry(sh.c.species);
          await game.wait(20);
          game.audio.playSfx("faint");
          for (let f = 0; f < 16; f++) {
            sh.dy = f * 4;
            await game.frame();
          }
          sh.visible = false;
          sh.dy = 0;
          break;
        }
        case "exp": {
          const sh = this.shown.player;
          if (sh.c && sh.c.uid === e.uid) {
            game.audio.playSfx("exp");
            const from = sh.exp;
            for (let f = 1; f <= 30; f++) {
              sh.exp = Math.round(from + (e.gained * f) / 30);
              await game.frame();
            }
          }
          const b = this.before.get(e.uid);
          if (b) b.exp += e.gained;
          break;
        }
        case "levelup": {
          const sh = this.shown.player;
          const b = this.before.get(e.uid);
          if (b) b.level = e.level;
          if (sh.c && sh.c.uid === e.uid) {
            const sp = game.dex.get(sh.c.species);
            const oldMax = sh.max;
            sh.level = e.level;
            sh.max = statsOf(sp, { ...sh.c, level: e.level }).hp;
            sh.hp += sh.max - oldMax;
          }
          await game.audio.jingle("levelup");
          break;
        }
        case "learned":
          break;
        case "ball":
          await this.throwOrb(e.item, e.shakes, e.caught);
          break;
        case "money":
          break;
      }
    }
  }

  /** @param {string} item @param {number} shakes @param {boolean} caught */
  async throwOrb(item, shakes, caught) {
    const game = this.game;
    const foe = this.shown.foe;
    game.audio.playSfx("ball-throw");
    for (let f = 0; f <= 20; f++) {
      const t = f / 20;
      this.orb = { item, x: Math.round(24 + (BATTLE_LAYOUT.foe.x - 8 - 24) * t), y: Math.round(80 - (80 - BATTLE_LAYOUT.foe.y + 16) * t - 30 * Math.sin(t * Math.PI)) };
      await game.frame();
    }
    foe.visible = false;
    game.audio.playSfx("ball-click");
    await game.wait(20);
    for (let i = 0; i < shakes; i++) {
      game.audio.playSfx("ball-shake");
      const o = /** @type {{x: number, y: number, item: string}} */ (this.orb);
      for (let f = 0; f < 12; f++) {
        o.x = BATTLE_LAYOUT.foe.x - 8 + (f < 6 ? 2 : -2);
        await game.frame();
      }
      o.x = BATTLE_LAYOUT.foe.x - 8;
      await game.wait(18);
    }
    if (caught) {
      game.audio.playSfx("ball-click");
      game.audio.stopMusic();
      await game.audio.jingle("caught");
    } else {
      this.orb = null;
      foe.visible = true;
      if (foe.c) game.audio.playCry(foe.c.species);
    }
  }

  // Decisions

  /** @returns {Promise<import("./engine.js").Choice|null>} */
  async chooseAction() {
    const game = this.game;
    const me = this.shown.player.c;
    for (;;) {
      // The prompt on the left of the text area, the four actions on the right.
      const prompt = {
        draw: (/** @type {CanvasRenderingContext2D} */ ctx) => {
          drawFrame(ctx, 0, HEIGHT - 48, 96, 48);
          drawText(ctx, "What will", 8, HEIGHT - 42);
          drawText(ctx, me ? displayName(game.dex, me) : "you", 8, HEIGHT - 30);
          drawText(ctx, "do?", 8, HEIGHT - 18);
        },
      };
      game.push(prompt);
      let i;
      try {
        i = await choose(game, ["FIGHT", "BAG", "PARTY", "RUN"], { x: 96, y: HEIGHT - 48, width: 64, cancel: false, start: this.lastAction ?? 0, compact: true });
      } finally {
        game.remove(prompt);
      }
      this.lastAction = i;
      if (i === 0) {
        const m = await this.chooseMove();
        if (m != null) return { type: "move", index: m };
      } else if (i === 1) {
        const c = await this.chooseItem();
        if (c) return c;
      } else if (i === 2) {
        const c = await this.chooseSwitch(false);
        if (c) return c;
      } else {
        if (this.setup.kind === "trainer") {
          await say(game, "There's no running from a trainer battle!");
          continue;
        }
        return { type: "run" };
      }
    }
  }

  /** @returns {Promise<number|null>} */
  async chooseMove() {
    const game = this.game;
    const me = this.shown.player.c;
    if (!me) return null;
    if (me.moves.every((m) => m.pp <= 0)) return 0;
    let hover = this.lastMove ?? 0;
    const info = {
      draw: (/** @type {CanvasRenderingContext2D} */ ctx) => {
        const m = me.moves[hover];
        const mv = m && MOVE_BY_ID.get(m.id);
        drawFrame(ctx, 0, 56, 88, 40);
        if (mv) {
          drawText(ctx, "TYPE/", 8, 64);
          drawText(ctx, mv.type.toUpperCase(), 16, 74);
          drawText(ctx, `PP ${m.pp}/${mv.pp}`, 16, 84);
        }
      },
    };
    game.push(info);
    try {
      for (;;) {
        const labels = me.moves.map((m) => MOVE_BY_ID.get(m.id)?.name ?? m.id);
        const i = await choose(game, labels, { x: 0, y: HEIGHT - 48, width: WIDTH, start: hover, onMove: (k) => (hover = k), rows: 4, compact: true });
        if (i < 0) return null;
        if (me.moves[i].pp <= 0) {
          await say(game, "There's no PP left for this move!");
          continue;
        }
        this.lastMove = i;
        return i;
      }
    } finally {
      game.remove(info);
    }
  }

  /** @returns {Promise<import("./engine.js").Choice|null>} */
  async chooseItem() {
    const game = this.game;
    const s = /** @type {import("../game/state.js").State} */ (game.state);
    const ids = Object.keys(s.bag).filter((id) => {
      const it = ITEM_BY_ID.get(id);
      if (!it?.battle) return false;
      if (it.battle.kind === "ball" && this.setup.kind !== "wild") return false;
      return true;
    });
    if (!ids.length) {
      await say(game, "There's nothing in the bag to use here.");
      return null;
    }
    const labels = ids.map((id) => `${(ITEM_BY_ID.get(id)?.name ?? id).padEnd(13).slice(0, 13)}×${String(s.bag[id]).padStart(2)}`);
    const i = await choose(game, labels, { x: 0, y: 0, width: WIDTH, rows: 5 });
    if (i < 0) return null;
    const it = /** @type {import("../data/items.js").Item} */ (ITEM_BY_ID.get(ids[i]));
    const e = /** @type {NonNullable<typeof it.battle>} */ (it.battle);
    if (e.kind === "ball" || e.kind === "stat") return { type: "item", item: it.id };
    const t = await this.pickPartyMember(`Use ${it.name} on which?`);
    if (t < 0) return null;
    if (e.kind === "pp") {
      const c = this.playerParty[t];
      const k = await choose(game, c.moves.map((m) => `${MOVE_BY_ID.get(m.id)?.name ?? m.id} ${m.pp}`), { x: 24, y: 24, width: 136 });
      if (k < 0) return null;
      return { type: "item", item: it.id, target: t, move: k };
    }
    return { type: "item", item: it.id, target: t };
  }

  /** @param {string} prompt */
  async pickPartyMember(prompt) {
    const game = this.game;
    const party = this.playerParty;
    let i = 0;
    const input = game.input;
    return screen(
      game,
      (ctx) => {
        page(ctx);
        party.forEach((c, k) => {
          partyLine(ctx, game, c, 8, 4 + k * 20);
          if (k === i) drawText(ctx, "▶", 0, 4 + k * 20);
        });
        drawFrame(ctx, 0, HEIGHT - 24, WIDTH, 24);
        drawText(ctx, prompt, 8, HEIGHT - 16);
      },
      () => {
        if (input.repeat("up")) i = (i + party.length - 1) % party.length;
        else if (input.repeat("down")) i = (i + 1) % party.length;
        else if (input.pressed("a")) return i;
        else if (input.pressed("b")) return -1;
        return undefined;
      },
    );
  }

  /**
   * @param {boolean} forced after a faint: no cancelling
   * @returns {Promise<import("./engine.js").Choice|null>}
   */
  async chooseSwitch(forced) {
    const game = this.game;
    const party = this.playerParty;
    for (;;) {
      const i = await this.pickPartyMember(forced ? "Bring out which?" : "Choose a creature.");
      if (i < 0) {
        if (forced) continue;
        return null;
      }
      const c = party[i];
      const act = await over(game, (ctx) => page(ctx), () => choose(game, ["SWITCH", "SUMMARY", "CANCEL"], { x: WIDTH - 80, y: HEIGHT - 72, width: 80 }));
      if (act === 1) {
        await summary(game, party, i);
        continue;
      }
      if (act !== 0) continue;
      if (c.hp <= 0) {
        await say(game, `${displayName(game.dex, c)} has no energy left to battle!`);
        continue;
      }
      if (this.shown.player.c === c && this.shown.player.visible) {
        await say(game, `${displayName(game.dex, c)} is already in battle!`);
        continue;
      }
      return { type: "switch", index: i };
    }
  }

  /** @param {string} uid @param {string} moveId @returns {Promise<import("./engine.js").Choice>} */
  async chooseLearn(uid, moveId) {
    const game = this.game;
    const c = /** @type {Creature} */ (this.playerParty.find((x) => x.uid === uid));
    const name = displayName(game.dex, c);
    const mv = MOVE_BY_ID.get(moveId);
    const moveName = mv?.name ?? moveId;
    for (;;) {
      await say(game, `${name} is trying to learn ${moveName}. But it already knows four moves.\fForget a move to make room for ${moveName}?`, { keep: true });
      if (!(await yesNo(game))) {
        close(game);
        await say(game, `${name} did not learn ${moveName}.`);
        return { type: "learn", replace: -1 };
      }
      close(game);
      await say(game, "Which move should be forgotten?", { keep: true });
      const k = await choose(game, c.moves.map((m) => MOVE_BY_ID.get(m.id)?.name ?? m.id), { x: 64, y: 32, width: 96 });
      close(game);
      if (k < 0) continue;
      await say(game, `1, 2 and... Poof! ${name} forgot ${MOVE_BY_ID.get(c.moves[k].id)?.name}.`);
      return { type: "learn", replace: k };
    }
  }
}
