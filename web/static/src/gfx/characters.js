// @ts-check
// Overworld people: 16x16, four directions, a standing frame and two stride frames. Each
// person is a descriptor (hair, hat, clothes, colours) over shared templates, so all of
// them share one proportion and outline style. Left is right mirrored.

import { Grid, memo, mix } from "./grid.js";

/** @typedef {import("./grid.js").Pixels} Pixels */
/** @typedef {"up"|"down"|"left"|"right"} Dir */

/**
 * @typedef {object} Look
 * @property {string} hair       hair style: short, spiky, long, bun, bald, ponytail, pigtails, hood
 * @property {string} [hat]      cap, wide, hard, tophat, band, nurse, sailor, beanie
 * @property {string} skin
 * @property {string} hairC
 * @property {string} top
 * @property {string} bottom
 * @property {string} shoes
 * @property {string} [accent]   the hat's colour
 * @property {string} [accent2]  a hat band or badge
 * @property {"pants"|"shorts"|"skirt"|"robe"} legs
 * @property {boolean} [big]     a broad build
 * @property {boolean} [glasses]
 * @property {boolean} [beard]
 * @property {boolean} [mustache]
 * @property {string} [pack]     a backpack's colour
 * @property {string} [trim]     a stripe across the top (sailor, uniforms)
 */

export const INK = "#202030";
const SKIN = { light: "#f8d4b0", mid: "#e8b088", tan: "#c88858", dark: "#8c5a38" };

