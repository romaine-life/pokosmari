// The pixel art: every tile, building, person, object, portrait and glyph is well-formed
// data, animated tiles move, and the drawing helpers work against a minimal fake canvas.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { TILES, BUILDINGS, THEMES } from "../static/src/data/tiles.js";
import {
  tilePixels,
  ANIMATED_TILES,
  TILE_ANIM_FRAMES,
  buildingPixels,
  characterPixels,
  CHARACTER_SPRITES,
  portraitPixels,
  PORTRAIT_SPRITES,
  objectPixels,
  OBJECT_KINDS,
  fontGlyph,
  FONT_CHARS,
  titlePixels,
  battleBackgroundPixels,
  drawPixels,
  drawText,
  drawFrame,
  drawBattleBackground,
  creatureCanvas,
} from "../static/src/gfx/index.js";

const COLOR = /^#[0-9a-f]{6}$/;

/**
 * Assert a Pixels is w x h, every row the right length, every index in its palette.
 * @param {any} p @param {number} w @param {number} h @param {string} what
 */
function wellFormed(p, w, h, what) {
  assert.equal(p.w, w, `${what}: width`);
  assert.equal(p.h, h, `${what}: height`);
  assert.equal(p.rows.length, h, `${what}: row count`);
  assert.ok(p.palette.length <= 36, `${what}: palette size`);
  for (const c of p.palette) assert.match(c, COLOR, `${what}: palette colour ${c}`);
  p.rows.forEach((row, y) => {
    assert.equal(row.length, w, `${what}: row ${y} length`);
    for (const ch of row) {
      const i = parseInt(ch, 36);
      assert.ok(Number.isInteger(i) && i >= 0 && i < p.palette.length, `${what}: index ${ch} at row ${y}`);
    }
  });
}

/** @param {any} p */
const opaqueCount = (p) => p.rows.join("").replace(/0/g, "").length;

test("every legend tile in every theme is 16x16 at several frames", () => {
  for (const ch of Object.keys(TILES)) {
    for (const theme of THEMES) {
      for (const frame of [0, 31, 32, 64, 1000]) {
        const p = tilePixels(ch, theme, frame);
        wellFormed(p, 16, 16, `tile ${JSON.stringify(ch)} ${theme} @${frame}`);
        assert.equal(opaqueCount(p), 256, `tile ${JSON.stringify(ch)} ${theme} has holes`);
      }
    }
  }
});

test("animated tiles change between frames and others don't", () => {
  for (const ch of ANIMATED_TILES) {
    assert.ok(ch in TILES, `${ch} is a legend tile`);
    for (const theme of THEMES) {
      const a = tilePixels(ch, theme, 0);
      const b = tilePixels(ch, theme, TILE_ANIM_FRAMES);
      assert.notDeepEqual(a.rows, b.rows, `${ch} ${theme} animates`);
      assert.equal(tilePixels(ch, theme, TILE_ANIM_FRAMES - 1), a, `${ch} holds a frame for ${TILE_ANIM_FRAMES}`);
    }
  }
  assert.equal(tilePixels(".", "meadow", 0), tilePixels(".", "meadow", 32), "ground is still");
});

test("the void is black and themes recolour", () => {
  const v = tilePixels(" ", "meadow", 0);
  assert.deepEqual(new Set(v.rows.join("")), new Set(["1"]));
  assert.equal(v.palette[1], "#000000");
  assert.notDeepEqual(tilePixels(".", "meadow").palette, tilePixels(".", "snow").palette);
});

test("small tree and tree differ, ledges differ by direction", () => {
  assert.notDeepEqual(tilePixels("t", "meadow").rows, tilePixels("T", "meadow").rows);
  const [v, l, r] = ["v", "<", ">"].map((c) => tilePixels(c, "meadow").rows.join(""));
  assert.ok(v !== l && l !== r && v !== r);
});

