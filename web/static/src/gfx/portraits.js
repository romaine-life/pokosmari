// @ts-check
// 48x48 trainer portraits for battle intros, built from the same looks as the overworld
// sprites (characters.js) so a trainer is recognisable in both. Each part is drawn on its
// own layer and outlined before it is laid on the ones below, which gives the cel look.

import { Grid, memo, mix } from "./grid.js";
import { LOOKS, INK } from "./characters.js";

/** @typedef {import("./grid.js").Pixels} Pixels */
/** @typedef {import("./characters.js").Look} Look */

/** The sprites with a portrait: every trainer who battles, and the player's back. */
export const PORTRAIT_SPRITES = [
  "rival",
  "youngster",
  "lass",
  "bugcatcher",
  "hiker",
  "swimmer",
  "fisher",
  "sailor",
  "scientist",
  "gentleman",
  "beauty",
  "blackbelt",
  "psychic",
  "channeler",
  "ace-m",
  "ace-f",
  "worker",
  "grunt-m",
  "grunt-f",
  "boss",
  "warden1",
  "warden2",
  "warden3",
  "warden4",
  "warden5",
  "warden6",
  "warden7",
  "warden8",
  "council1",
  "council2",
  "council3",
  "council4",
  "player-back",
];

/** @param {string} c */
const shade = (c) => mix(c, "#101028", 0.3);
/** @param {string} c */
const light = (c) => mix(c, "#ffffff", 0.35);

const S = 48;

/** A fresh layer. */
const layer = () => new Grid(S, S);

/**
 * Lay `top` (outlined) over `base`.
 * @param {Grid} base @param {Grid} top
 */
function lay(base, top) {
  top.outline(INK);
  base.blit(top, 0, 0);
}

/**
 * A shaded ellipse: the shade colour, then the colour nudged up and left.
 * @param {Grid} g @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {string} c
 */
function blob(g, cx, cy, rx, ry, c) {
  g.ellipse(cx, cy, rx, ry, shade(c));
  g.ellipse(cx - 1, cy - 1, rx - 1, ry - 1, c);
}

/**
 * Keep only the pixels of `g` where `keep(x, y)` holds.
 * @param {Grid} g @param {(x: number, y: number) => boolean} keep
 */
function clip(g, keep) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (!keep(x, y)) g.set(x, y, null);
  return g;
}

/**
 * The shoulders and chest.
 * @param {Look} L @param {boolean} back
 */
function torso(L, back) {
  const g = layer();
  const rx = L.big ? 23 : 19;
  blob(g, 24, 50, rx, 15, L.top);
  if (L.legs === "robe" || L.trim) {
    // a collar or lapels in the trim colour
    const c = L.trim || shade(L.top);
    if (!back) {
      g.line(18, 36, 24, 45, c).line(19, 36, 24, 44, c);
      g.line(30, 36, 24, 45, c).line(29, 36, 24, 44, c);
    } else g.rect(16, 37, 16, 2, c);
  }
  if (L.top === L.skin && !back) {
    // a swimmer: a little chest shading
    g.line(18, 42, 22, 42, shade(L.skin)).line(26, 42, 30, 42, shade(L.skin));
  }
  if (L.pack && !back) {
    g.rect(12, 38, 3, 10, L.pack).rect(33, 38, 3, 10, L.pack);
  }
  return g;
}

/** @param {Look} L */
function neck(L) {
  const g = layer();
  g.rect(20, 28, 8, 9, shade(L.skin));
  g.rect(21, 28, 6, 7, L.skin);
  return g;
}

/** @param {Look} L */
function head(L) {
  const g = layer();
  blob(g, 24, 20, 11, 12, L.skin);
  // ears
  g.ellipse(13, 21, 2, 3, L.skin).ellipse(35, 21, 2, 3, shade(L.skin));
  return g;
}

/**
 * The face's features, drawn straight on the head (no outline pass).
 * @param {Grid} g @param {Look} L
 */