/** Every overworld person, by sprite id. */
/** @type {Record<string, Look>} */
export const LOOKS = {
  player: { hair: "short", hat: "cap", skin: SKIN.light, hairC: "#5a3828", top: "#f08838", bottom: "#3c4c88", shoes: "#c83838", accent: "#30a8a0", legs: "pants", pack: "#e8c040" },
  rival: { hair: "spiky", skin: SKIN.light, hairC: "#c83850", top: "#6c50c0", bottom: "#383848", shoes: "#282830", legs: "pants" },
  professor: { hair: "bald", skin: SKIN.mid, hairC: "#b8b8c0", top: "#f4f4f4", bottom: "#f4f4f4", shoes: "#604030", legs: "robe", glasses: true, mustache: true },
  mom: { hair: "long", skin: SKIN.light, hairC: "#a85030", top: "#e888a0", bottom: "#5878c0", shoes: "#583828", legs: "skirt" },
  nurse: { hair: "bun", hat: "nurse", skin: SKIN.light, hairC: "#f080a8", top: "#f8f0f4", bottom: "#f8f0f4", shoes: "#f0a0b8", accent: "#f8f8f8", accent2: "#e84868", legs: "robe" },
  clerk: { hair: "short", hat: "cap", skin: SKIN.mid, hairC: "#4a3020", top: "#4878e0", bottom: "#c8b080", shoes: "#383030", accent: "#4878e0", legs: "pants" },
  youngster: { hair: "short", hat: "cap", skin: SKIN.light, hairC: "#6a4028", top: "#f8f8f8", bottom: "#3870c8", shoes: "#d84040", accent: "#f0c030", legs: "shorts" },
  lass: { hair: "long", skin: SKIN.light, hairC: "#583020", top: "#f8f8f8", bottom: "#e04858", shoes: "#d04050", legs: "skirt" },
  bugcatcher: { hair: "short", hat: "wide", skin: SKIN.mid, hairC: "#3a2818", top: "#78b850", bottom: "#c8a868", shoes: "#604028", accent: "#f0d890", legs: "shorts" },
  hiker: { hair: "short", hat: "beanie", skin: SKIN.tan, hairC: "#4a2c18", top: "#8c7040", bottom: "#4c4c40", shoes: "#583418", accent: "#e87830", legs: "pants", big: true, beard: true, pack: "#c05838" },
  swimmer: { hair: "short", skin: SKIN.tan, hairC: "#e04848", top: SKIN.tan, bottom: "#3870d8", shoes: SKIN.tan, legs: "shorts" },
  fisher: { hair: "short", hat: "wide", skin: SKIN.tan, hairC: "#3a2818", top: "#5c8c5c", bottom: "#3c4870", shoes: "#383028", accent: "#a0a058", legs: "pants" },
  sailor: { hair: "short", hat: "sailor", skin: SKIN.mid, hairC: "#2a2020", top: "#f8f8f8", bottom: "#2c3c78", shoes: "#202028", accent: "#2c3c78", legs: "pants", trim: "#3858b8" },
  scientist: { hair: "short", skin: SKIN.light, hairC: "#8890a0", top: "#f0f4f8", bottom: "#f0f4f8", shoes: "#404048", legs: "robe", glasses: true },
  gentleman: { hair: "short", hat: "tophat", skin: SKIN.light, hairC: "#a0a0a8", top: "#3c3450", bottom: "#3c3450", shoes: "#181818", accent: "#2c2c34", accent2: "#c04048", legs: "pants", mustache: true },
  beauty: { hair: "long", skin: SKIN.light, hairC: "#f0d070", top: "#d04888", bottom: "#d04888", shoes: "#f8f8f8", legs: "robe" },
  blackbelt: { hair: "short", hat: "band", skin: SKIN.tan, hairC: "#282020", top: "#f8f8f8", bottom: "#f8f8f8", shoes: SKIN.tan, accent: "#d83838", legs: "pants", big: true, trim: "#282828" },
  psychic: { hair: "short", skin: SKIN.light, hairC: "#7850c0", top: "#304c90", bottom: "#304c90", shoes: "#202838", trim: "#e0c050", legs: "robe" },
  channeler: { hair: "hood", skin: "#f4dcc8", hairC: "#8c80a0", top: "#8c80a0", bottom: "#8c80a0", shoes: "#585068", legs: "robe" },
  "ace-m": { hair: "spiky", skin: SKIN.light, hairC: "#38985c", top: "#d04040", bottom: "#f0f0f0", shoes: "#303030", legs: "pants" },
  "ace-f": { hair: "ponytail", skin: SKIN.light, hairC: "#c83838", top: "#30a0b0", bottom: "#303848", shoes: "#f0f0f0", legs: "pants" },
  oldman: { hair: "bald", skin: SKIN.mid, hairC: "#e0e0e0", top: "#8c6848", bottom: "#787880", shoes: "#403028", legs: "pants", beard: true },
  oldwoman: { hair: "bun", skin: SKIN.mid, hairC: "#d0d0d8", top: "#a890c8", bottom: "#a890c8", shoes: "#504058", legs: "robe" },
  boy: { hair: "short", skin: SKIN.mid, hairC: "#202020", top: "#e04040", bottom: "#3060c0", shoes: "#f0f0f0", legs: "shorts" },
  girl: { hair: "pigtails", skin: SKIN.light, hairC: "#e08040", top: "#f8d048", bottom: "#f080a8", shoes: "#d04060", legs: "skirt" },
  worker: { hair: "short", hat: "hard", skin: SKIN.tan, hairC: "#3a2818", top: "#e87830", bottom: "#4868a8", shoes: "#483020", accent: "#f8d038", legs: "pants" },
  "grunt-m": { hair: "short", hat: "beanie", skin: SKIN.light, hairC: "#202020", top: "#2c2c3c", bottom: "#2c2c3c", shoes: "#181820", accent: "#383850", legs: "pants", trim: "#48d8b0" },
  "grunt-f": { hair: "long", skin: SKIN.light, hairC: "#c04898", top: "#2c2c3c", bottom: "#2c2c3c", shoes: "#181820", legs: "skirt", trim: "#48d8b0" },
  boss: { hair: "short", skin: SKIN.light, hairC: "#e0e0e8", top: "#5a2030", bottom: "#5a2030", shoes: "#181818", legs: "robe", trim: "#48d8b0" },
  warden1: { hair: "ponytail", skin: SKIN.mid, hairC: "#4a8c38", top: "#80c050", bottom: "#685038", shoes: "#3a2818", legs: "shorts" },
  warden2: { hair: "long", skin: SKIN.light, hairC: "#3870c8", top: "#58c8e0", bottom: "#58c8e0", shoes: "#f8f8f8", legs: "robe" },
  warden3: { hair: "spiky", skin: SKIN.light, hairC: "#f0d030", top: "#303038", bottom: "#f0d030", shoes: "#303038", legs: "pants" },
  warden4: { hair: "short", hat: "hard", skin: SKIN.tan, hairC: "#3a2818", top: "#a08050", bottom: "#685038", shoes: "#3a2818", accent: "#c09050", legs: "pants", big: true, beard: true },
  warden5: { hair: "long", skin: SKIN.light, hairC: "#e070b0", top: "#a04898", bottom: "#a04898", shoes: "#602858", legs: "robe" },
  warden6: { hair: "spiky", hat: "band", skin: SKIN.tan, hairC: "#d83828", top: "#f09030", bottom: "#383030", shoes: "#d83828", accent: "#f8f8f8", legs: "pants" },
  warden7: { hair: "bun", skin: SKIN.light, hairC: "#a8d0f0", top: "#e0f0f8", bottom: "#e0f0f8", shoes: "#6890c0", legs: "robe" },
  warden8: { hair: "spiky", skin: SKIN.mid, hairC: "#6038a8", top: "#382858", bottom: "#382858", shoes: "#181820", legs: "robe", trim: "#f0c040" },
  council1: { hair: "long", skin: SKIN.light, hairC: "#c8ccd8", top: "#2c8c88", bottom: "#2c8c88", shoes: "#1c4c48", legs: "robe" },
  council2: { hair: "bald", skin: SKIN.dark, hairC: "#202020", top: "#3c3c48", bottom: "#3c3c48", shoes: "#202020", legs: "pants", big: true, beard: true },
  council3: { hair: "hood", skin: "#d8d0d8", hairC: "#303040", top: "#303040", bottom: "#303040", shoes: "#181820", legs: "robe", trim: "#a050d0" },
  council4: { hair: "spiky", skin: SKIN.light, hairC: "#902030", top: "#202028", bottom: "#202028", shoes: "#101010", legs: "robe", trim: "#e0e0e8" },
  guard: { hair: "short", hat: "cap", skin: SKIN.mid, hairC: "#2a2020", top: "#2c3c78", bottom: "#2c3c78", shoes: "#181820", accent: "#2c3c78", legs: "pants", trim: "#f0c040" },
};