test("every building is its size in tiles with an opaque door tile", () => {
  for (const [kind, def] of Object.entries(BUILDINGS)) {
    for (const theme of THEMES) {
      const p = buildingPixels(kind, theme);
      wellFormed(p, def.w * 16, def.h * 16, `building ${kind} ${theme}`);
      const [dx, dy] = def.door;
      let opaque = 0;
      for (let y = dy * 16; y < dy * 16 + 16; y++) for (let x = dx * 16; x < dx * 16 + 16; x++) if (p.rows[y][x] !== "0") opaque++;
      assert.ok(opaque > 200, `${kind} door tile is drawn (${opaque} px)`);
    }
  }
});

test("every character faces four ways in three steps", () => {
  for (const id of ["player", "rival", "boss", "warden1", "warden8", "council4", "guard", "creature"]) {
    assert.ok(CHARACTER_SPRITES.includes(id), id);
  }
  for (const id of CHARACTER_SPRITES) {
    for (const dir of ["up", "down", "left", "right"]) {
      for (const step of [0, 1, 2]) {
        const p = characterPixels(id, /** @type {any} */ (dir), step);
        wellFormed(p, 16, 16, `${id} ${dir} ${step}`);
        assert.ok(opaqueCount(p) > 60, `${id} ${dir} ${step} is drawn`);
      }
    }
    // left mirrors right; the stride frames differ from standing
    const colours = (/** @type {any} */ p) => p.rows.map((row) => [...row].map((c) => (c === "0" ? "-" : p.palette[parseInt(c, 36)])));
    const r = colours(characterPixels(id, "right", 0));
    const l = colours(characterPixels(id, "left", 0));
    assert.deepEqual(l, r.map((row) => row.slice().reverse()), `${id} left mirrors right`);
    assert.notDeepEqual(characterPixels(id, "down", 1).rows, characterPixels(id, "down", 0).rows, `${id} walks`);
  }
});

test("people look different from each other", () => {
  const seen = new Map();
  for (const id of CHARACTER_SPRITES) {
    const key = characterPixels(id, "down", 0).rows.join("") + characterPixels(id, "down", 0).palette.join("");
    assert.ok(!seen.has(key), `${id} looks the same as ${seen.get(key)}`);
    seen.set(key, id);
  }
});

test("objects, portraits, font and title are well-formed", () => {
  for (const k of ["itemball", "boulder", "sign"]) assert.ok(OBJECT_KINDS.includes(k));
  for (const k of OBJECT_KINDS) wellFormed(objectPixels(k), 16, 16, `object ${k}`);
  for (const id of ["rival", "boss", "warden1", "council4", "player-back"]) assert.ok(PORTRAIT_SPRITES.includes(id), id);
  for (const id of PORTRAIT_SPRITES) {
    const p = portraitPixels(id);
    wellFormed(p, 48, 48, `portrait ${id}`);
    assert.ok(opaqueCount(p) > 600, `portrait ${id} is drawn`);
  }
  for (let c = 32; c <= 126; c++) assert.ok(FONT_CHARS.includes(String.fromCharCode(c)), `font has ${String.fromCharCode(c)}`);
  for (const c of "é…▶▼▲◀▷●♂♀×$") assert.ok(FONT_CHARS.includes(c), `font has ${c}`);
  for (const c of FONT_CHARS) {
    const g = fontGlyph(c);
    wellFormed(g, 8, 8, `glyph ${c}`);
    if (c !== " ") assert.ok(opaqueCount(g) > 0, `glyph ${c} is drawn`);
  }
  assert.notDeepEqual(fontGlyph("A").rows, fontGlyph("B").rows);
  assert.deepEqual(fontGlyph("\u0001").rows, fontGlyph("?").rows, "unknown characters draw as ?");
  assert.notEqual(fontGlyph("A", "light").palette[1], fontGlyph("A", "dark").palette[1]);
  const t = titlePixels();
  wellFormed(t, 160, 48, "title");
  for (const theme of THEMES) wellFormed(battleBackgroundPixels(theme), 160, 144, `battle ${theme}`);
});

