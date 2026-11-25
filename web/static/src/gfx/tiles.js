// @ts-check
// The 16x16 map tiles: one design per legend character (data/tiles.js), coloured by the
// map's theme. Templates name colours by single characters; each tile maps them to keys of
// the theme palette (gfx/palettes.js).

import { Grid, memo } from "./grid.js";
import { themePalette } from "./palettes.js";

/** @typedef {import("./grid.js").Pixels} Pixels */
/** @typedef {import("./palettes.js").ThemePalette} ThemePalette */

/** Frames each animation step lasts, in world frames. */
export const TILE_ANIM_FRAMES = 32;

/**
 * Paint a template whose characters name palette keys.
 * @param {Grid} g
 * @param {ThemePalette} pal
 * @param {string[]} rows
 * @param {Record<string, string>} keys template character -> palette key (or a '#colour')
 * @param {number} [x] @param {number} [y]
 */
function paint(g, pal, rows, keys, x = 0, y = 0) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const [ch, k] of Object.entries(keys)) map[ch] = k.startsWith("#") ? k : pal[k];
  g.stamp(rows, map, x, y);
  return g;
}

/** Ground: the theme's base colour with a few tufts. */
const GROUND = [
  "2222222222222222",
  "2222222222222222",
  "2222222222221222",
  "2232322222222222",
  "2223222222222222",
  "2222222222222222",
  "2222222222222222",
  "2222222223232222",
  "2122222222322222",
  "2222222222222222",
  "2222222222222222",
  "2222222222222222",
  "2222323222222212",
  "2222232222222222",
  "2222222222222222",
  "2222222222222222",
];
const GROUND_KEYS = { 1: "g1", 2: "g2", 3: "g3" };

/** @param {ThemePalette} pal */
function ground(pal) {
  return paint(new Grid(16, 16), pal, GROUND, GROUND_KEYS);
}

const PATH = [
  "1111111111111111",
  "1111111111111111",
  "1121111111111111",
  "1111111111113211",
  "1111111111111111",
  "1111111111111111",
  "1111113211111111",
  "1111111111111111",
  "1111111111111111",
  "1111111111111121",
  "1211111111111111",
  "1111111111111111",
  "1111111112311111",
  "1111111111111111",
  "1111111111111111",
  "1111211111111111",
];

const SAND = [
  "1111111111111111",
  "1111111111111111",
  "1112211111111111",
  "1111111111111111",
  "1111111111132111",
  "1111111111111111",
  "1111111111111111",
  "1111111111111111",
  "1111111221111111",
  "1311111111111111",
  "1111111111111111",
  "1111111111111111",
  "1111111111122111",
  "1111111111111111",
  "1111311111111111",
  "1111111111111111",
];

const SNOW = [
  "1111111111111111",
  "1111111111111111",
  "1112221111111111",
  "1111111111111111",
  "1111111111111311",
  "1111111111111111",
  "1111111111111111",
  "1111111112221111",
  "1111111111111111",
  "1131111111111111",
  "1111111111111111",
  "1111111111111111",
  "1111122211111111",
  "1111111111111131",
  "1111111111111111",
  "1111111111111111",
];

// Tall grass: rows of pointed blades, light inside dark edges; the tips sway.
const TALL = [
  [
    "2232222222322222",
    "2313222223132222",
    "2313222223132223",
    "3111322231113231",
    "1111131311111311",
    "2222322222223222",
    "2223132222231322",
    "3223132322231323",
    "1331113133111311",
    "1111111311111131",
    "2232222222322222",
    "2313222223132222",
    "2313222223132223",
    "3111322231113231",
    "1111131311111311",
    "3333333333333333",
  ],
  [
    "2223222222232222",
    "2231322222313222",
    "2313222223132223",
    "3111322231113231",
    "1111131311111311",
    "2222232222222322",
    "2222313222223132",
    "3223132322231323",
    "1331113133111311",
    "1111111311111131",
    "2223222222232222",
    "2231322222313222",
    "2313222223132223",
    "3111322231113231",
    "1111131311111311",
    "3333333333333333",
  ],
];