/** Every sprite id characterPixels draws: the people above plus the overworld creature. */
export const CHARACTER_SPRITES = [...Object.keys(LOOKS), "creature"];

// ---- templates -----------------------------------------------------------------------
// o outline, s skin, e eye, h hair, H hair shade, w white, a hat, A hat shade, r hat band.

/** @type {Record<string, {down: string[], up: string[], side: string[]}>} */
const HEADS = {
  short: {
    down: [
      "....oooooooo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhsshhssHHo..",
      "..ossessssesso..",
      "..ossessssesso..",
      "...osssssssso...",
    ],
    up: [
      "....oooooooo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..oHhhhhhhhhHo..",
      "...oHHHHHHHHo...",
    ],
    side: [
      ".....ooooooo....",
      "....ohhhhhhho...",
      "...ohhhhhhhhho..",
      "...ohhhhhhhhhho.",
      "...ohhhhhhhhhho.",
      "...oHhhhhssssso.",
      "...oHhhsssssseo.",
      "...oHHhsssssseo.",
      "....oHHsssssso..",
    ],
  },
  spiky: {
    down: [
      "...o.oo..oo.o...",
      "..ohohhoohhoho..",
      ".ohhhhhhhhhhhho.",
      "..ohhhhhhhhhHo..",
      ".ohhhhhhhhhhHHo.",
      "..ohsshhhsshHo..",
      "..ossessssesso..",
      "..ossessssesso..",
      "...osssssssso...",
    ],
    up: [
      "...o.oo..oo.o...",
      "..ohohhoohhoho..",
      ".ohhhhhhhhhhhho.",
      "..ohhhhhhhhhHo..",
      ".ohhhhhhhhhhHHo.",
      "..ohhhhhhhhhHo..",
      ".ohhhhhhhhhhHHo.",
      "..oHhhhhhhhHHo..",
      "...oHHHHHHHHo...",
    ],
    side: [
      ".....oooooo.....",
      "..ooohhhhhhoo...",
      ".ohhhhhhhhhhho..",
      "..oohhhhhhhhhho.",
      ".ohhhhhhhhhhhho.",
      "..oHhhhhhssssso.",
      "...oHhhsssssseo.",
      "...oHHhsssssseo.",
      "....oHHsssssso..",
    ],
  },
  long: {
    down: [
      "....oooooooo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohhssssssHHo..",
      "..ohsessssesHo..",
      "..ohsessssesHo..",
      "..ohhssssssHHo..",
      ".ohhho....oHHHo.",
      ".oHHo......oHHo.",
    ],
    up: [
      "....oooooooo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "...oHHHHHHHHo...",
    ],
    side: [
      ".....ooooooo....",
      "....ohhhhhhho...",
      "...ohhhhhhhhho..",
      "..ohhhhhhhhhhho.",
      "..ohhhhhhhhhhho.",
      "..ohhhhhhssssso.",
      "..ohhhhhsssseso.",
      "..oHhhhhsssseso.",
      "..oHHhhsssssso..",
      "..oHHHho........",
      "...oHHo.........",
    ],
  },
  bun: {
    down: [
      "......oooo......",
      "....oohhhhoo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohsssssssHHo..",
      "..ossessssesso..",
      "..ossessssesso..",
      "...osssssssso...",
    ],
    up: [
      "......oooo......",
      "....ooHhhHoo....",
      "...ohhHHHHhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..oHhhhhhhhhHo..",
      "...oHHHHHHHHo...",
    ],
    side: [
      "......ooooo.....",
      ".ooo.ohhhhhoo...",
      "ohhhoohhhhhhho..",
      "oHhhohhhhhhhhho.",
      ".oHHohhhhhhhhho.",
      "..oohhhhhssssso.",
      "...oHhhsssssseo.",
      "...oHHhsssssseo.",
      "....oHHsssssso..",
    ],
  },
  bald: {
    down: [
      "....oooooooo....",
      "...ossssssswo...",
      "..ossssssssswo..",
      "..osssssssssso..",
      "..osssssssssso..",
      "..ohssssssssho..",
      "..ohsessssesho..",
      "..ohsessssesho..",
      "...osssssssso...",
    ],
    up: [
      "....oooooooo....",
      "...osssssssso...",
      "..ossssssssswo..",
      "..osssssssssso..",
      "..osssssssssso..",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhho..",
      "..oHhhhhhhhhHo..",
      "...oHHHHHHHHo...",
    ],
    side: [
      ".....ooooooo....",
      "....ossssswso...",
      "...osssssssswo..",
      "...osssssssssso.",
      "...ohssssssssso.",
      "...ohhhssssssso.",
      "...oHhhsssssseo.",
      "...oHHhsssssseo.",
      "....oHHsssssso..",
    ],
  },
  hood: {
    down: [
      "....oooooooo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhoooooohHo..",
      "..ohoSSSSSSoHo..",
      "..ohossssssoHo..",
      "..ohosessesoHo..",
      "..ohosessesoHo..",
      "..oHhossssohHo..",
    ],
    up: [
      "....oooooooo....",
      "...ohhhhhhhho...",
      "..ohhhhhhhhhho..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..ohhhhhhhhhHo..",
      "..oHhhhhhhhhHo..",
      "..oHHHHHHHHHHo..",
    ],
    side: [
      ".....ooooooo....",
      "....ohhhhhhho...",
      "...ohhhhhhhhho..",
      "...ohhhhhhhoooo.",
      "...oHhhhhhhossso",
      "...oHhhhhhhossso",
      "...oHhhhhhhoseso",
      "...oHhhhhhhoseso",
      "...oHHhhhhhoooo.",
    ],
  },
};
HEADS.ponytail = {
  down: HEADS.short.down,
  up: [...HEADS.short.up, "......oHHo......", ".......oo......."],
  side: HEADS.short.side.map((r, y) => (y >= 3 && y <= 8 ? ".oho" + r.slice(4) : r)).concat(["..oo............"]),
};
HEADS.ponytail.up[8] = "...oHHhhHHHo....".padEnd(16, ".");
HEADS.pigtails = {
  down: HEADS.short.down.map((r, y) => (y >= 4 && y <= 8 ? "oh" + r.slice(2, 14) + "ho" : r)).concat(["oHo..........oHo", ".o............o."]),
  up: HEADS.short.up.map((r, y) => (y >= 4 && y <= 8 ? "oh" + r.slice(2, 14) + "ho" : r)).concat(["oHo..........oHo", ".o............o."]),
  side: HEADS.short.side.map((r, y) => (y >= 4 && y <= 8 ? ".oh" + r.slice(3) : r)).concat([".oHo............", "..o............."]),
};