function face(g, L) {
  const brow = shade(L.hairC);
  for (const x of [18, 28]) {
    g.rect(x, 20, 2, 4, INK);
    g.set(x, 20, "#ffffff");
    g.rect(x - 1, 17, 4, 1, brow);
  }
  g.set(24, 25, shade(L.skin)).set(23, 26, shade(L.skin));
  g.rect(22, 28, 4, 1, mix(INK, L.skin, 0.4));
  g.set(16, 26, mix(L.skin, "#f06070", 0.3)).set(31, 26, mix(L.skin, "#f06070", 0.3));
  if (L.glasses) {
    for (const x of [15, 26]) {
      g.rect(x, 18, 8, 7, INK);
      g.rect(x + 1, 19, 6, 5, "#d8f0f8");
      g.rect(x + 3, 20, 2, 3, INK);
      g.set(x + 1, 19, "#ffffff");
    }
    g.rect(23, 20, 3, 1, INK);
  }
  if (L.beard) {
    const b = layer();
    blob(b, 24, 28, 11, 6, L.hairC);
    clip(b, (x, y) => y >= 25);
    b.rect(21, 27, 6, 1, mix(INK, L.skin, 0.4));
    b.outline(INK);
    g.blit(b, 0, 0);
  }
  if (L.mustache) {
    g.rect(19, 26, 10, 2, L.hairC).rect(18, 27, 2, 1, L.hairC).rect(28, 27, 2, 1, L.hairC);
    g.rect(19, 28, 10, 1, shade(L.hairC));
  }
}

/**
 * Hair that hangs behind the head.
 * @param {Look} L
 */
function backHair(L) {
  const g = layer();
  const c = L.hairC;
  if (L.hair === "long") {
    blob(g, 24, 24, 16, 20, c);
    clip(g, (x, y) => y < 44);
  } else if (L.hair === "hood") {
    blob(g, 24, 22, 17, 19, c);
  } else if (L.hair === "ponytail") {
    blob(g, 37, 24, 5, 11, c);
  } else if (L.hair === "pigtails") {
    blob(g, 9, 27, 5, 8, c);
    blob(g, 39, 27, 5, 8, c);
  } else if (L.hair === "bun") {
    blob(g, 24, 6, 7, 6, c);
  }
  return g;
}

/**
 * Hair over the top of the head: the cap of hair and its fringe.
 * @param {Look} L
 */
function frontHair(L) {
  const g = layer();
  const c = L.hairC;
  const hi = light(c);
  if (L.hair === "bald") {
    g.ellipse(14, 15, 2, 3, c).ellipse(34, 15, 2, 3, shade(c));
    return g;
  }
  if (L.hair === "hood") {
    // the hood's rim around the face
    blob(g, 24, 12, 14, 8, c);
    clip(g, (x, y) => y < 14 || x < 14 || x > 34);
    clip(g, (x, y) => y < 34);
    return g;
  }
  blob(g, 24, 14, 13, 10, c);
  // the fringe: a band across the forehead with a few points hanging down
  clip(g, (x, y) => y < 15 || (y < 18 && (x < 15 || x > 33)) || (y < 24 && (x < 14 || x > 34)));
  const points = L.hair === "spiky" ? [16, 21, 26, 31] : L.hair === "bun" ? [] : [17, 23, 29];
  for (const px of points) {
    for (let k = 0; k < 4; k++) g.rect(px - 2 + Math.floor(k / 2), 15 + k, 5 - k, 1, k === 3 ? shade(c) : c);
  }
  if (L.hair === "spiky") {
    for (const [x, y, dx] of [
      [10, 10, -1],
      [14, 4, -1],
      [21, 1, 0],
      [28, 1, 0],
      [34, 4, 1],
      [38, 10, 1],
    ]) {
      for (let k = 0; k < 5; k++) g.rect(x + dx * k - Math.floor((4 - k) / 2), y - k + 4, 5 - k, 1, k > 2 ? hi : c);
    }
  }
  // a shine on the hair
  g.rect(17, 7, 5, 1, hi).rect(16, 8, 3, 1, hi);
  return g;
}

/**
 * @param {Look} L
 */
