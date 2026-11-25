// @ts-check
// Theme palettes: every map theme recolours the same tile and building art. A theme is
// the meadow palette with some colours swapped; tiles name colours by these keys.

/** @typedef {Record<string, string>} ThemePalette */

/** Colours shared by everything: the window and text colours, the darkest outline. */
export const UI = {
  light: "#f8f8f0",
  dark: "#202020",
  mid: "#a0a8b8",
  shade: "#d0d8e0",
  frame: "#384868",
  frameLight: "#7890c0",
};

/** @type {ThemePalette} */
const MEADOW = {
  ink: "#183018",
  // ground (".") and its details
  g1: "#b8e890",
  g2: "#88cc68",
  g3: "#58a048",
  g4: "#2f6e34",
  // path
  p1: "#f0e0b0",
  p2: "#d8c088",
  p3: "#a88858",
  // tall grass
  tg1: "#88d860",
  tg2: "#48a040",
  tg3: "#1e5e2a",
  // trees
  t1: "#80c858",
  t2: "#48983c",
  t3: "#246030",
  t4: "#123820",
  bark: "#8a5a30",
  barkD: "#583418",
  // rock and cliff
  r1: "#e8e0d0",
  r2: "#b8a890",
  r3: "#807060",
  r4: "#463c34",
  // water
  w0: "#e8f8ff",
  w1: "#88c8f8",
  w2: "#5098e8",
  w3: "#2c64c0",
  // sand and snow
  s1: "#f8ecc0",
  s2: "#e8d098",
  s3: "#c0a060",
  n1: "#ffffff",
  n2: "#d8e8f8",
  n3: "#a0b8d8",
  // flowers
  fl1: "#f86878",
  fl2: "#f8f8f8",
  flc: "#f8c838",
  // wood (fence, bridge, furniture)
  wd1: "#e8b070",
  wd2: "#b87838",
  wd3: "#784820",
  // town paving
  tw1: "#e8e0d0",
  tw2: "#c8bca8",
  tw3: "#988c78",
  // indoors
  fo1: "#f0d8a8",
  fo2: "#d8b880",
  fo3: "#a88050",
  wa1: "#f8f0d8",
  wa2: "#e0d0b0",
  wa3: "#a89070",
  wa4: "#706048",
  // caves
  c1: "#d0b088",
  c2: "#a88460",
  c3: "#705438",
  c4: "#3c2818",
  cw0: "#b0d0f8",
  cw1: "#6890c8",
  cw2: "#3c64a0",
  cw3: "#203c70",
  // gym spires
  sp1: "#e0d8f0",
  sp2: "#a898d0",
  sp3: "#6c5c9c",
  sp4: "#3a2c60",
  spg: "#f0c040",
  // buildings
  roof1: "#e87858",
  roof2: "#b84838",
  roof3: "#782828",
  wall1: "#f8f0e0",
  wall2: "#d8c8b0",
  wall3: "#a08870",
  glass1: "#c0e8f8",
  glass2: "#6890c0",
  door1: "#a06838",
  door2: "#603818",
  void: "#000000",
};

/** @type {Record<string, Partial<ThemePalette>>} */
const OVERRIDES = {
  meadow: {},
  forest: {
    ink: "#102010",
    g1: "#98c870",
    g2: "#689e50",
    g3: "#447838",
    g4: "#244c24",
    p1: "#d8c090",
    p2: "#b89868",
    p3: "#7c6040",
    tg1: "#70b848",
    tg2: "#3a8034",
    tg3: "#164020",
    t1: "#5ca048",
    t2: "#30703a",
    t3: "#184828",
    t4: "#0a2414",
    roof1: "#a8885c",
    roof2: "#7a5c38",
    roof3: "#4a3420",
  },
  beach: {
    g1: "#f8f0c8",
    g2: "#f0dca0",
    g3: "#d0b878",
    g4: "#a08850",
    tg1: "#a8d868",
    tg2: "#70a840",
    tg3: "#3c6c28",
    t1: "#98d860",
    t2: "#58a040",
    t3: "#2c6830",
    w0: "#f0ffff",
    w1: "#80e0e8",
    w2: "#40b8d8",
    w3: "#1880b0",
    roof1: "#58b8e0",
    roof2: "#2888b8",
    roof3: "#185878",
  },
  snow: {
    ink: "#182838",
    g1: "#ffffff",
    g2: "#e0ecf8",
    g3: "#b8cce8",
    g4: "#8098c0",
    p1: "#e8e8f0",
    p2: "#c8d0e0",
    p3: "#98a4bc",
    tg1: "#b0d8c8",
    tg2: "#6c9c98",
    tg3: "#345c60",
    t1: "#f8ffff",
    t2: "#4c8870",
    t3: "#285448",
    t4: "#14302c",
    w1: "#a8d8f8",
    w2: "#70a8e0",
    w3: "#4070b8",
    fl1: "#a0c8f8",
    roof1: "#f8f8ff",
    roof2: "#9098c8",
    roof3: "#585c90",
  },
  volcanic: {
    ink: "#201010",
    g1: "#b8a090",
    g2: "#907868",
    g3: "#685448",
    g4: "#40302c",
    p1: "#d0b098",
    p2: "#a88870",
    p3: "#705848",
    tg1: "#a8a050",
    tg2: "#707030",
    tg3: "#3c3c18",
    t1: "#a09060",
    t2: "#6c6038",
    t3: "#3c3420",
    t4: "#201810",
    r1: "#c89880",
    r2: "#9c6c58",
    r3: "#6c4038",
    r4: "#3c201c",
    w0: "#fff0a0",
    w1: "#f8a048",
    w2: "#e06028",
    w3: "#a02c18",
    fl1: "#f8a030",
    roof1: "#787080",
    roof2: "#504858",
    roof3: "#302838",
  },
  city: {
    g1: "#c8e0a8",
    g2: "#98c088",
    g3: "#6c9868",
    g4: "#3c6048",
    p1: "#e0e0e0",
    p2: "#c0c0c8",
    p3: "#8c8c98",
    roof1: "#7898d8",
    roof2: "#4868a8",
    roof3: "#2c3c70",
  },
  indoor: {
    g1: "#f0d8a8",
    g2: "#d8b880",
    g3: "#a88050",
    g4: "#705030",
  },
  cave: {
    ink: "#201408",
    g1: "#d0b088",
    g2: "#a88460",
    g3: "#705438",
    g4: "#3c2818",
    p1: "#d8c098",
    p2: "#b09070",
    p3: "#786048",
    tg1: "#a0b070",
    tg2: "#68783c",
    tg3: "#384420",
    w1: "#6890c8",
    w2: "#3c64a0",
    w3: "#203c70",
  },
  spire: {
    ink: "#1c1430",
    g1: "#e0d8f0",
    g2: "#a898d0",
    g3: "#6c5c9c",
    g4: "#3a2c60",
    p1: "#f0e8f8",
    p2: "#c8bce0",
    p3: "#8c7cb0",
  },
};

/** @type {Map<string, ThemePalette>} */
const built = new Map();

/**
 * The full palette for a theme; an unknown theme gets the meadow's.
 * @param {string} theme
 * @returns {ThemePalette}
 */
export function themePalette(theme) {
  let p = built.get(theme);
  if (!p) {
    p = /** @type {ThemePalette} */ ({ ...MEADOW, ...(OVERRIDES[theme] || {}) });
    built.set(theme, p);
  }
  return p;
}