/** Hats drawn over the head, from the top row down. */
/** @type {Record<string, {down: string[], up: string[], side: string[]}>} */
const HATS = {
  cap: {
    down: ["....oooooooo....", "...oaaaaaaaao...", "..oaaaarraaaao..", "..oaaaaaaaaaao..", ".oAAAAAAAAAAAAo."],
    up: ["....oooooooo....", "...oaaaaaaaao...", "..oaaaaaaaaaao..", "..oaaaaaaaaaao..", "..oAAAAAAAAAAo.."],
    side: [".....ooooooo....", "....oaaaaaaao...", "...oaaaaaarraao.", "...oaaaaaaaaaoo.", "...oAAAAAAAAAAAo"],
  },
  wide: {
    down: ["....oooooooo....", "...oaaaaaaaao...", "...orrrrrrrro...", ".ooAAAAAAAAAAoo.", "oAAAAAAAAAAAAAAo", ".oooooooooooooo."],
    up: ["....oooooooo....", "...oaaaaaaaao...", "...orrrrrrrro...", ".ooAAAAAAAAAAoo.", "oAAAAAAAAAAAAAAo", ".oooooooooooooo."],
    side: [".....ooooooo....", "....oaaaaaaao...", "....orrrrrrro...", "..ooAAAAAAAAAoo.", ".oAAAAAAAAAAAAAo", "..ooooooooooooo."],
  },
  hard: {
    down: ["....oooooooo....", "...oaaawwaaao...", "..oaaaawwaaaao..", "..oaaaaaaaaaao..", ".oAAAAAAAAAAAAo."],
    up: ["....oooooooo....", "...oaaawwaaao...", "..oaaaawwaaaao..", "..oaaaaaaaaaao..", ".oAAAAAAAAAAAAo."],
    side: [".....ooooooo....", "....oaawwaaao...", "...oaaaawwaaao..", "...oaaaaaaaaaao.", "..oAAAAAAAAAAAAo"],
  },
  tophat: {
    down: ["...oooooooooo...", "...oaaaaaaaao...", "...orrrrrrrro...", "...oaaaaaaaao...", ".oaaaaaaaaaaaao.", "..oooooooooooo.."],
    up: ["...oooooooooo...", "...oaaaaaaaao...", "...orrrrrrrro...", "...oaaaaaaaao...", ".oaaaaaaaaaaaao.", "..oooooooooooo.."],
    side: ["....oooooooooo..", "....oaaaaaaaao..", "....orrrrrrrro..", "....oaaaaaaaao..", "..oaaaaaaaaaaaao", "...ooooooooooooo"],
  },
  band: {
    down: ["", "", "", "..oaaaaaaaaaao.."],
    up: ["", "", "", "..oaaaaaaaaaao..", "..oaaao.........", ".oao............"],
    side: ["", "", "", "...oaaaaaaaaaao.", ".oaao...........", "oao............."],
  },
  nurse: {
    down: ["....oaaaaaao....", "....oaarraao....", "....oaaaaaao...."],
    up: ["....oaaaaaao....", "....oaaaaaao....", "....oaaaaaao...."],
    side: [".....oaaaaaao...", ".....oaarraao...", ".....oaaaaaao..."],
  },
  sailor: {
    down: ["....oooooooo....", "...owwwwwwwwo...", "..owwwwwwwwwwo..", "..oaaaaaaaaaao.."],
    up: ["....oooooooo....", "...owwwwwwwwo...", "..owwwwwwwwwwo..", "..oaaaaaaaaaao.."],
    side: [".....ooooooo....", "....owwwwwwwo...", "...owwwwwwwwwo..", "...oaaaaaaaaaao."],
  },
  beanie: {
    down: ["......owwo......", "....oaaaaaao....", "...oaaaaaaaao...", "..oaaaaaaaaaao..", "..oAAAAAAAAAAo.."],
    up: ["......owwo......", "....oaaaaaao....", "...oaaaaaaaao...", "..oaaaaaaaaaao..", "..oAAAAAAAAAAo.."],
    side: ["......owwo......", ".....oaaaaaao...", "....oaaaaaaaao..", "...oaaaaaaaaaao.", "...oAAAAAAAAAAo."],
  },
};

