// @ts-check
// The map legend: each character a map's rows use, and how the world treats it. The art
// (gfx/tiles.js) draws every one; tests check that every map uses only these.

/**
 * @typedef {object} TileDef
 * @property {string} name
 * @property {boolean} [solid]     blocks walking
 * @property {"grass"|"cave"|"water"} [encounter] wild creatures appear here
 * @property {boolean} [water]     crossed only by surfing (the Tide Board)
 * @property {"down"|"left"|"right"} [ledge] jumped in that direction, never climbed back
 * @property {"cut"} [needs]        solid until cleared with the Brush Cutter
 * @property {boolean} [talk]      a counter: talking across it reaches the NPC behind
 * @property {boolean} [dark]      part of a cave that needs the Lantern to see
 */

/** @type {Record<string, TileDef>} */
export const TILES = {
  // Outdoors
  ".": { name: "ground" },
  ":": { name: "path" },
  '"': { name: "tall grass", encounter: "grass" },
  F: { name: "flowers" },
  S: { name: "sand" },
  n: { name: "snow" },
  T: { name: "tree", solid: true },
  t: { name: "small tree", solid: true, needs: "cut" },
  R: { name: "rock", solid: true },
  "^": { name: "cliff", solid: true },
  f: { name: "fence", solid: true },
  "~": { name: "water", solid: true, water: true, encounter: "water" },
  v: { name: "ledge (down)", ledge: "down" },
  "<": { name: "ledge (left)", ledge: "left" },
  ">": { name: "ledge (right)", ledge: "right" },
  "=": { name: "bridge" },
  "+": { name: "town floor" },
  // Indoors
  _: { name: "floor" },
  "|": { name: "wall", solid: true },
  c: { name: "counter", solid: true, talk: true },
  b: { name: "bookshelf", solid: true },
  p: { name: "potted plant", solid: true },
  x: { name: "table", solid: true },
  m: { name: "doormat" },
  P: { name: "computer", solid: true },
  H: { name: "healing machine", solid: true },
  // Caves and the gym spires
  o: { name: "cave floor", encounter: "cave" },
  O: { name: "cave wall", solid: true },
  d: { name: "dark cave floor", encounter: "cave", dark: true },
  w: { name: "cave water", solid: true, water: true, encounter: "water" },
  L: { name: "ladder" },
  "#": { name: "spire floor" },
  "%": { name: "spire wall", solid: true },
  " ": { name: "void", solid: true },
};

/** The building kinds a map can place; each is solid except its door. */
export const BUILDINGS = {
  house: { w: 4, h: 3, door: [1, 2] },
  bighouse: { w: 6, h: 4, door: [2, 3] },
  center: { w: 5, h: 4, door: [2, 3] },
  mart: { w: 4, h: 4, door: [1, 3] },
  lab: { w: 6, h: 4, door: [2, 3] },
  spire: { w: 6, h: 5, door: [2, 4] },
  gate: { w: 4, h: 3, door: [1, 2] },
  cave: { w: 2, h: 2, door: [0, 1] },
};

/** Map themes recolour the same legend: a map names one. */
export const THEMES = ["meadow", "forest", "beach", "snow", "volcanic", "city", "indoor", "cave", "spire"];