/** A canvas and context just big enough for draw.js. */
function fakeDom() {
  const made = [];
  globalThis.document = /** @type {any} */ ({
    createElement(tag) {
      assert.equal(tag, "canvas");
      const canvas = {
        width: 0,
        height: 0,
        image: null,
        getContext: () => ({
          createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: (img) => {
            canvas.image = img;
          },
        }),
      };
      made.push(canvas);
      return canvas;
    },
  });
  const calls = [];
  const ctx = {
    fillStyle: "",
    drawImage: (c, x, y) => calls.push({ op: "drawImage", c, x, y }),
    fillRect: (x, y, w, h) => calls.push({ op: "fillRect", x, y, w, h }),
  };
  return { made, calls, ctx };
}

test("drawPixels renders once, caches, and mirrors", () => {
  const { made, calls, ctx } = fakeDom();
  const p = characterPixels("player", "right", 0);
  drawPixels(/** @type {any} */ (ctx), p, 10.4, 20);
  drawPixels(/** @type {any} */ (ctx), p, 30, 20);
  assert.equal(made.length, 1, "one canvas for two draws");
  assert.deepEqual([calls[0].x, calls[0].y], [10, 20]);
  assert.equal(calls[0].c, calls[1].c);
  const img = made[0].image;
  assert.equal(img.width, 16);
  // the image matches the data, transparent where the rows say 0
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const alpha = img.data[(y * 16 + x) * 4 + 3];
      assert.equal(alpha, p.rows[y][x] === "0" ? 0 : 255);
    }
  }
  drawPixels(/** @type {any} */ (ctx), p, 0, 0, { flipX: true });
  assert.equal(made.length, 2, "the mirror has its own canvas");
  const m = made[1].image;
  const at = (im, x, y) => Array.from(im.data.slice((y * 16 + x) * 4, (y * 16 + x) * 4 + 4));
  assert.deepEqual(at(m, 0, 8), at(img, 15, 8));
});

test("drawText, drawFrame and the battle backdrop draw", () => {
  const { calls, ctx } = fakeDom();
  drawText(/** @type {any} */ (ctx), "Hi !\nok", 8, 104);
  const glyphs = calls.filter((c) => c.op === "drawImage");
  assert.deepEqual(
    glyphs.map((c) => [c.x, c.y]),
    [
      [8, 104],
      [16, 104],
      [32, 104],
      [8, 120],
      [16, 120],
    ],
  );
  calls.length = 0;
  drawFrame(/** @type {any} */ (ctx), 0, 96, 160, 48);
  assert.ok(calls.some((c) => c.op === "fillRect"));
  assert.equal(calls.filter((c) => c.op === "drawImage").length, 4 + 2 * 18 + 2 * 4);
  calls.length = 0;
  drawBattleBackground(/** @type {any} */ (ctx), "cave");
  assert.equal(calls.length, 1);
});

test("creatureCanvas draws a dex sprite and mirrors its back", () => {
  const { made } = fakeDom();
  const json = JSON.parse(fs.readFileSync(new URL("../static/data/species.json", import.meta.url), "utf8"));
  const s = json.species[0];
  const front = creatureCanvas(s);
  const back = creatureCanvas(s, { back: true });
  assert.equal(creatureCanvas(s), front, "cached");
  assert.notEqual(front, back);
  const w = s.sprite.width;
  const f = /** @type {any} */ (front).image;
  const b = /** @type {any} */ (back).image;
  assert.equal(f.width, w);
  let opaque = 0;
  for (let y = 0; y < s.sprite.height; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const j = (y * w + (w - 1 - x)) * 4;
      assert.deepEqual(Array.from(f.data.slice(i, i + 4)), Array.from(b.data.slice(j, j + 4)));
      if (f.data[i + 3]) opaque++;
    }
  }
  assert.ok(opaque > 100);
  assert.ok(made.length >= 2);
});