// Bodies: rows 9-11 (torso and arms); t top, T top shade, s hands, k trim stripe.
const BODY = {
  down: ["..otttttttttto..", ".otttkkkkkkttto.", ".osottttttttoso."],
  big: [".otttttttttttto.", "otttkkkkkkkktTto", "osottttttttttoso"],
  side: ["....otttttto....", "...ottkkkkTto...", "...otttTTttto..."],
  bigSide: ["...otttttttto...", "..otttkkkkkTto..", "..ottttTTtttto.."],
};

// Legs: rows 12-15 for each step. p bottom, P bottom shade, f shoes, s skin.
/** @type {Record<string, {down: string[][], side: string[][]}>} */
const LEGS = {
  pants: {
    down: [
      ["...oppppppppo...", "...opppoopppo...", "...offo..offo...", "....oo....oo...."],
      ["...oppppppppo...", "...opppoopppo...", "...opppo.offo...", "...offo...oo...."],
    ],
    side: [
      ["....oppspppo....", "....oppppppo....", "....offffffo....", ".....oooooo....."],
      ["....oppspppo....", "...opppoopppo...", "..offfo..offffo.", "...ooo....oooo.."],
      ["....opppsppo....", "....oppopppo....", "...offooffffo...", "....oo..oooo...."],
    ],
  },
  skirt: {
    down: [
      ["..oppppppppppo..", "..oPPPPPPPPPPo..", "....osso..osso..", "....offo..offo.."],
      ["..oppppppppppo..", "..oPPPPPPPPPPo..", "....osso..offo..", "....offo...oo..."],
    ],
    side: [
      ["...opppspppo....", "...oPPPPPPPo....", ".....osso.......", ".....offfo......"],
      ["...opppspppo....", "...oPPPPPPPo....", "....oso.oso.....", "...ofo..offo...."],
      ["...oppppsppo....", "...oPPPPPPPo....", ".....osoos......", ".....offffo....."],
    ],
  },
  robe: {
    down: [
      ["...oppppppppo...", "..oppppppppppo..", "..oPPPPPPPPPPo..", "...offo..offo..."],
      ["...oppppppppo...", "..oppppppppppo..", "..oPPPPPPPPPPo..", "...offo...oo...."],
    ],
    side: [
      ["...opppsppppo...", "...opppppppppo..", "...oPPPPPPPPPo..", "....offo.offo..."],
      ["...opppsppppo...", "...opppppppppo..", "...oPPPPPPPPPo..", "...offo...offo.."],
      ["...oppppsppo....", "...opppppppppo..", "...oPPPPPPPPPo..", ".....offoffo...."],
    ],
  },
};
LEGS.shorts = {
  down: LEGS.pants.down.map((f) => f.map((r, i) => (i === 1 ? r.replace(/p/g, "s") : i === 2 ? r.replace(/p/g, "s") : r))),
  side: LEGS.pants.side.map((f) => f.map((r, i) => (i === 1 ? r.replace(/p/g, "s") : r))),
};