const FLOWER = [
  ["22222222", "222ww222", "222ww222", "2wwyyww2", "2wwyyww2", "222ww222", "222ww222", "22222222"],
  ["22222222", "2ww22ww2", "2wwwwww2", "22wyyw22", "22wyyw22", "2wwwwww2", "2ww22ww2", "22222222"],
];
const TUFT_QUAD = ["22222222", "22222222", "22323222", "22232222", "22222222", "22222122", "22222222", "22222222"];

const TREE = [
  "....44444444....",
  "..441111112244..",
  ".41111122222224.",
  "4111122222222334",
  "4112222232222234",
  "4122223222222234",
  "4122222222232334",
  "4222322222322334",
  "4223222223222334",
  "4322222222223334",
  ".43322222223334.",
  ".44333333333344.",
  "...4444kkK444...",
  "......4kkK4.....",
  ".....g4kKK4g....",
  "......g444g.....",
];

const SMALL_TREE = [
  ".......44.......",
  "......4114......",
  ".....411124.....",
  ".....412224.....",
  "....41122224....",
  "....41222334....",
  "...4112222234...",
  "...4122223334...",
  "..411222222334..",
  "..412222233334..",
  ".41122222233334.",
  ".44333333333344.",
  "...4444kK4444...",
  "......4kK4......",
  ".....g4kK4g.....",
  "......gggg......",
];

const ROCK = [
  "................",
  ".....444444.....",
  "...4411111144...",
  "..411111122224..",
  ".41111222222234.",
  ".41122222222334.",
  "4112222222223334",
  "4122222222233334",
  "4122222223333334",
  "4122222333333334",
  "4222233333333334",
  "4223333333333344",
  ".43333333333344.",
  "g44444444444444g",
  ".gggggggggggggg.",
  "................",
];

const CLIFF = [
  "1111111111111111",
  "2222111122221111",
  "4444222244442222",
  "3333444433334444",
  "2233333322333333",
  "3322333333223333",
  "3333223333332233",
  "4433332244333322",
  "3344333333443333",
  "3333443333334433",
  "2233334422333344",
  "3322333333223333",
  "3333223333332233",
  "4433332244333322",
  "4444444444444444",
  "4444444444444444",
];


// The ledge you drop down: a lit lip, its dark face scalloped downward, a shadow below.
const LEDGE = [
  "2222222222222222",
  "2222222222221222",
  "2232322222222222",
  "2223222222222222",
  "2222222222222222",
  "3333333333333333",
  "1111111111111111",
  "1111111111111111",
  "2222222222222222",
  "4444444444444444",
  "3334333433343334",
  "3343334333433343",
  "4444444444444444",
  "2442244224422442",
  "3333333333333333",
  "2222222222222222",
];

const BRIDGE = [
  "3333333333333333",
  "1111111111111111",
  "1121111111111121",
  "2222222222222222",
  "3333333333333333",
  "1111111111111111",
  "1111111211111111",
  "2222222222222222",
  "3333333333333333",
  "1111111111111111",
  "1211111111111211",
  "2222222222222222",
  "3333333333333333",
  "1111111111111111",
  "1111111211111111",
  "2222222222222222",
];

const TOWN = [
  "1111111311111113",
  "1222222312222223",
  "1222222312222223",
  "1222222312222223",
  "1222222312222223",
  "1222222312222223",
  "1222222312222223",
  "3333333333333333",
  "1111111111111311",
  "2222231222222312",
  "2222231222222312",
  "2222231222222312",
  "2222231222222312",
  "2222231222222312",
  "2222231222222312",
  "3333333333333333",
];

const FLOOR = [
  "1111111111111111",
  "2222222222222222",
  "1111131111111111",
  "1111131111111111",
  "1111131111111111",
  "3333333333333333",
  "1111111111113111",
  "1111111111113111",
  "1111111111113111",
  "2222222222222222",
  "3333333333333333",
  "1113111111111111",
  "1113111111111111",
  "1113111111111111",
  "2222222222222222",
  "3333333333333333",
];

