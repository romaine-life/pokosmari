// @ts-check
// The start menu and the screens only it opens: the dex, the trainer card, saving and
// options.

import { drawFrame, drawText } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";
import { say, choose, yesNo, close, wrap } from "./text.js";
import { page, drawCreature, screen, over, titleBar } from "./widgets.js";
import { partyScreen } from "./screens.js";
import { bagScreen } from "./bag.js";
import { save, exportSave, importSave } from "../game/save.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("../game/state.js").State} State */

/** @param {Game} game */
const st = (game) => /** @type {State} */ (game.state);

/** @param {Game} game */
export async function startMenu(game) {
  const s = st(game);
  game.audio.playSfx("menu-open");
  let at = 0;
  for (;;) {
    /** @type {[string, () => Promise<boolean|void>][]} */
    const entries = [];
    if (s.flags.dex) entries.push(["DEX", () => dexScreen(game)]);
    if (s.party.length) entries.push(["PARTY", () => partyScreen(game)]);
    entries.push(["BAG", () => bagScreen(game)]);
    entries.push([s.name.toUpperCase(), () => cardScreen(game)]);
    entries.push(["SAVE", () => saveFlow(game)]);
    entries.push(["OPTIONS", () => optionsScreen(game)]);
    entries.push(["EXIT", async () => true]);
    const i = await choose(game, entries.map((e) => e[0]), { x: WIDTH - 80, y: 0, width: 80, start: at });
    if (i < 0) return;
    at = i;
    const closeMenu = await entries[i][1]();
    if (closeMenu) return;
  }
}

// The dex

/** @param {Game} game */
async function dexScreen(game) {
  const s = st(game);
  const list = game.dex.list.filter((sp) => sp.role !== "legendary" || s.dex.seen.includes(sp.id));
  let i = 0, top = 0;
  const rows = 11;
  const input = game.input;
  for (;;) {
    const pick = await screen(
      game,
      (ctx) => {
        page(ctx);
        drawText(ctx, `SEEN ${s.dex.seen.length}  OWN ${s.dex.caught.length}`, 4, 2);
        for (let r = 0; r < rows; r++) {
          const sp = list[top + r];
          if (!sp) break;
          const y = 14 + r * 12;
          const seen = s.dex.seen.includes(sp.id);
          const own = s.dex.caught.includes(sp.id);
          drawText(ctx, `${String(sp.num).padStart(3, "0")}${own ? "●" : " "}${seen ? sp.name : "----------"}`, 12, y);
          if (top + r === i) drawText(ctx, "▶", 2, y);
        }
        const cur = list[i];
        if (cur && s.dex.seen.includes(cur.id)) drawCreature(ctx, game, cur.id, WIDTH - 44, 60);
      },
      () => {
        if (input.repeat("up")) i = Math.max(0, i - 1);
        else if (input.repeat("down")) i = Math.min(list.length - 1, i + 1);
        else if (input.repeat("left")) i = Math.max(0, i - rows);
        else if (input.repeat("right")) i = Math.min(list.length - 1, i + rows);
        else if (input.pressed("b")) return -1;
        else if (input.pressed("a") && s.dex.seen.includes(list[i].id)) return i;
        if (i < top) top = i;
        if (i >= top + rows) top = i - rows + 1;
        return undefined;
      },
    );
    if (pick < 0) return false;
    await dexEntry(game, list[pick].id);
  }
}

/** @param {Game} game @param {string} id */
async function dexEntry(game, id) {
  const s = st(game);
  const sp = game.dex.get(id);
  const own = s.dex.caught.includes(id);
  game.audio.playCry(id);
  const lines = own ? wrap(sp.entry, 17) : ["Catch one to learn", "more about it."];
  const PER_PAGE = 5;
  const pages = Math.max(1, Math.ceil(lines.length / PER_PAGE));
  let pg = 0;
  const input = game.input;
  await screen(
    game,
    (ctx) => {
      page(ctx);
      drawCreature(ctx, game, id, 4, 4);
      drawText(ctx, `No.${String(sp.num).padStart(3, "0")}`, 52, 6);
      drawText(ctx, sp.name, 52, 18);
      drawText(ctx, sp.types.map((t) => t.toUpperCase()).join("/"), 52, 30);
      drawText(ctx, own ? sp.category.toUpperCase().slice(0, 19) : "?????", 4, 48);
      if (own) drawText(ctx, `HT ${sp.heightM}m  WT ${sp.weightKg}kg`, 4, 60);
      drawFrame(ctx, 0, 72, WIDTH, HEIGHT - 72);
      lines.slice(pg * PER_PAGE, pg * PER_PAGE + PER_PAGE).forEach((l, k) => drawText(ctx, l, 8, 80 + k * 11));
      if (pg < pages - 1 && Math.floor(game.frameCount / 16) % 2 === 0) drawText(ctx, "▼", WIDTH - 16, HEIGHT - 12);
    },
    () => {
      if (input.pressed("b")) return true;
      if (input.pressed("a")) {
        if (pg < pages - 1) pg++;
        else return true;
      }
      return undefined;
    },
  );
}

