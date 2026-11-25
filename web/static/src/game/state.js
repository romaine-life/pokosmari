// @ts-check
// Everything a save holds: the player, their creatures and bag, and the world's flags.

/** @typedef {import("./creature.js").Creature} Creature */
/** @typedef {"up"|"down"|"left"|"right"} Dir */

/**
 * @typedef {object} Options
 * @property {"slow"|"mid"|"fast"} textSpeed
 * @property {number} music   0-10
 * @property {number} sfx     0-10
 */

/**
 * @typedef {object} State
 * @property {number} version
 * @property {string} name          the player's name
 * @property {string} rival         the rival's name
 * @property {number} money
 * @property {{map: string, x: number, y: number, dir: Dir}} pos
 * @property {{map: string, x: number, y: number}} lastCenter  where a blackout or the escape item returns to
 * @property {Creature[]} party     one to six
 * @property {Creature[]} box       the storage PC
 * @property {Record<string, number>} bag
 * @property {string[]} badges      warden ids, in the order won
 * @property {{seen: string[], caught: string[]}} dex
 * @property {Record<string, boolean|number|string>} flags   story flags; "trainer:<id>" once beaten, "item:<map>:<n>" once picked up
 * @property {string[]} visited     town map ids the Wing Whistle can reach
 * @property {number} repel         steps of repel left
 * @property {boolean} biking
 * @property {boolean} surfing
 * @property {number} playSeconds
 * @property {Options} options
 * @property {number} savedAt       ms since epoch, 0 if never saved
 */

export const STATE_VERSION = 2;
export const PARTY_MAX = 6;
export const BOX_MAX = 240;

/** @returns {State} */
export function newState() {
  return {
    version: STATE_VERSION,
    name: "",
    rival: "Kip",
    money: 3000,
    pos: { map: "fernhollow-home", x: 3, y: 3, dir: "down" },
    lastCenter: { map: "fernhollow-home", x: 3, y: 3 },
    party: [],
    box: [],
    bag: {},
    badges: [],
    dex: { seen: [], caught: [] },
    flags: {},
    visited: [],
    repel: 0,
    biking: false,
    surfing: false,
    playSeconds: 0,
    options: { textSpeed: "mid", music: 7, sfx: 8 },
    savedAt: 0,
  };
}

/**
 * Note a species as seen (and caught) in the dex.
 * @param {State} s
 * @param {string} species
 * @param {boolean} caught
 */
export function markDex(s, species, caught) {
  if (!s.dex.seen.includes(species)) s.dex.seen.push(species);
  if (caught && !s.dex.caught.includes(species)) s.dex.caught.push(species);
}

/**
 * Add items to the bag.
 * @param {State} s
 * @param {string} item
 * @param {number} n
 */
export function addItem(s, item, n = 1) {
  s.bag[item] = (s.bag[item] ?? 0) + n;
  if (s.bag[item] <= 0) delete s.bag[item];
}

/**
 * Give the player a creature: into the party if there's room, else the storage PC.
 * @param {State} s
 * @param {Creature} c
 * @returns {"party"|"box"|"full"}
 */
export function receiveCreature(s, c) {
  if (s.party.length < PARTY_MAX) {
    s.party.push(c);
    return "party";
  }
  if (s.box.length < BOX_MAX) {
    s.box.push(c);
    return "box";
  }
  return "full";
}