const WALL = [
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "1112111211121112",
  "3333333333333333",
  "2222222222222222",
  "3333333333333333",
  "1111111111111111",
  "3333333333333333",
  "4444444444444444",
];

const COUNTER = [
  "4444444444444444",
  "1111111111111111",
  "1111111111111111",
  "1111111111111111",
  "1111111111111111",
  "1111111111111111",
  "2222222222222222",
  "4444444444444444",
  "2222222222222222",
  "2333333223333332",
  "2322222232222222",
  "2322222232222222",
  "2322222232222222",
  "2222222222222222",
  "3333333333333333",
  "4444444444444444",
];

const SHELF = [
  "4444444444444444",
  "4333333333333334",
  "43rRbBy3gGrR3bB4",
  "43rRbBy3gGrR3bB4",
  "43rRbBy3gGrRybB4",
  "43rRbByygGrRybB4",
  "4111111111111114",
  "4222222222222224",
  "433333333333gG34",
  "4bBgGyy3rRbBgG34",
  "4bBgGyy3rRbBgGy4",
  "4bBgGyyyrRbBgGy4",
  "4111111111111114",
  "4222222222222224",
  "4333333333333334",
  "4444444444444444",
];

const PLANT = [
  "ffffff4444ffffff",
  "ffff44gg114fffff",
  "fff41gg1114g4fff",
  "ff4g11g11g1gg4ff",
  "f4gg1g4gg41g1g4f",
  "f4g1gg41g4gg1g4f",
  "ff4gg41gg14gg4ff",
  "f4gg1g4gg4g11g4f",
  "f4g11gg44gg1gg4f",
  "ff44gg4ff4gg44ff",
  "fff44444444444ff",
  "fff4rrRRRRRrr4ff",
  "ffff4rrrrRRR4fff",
  "ffff4rrrrRRR4fff",
  "fffff4444444ffff",
  "ffffffffffffffff",
];

const TABLE = [
  "ffffffffffffffff",
  "f44444444444444f",
  "4111111111111124",
  "4111111111111124",
  "4111111111111124",
  "4111111111111124",
  "4111111111111124",
  "4111111111111124",
  "4111111111111124",
  "4222222222222224",
  "4333333333333334",
  "f44444444444444f",
  "f432ffffffff234f",
  "f432ffffffff234f",
  "f444ffffffff444f",
  "ffffffffffffffff",
].map((r) => r.slice(0, 16));

const MAT = [
  "ffffffffffffffff",
  "ffffffffffffffff",
  "ffffffffffffffff",
  "f44444444444444f",
  "f4rrrrrrrrrrrr4f",
  "f4rwwwwwwwwwwr4f",
  "f4rwRRRRRRRRwr4f",
  "f4rwRRRRRRRRwr4f",
  "f4rwRRRRRRRRwr4f",
  "f4rwRRRRRRRRwr4f",
  "f4rwwwwwwwwwwr4f",
  "f4rrrrrrrrrrrr4f",
  "f44444444444444f",
  "ffffffffffffffff",
  "ffffffffffffffff",
  "ffffffffffffffff",
];

const COMPUTER = [
  "ffffffffffffffff",
  "ff444444444444ff",
  "f41111111111114f",
  "f41kkkkkkkkkk34f",
  "f41kBBBBBBBBk34f",
  "f41kBbbBBBBBk34f",
  "f41kBBBBBBBBk34f",
  "f41kBBBBBbbBk34f",
  "f41kkkkkkkkkk34f",
  "f41333333333334f",
  "ff444441144444ff",
  "4444444444444444",
  "4wwwwwwwwwwwwww4",
  "4w1k1k1k1k1k1kw4",
  "4333333333333334",
  "4444444444444444",
];