// The trainer card

/** @param {Game} game */
async function cardScreen(game) {
  const s = st(game);
  const names = ["tamsin", "bram", "nerys", "ozzie", "vesper", "gideon", "yuki", "corvin"];
  const input = game.input;
  const t = s.playSeconds;
  await screen(
    game,
    (ctx) => {
      page(ctx);
      drawFrame(ctx, 0, 0, WIDTH, 80);
      drawText(ctx, `NAME/ ${s.name}`, 8, 8);
      drawText(ctx, `MONEY/ $${s.money}`, 8, 24);
      drawText(ctx, `DEX/ ${s.dex.caught.length} caught`, 8, 40);
      drawText(ctx, `TIME/ ${Math.floor(t / 3600)}:${String(Math.floor((t % 3600) / 60)).padStart(2, "0")}`, 8, 56);
      drawText(ctx, "BADGES", 8, 88);
      names.forEach((n, k) => {
        const x = 8 + (k % 4) * 38, y = 102 + Math.floor(k / 4) * 20;
        const have = s.badges.includes(n);
        ctx.fillStyle = have ? ["#68b848", "#e86030", "#4890e8", "#e8c830", "#8858b8", "#a0a8b8", "#88d8e8", "#7048d8"][k] : "#d0d0c8";
        ctx.beginPath();
        ctx.arc(x + 8, y + 6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#202820";
        ctx.fillRect(x + 7, y + 5, 2, 2);
      });
    },
    () => (input.pressed("a") || input.pressed("b") ? true : undefined),
  );
}

// Saving

/** @param {Game} game */
async function saveFlow(game) {
  const s = st(game);
  await say(game, "Would you like to save the game?", { keep: true });
  if (!(await yesNo(game))) {
    close(game);
    return false;
  }
  close(game);
  try {
    save(game.store, s);
    game.audio.jingle("save");
    await say(game, "{PLAYER} saved the game.");
  } catch (e) {
    game.report(e, "save");
    await say(game, "The game couldn't be saved: the browser refused to store it.\fYou can download the save from OPTIONS instead.");
  }
  return false;
}

// Options

/** @param {Game} game */
async function optionsScreen(game) {
  const s = st(game);
  const o = s.options;
  let at = 0;
  for (;;) {
    const labels = [
      `TEXT  ${o.textSpeed.toUpperCase()}`,
      `MUSIC ${"|".repeat(o.music).padEnd(10, ".")}`,
      `SOUND ${"|".repeat(o.sfx).padEnd(10, ".")}`,
      "DOWNLOAD SAVE",
      "LOAD SAVE FILE",
      "DONE",
    ];
    const i = await over(game, (ctx) => { page(ctx); titleBar(ctx, "OPTIONS"); drawText(ctx, "A: change", 8, HEIGHT - 12); },
      () => choose(game, labels, { x: 0, y: 24, width: WIDTH, start: at }));
    if (i < 0 || i === 5) return false;
    at = i;
    if (i === 0) o.textSpeed = o.textSpeed === "slow" ? "mid" : o.textSpeed === "mid" ? "fast" : "slow";
    if (i === 1) o.music = (o.music + 1) % 11;
    if (i === 2) o.sfx = (o.sfx + 1) % 11;
    if (i === 1 || i === 2) {
      game.audio.setVolumes({ music: o.music / 10, sfx: o.sfx / 10 });
      game.audio.playSfx("select");
    }
    if (i === 3) downloadSave(s);
    if (i === 4) {
      const loaded = await uploadSave(game);
      if (loaded) return true;
    }
  }
}

/** @param {State} s */
function downloadSave(s) {
  const blob = new Blob([exportSave(s)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pokosmari-${s.name || "save"}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/**
 * Pick a save file and load it in place of the current game. Resolves true if loaded.
 * @param {Game} game
 */
export async function uploadSave(game) {
  const text = await pickFile();
  if (text == null) return false;
  let state;
  try {
    state = importSave(text);
  } catch (e) {
    await say(game, `That file couldn't be loaded: ${e instanceof Error ? e.message : e}.`);
    return false;
  }
  await say(game, `Load ${state.name}'s save? Progress since your last save here will be lost.`, { keep: true });
  if (!(await yesNo(game))) {
    close(game);
    return false;
  }
  close(game);
  game.state = state;
  save(game.store, state);
  await game.world.warp(state.pos, "none");
  game.audio.setVolumes({ music: state.options.music / 10, sfx: state.options.sfx / 10 });
  return true;
}

/** @returns {Promise<string|null>} */
function pickFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", async () => {
      const f = input.files?.[0];
      resolve(f ? await f.text() : null);
    });
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}
