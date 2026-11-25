// @ts-check
// The title screen, continuing a save, and a new game's opening: the professor's welcome
// and naming the player and the rival.

import { drawText, drawPixels, titlePixels, characterPixels } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";
import { say, choose, yesNo, close } from "./text.js";
import { drawCreature, over, page } from "./widgets.js";
import { nameEntry } from "./screens.js";
import { uploadSave } from "./start.js";
import { load } from "../game/save.js";
import { newState } from "../game/state.js";

/** @typedef {import("../core/game.js").Game} Game */

/** @param {Game} game */
export async function titleScreen(game) {
  game.audio.playMusic("title");
  // A creature from the dex parades on the title, a different one each visit.
  const featured = game.dex.list.filter((s) => s.stage === s.stages && s.role !== "legendary");
  let shown = game.rng.pick(featured).id;
  const layer = {
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
      ctx.fillStyle = "#f8f8f0";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawPixels(ctx, titlePixels(), 0, 8);
      drawCreature(ctx, game, shown, 50, 54, { scale: 1.5 });
      if (Math.floor(game.frameCount / 30) % 2 === 0) drawText(ctx, "PRESS START", 36, HEIGHT - 24);
      drawText(ctx, "v" + (document.documentElement.dataset.version ?? "dev"), 2, HEIGHT - 10);
    },
  };
  game.push(layer);
  const input = game.input;
  let t = 0;
  try {
    for (;;) {
      await game.frame();
      if (++t % 360 === 0) shown = game.rng.pick(featured).id;
      if (input.pressed("start") || input.pressed("a")) break;
    }
  } finally {
    game.remove(layer);
  }
  game.audio.playSfx("select");
  await mainMenu(game);
}

/** @param {Game} game */
async function mainMenu(game) {
  const saved = load(game.store);
  for (;;) {
    /** @type {string[]} */
    const items = [];
    if (saved && "state" in saved) items.push("CONTINUE");
    items.push("NEW GAME", "LOAD SAVE FILE");
    const i = await over(game, (ctx) => page(ctx), async () => {
      if (saved && "error" in saved) {
        await say(game, `Your save couldn't be read (${saved.error}). It's kept as it was until you save over it.`);
      }
      return choose(game, items, { x: 0, y: 0, width: WIDTH, cancel: false });
    });
    const pick = items[i];
    if (pick === "CONTINUE" && saved && "state" in saved) {
      await continueGame(game, saved.state);
      return;
    }
    if (pick === "NEW GAME") {
      if (saved) {
        const ok = await over(game, (ctx) => page(ctx), async () => {
          await say(game, "There's a saved game. Starting a new one replaces it the first time you save. Start anyway?", { keep: true });
          const yes = await yesNo(game);
          close(game);
          return yes;
        });
        if (!ok) continue;
      }
      await newGame(game);
      return;
    }
    if (pick === "LOAD SAVE FILE") {
      game.state = newState();
      const loaded = await over(game, (ctx) => page(ctx), () => uploadSave(game));
      if (loaded) return;
      game.state = null;
    }
  }
}

/** @param {Game} game @param {import("../game/state.js").State} state */
async function continueGame(game, state) {
  game.state = state;
  game.audio.setVolumes({ music: state.options.music / 10, sfx: state.options.sfx / 10 });
  game.fade = 1;
  await game.world.enter(state.pos);
  await game.fadeTo(0, 16);
  await game.world.arrive();
}

/** @param {Game} game */
async function newGame(game) {
  const s = newState();
  game.state = s;
  game.audio.setVolumes({ music: s.options.music / 10, sfx: s.options.sfx / 10 });
  game.audio.playMusic("intro");
  /** @type {"professor"|"creature"|"player"|"rival"} */
  let who = "professor";
  const mascot = game.dex.list.find((x) => x.id === "nibakit")?.id ?? game.dex.list[3].id;
  const layer = {
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
      page(ctx);
      if (who === "creature") drawCreature(ctx, game, mascot, 60, 30);
      else {
        const sprite = who === "professor" ? "professor" : who === "rival" ? "rival" : "player";
        const p = characterPixels(sprite, "down", 0);
        // The person, drawn big: each pixel 3×3.
        for (let y = 0; y < p.h; y++)
          for (let x = 0; x < p.w; x++) {
            const k = p.rows[y][x];
            if (k === "0") continue;
            ctx.fillStyle = p.palette[parseInt(k, 36)];
            ctx.fillRect(56 + x * 3, 30 + y * 3, 3, 3);
          }
      }
    },
  };
  game.push(layer);
  try {
    await game.fadeTo(0, 12);
    await say(game, "Ah, there you are! Welcome to the Osmari Isles!\fI'm Linden. Folks here call me the creature professor.");
    who = "creature";
    game.audio.playCry(mascot);
    await say(game, "These isles are home to creatures of every shape: in the grass, in the sea, in the caves and up on the peaks.\fPeople and creatures live side by side here, and some of us battle alongside them.");
    who = "player";
    await say(game, "And you are...? Tell me your name!");
    s.name = await nameEntry(game, "YOUR NAME?", "Sam", 7);
    await say(game, `${s.name}! A fine name.`);
    who = "rival";
    await say(game, "This is your neighbour. You two have raced each other at everything since you could walk.\f...Erm, what was his name again?");
    s.rival = await nameEntry(game, "RIVAL'S NAME?", "Kip", 7);
    await say(game, `That's right! I remember now. His name is ${s.rival}!`);
    who = "player";
    await say(game, `${s.name}! Your very own adventure is about to begin.\fA world of creatures waits for you. Let's go!`);
    await game.fadeTo(1, 20);
  } finally {
    game.remove(layer);
  }
  await game.world.enter({ map: "fernhollow-home", at: "start" });
  await game.fadeTo(0, 16);
  await game.world.arrive();
}