const HEALER = [
  "ffffffffffffffff",
  "f44444444444444f",
  "4wwwwwwwwwwwwww4",
  "4wkkkkkkkkkkkkw4",
  "4wkCCkkCCkkCCkw4",
  "4wkCcRkCcRkCcRw4",
  "4wkRRkkRRkkRRkw4",
  "4wkkkkkkkkkkkkw4",
  "4wwwwwwwwwwwwww4",
  "4ppppppppppppp44",
  "4pwwwpppppGGGp34",
  "4pppppppppGGGp34",
  "4pwwwppppppppp34",
  "4ppppppppppppp34",
  "4333333333333334",
  "4444444444444444",
];

const CAVE_FLOOR = [
  "2222222222222222",
  "2222222222222222",
  "2213222222222222",
  "2222222222221222",
  "2222222222222322",
  "2222222222222222",
  "2222222122222222",
  "2222222232222222",
  "2222222222222222",
  "2222222222222222",
  "2312222222222222",
  "2222222222213222",
  "2222222222222222",
  "2222212222222222",
  "2222223222222222",
  "2222222222222222",
];

const CAVE_WALL = [
  "3333444333334444",
  "2222334222223334",
  "1122233411222334",
  "1112223311122233",
  "2111223321112223",
  "2211223322111223",
  "3222334332211233",
  "4333344443322334",
  "3444443333444444",
  "2222334322223334",
  "1112233411122334",
  "1111223311112233",
  "2111223321111223",
  "3221123332211233",
  "4332234443322344",
  "4444444444444444",
];

const LADDER = [
  "2222222222222222",
  "2244444444444422",
  "2413333333333142",
  "24k4k444444k4k42",
  "24kKKKKKKKKKkk42",
  "24k4k444444k4k42",
  "24k4k444444k4k42",
  "24kKKKKKKKKKkk42",
  "24k4k444444k4k42",
  "24k4k444444k4k42",
  "24kKKKKKKKKKkk42",
  "24k4k444444k4k42",
  "24k4k444444k4k42",
  "2244444444444422",
  "2222222222222222",
  "2222222222222222",
];

const SPIRE_FLOOR = [
  "1111111211111112",
  "1111111211111112",
  "1113111211131112",
  "1133311211333112",
  "1113111211131112",
  "1111111211111112",
  "1111111211111112",
  "2222222222222222",
  "1111111211111112",
  "1111111211111112",
  "1113111211131112",
  "1133311211333112",
  "1113111211131112",
  "1111111211111112",
  "1111111211111112",
  "2222222222222222",
];

const SPIRE_WALL = [
  "2222222422222224",
  "3333333433333334",
  "3333333433333334",
  "3333333433333334",
  "4444444444444444",
  "2224222222242222",
  "3334333333343333",
  "3334333333343333",
  "3334333333343333",
  "4444444444444444",
  "2222222422222224",
  "3333333433333334",
  "3333333433333334",
  "3333333433333334",
  "4444444444444444",
  "4444444444444444",
];

/**
 * Water: a deep base with drifting wave crests.
 * @param {ThemePalette} pal @param {number} phase @param {string[]} keys light, base, deep, foam
 */
function water(pal, phase, keys) {
  const [light, base, deep, foam] = keys.map((k) => pal[k]);
  const g = new Grid(16, 16, base);
  const crest = ["..ff..", ".lllll", "l....."];
  const map = { f: foam, l: light };
  const shift = phase % 2 === 0 ? 0 : 2;
  const spots = [
    [1, 2],
    [9, 6],
    [3, 10],
    [11, 13],
  ];
  for (const [x, y] of spots) {
    g.stamp(crest, map, (x + shift) % 16, y);
    g.stamp(crest, map, ((x + shift) % 16) - 16, y);
  }
  for (const [x, y] of [
    [7, 1],
    [14, 9],
    [0, 14],
    [6, 12],
  ]) {
    g.set(x + (phase % 2 === 0 ? 0 : 1), y, deep);
  }
  return g;
}

