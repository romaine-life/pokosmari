// @ts-check
// Creature cries, synthesized from the species id: a hash of the id seeds every choice
// (length, pitch contour, timbre, noise), so each species has its own cry and always the
// same one. A cry plays on both pulses and the noise channel, as the GB's cries did, and
// leaves the music's wave channel alone.

/** @typedef {import("./notation.js").Piece} Piece */
/** @typedef {import("./notation.js").NoteEvent} NoteEvent */

/** A cry's step: 1/120 s, fine enough for its contours. */
const STEP_SEC = 1 / 120;

/**
 * FNV-1a, 32 bits.
 * @param {string} s
 */
export function hashId(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * mulberry32: a small seeded source, kept here so cries never change with other code.
 * @param {number} seed
 */
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} lo
 * @param {number} hi
 * @param {number} v
 */
const clamp = (lo, hi, v) => Math.min(hi, Math.max(lo, v));

/**
 * @param {number} step
 * @param {number} len
 * @param {Partial<NoteEvent>} e
 * @returns {NoteEvent}
 */
function note(step, len, e) {
  return { step, len, pitch: 60, vol: 15, env: 0, duty: 2, wave: 0, gate: 8, vib: 0, ...e };
}

/**
 * The cry of a species as a piece that plays once.
 * @param {string | number} speciesId
 * @returns {Piece}
 */
export function cryPiece(speciesId) {
  const rnd = random(hashId(String(speciesId)));
  const r = (/** @type {number} */ lo, /** @type {number} */ hi) => lo + rnd() * (hi - lo);
  const pick = /** @template T @param {T[]} list @returns {T} */ (list) =>
    list[Math.floor(rnd() * list.length)];

  const total = Math.round(r(0.3, 0.8) / STEP_SEC);
  const base = r(50, 78); // voice size: low growlers to high chirps
  const shape = pick(["rise-fall", "fall", "chirp", "warble", "two-call", "swoop"]);
  const duty = pick([0, 1, 1, 2, 2, 3]);

  // The pitch contour, as points over one syllable of `len` steps.
  /** @param {number} len @returns {{at: number, pitch: number}[]} */
  const contour = (len) => {
    const up = r(3, 12);
    const down = r(4, 16);
    switch (shape) {
      case "rise-fall":
        return [
          { at: 0, pitch: base },
          { at: Math.round(len * r(0.2, 0.45)), pitch: base + up },
          { at: len, pitch: base - down },
        ];
      case "fall":
        return [
          { at: 0, pitch: base + up },
          { at: Math.round(len * r(0.15, 0.35)), pitch: base + up * 0.7 },
          { at: len, pitch: base - down },
        ];
      case "chirp":
        return [
          { at: 0, pitch: base - down * 0.5 },
          { at: Math.round(len * r(0.5, 0.8)), pitch: base + up },
          { at: len, pitch: base + up - r(1, 5) },
        ];
      case "warble": {
        const pts = [{ at: 0, pitch: base }];
        const n = 3 + Math.floor(rnd() * 4);
        const depth = r(1.5, 5);
        for (let i = 1; i <= n; i++)
          pts.push({ at: Math.round((len * i) / n), pitch: base + (i % 2 ? depth : -depth) - (i * down) / (2 * n) });
        return pts;
      }
      case "swoop":
        return [
          { at: 0, pitch: base + up },
          { at: Math.round(len * r(0.3, 0.5)), pitch: base - down * 0.6 },
          { at: Math.round(len * r(0.6, 0.85)), pitch: base + up * 0.5 },
          { at: len, pitch: base - down },
        ];
      default: // two-call: each call a short rise and fall
        return [
          { at: 0, pitch: base },
          { at: Math.round(len * 0.4), pitch: base + up * 0.6 },
          { at: len, pitch: base - down * 0.5 },
        ];
    }
  };

  /** @param {number} len @param {number} peak */
  const amp = (len, peak) => {
    const attack = Math.max(1, Math.round(r(0.005, 0.05) / STEP_SEC));
    const hold = Math.round(len * r(0.3, 0.7));
    return [
      { at: 0, vol: 0 },
      { at: Math.min(attack, len - 2), vol: peak },
      { at: Math.max(attack + 1, Math.min(hold, len - 1)), vol: peak * r(0.6, 0.95) },
      { at: len, vol: 0 },
    ];
  };

  /** Syllables: [start, length] in steps. */
  const syllables =
    shape === "two-call"
      ? (() => {
          const a = Math.round(total * r(0.35, 0.45));
          const gap = Math.round(total * 0.1);
          return [
            [0, a],
            [a + gap, total - a - gap],
          ];
        })()
      : [[0, total]];

  /** @type {NoteEvent[]} */
  const p1 = [];
  /** @type {NoteEvent[]} */
  const p2 = [];
  /** @type {NoteEvent[]} */
  const n = [];
  const second = rnd() < 0.75;
  const interval = pick([-12, -7, -5, 0.18, -0.22, 3, 4]);
  const duty2 = (duty + 1 + Math.floor(rnd() * 3)) % 4;
  const noiseMix = rnd();
  const noiseShort = rnd() < 0.2;
  const noiseBase = r(2, 9);
  const noiseLen = r(0.3, 1);
  const vib = rnd() < 0.4 ? Math.round(r(2, 6)) : 0;

  for (const [start, len] of syllables) {
    const bend = contour(len).map((p) => ({ at: p.at, pitch: clamp(36, 100, p.pitch) }));
    p1.push(note(start, len, { pitch: bend[0].pitch, bend, amp: amp(len, r(13, 15)), duty, vib }));
    if (second) {
      const b2 = bend.map((p) => ({ at: p.at, pitch: clamp(36, 100, p.pitch + interval) }));
      p2.push(note(start, len, { pitch: b2[0].pitch, bend: b2, amp: amp(len, r(7, 11)), duty: duty2 }));
    }
    if (noiseMix > 0.3) {
      const nl = Math.max(4, Math.round(len * noiseLen));
      const from = clamp(0, 15, noiseBase);
      const to = clamp(0, 15, noiseBase + r(-3, 5));
      n.push(
        note(start, nl, {
          pitch: from,
          bend: [{ at: 0, pitch: from }, { at: nl, pitch: to }],
          amp: amp(nl, 4 + noiseMix * 8),
          short: noiseShort,
        }),
      );
    }
  }

  const loopIndex = 0;
  /** @param {NoteEvent[]} events */
  const track = (events) => ({ events, length: total, loopIndex });
  return {
    id: `cry:${speciesId}`,
    stepSec: STEP_SEC,
    length: total,
    loop: -1,
    tracks: { p1: track(p1), p2: track(p2), w: track([]), n: track(n) },
  };
}
