// @ts-check
// The bag outside battle: three pockets, and using an item in the field.

import { drawText } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";
import { say, choose, yesNo, askNumber, close } from "./text.js";
import { page, over, titleBar } from "./widgets.js";
import { chooseFromParty, levelUp, evolve, flyMenu } from "./screens.js";
import { ITEM_BY_ID } from "../data/items.js";
import { MOVE_BY_ID } from "../data/moves.js";
import { statsOf, displayName } from "../game/creature.js";
import { addItem } from "../game/state.js";
import { TILES } from "../data/tiles.js";
import { DELTA } from "../world/map.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("../game/state.js").State} State */
/** @typedef {import("../data/items.js").Item} Item */

const POCKETS = /** @type {const} */ (["items", "balls", "key"]);
const POCKET_NAMES = { items: "ITEMS", balls: "ORBS", key: "KEY ITEMS" };

/** @param {Game} game */
const st = (game) => /** @type {State} */ (game.state);

/**
 * The bag from the start menu. Resolves true if an item closed the menu (flying, the bike).
 * @param {Game} game
 */
export async function bagScreen(game) {
  const s = st(game);
  let pocket = 0;
  /** @type {Record<string, number>} */
  const at = { items: 0, balls: 0, key: 0 };
  for (;;) {
    const p = POCKETS[pocket];
    const ids = Object.keys(s.bag).filter((id) => ITEM_BY_ID.get(id)?.pocket === p);
    const labels = ids.map((id) => {
      const it = /** @type {Item} */ (ITEM_BY_ID.get(id));
      return p === "key" ? it.name : `${it.name.padEnd(13).slice(0, 13)}×${String(s.bag[id]).padStart(2)}`;
    });
    let hover = Math.min(at[p], Math.max(0, ids.length - 1));
    /** @type {number|"left"|"right"} */
    const i = await over(
      game,
      (ctx) => {
        page(ctx);
        titleBar(ctx, `◀ ${POCKET_NAMES[p]} ▶`);
        const it = ITEM_BY_ID.get(ids[hover]);
        if (it) {
          // The description, wrapped into the bottom of the page.
          const words = it.description.split(" ");
          let line = "", y = HEIGHT - 36;
          for (const w of words) {
            if ((line + " " + w).trim().length > 19) {
              drawText(ctx, line, 4, y);
              y += 10;
              line = w;
            } else line = (line + " " + w).trim();
          }
          drawText(ctx, line, 4, y);
        }
      },
      () => pocketList(game, labels, hover, (k) => (hover = k)),
    );
    if (i === "left") pocket = (pocket + 2) % 3;
    else if (i === "right") pocket = (pocket + 1) % 3;
    else if (i < 0) return false;
    else {
      at[p] = i;
      const closed = await itemAction(game, ids[i]);
      if (closed) return true;
    }
  }
}

/**
 * A pocket's list; left/right switch pockets.
 * @param {Game} game @param {string[]} labels @param {number} start @param {(i: number) => void} onMove
 * @returns {Promise<number|"left"|"right">}
 */
async function pocketList(game, labels, start, onMove) {
  if (!labels.length) {
    const layer = { draw: (/** @type {CanvasRenderingContext2D} */ ctx) => drawText(ctx, "(empty)", 16, 32) };
    game.push(layer);
    try {
      for (;;) {
        await game.frame();
        if (game.input.pressed("left")) return "left";
        if (game.input.pressed("right")) return "right";
        if (game.input.pressed("b")) return -1;
      }
    } finally {
      game.remove(layer);
    }
  }
  const i = await choose(game, labels, { x: 0, y: 24, width: WIDTH, rows: 4, start, onMove, sides: true });
  return i === -2 ? "left" : i === -3 ? "right" : i;
}

/**
 * What to do with an item: USE or TOSS. Resolves true when the start menu should close.
 * @param {Game} game @param {string} id
 */
async function itemAction(game, id) {
  const s = st(game);
  const it = /** @type {Item} */ (ITEM_BY_ID.get(id));
  const opts = it.field ? ["USE"] : [];
  if (it.pocket !== "key") opts.push("TOSS");
  opts.push("CANCEL");
  const k = await choose(game, opts, { x: WIDTH - 64, y: HEIGHT - 72, width: 64 });
  const pick = opts[k];
  if (pick === "TOSS") {
    await say(game, `Throw away how many ${it.name}?`, { keep: true });
    const n = await askNumber(game, { max: s.bag[id] });
    close(game);
    if (n > 0) {
      await say(game, `Throw away ${n} ${it.name}?`, { keep: true });
      if (await yesNo(game)) addItem(s, id, -n);
      close(game);
    }
    return false;
  }
  if (pick === "USE") return useInField(game, it);
  return false;
}

/**
 * Use an item outside battle. Resolves true when the start menu should close.
 * @param {Game} game @param {Item} it
 */