function hat(L) {
  const g = layer();
  const a = L.accent || L.hairC;
  const band = L.accent2 || "#f8f8f8";
  switch (L.hat) {
    case "cap":
      blob(g, 24, 12, 13, 9, a);
      clip(g, (x, y) => y < 13);
      g.rect(10, 12, 28, 3, shade(a)).rect(11, 12, 26, 1, a);
      g.rect(22, 6, 4, 3, band);
      break;
    case "wide":
      blob(g, 24, 9, 10, 7, a);
      clip(g, (x, y) => y < 12);
      g.rect(14, 9, 20, 2, band);
      g.ellipse(24, 13, 21, 3, shade(a)).ellipse(24, 12, 20, 2, a);
      break;
    case "hard":
      blob(g, 24, 12, 13, 10, a);
      clip(g, (x, y) => y < 13);
      g.rect(22, 3, 4, 10, light(a));
      g.rect(9, 12, 30, 3, shade(a)).rect(10, 12, 28, 1, a);
      break;
    case "tophat":
      g.rect(14, 0, 20, 12, a).rect(14, 0, 3, 12, light(a));
      g.rect(14, 8, 20, 3, band);
      g.ellipse(24, 12, 17, 3, shade(a)).ellipse(24, 11, 16, 2, a);
      break;
    case "band":
      g.rect(12, 10, 24, 4, a).rect(12, 12, 24, 2, shade(a));
      g.rect(36, 10, 3, 3, a).line(38, 13, 42, 18, a).line(39, 13, 43, 17, a);
      break;
    case "nurse":
      g.rect(16, 1, 16, 8, a).rect(16, 7, 16, 2, shade(a));
      g.rect(23, 2, 2, 6, band).rect(21, 4, 6, 2, band);
      break;
    case "sailor":
      blob(g, 24, 10, 12, 7, "#f8f8f8");
      clip(g, (x, y) => y < 11);
      g.rect(11, 10, 26, 3, a);
      break;
    case "beanie":
      blob(g, 24, 12, 13, 10, a);
      clip(g, (x, y) => y < 14);
      g.rect(11, 11, 26, 4, shade(a));
      for (let x = 13; x < 36; x += 3) g.rect(x, 4, 1, 7, shade(a));
      g.ellipse(24, 2, 3, 2, "#f8f8f8");
      break;
    default:
      return null;
  }
  return g;
}

/**
 * @param {Look} L
 * @returns {Grid}
 */
function portraitFront(L) {
  const g = layer();
  lay(g, backHair(L));
  lay(g, torso(L, false));
  lay(g, neck(L));
  const h = head(L);
  lay(g, h);
  face(g, L);
  if (L.hair !== "hood") {
    // long hair falls down the sides of the face
    if (L.hair === "long") {
      const side = layer();
      blob(side, 13, 24, 3, 10, L.hairC);
      blob(side, 35, 24, 3, 10, L.hairC);
      lay(g, side);
    }
  }
  lay(g, frontHair(L));
  const ht = hat(L);
  if (ht) lay(g, ht);
  return g;
}

/** The player from behind: cap, hair, shoulders and backpack. */
function playerBack() {
  const L = LOOKS.player;
  const g = layer();
  const body = layer();
  blob(body, 24, 52, 21, 16, L.top);
  lay(g, body);
  const pack = layer();
  pack.rect(14, 34, 20, 16, shade(L.pack)).rect(15, 35, 18, 14, L.pack);
  pack.rect(17, 40, 14, 6, shade(L.pack)).rect(18, 41, 12, 4, light(L.pack));
  pack.rect(22, 40, 4, 2, INK);
  lay(g, pack);
  const n = neck(L);
  lay(g, n);
  const hd = layer();
  blob(hd, 24, 21, 12, 12, L.hairC);
  hd.ellipse(12, 23, 2, 3, L.skin).ellipse(36, 23, 2, 3, L.skin);
  lay(g, hd);
  g.rect(18, 28, 12, 1, shade(L.hairC));
  const cap = layer();
  blob(cap, 24, 15, 13, 10, L.accent);
  clip(cap, (x, y) => y < 17);
  cap.rect(18, 15, 12, 2, shade(L.accent)).rect(21, 14, 6, 1, INK);
  lay(g, cap);
  return g;
}

const portraitCache = memo((sprite) => {
  if (sprite === "player-back") return playerBack().toPixels();
  const L = LOOKS[sprite];
  if (!L) throw new Error(`no portrait for ${sprite}`);
  return portraitFront(L).toPixels();
});

/**
 * A 48x48 front view of a trainer for battle intros, or "player-back".
 * @param {string} sprite one of PORTRAIT_SPRITES
 * @returns {Pixels}
 */
export function portraitPixels(sprite) {
  return portraitCache(sprite);
}
