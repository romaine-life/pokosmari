// @ts-check
// A small seeded random source (mulberry32). Battles and encounters take one, so tests can
// replay them exactly; the game seeds it from the clock.

/** @typedef {{ next(): number, int(min: number, max: number): number, chance(p: number): boolean, pick<T>(list: T[]): T, state(): number }} Rng */

/**
 * @param {number} seed
 * @returns {Rng}
 */
export function createRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** An integer from min to max, both included. */
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (list) => list[Math.floor(next() * list.length)],
    state: () => a,
  };
}