/** @param {string} c */
const shade = (c) => mix(c, "#101020", 0.28);

/**
 * @param {Look} L
 * @returns {Record<string, string|null>}
 */
function colorMap(L) {
  return {
    o: INK,
    s: L.skin,
    S: shade(L.skin),
    e: INK,
    h: L.hairC,
    H: shade(L.hairC),
    w: "#f8f8f8",
    a: L.accent || L.hairC,
    A: shade(L.accent || L.hairC),
    r: L.accent2 || "#f8f8f8",
    t: L.top,
    T: shade(L.top),
    k: L.trim || L.top,
    p: L.bottom,
    P: shade(L.bottom),
    f: L.shoes,
    g: "#d8f0f8",
    b: L.pack || L.top,
    B: shade(L.pack || L.top),
  };
}

/**
 * @param {Look} L @param {"down"|"up"|"side"} view @param {number} step
 * @returns {Grid}
 */
function person(L, view, step) {
  const g = new Grid(16, 16);
  const map = colorMap(L);
  const side = view === "side";
  // body and legs
  const body = side ? (L.big ? BODY.bigSide : BODY.side) : L.big ? BODY.big : BODY.down;
  g.stamp(body, map, 0, 9);
  const legs = LEGS[L.legs] || LEGS.pants;
  if (side) {
    g.stamp(legs.side[step], map, 0, 12);
  } else {
    // step 2 is step 1 mirrored
    g.stamp(legs.down[step === 0 ? 0 : 1], map, 0, 12, step === 2);
  }
  // a backpack shows from behind and from the side
  if (L.pack && view === "up") {
    g.stamp(["...obbbbbbo...", "...obBBBBbo...", "...obbbbbbo...", "....oooooo...."].map((r) => "." + r + "."), map, 0, 9);
  }
  if (L.pack && side) {
    g.stamp(["oboo", "obbo", "oBbo", ".oo."], map, 1, 9);
  }
  // head, hair, hat
  const head = HEADS[L.hair] || HEADS.short;
  g.stamp(head[view], map, 0, 0);
  if (L.hat) g.stamp(HATS[L.hat][view].filter(Boolean).length ? HATS[L.hat][view] : [], map, 0, 0);
  if (view === "down") {
    if (L.glasses) g.stamp(["...oggooooggo...", "...oggo..oggo..."], map, 0, 6);
    if (L.beard) g.stamp(["......hhhh......", "...ohhhhhhhho...", "....ohhhhhho...."], map, 0, 7);
    if (L.mustache) g.stamp(["......hhhh......"], map, 0, 8);
  }
  if (side) {
    if (L.glasses) g.stamp(["..........oggo..", "..........oggo.."], map, 0, 6);
    if (L.beard) g.stamp(["..........hhh...", ".......hhhhhho..", "........ohhho..."], map, 0, 7);
    if (L.mustache) g.stamp([".........hhhho.."], map, 0, 8);
  }
  return g;
}