export async function useInField(game, it) {
  const s = st(game);
  const e = it.field;
  if (!e) return false;
  const world = game.world;
  switch (e.kind) {
    case "heal":
    case "cure":
    case "revive":
    case "pp":
    case "level":
    case "evolve": {
      const i = await chooseFromParty(game, `Use ${it.name} on which?`);
      if (i < 0) return false;
      const c = s.party[i];
      const sp = game.dex.get(c.species);
      const max = statsOf(sp, c).hp;
      const name = displayName(game.dex, c);
      const used = () => addItem(s, it.id, -1);
      if (e.kind === "heal") {
        if (c.hp <= 0 || (c.hp >= max && !(e.status && c.status))) return noEffect(game);
        const gained = Math.min(max - c.hp, e.hp);
        c.hp += gained;
        if (e.status) c.status = null;
        used();
        game.audio.playSfx("heal-machine");
        await say(game, gained > 0 ? `${name} recovered ${gained} HP!` : `${name} was cured!`);
      } else if (e.kind === "cure") {
        const ok = c.hp > 0 && c.status && (e.status === "all" || e.status === c.status || (e.status === "psn" && c.status === "tox"));
        if (!ok) return noEffect(game);
        c.status = null;
        c.sleep = 0;
        used();
        await say(game, `${name} is cured!`);
      } else if (e.kind === "revive") {
        if (c.hp > 0) return noEffect(game);
        c.hp = Math.max(1, Math.floor(max * e.fraction));
        c.status = null;
        used();
        await say(game, `${name} is revived!`);
      } else if (e.kind === "pp") {
        const labels = c.moves.map((m) => `${MOVE_BY_ID.get(m.id)?.name ?? m.id} ${m.pp}/${MOVE_BY_ID.get(m.id)?.pp}`);
        await say(game, "Restore which move?", { keep: true });
        const k = await choose(game, labels, { x: 24, y: 24, width: 136 });
        close(game);
        if (k < 0) return false;
        const m = c.moves[k];
        const full = MOVE_BY_ID.get(m.id)?.pp ?? m.pp;
        if (m.pp >= full) return noEffect(game);
        m.pp = Math.min(full, m.pp + e.amount);
        used();
        await say(game, "PP was restored.");
      } else if (e.kind === "level") {
        if (c.level >= 100) return noEffect(game);
        used();
        await levelUp(game, c);
      } else if (e.kind === "evolve") {
        const evo = sp.evolution;
        if (evo?.item !== e.item) return noEffect(game);
        used();
        await evolve(game, c, evo.to);
      }
      return false;
    }
    case "repel":
      if (s.repel > 0) {
        await say(game, "A repellent is still working.");
        return false;
      }
      s.repel = e.steps;
      addItem(s, it.id, -1);
      await say(game, `{PLAYER} used ${it.name}. Weak wild creatures will stay away.`);
      return false;
    case "escape": {
      const theme = world.map?.def.theme;
      if (theme !== "cave" && theme !== "spire") {
        await say(game, "There's no use for that here.");
        return false;
      }
      addItem(s, it.id, -1);
      await say(game, `{PLAYER} followed the ${it.name} back out.`);
      await world.warp({ ...s.lastCenter, dir: "down" }, "door");
      return true;
    }
    case "key":
      return useKeyItem(game, e.use);
  }
  return false;
}

/** @param {Game} game */
async function noEffect(game) {
  await say(game, "It won't have any effect.");
  return false;
}

/**
 * @param {Game} game @param {string} use
 */
async function useKeyItem(game, use) {
  const s = st(game);
  const world = game.world;
  const p = world.player;
  const [dx, dy] = DELTA[p.dir];
  const ahead = world.tileAt(p.x + dx, p.y + dy);
  if (use === "bicycle") {
    if (world.map?.def.indoor || s.surfing) {
      await say(game, "This isn't the place to ride a bike.");
      return false;
    }
    s.biking = !s.biking;
    game.audio.playMusic(world.music());
    await say(game, s.biking ? "{PLAYER} got on the bike." : "{PLAYER} got off the bike.");
    return true;
  }
  if (use === "wing-whistle") {
    if (world.map?.def.indoor || world.map?.def.theme === "cave") {
      await say(game, "There's no sky to call to here.");
      return false;
    }
    const to = await flyMenu(game);
    if (!to) return false;
    const m = await world.load(to);
    const spot = m.def.flyTo ?? { x: Math.floor(m.w / 2), y: Math.floor(m.h / 2) };
    await say(game, "{PLAYER} blew the Wing Whistle!", { auto: 40 });
    s.biking = false;
    await world.warp({ map: to, x: spot.x, y: spot.y, dir: "down" }, "fly");
    return true;
  }
  if (use === "old-rod" || use === "good-rod" || use === "tide-board") {
    if (!TILES[ahead.ch]?.water) {
      await say(game, use === "tide-board" ? "Face the water to ride the board." : "Face the water to fish.");
      return false;
    }
    close(game);
    await world.scripts.water();
    return true;
  }
  if (use === "town-map") {
    await say(game, `You are in ${world.map?.def.name ?? "the Osmari Isles"}.`);
    return false;
  }
  const auto = { "brush-cutter": "small trees", "power-gloves": "boulders", lantern: "dark caves" };
  if (use in auto) {
    await say(game, `It's used by itself: face ${auto[/** @type {keyof typeof auto} */ (use)]} and press A.`);
    return false;
  }
  await say(game, "This can't be used right now.");
  return false;
}
