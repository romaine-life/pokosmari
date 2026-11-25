// @ts-check
// The game's screens: the party and a creature's summary, naming, the shop, the storage PC,
// evolution, the Wing Whistle's town list and the hall of fame.

import { drawFrame, drawText } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";
import { say, choose, yesNo, askNumber, close } from "./text.js";
import { page, partyLine, drawCreature, hpBar, expBar, statusLabel, screen, over, titleBar, PAPER } from "./widgets.js";
import { statsOf, displayName, expForLevel } from "../game/creature.js";
import { ITEM_BY_ID } from "../data/items.js";
import { MOVE_BY_ID } from "../data/moves.js";
import { movesLearnedAt } from "../data/learnsets.js";
import { addItem, markDex, receiveCreature, PARTY_MAX } from "../game/state.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("../game/creature.js").Creature} Creature */
/** @typedef {import("../game/state.js").State} State */

/** @param {Game} game */
const st = (game) => /** @type {State} */ (game.state);

// The party

/**
 * The party list. Resolves to the index picked, or -1.
 * @param {Game} game @param {string} prompt @param {{start?: number, mark?: number}} [o] mark: a row drawn as being moved
 */
async function partyList(game, prompt, o = {}) {
  const s = st(game);
  let i = Math.min(o.start ?? 0, s.party.length - 1);
  const input = game.input;
  return screen(
    game,
    (ctx) => {
      page(ctx);
      s.party.forEach((c, k) => {
        partyLine(ctx, game, c, 8, 4 + k * 20);
        if (k === i) drawText(ctx, "▶", 0, 4 + k * 20);
        if (k === o.mark) drawText(ctx, "▷", 0, 4 + k * 20);
      });
      drawFrame(ctx, 0, HEIGHT - 24, WIDTH, 24);
      drawText(ctx, prompt, 8, HEIGHT - 16);
    },
    () => {
      if (input.repeat("up")) i = (i + s.party.length - 1) % s.party.length;
      else if (input.repeat("down")) i = (i + 1) % s.party.length;
      else if (input.pressed("a")) {
        game.audio.playSfx("select");
        return i;
      } else if (input.pressed("b")) {
        game.audio.playSfx("cancel");
        return -1;
      }
      return undefined;
    },
  );
}

/**
 * Pick a creature from the party (for an item, a script). Resolves to its index or -1.
 * @param {Game} game @param {string} prompt
 */
export function chooseFromParty(game, prompt) {
  return partyList(game, prompt);
}