// The small overworld creature: a round-eared critter.
const CRITTER = {
  down: [
    "................",
    "................",
    "................",
    "...oo......oo...",
    "..oaao....oaao..",
    "..oaaaooooaaao..",
    ".oaaaaaaaaaaaao.",
    ".oaaeaaaaaaeaao.",
    ".oaaeaaaaaaeaao.",
    ".oAaaaaooaaaaAo.",
    "..oAaawwwwaaAo..",
    "..oaawwwwwwaao..",
    "..oAawwwwwwaAo..",
    "...oAAAAAAAAo...",
    "...oAo....oAo...",
    "....o......o....",
  ],
  up: [
    "................",
    "................",
    "................",
    "...oo......oo...",
    "..oaao....oaao..",
    "..oaaaooooaaao..",
    ".oaaaaaaaaaaaao.",
    ".oaaaaaaaaaaaao.",
    ".oaaaaaaaaaaaao.",
    ".oAaaaaaaaaaaAo.",
    "..oAaaaaaaaaAo..",
    "..oaaaaaaaaaao..",
    "..oAaaawwaaaAo..",
    "...oAAAwwAAAo...",
    "...oAo.oo.oAo...",
    "....o......o....",
  ],
  side: [
    "................",
    "................",
    "................",
    "........oo.oo...",
    ".......oaooaao..",
    "......oaaaaaaao.",
    "......oaaaaaeao.",
    ".oo...oaaaaaaaoo",
    "oaao..oAaaaawwo.",
    "oaaooooaaaaaao..",
    ".oaaaaaaaaaaao..",
    ".oaaaaaaaaaao...",
    "..oaawwwwwaAo...",
    "..oAAAAAAAAAo...",
    "..oAo....oAo....",
    "...o......o.....",
  ],
};

/** @param {"down"|"up"|"side"} view @param {number} step */
function critter(view, step) {
  const g = new Grid(16, 16);
  const map = { o: INK, a: "#f0a850", A: "#c07838", w: "#fff0d8", e: INK };
  const rows = CRITTER[view].slice();
  if (step !== 0) {
    // the feet patter and the body bobs a pixel
    const feet = view === "side" ? ["...oAo..oAo.....", "....o....o......"] : ["...oAo.....oo...", "....o..........."];
    rows[14] = feet[0];
    rows[15] = feet[1];
  }
  g.stamp(rows, map, 0, step === 0 ? 0 : -0);
  return step === 2 ? (view === "side" ? g : g.flipX()) : g;
}

const charCache = memo((key) => {
  const [sprite, dir, step] = JSON.parse(key);
  const view = dir === "up" ? "up" : dir === "down" ? "down" : "side";
  let g;
  if (sprite === "creature") g = critter(view, step);
  else {
    const L = LOOKS[sprite];
    if (!L) throw new Error(`unknown character sprite ${sprite}`);
    g = person(L, view, step);
  }
  if (dir === "left") g = g.flipX();
  return g.toPixels();
});

/**
 * A 16x16 overworld person (or "creature") facing `dir`; step 0 stands, 1 and 2 stride.
 * @param {string} sprite one of CHARACTER_SPRITES
 * @param {Dir} dir
 * @param {number} [step] 0, 1 or 2
 * @returns {Pixels}
 */
export function characterPixels(sprite, dir, step = 0) {
  const s = ((Math.floor(step) % 3) + 3) % 3;
  return charCache(JSON.stringify([sprite, dir, s]));
}