/** @type {Record<string, (pal: ThemePalette, phase: number) => Grid>} */
const DRAW = {
  ".": (pal) => ground(pal),
  ":": (pal) => paint(new Grid(16, 16), pal, PATH, { 1: "p1", 2: "p2", 3: "p3" }),
  '"': (pal, phase) => paint(new Grid(16, 16), pal, TALL[phase % 2], { 1: "tg1", 2: "tg2", 3: "tg3" }),
  F: (pal, phase) => {
    const g = ground(pal);
    const f = FLOWER[phase % 2];
    const quad = TUFT_QUAD;
    paint(g, pal, quad, GROUND_KEYS, 8, 0);
    paint(g, pal, quad, GROUND_KEYS, 0, 8);
    paint(g, pal, f, { 2: "g2", w: "fl1", y: "flc", 3: "g3" }, 0, 0);
    paint(g, pal, FLOWER[(phase + 1) % 2], { 2: "g2", w: "fl2", y: "flc", 3: "g3" }, 8, 8);
    return g;
  },
  S: (pal) => paint(new Grid(16, 16), pal, SAND, { 1: "s1", 2: "s2", 3: "s3" }),
  n: (pal) => paint(new Grid(16, 16), pal, SNOW, { 1: "n1", 2: "n2", 3: "n3" }),
  T: (pal) => paint(ground(pal), pal, TREE, { 1: "t1", 2: "t2", 3: "t3", 4: "t4", k: "bark", K: "barkD", g: "g3" }),
  t: (pal) =>
    paint(ground(pal), pal, SMALL_TREE, { 1: "tg1", 2: "tg2", 3: "t3", 4: "t4", k: "bark", K: "barkD", g: "g3" }),
  R: (pal) => paint(ground(pal), pal, ROCK, { 1: "r1", 2: "r2", 3: "r3", 4: "r4", g: "g3" }),
  "^": (pal) => paint(new Grid(16, 16), pal, CLIFF, { 1: "r1", 2: "r2", 3: "r3", 4: "r4" }),
  f: (pal) => {
    const g = ground(pal);
    for (const y of [4, 9]) {
      g.rect(0, y, 16, 1, pal.wd3).rect(0, y + 1, 16, 1, pal.wd1).rect(0, y + 2, 16, 1, pal.wd2).rect(0, y + 3, 16, 1, pal.wd3);
    }
    g.rect(5, 14, 6, 1, pal.g3);
    g.rect(6, 3, 4, 11, pal.wd3).rect(7, 3, 1, 10, pal.wd1).rect(8, 3, 1, 10, pal.wd2).rect(7, 2, 2, 1, pal.wd3);
    return g;
  },
  "~": (pal, phase) => water(pal, phase, ["w1", "w2", "w3", "w0"]),
  v: (pal) => paint(new Grid(16, 16), pal, LEDGE, { 1: "g1", 2: "g2", 3: "g3", 4: "g4" }),
  "<": (pal) => {
    // The down ledge turned so its face looks left.
    const d = DRAW.v(pal, 0);
    const g = new Grid(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) g.set(x, y, d.get(y, 15 - x));
    return g;
  },
  ">": (pal) => DRAW["<"](pal, 0).flipX(),
  "=": (pal) => paint(new Grid(16, 16), pal, BRIDGE, { 1: "wd1", 2: "wd2", 3: "wd3" }),
  "+": (pal) => paint(new Grid(16, 16), pal, TOWN, { 1: "tw1", 2: "tw2", 3: "tw3" }),
  _: (pal) => paint(new Grid(16, 16), pal, FLOOR, { 1: "fo1", 2: "fo2", 3: "fo3" }),
  "|": (pal) => paint(new Grid(16, 16), pal, WALL, { 1: "wa1", 2: "wa2", 3: "wa3", 4: "wa4" }),
  c: (pal) => paint(new Grid(16, 16), pal, COUNTER, { 1: "wd1", 2: "wd2", 3: "wd3", 4: "ink" }),
  b: (pal) =>
    paint(new Grid(16, 16), pal, SHELF, {
      1: "wd1",
      2: "wd2",
      3: "wd3",
      4: "ink",
      r: "#d84848",
      R: "#983030",
      b: "#4870d0",
      B: "#2c4890",
      g: "#58a858",
      G: "#30703c",
      y: "#e8c050",
    }),
  p: (pal) =>
    paint(paint(new Grid(16, 16), pal, FLOOR, { 1: "fo1", 2: "fo2", 3: "fo3" }), pal, PLANT, {
      1: "#88d060",
      g: "#3c9040",
      4: "ink",
      r: "#d07848",
      R: "#984c30",
    }),
  x: (pal) =>
    paint(paint(new Grid(16, 16), pal, FLOOR, { 1: "fo1", 2: "fo2", 3: "fo3" }), pal, TABLE, {
      1: "wd1",
      2: "wd2",
      3: "wd3",
      4: "ink",
    }),
  m: (pal) =>
    paint(paint(new Grid(16, 16), pal, FLOOR, { 1: "fo1", 2: "fo2", 3: "fo3" }), pal, MAT, {
      4: "wa4",
      r: "#a83838",
      R: "#d05048",
      w: "#f0c070",
    }),
  P: (pal) =>
    paint(paint(new Grid(16, 16), pal, FLOOR, { 1: "fo1", 2: "fo2", 3: "fo3" }), pal, COMPUTER, {
      1: "#e0e0e8",
      3: "#9898a8",
      4: "ink",
      k: "#404050",
      B: "#4878d0",
      b: "#a8d0f8",
      w: "wd1",
    }),
  H: (pal) =>
    paint(paint(new Grid(16, 16), pal, FLOOR, { 1: "fo1", 2: "fo2", 3: "fo3" }), pal, HEALER, {
      w: "#f8f8f8",
      k: "#386078",
      C: "#f8f8f8",
      c: "#f8f8f8",
      R: "#e85870",
      p: "#f8b8c8",
      3: "#c87890",
      G: "#58d878",
      4: "ink",
    }),
  o: (pal) => paint(new Grid(16, 16), pal, CAVE_FLOOR, { 1: "c1", 2: "c2", 3: "c3" }),
  O: (pal) => paint(new Grid(16, 16), pal, CAVE_WALL, { 1: "c1", 2: "c2", 3: "c3", 4: "c4" }),
  d: (pal) => paint(new Grid(16, 16), pal, CAVE_FLOOR, { 1: "c3", 2: "c4", 3: "#100804" }),
  w: (pal, phase) => water(pal, phase, ["cw1", "cw2", "cw3", "cw0"]),
  L: (pal) =>
    paint(paint(new Grid(16, 16), pal, CAVE_FLOOR, { 1: "c1", 2: "c2", 3: "c3" }), pal, LADDER, {
      1: "c1",
      2: "c2",
      3: "c3",
      4: "#100804",
      k: "wd1",
      K: "wd2",
    }),
  "#": (pal) => paint(new Grid(16, 16), pal, SPIRE_FLOOR, { 1: "sp1", 2: "sp2", 3: "spg" }),
  "%": (pal) => paint(new Grid(16, 16), pal, SPIRE_WALL, { 2: "sp2", 3: "sp3", 4: "sp4" }),
  " ": (pal) => new Grid(16, 16, pal.void),
};

/** Legend characters whose art changes with the frame counter. */
export const ANIMATED_TILES = ["~", "w", "F", '"'];

const tileCache = memo((key) => {
  const [ch, theme, phase] = JSON.parse(key);
  const draw = DRAW[ch];
  if (!draw) throw new Error(`no tile art for ${JSON.stringify(ch)}`);
  const g = draw(themePalette(theme), phase);
  // Anything a template left uncovered takes the ground colour, so no tile has holes.
  return g.replace(null, themePalette(theme).g2).toPixels();
});

/**
 * The 16x16 tile for a map legend character in a theme at a world frame.
 * @param {string} ch a key of TILES
 * @param {string} theme one of THEMES
 * @param {number} [frame] the world's frame counter
 * @returns {Pixels}
 */
export function tilePixels(ch, theme, frame = 0) {
  const phase = ANIMATED_TILES.includes(ch) ? Math.floor(frame / TILE_ANIM_FRAMES) % 2 : 0;
  return tileCache(JSON.stringify([ch, theme, phase]));
}

/** Exposed for the buildings, which stand on ground. */
export { ground as groundGrid, paint };