/** The party screen from the start menu: summaries and reordering. @param {Game} game */
export async function partyScreen(game) {
  const s = st(game);
  let at = 0;
  for (;;) {
    const i = await partyList(game, "Choose a creature.", { start: at });
    if (i < 0) return;
    at = i;
    const pick = await over(game, (ctx) => drawPartyBehind(ctx, game, i), () =>
      choose(game, ["SUMMARY", "SWITCH", "CANCEL"], { x: WIDTH - 80, y: HEIGHT - 72, width: 80 }),
    );
    if (pick === 0) await summary(game, s.party, i);
    if (pick === 1) {
      const j = await partyList(game, "Move to where?", { start: i, mark: i });
      if (j >= 0 && j !== i) {
        [s.party[i], s.party[j]] = [s.party[j], s.party[i]];
        at = j;
      }
    }
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {Game} game @param {number} i */
function drawPartyBehind(ctx, game, i) {
  page(ctx);
  st(game).party.forEach((c, k) => {
    partyLine(ctx, game, c, 8, 4 + k * 20);
    if (k === i) drawText(ctx, "▶", 0, 4 + k * 20);
  });
}

/**
 * A creature's summary: two pages (stats, moves); left/right or A turns, B leaves, up/down
 * moves through the list.
 * @param {Game} game @param {Creature[]} list @param {number} start
 */
export async function summary(game, list, start) {
  let i = start;
  let pg = 0;
  const input = game.input;
  await screen(
    game,
    (ctx) => {
      const c = list[i];
      const sp = game.dex.get(c.species);
      const stats = statsOf(sp, c);
      page(ctx);
      drawCreature(ctx, game, c.species, 4, 4);
      drawText(ctx, `No.${String(sp.num).padStart(3, "0")}`, 52, 4);
      drawText(ctx, displayName(game.dex, c), 52, 16);
      drawText(ctx, `:L${c.level}`, 52, 28);
      drawText(ctx, sp.types.map((t) => t.toUpperCase()).join("/"), 52, 40);
      if (pg === 0) {
        hpBar(ctx, 20, 54, c.hp, stats.hp);
        drawText(ctx, `${Math.max(0, c.hp)}/${stats.hp}`, 80, 52);
        drawText(ctx, `STATUS/${c.hp <= 0 ? "FNT" : statusLabel(c.status) || "OK"}`, 4, 64);
        const rows = [["ATTACK", stats.atk], ["DEFENSE", stats.def], ["SP.ATK", stats.spa], ["SP.DEF", stats.spd], ["SPEED", stats.spe]];
        rows.forEach(([n, v], k) => {
          drawText(ctx, String(n), 4, 78 + k * 10);
          drawText(ctx, String(v).padStart(3), 64, 78 + k * 10);
        });
        drawText(ctx, "EXP", 96, 78);
        drawText(ctx, String(c.exp), 96, 88);
        drawText(ctx, "NEXT", 96, 100);
        drawText(ctx, c.level >= 100 ? "-" : String(expForLevel(c.level + 1) - c.exp), 96, 110);
        expBar(ctx, 96, 122, 56, c);
        drawText(ctx, `OT/${c.ot}`, 4, 134);
      } else {
        c.moves.forEach((m, k) => {
          const mv = MOVE_BY_ID.get(m.id);
          const y = 56 + k * 22;
          drawText(ctx, mv?.name ?? m.id, 8, y);
          drawText(ctx, `${(mv?.type ?? "").toUpperCase()}`, 16, y + 10);
          drawText(ctx, `PP ${m.pp}/${mv?.pp ?? 0}`, 88, y + 10);
        });
      }
      drawText(ctx, pg === 0 ? "▶" : "◀", WIDTH - 10, 4);
    },
    () => {
      if (input.pressed("b")) return true;
      if (input.pressed("a") || input.pressed("right") || input.pressed("left")) pg ^= 1;
      if (input.repeat("up") && list.length > 1) i = (i + list.length - 1) % list.length;
      if (input.repeat("down") && list.length > 1) i = (i + 1) % list.length;
      if (input.pressed("up") || input.pressed("down")) game.audio.playCry(list[i].species);
      return undefined;
    },
  );
}

// Naming

const KEYBOARD = [
  "ABCDEFGHI",
  "JKLMNOPQR",
  "STUVWXYZ ",
  "abcdefghi",
  "jklmnopqr",
  "stuvwxyz ",
  "0123456789".slice(0, 9),
  "9-.,'!?& ",
];

/**
 * A name on the on-screen keyboard (or typed: letters, digits and Backspace work too).
 * Resolves to the name, or the default if left empty.
 * @param {Game} game @param {string} prompt @param {string} def @param {number} max
 */
export async function nameEntry(game, prompt, def, max) {
  let name = "";
  let cx = 0, cy = 0;
  const rows = KEYBOARD.length;
  const input = game.input;
  /** Typed characters, collected from the keyboard while this screen is open. */
  /** @type {string[]} */
  const typed = [];
  /** @param {KeyboardEvent} e */
  const onKey = (e) => {
    if (e.key.length === 1 && /[A-Za-z0-9 \-.,'!?&]/.test(e.key) && !e.ctrlKey && !e.metaKey) typed.push(e.key);
  };
  const win = typeof window !== "undefined" ? window : null;
  win?.addEventListener("keydown", onKey);
  try {
    return await screen(
      game,
      (ctx) => {
        page(ctx);
        drawText(ctx, prompt, 8, 4);
        drawText(ctx, name + (Math.floor(game.frameCount / 16) % 2 ? "_" : ""), 24, 20);
        ctx.fillStyle = "#202820";
        ctx.fillRect(24, 30, max * 8, 1);
        drawFrame(ctx, 0, 36, WIDTH, HEIGHT - 36);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < 9; x++) drawText(ctx, KEYBOARD[y][x], 24 + x * 14, 44 + y * 10);
        }
        drawText(ctx, "DEL  END", 24 + 0, 44 + rows * 10 + 2);
        const onBottom = cy === rows;
        drawText(ctx, "▶", onBottom ? 16 + cx * 40 : 16 + cx * 14, onBottom ? 44 + rows * 10 + 2 : 44 + cy * 10);
      },
      () => {
        for (const ch of typed.splice(0)) if (name.length < max) name += ch;
        if (input.repeat("up")) cy = (cy + rows) % (rows + 1);
        else if (input.repeat("down")) cy = (cy + 1) % (rows + 1);
        else if (input.repeat("left")) cx = cy === rows ? (cx + 1) % 2 : (cx + 8) % 9;
        else if (input.repeat("right")) cx = cy === rows ? (cx + 1) % 2 : (cx + 1) % 9;
        if (cy === rows && cx > 1) cx = 1;
        if (input.pressed("b")) name = name.slice(0, -1);
        if (input.pressed("start")) return name.trim() || def;
        if (input.pressed("a")) {
          game.audio.playSfx("select");
          if (cy === rows) {
            if (cx === 0) name = name.slice(0, -1);
            else return name.trim() || def;
          } else if (name.length < max) name += KEYBOARD[cy][cx];
          else cy = rows, cx = 1;
        }
        return undefined;
      },
    );
  } finally {
    win?.removeEventListener("keydown", onKey);
  }
}

// The shop

/**
 * A mart counter: buy from `stock`, sell from the bag.
 * @param {Game} game @param {string[]} stock item ids
 */
export async function openShop(game, stock) {
  const s = st(game);
  const money = { draw: (/** @type {CanvasRenderingContext2D} */ ctx) => moneyBox(ctx, s.money) };
  game.push(money);
  try {
    await say(game, "Hi there! May I help you?", { keep: true });
    for (;;) {
      const what = await choose(game, ["BUY", "SELL", "QUIT"], { x: 0, y: 0, width: 64 });
      close(game);
      if (what === 0) await buy(game, stock);
      else if (what === 1) await sell(game);
      else break;
      await say(game, "Is there anything else I can do?", { keep: true });
    }
    close(game);
    await say(game, "Thank you! Please come again!");
  } finally {
    game.remove(money);
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} m */
function moneyBox(ctx, m) {
  drawFrame(ctx, WIDTH - 72, 0, 72, 24);
  drawText(ctx, "$" + String(m).padStart(6), WIDTH - 64, 8);
}

/** @param {Game} game @param {string[]} stock */
async function buy(game, stock) {
  const s = st(game);
  const items = stock.map((id) => /** @type {import("../data/items.js").Item} */ (ITEM_BY_ID.get(id)));
  let at = 0;
  for (;;) {
    const labels = items.map((it) => `${it.name.padEnd(12).slice(0, 12)}${String(it.price).padStart(5)}`);
    const i = await choose(game, [...labels, "CANCEL"], { x: 0, y: 24, width: WIDTH, rows: 4, start: at });
    if (i < 0 || i === items.length) return;
    at = i;
    const it = items[i];
    const max = Math.min(99, Math.floor(s.money / it.price));
    if (max < 1) {
      await say(game, "You don't have enough money.");
      continue;
    }
    await say(game, `${it.name}? How many?`, { keep: true });
    const n = await askNumber(game, { max, each: it.price });
    close(game);
    if (n < 1) continue;
    await say(game, `${it.name}, ×${n}. That'll be $${n * it.price}. OK?`, { keep: true });
    if (await yesNo(game)) {
      close(game);
      s.money -= n * it.price;
      addItem(s, it.id, n);
      game.audio.playSfx("ball-click");
      await say(game, "Here you are! Thank you!");
    } else close(game);
  }
}

/** @param {Game} game */
async function sell(game) {
  const s = st(game);
  for (;;) {
    const ids = Object.keys(s.bag).filter((id) => ITEM_BY_ID.get(id)?.pocket !== "key" && (ITEM_BY_ID.get(id)?.price ?? 0) > 0);
    if (!ids.length) {
      await say(game, "You don't have anything I can buy.");
      return;
    }
    const labels = ids.map((id) => `${(ITEM_BY_ID.get(id)?.name ?? id).padEnd(12).slice(0, 12)} ×${String(s.bag[id]).padStart(2)}`);
    const i = await choose(game, [...labels, "CANCEL"], { x: 0, y: 24, width: WIDTH, rows: 4 });
    if (i < 0 || i === ids.length) return;
    const it = /** @type {import("../data/items.js").Item} */ (ITEM_BY_ID.get(ids[i]));
    const each = Math.floor(it.price / 2);
    await say(game, `How many ${it.name}?`, { keep: true });
    const n = await askNumber(game, { max: s.bag[it.id], each });
    close(game);
    if (n < 1) continue;
    await say(game, `I can pay $${n * each}. Is that OK?`, { keep: true });
    if (await yesNo(game)) {
      close(game);
      addItem(s, it.id, -n);
      s.money = Math.min(999999, s.money + n * each);
      game.audio.playSfx("ball-click");
    } else close(game);
  }
}

// The storage PC

/** The storage PC: withdraw, deposit, release. @param {Game} game */
export async function openPc(game) {
  const s = st(game);
  game.audio.playSfx("menu-open");
  await say(game, "{PLAYER} turned on the PC.", { keep: true });
  for (;;) {
    const what = await choose(game, ["WITHDRAW", "DEPOSIT", "RELEASE", "LOG OFF"], { x: 0, y: 0, width: 88 });
    close(game);
    if (what === 0) {
      if (!s.box.length) await say(game, "There's nothing stored.");
      else if (s.party.length >= PARTY_MAX) await say(game, "Your party is full!");
      else {
        const i = await boxList(game, "Withdraw which?");
        if (i >= 0) {
          const [c] = s.box.splice(i, 1);
          s.party.push(c);
          await say(game, `${displayName(game.dex, c)} is taken out.`);
        }
      }
    } else if (what === 1) {
      if (s.party.length <= 1) await say(game, "You can't deposit your last creature!");
      else {
        const i = await chooseFromParty(game, "Deposit which?");
        if (i >= 0) {
          if (s.party.filter((c, k) => k !== i && c.hp > 0).length === 0) {
            await say(game, "You need at least one creature that can fight!");
          } else {
            const [c] = s.party.splice(i, 1);
            s.box.push(c);
            await say(game, `${displayName(game.dex, c)} was stored.`);
          }
        }
      }
    } else if (what === 2) {
      if (!s.box.length) await say(game, "There's nothing stored.");
      else {
        const i = await boxList(game, "Release which?");
        if (i >= 0) {
          const c = s.box[i];
          await say(game, `Release ${displayName(game.dex, c)}? It can't be undone.`, { keep: true });
          if (await yesNo(game)) {
            close(game);
            s.box.splice(i, 1);
            await say(game, `${displayName(game.dex, c)} was released outside. Bye!`);
          } else close(game);
        }
      }
    } else break;
    await say(game, "What would you like to do?", { keep: true });
  }
  close(game);
}

/** @param {Game} game @param {string} prompt */
async function boxList(game, prompt) {
  const s = st(game);
  const labels = s.box.map((c) => `${displayName(game.dex, c).padEnd(10)} :L${c.level}`);
  /** @type {number} */
  let at = 0;
  for (;;) {
    const i = await over(
      game,
      (ctx) => {
        page(ctx);
        titleBar(ctx, `${prompt} (${s.box.length})`);
        const c = s.box[at];
        if (c) drawCreature(ctx, game, c.species, 112, 96);
      },
      () => choose(game, labels, { x: 0, y: 24, width: 112, rows: 7, start: at, onMove: (k) => (at = k) }),
    );
    if (i < 0) return -1;
    const act = await choose(game, ["SELECT", "SUMMARY", "CANCEL"], { x: WIDTH - 80, y: HEIGHT - 72, width: 80 });
    if (act === 0) return i;
    if (act === 1) await summary(game, s.box, i);
    at = i;
  }
}

// Levels, moves and evolution outside battle

/**
 * Teach a move, asking which to forget when four are known. Resolves true if learned.
 * @param {Game} game @param {Creature} c @param {string} moveId
 */
export async function learnMove(game, c, moveId) {
  const mv = MOVE_BY_ID.get(moveId);
  if (!mv || c.moves.some((m) => m.id === moveId)) return false;
  const name = displayName(game.dex, c);
  if (c.moves.length < 4) {
    c.moves.push({ id: moveId, pp: mv.pp });
    await say(game, `${name} learned ${mv.name}!`);
    return true;
  }
  for (;;) {
    await say(game, `${name} is trying to learn ${mv.name}. But it already knows four moves.\fForget a move to make room for ${mv.name}?`, { keep: true });
    if (!(await yesNo(game))) {
      close(game);
      await say(game, `${name} did not learn ${mv.name}.`);
      return false;
    }
    close(game);
    const labels = c.moves.map((m) => MOVE_BY_ID.get(m.id)?.name ?? m.id);
    await say(game, "Which move should be forgotten?", { keep: true });
    const k = await choose(game, labels, { x: 64, y: 32, width: 96 });
    close(game);
    if (k < 0) continue;
    const old = labels[k];
    c.moves[k] = { id: moveId, pp: mv.pp };
    await say(game, `1, 2 and... Poof!\f${name} forgot ${old}. And... ${name} learned ${mv.name}!`);
    return true;
  }
}

/**
 * Raise a creature one level outside battle (the level candy): stats, moves, evolution.
 * @param {Game} game @param {Creature} c
 */
export async function levelUp(game, c) {
  const sp = game.dex.get(c.species);
  const before = statsOf(sp, c).hp;
  c.level += 1;
  c.exp = Math.max(c.exp, expForLevel(c.level));
  c.hp = Math.max(0, c.hp + statsOf(sp, c).hp - before);
  game.audio.jingle("levelup");
  await say(game, `${displayName(game.dex, c)} grew to level ${c.level}!`);
  for (const m of movesLearnedAt(game.dex, c.species, c.level)) await learnMove(game, c, m);
  const evo = sp.evolution;
  if (evo?.level && c.level >= evo.level) await evolve(game, c, evo.to);
}

/**
 * The evolution scene. B stops it. The creature keeps its damage; moves the new species
 * learns at its level are offered.
 * @param {Game} game @param {Creature} c @param {string} to
 */
export async function evolve(game, c, to) {
  const from = c.species;
  const name = displayName(game.dex, c);
  let showNew = false;
  let cancelled = false;
  const layer = {
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
      page(ctx);
      drawCreature(ctx, game, showNew ? to : from, 60, 36);
    },
  };
  game.push(layer);
  try {
    game.audio.stopMusic();
    await say(game, `What? ${name} is evolving!`);
    const input = game.input;
    // Flicker between the two, faster and faster.
    for (let n = 0; n < 24 && !cancelled; n++) {
      const hold = Math.max(3, 24 - n);
      for (let f = 0; f < hold; f++) {
        if (input.pressed("b")) cancelled = true;
        await game.frame();
      }
      showNew = !showNew;
    }
    if (cancelled) {
      showNew = false;
      await say(game, `Huh? ${name} stopped evolving!`);
      return false;
    }
    showNew = true;
    const sp = game.dex.get(c.species);
    const before = statsOf(sp, c).hp;
    c.species = to;
    const after = statsOf(game.dex.get(to), c).hp;
    c.hp = Math.max(0, c.hp + after - before);
    markDex(st(game), to, true);
    game.audio.playCry(to);
    game.audio.jingle("evolution-done");
    await say(game, `Congratulations! ${name} evolved into ${game.dex.get(to).name}!`);
    for (const m of movesLearnedAt(game.dex, to, c.level)) await learnMove(game, c, m);
    return true;
  } finally {
    game.remove(layer);
    game.audio.playMusic(game.world?.music() ?? "route-1");
  }
}

// The Wing Whistle

/**
 * Pick a visited town to fly to. Resolves to its map id, or null.
 * @param {Game} game
 */
export async function flyMenu(game) {
  const s = st(game);
  if (!s.visited.length) return null;
  const world = game.world;
  const names = await Promise.all(s.visited.map(async (id) => (await world.load(id)).def.name));
  const i = await over(
    game,
    (ctx) => {
      page(ctx);
      titleBar(ctx, "Fly where?");
    },
    () => choose(game, names, { x: 0, y: 24, width: WIDTH, rows: 6 }),
  );
  return i < 0 ? null : s.visited[i];
}

// The end

/**
 * The hall of fame, then the credits.
 * @param {Game} game
 */
export async function hallOfFame(game) {
  const s = st(game);
  game.audio.playMusic("hall");
  /** @type {Creature|null} */
  let shown = null;
  let text = "";
  const layer = {
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
      ctx.fillStyle = "#101828";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      if (shown) {
        drawCreature(ctx, game, shown.species, 60, 24);
        drawFrame(ctx, 0, HEIGHT - 40, WIDTH, 40);
        drawText(ctx, displayName(game.dex, shown), 8, HEIGHT - 32);
        drawText(ctx, `:L${shown.level}  ${game.dex.get(shown.species).name}`, 8, HEIGHT - 16);
      }
      if (text) {
        const lines = text.split("\n");
        lines.forEach((l, k) => drawText(ctx, l, Math.max(0, (WIDTH - l.length * 8) / 2), 56 + k * 12 - lines.length * 6, "light"));
      }
    },
  };
  game.push(layer);
  try {
    await game.fadeTo(0, 12);
    text = "HALL OF FAME";
    await game.wait(120);
    text = "";
    for (const c of s.party) {
      shown = c;
      game.audio.playCry(c.species);
      await game.wait(150);
    }
    shown = null;
    text = `${s.name}\nCHAMPION OF THE\nOSMARI ISLES`;
    await game.wait(200);
    game.audio.playMusic("ending");
    const credits = [
      "POKOSMARI",
      "A journey through\nthe Osmari Isles",
      "Creatures\ninvented by\npokemon-generator",
      "World, story,\nmusic and art\nmade for this game",
      `Caught: ${s.dex.caught.length}\nSeen: ${s.dex.seen.length}`,
      `Time: ${Math.floor(s.playSeconds / 3600)}h ${String(Math.floor((s.playSeconds % 3600) / 60)).padStart(2, "0")}m`,
      "Thanks for playing!",
    ];
    for (const c of credits) {
      text = c;
      await game.wait(200);
    }
    await game.fadeTo(1, 30);
    text = "";
  } finally {
    game.remove(layer);
  }
}

export { PAPER };
