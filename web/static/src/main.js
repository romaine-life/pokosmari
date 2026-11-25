// @ts-check
// Boot: load the dex, set up the screen, input and sound, then hand over to the title
// screen. Errors anywhere are reported to the server and shown on screen.

import { Game, WIDTH, HEIGHT } from "./core/game.js";
import { makeDex } from "./game/dex.js";
import { createAudio } from "./audio/audio.js";
import { Overworld } from "./world/overworld.js";
import { Scripts } from "./script/context.js";
import { titleScreen } from "./ui/title.js";
import { startMenu } from "./ui/start.js";
import { drawFrame, drawText } from "./gfx/index.js";

const base = document.documentElement.dataset.base ?? "./";
const version = document.documentElement.dataset.version ?? "dev";

/** @type {HTMLCanvasElement} */
const canvas = /** @type {any} */ (document.getElementById("screen"));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d", { alpha: false }));
canvas.width = WIDTH;
canvas.height = HEIGHT;
ctx.imageSmoothingEnabled = false;

/** Scale the screen by the largest whole number that fits the window. */
function fit() {
  const s = Math.max(1, Math.floor(Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT)));
  canvas.style.width = `${WIDTH * s}px`;
  canvas.style.height = `${HEIGHT * s}px`;
}
window.addEventListener("resize", fit);
fit();

let reported = 0;
/** @type {string|null} */
let crashed = null;

/**
 * Send an error to the server's log and show it. The first few per page load are sent.
 * @param {unknown} e @param {string} where
 */
function report(e, where) {
  const err = e instanceof Error ? e : new Error(String(e));
  console.error(where, err);
  crashed = err.message;
  if (reported++ >= 5) return;
  const body = JSON.stringify({
    where,
    message: err.message,
    stack: (err.stack ?? "").slice(0, 3000),
    cause: err.cause instanceof Error ? err.cause.stack?.slice(0, 2000) : undefined,
    version,
    map: game?.state?.pos.map,
    agent: navigator.userAgent,
  });
  fetch("/api/errors", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}
window.addEventListener("error", (ev) => report(ev.error ?? ev.message, "window"));
window.addEventListener("unhandledrejection", (ev) => report(ev.reason, "promise"));

/** The problem banner, drawn over everything once something has gone wrong. */
const crashLayer = {
  /** @param {CanvasRenderingContext2D} c */
  draw(c) {
    if (!crashed) return;
    drawFrame(c, 0, 0, WIDTH, 56);
    drawText(c, "The game hit a", 8, 8);
    drawText(c, "problem. Reload to", 8, 24);
    drawText(c, "go on from a save.", 8, 40);
  },
};

/** @type {Game} */
let game;

/** @returns {import("./core/game.js").Audio} */
function silentAudio() {
  return { unlock() {}, playMusic() {}, stopMusic() {}, jingle: async () => {}, playSfx() {}, playCry() {}, setVolumes() {} };
}

async function boot() {
  const res = await fetch(`${base}data/species.json`);
  if (!res.ok) throw new Error(`couldn't load the dex: HTTP ${res.status}`);
  const dex = makeDex(await res.json());
  // ?mute plays with no sound at all (testing the game somewhere sound would disturb).
  const muted = new URLSearchParams(location.search).has("mute");
  const audio = muted ? silentAudio() : createAudio();
  game = new Game({ ctx, dex, audio, store: window.localStorage, report });
  game.input.attach(window);
  game.input.onFirstPress.push(() => audio.unlock());

  const world = new Overworld(game);
  world.scripts = new Scripts(game, world);
  world.openMenu = startMenu;
  game.world = world;
  game.push(world);
  game.start();
  // Drawn last: it sits above whatever layers come and go.
  const draw = game.draw.bind(game);
  game.draw = () => {
    draw();
    crashLayer.draw(ctx);
  };
  game.run(() => titleScreen(game), "title");
}

boot().catch((e) => {
  report(e, "boot");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#fff";
  ctx.font = "8px monospace";
  ctx.fillText("pokosmari couldn't start.", 4, 60);
  ctx.fillText("Reload to try again.", 4, 76);
});
