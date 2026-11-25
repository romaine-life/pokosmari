// @ts-check
// The tracker notation every song, jingle and sound effect is written in, and its parser.
//
// A piece is one string per channel (p1, p2 pulses; w wave; n noise). Time counts in
// steps: a step is a sixteenth note at the piece's bpm. Tokens, separated by spaces:
//
//   C4  F#3  Bb5        a note (octave 4 holds middle C), lasting the default length
//   C4:6                a note lasting 6 steps
//   C4>G4:8             a note sliding from C4 to G4 over its length
//   C4+E4+G4:8          an arpeggio: the notes cycle fast, the GB way to play a chord
//   r  r:4              a rest
//   _  _:4              tie: lengthen the previous note
//   k s h o x           noise channel drums: kick, snare, closed hat, open hat, crash
//                       (their volume scales with the channel's: v12 plays them as set)
//   N5  M3  N2>N9:6     raw noise at pitch 0..F (hex, 0 brightest); M is the metallic mode
//   lN                  default length in steps
//   vN                  volume 0..15
//   eN                  envelope: 0 holds, N drops a level every N/64 s
//   dN                  pulse duty: 0 12.5%, 1 25%, 2 50%, 3 75%
//   wN                  wave channel table (chip.js WAVETABLES)
//   qN                  gate: N eighths of each note sound (8 legato, 6 detached)
//   ~N                  vibrato depth in tens of cents, 0 off
//   tN  t-N             transpose following notes by N semitones (set, not added)
//   $name               a pattern from the piece's defs
//   [ ... ]N            repeat N times (nests)
//   C4:2*4              one token repeated: four C4:2
//   @                   loop start (every channel at the same step)
//   |                   bar line: checked to fall on a whole bar, else the parse fails
//   bN                  bar lines from here on fall N steps late (an echo of another line)

import { CHANNELS } from "./chip.js";

/** @typedef {import("./chip.js").ChannelId} ChannelId */

/**
 * @typedef {object} NoteEvent
 * @property {number} step   start, in steps from the piece's start
 * @property {number} len    length in steps
 * @property {number} pitch  MIDI note (tone channels) or noise pitch 0..15
 * @property {{at: number, pitch: number}[]} [bend]  pitch points, `at` in steps from the start
 * @property {{at: number, vol: number}[]} [amp]     volume points (0..15) replacing the envelope
 * @property {number[]} [arp]  every note of an arpeggio, `pitch` first
 * @property {boolean} [short] noise: the metallic 7-bit mode
 * @property {number} vol   0..15
 * @property {number} env   envelope pace, 0 holds
 * @property {number} duty  0..3
 * @property {number} wave  wavetable index
 * @property {number} gate  1..8
 * @property {number} vib   vibrato depth, tens of cents
 */

/**
 * @typedef {object} Track
 * @property {NoteEvent[]} events
 * @property {number} length     steps
 * @property {number} loopIndex  index of the first event at or after the loop point
 */

/**
 * A piece as written.
 * @typedef {object} PieceDef
 * @property {number} bpm          quarter notes a minute (a step is a sixteenth)
 * @property {string} [key]        e.g. "C", "Am", for the checks: tonic, "m" for minor
 * @property {number} [bar]        steps in a bar, 16 by default (12 for 3/4)
 * @property {boolean} [loop]      songs loop (default true for songs, false otherwise)
 * @property {Record<string, string>} [defs]
 * @property {string} [p1]
 * @property {string} [p2]
 * @property {string} [w]
 * @property {string} [n]
 */

/**
 * A parsed piece, ready to schedule.
 * @typedef {object} Piece
 * @property {string} id
 * @property {number} stepSec   seconds per step
 * @property {number} length    steps
 * @property {number} loop      loop-start step, -1 when the piece plays once
 * @property {string} [key]
 * @property {Record<ChannelId, Track>} tracks
 */

const NOTE_RE = /^([A-G])([#b]?)(-?\d)$/;
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/**
 * Drum kit for the noise channel: pitch (or a slide), volume and envelope.
 * @type {Record<string, {pitch: number, to?: number, vol: number, env: number, short?: boolean}>}
 */
export const DRUMS = {
  k: { pitch: 11, to: 14, vol: 13, env: 1 }, // kick: a low thump falling away
  s: { pitch: 5, to: 6, vol: 12, env: 1.2 }, // snare
  h: { pitch: 1, vol: 6, env: 1 }, // closed hat
  o: { pitch: 1, vol: 6, env: 3 }, // open hat
  x: { pitch: 3, vol: 9, env: 6 }, // crash
};

/**
 * MIDI number of a note name like "C#4", or NaN.
 * @param {string} name
 */
export function noteToMidi(name) {
  const m = NOTE_RE.exec(name);
  if (!m) return NaN;
  const acc = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + SEMI[/** @type {keyof typeof SEMI} */ (m[1])] + acc;
}

/**
 * Expand patterns and repeats into a flat token list.
 * @param {string} text
 * @param {Record<string, string>} defs
 * @param {(msg: string) => never} fail
 * @param {number} [depth]
 * @returns {string[]}
 */
function expand(text, defs, fail, depth = 0) {
  if (depth > 8) fail("patterns nest too deep");
  const tokens = text.split(/\s+/).filter(Boolean);
  /** @type {string[][]} */
  const stack = [[]];
  for (const tok of tokens) {
    if (tok === "[") {
      stack.push([]);
    } else if (/^\](\d*)$/.test(tok)) {
      if (stack.length < 2) fail(`unmatched ${tok}`);
      const times = tok.length > 1 ? Number(tok.slice(1)) : 2;
      const body = /** @type {string[]} */ (stack.pop());
      const top = stack[stack.length - 1];
      for (let i = 0; i < times; i++) top.push(...body);
    } else if (/^[^*]+\*\d+$/.test(tok)) {
      const [one, times] = tok.split("*");
      for (let i = 0; i < Number(times); i++) stack[stack.length - 1].push(one);
    } else if (tok.startsWith("$")) {
      const name = tok.slice(1);
      if (!(name in defs)) fail(`unknown pattern ${tok}`);
      stack[stack.length - 1].push(...expand(defs[name], defs, fail, depth + 1));
    } else {
      stack[stack.length - 1].push(tok);
    }
  }
  if (stack.length !== 1) fail("unclosed [");
  return stack[0];
}

/**
 * Parse one channel.
 * @param {string} text
 * @param {ChannelId} ch
 * @param {PieceDef} def
 * @param {(msg: string) => never} fail
 * @returns {{events: NoteEvent[], length: number, loop: number}}
 */
function parseChannel(text, ch, def, fail) {
  const tokens = expand(text, def.defs ?? {}, fail);
  const bar = def.bar ?? 16;
  const noise = ch === "n";
  /** @type {NoteEvent[]} */
  const events = [];
  let step = 0;
  let loop = -1;
  let len = 4;
  let vol = 12;
  let env = 0;
  let duty = 2;
  let wave = 0;
  let gate = 8;
  let vib = 0;
  let transpose = 0;
  let barShift = 0;

  /** @param {string} tok */
  const lengthOf = (tok) => {
    const i = tok.indexOf(":");
    if (i < 0) return { head: tok, n: len };
    const n = Number(tok.slice(i + 1));
    if (!(n > 0)) fail(`bad length in ${tok}`);
    return { head: tok.slice(0, i), n };
  };
  /** @param {string} name */
  const tone = (name) => {
    const m = noteToMidi(name);
    if (Number.isNaN(m)) fail(`bad note ${name}`);
    return m + transpose;
  };
  /** @param {string} name */
  const noisePitch = (name) => {
    const m = /^([NM])([0-9A-F])$/.exec(name);
    if (!m) fail(`bad noise ${name}`);
    return { pitch: parseInt(m[2], 16), short: m[1] === "M" };
  };
  /** @param {Partial<NoteEvent>} e @param {number} n */
  const push = (e, n) => {
    events.push({ step, len: n, pitch: 0, vol, env, duty, wave, gate, vib, ...e });
    step += n;
  };

  for (const tok of tokens) {
    const c = tok[0];
    if (tok === "|") {
      if ((step - barShift) % bar !== 0) fail(`bar line at step ${step}, not on a bar of ${bar}`);
    } else if (tok === "@") {
      if (loop >= 0) fail("two loop points");
      loop = step;
    } else if (/^[lvedwqb]\d+(\.\d+)?$/.test(tok)) {
      const n = Number(tok.slice(1));
      if (c === "l") len = n;
      else if (c === "b") barShift = n;
      else if (c === "v") vol = Math.min(15, n);
      else if (c === "e") env = n;
      else if (c === "d") duty = n & 3;
      else if (c === "w") wave = n;
      else if (c === "q") gate = Math.max(1, Math.min(8, n));
    } else if (/^~\d+$/.test(tok)) {
      vib = Number(tok.slice(1));
    } else if (/^t-?\d+$/.test(tok)) {
      transpose = Number(tok.slice(1));
    } else if (c === "r" && /^r(:\d+)?$/.test(tok)) {
      step += lengthOf(tok).n;
    } else if (c === "_" && /^_(:\d+)?$/.test(tok)) {
      const { n } = lengthOf(tok);
      const last = events[events.length - 1];
      if (!last || last.step + last.len !== step) fail("tie with no note right before it");
      last.len += n;
      if (last.bend) last.bend[last.bend.length - 1].at = last.len;
      step += n;
    } else if (noise) {
      const { head, n } = lengthOf(tok);
      if (head in DRUMS) {
        const d = DRUMS[head];
        // A drum's own volume, scaled by the channel's (v12, the default, leaves it as is).
        const dv = Math.min(15, Math.round((d.vol * vol) / 12));
        /** @type {Partial<NoteEvent>} */
        const e = { pitch: d.pitch, vol: dv, env: d.env, gate: 8, short: !!d.short };
        if (d.to !== undefined) e.bend = [{ at: 0, pitch: d.pitch }, { at: n, pitch: d.to }];
        push(e, n);
      } else {
        const [from, to] = head.split(">");
        const a = noisePitch(from);
        /** @type {Partial<NoteEvent>} */
        const e = { pitch: a.pitch, short: a.short };
        if (to) e.bend = [{ at: 0, pitch: a.pitch }, { at: n, pitch: noisePitch(to).pitch }];
        push(e, n);
      }
    } else if (/^[A-G]/.test(tok)) {
      const { head, n } = lengthOf(tok);
      if (head.includes("+")) {
        const arp = head.split("+").map(tone);
        push({ pitch: arp[0], arp }, n);
      } else if (head.includes(">")) {
        const [from, to] = head.split(">").map(tone);
        push({ pitch: from, bend: [{ at: 0, pitch: from }, { at: n, pitch: to }] }, n);
      } else {
        push({ pitch: tone(head) }, n);
      }
    } else {
      fail(`unknown token ${tok}`);
    }
  }
  return { events, length: step, loop };
}

/**
 * Parse a piece. Throws with the piece id and channel on any mistake, including (for a
 * piece that loops) channels of different lengths or loop points. A piece that plays once
 * lasts as long as its longest channel.
 * @param {string} id
 * @param {PieceDef} def
 * @param {boolean} loops  whether the piece loops (songs) or plays once
 * @returns {Piece}
 */
export function parsePiece(id, def, loops) {
  /** @type {Partial<Record<ChannelId, {events: NoteEvent[], length: number, loop: number}>>} */
  const raw = {};
  let length = -1;
  let loop = -2;
  for (const ch of CHANNELS) {
    const text = def[ch];
    if (!text) continue;
    /** @type {(msg: string) => never} */
    const fail = (msg) => {
      throw new Error(`${id} ${ch}: ${msg}`);
    };
    const r = parseChannel(text, ch, def, fail);
    if (loops && length >= 0 && r.length !== length) fail(`is ${r.length} steps long, other channels ${length}`);
    const lp = loops ? Math.max(0, r.loop) : -1;
    if (!loops && r.loop >= 0) fail("has a loop point but plays once");
    if (loop !== -2 && lp !== loop) fail(`loops from step ${lp}, other channels from ${loop}`);
    length = Math.max(length, r.length);
    loop = lp;
    raw[ch] = r;
  }
  if (length <= 0) throw new Error(`${id}: no notes`);
  if (loops && loop >= length) throw new Error(`${id}: loop point at the end`);
  /** @type {Record<string, Track>} */
  const tracks = {};
  for (const ch of CHANNELS) {
    const events = raw[ch]?.events ?? [];
    let loopIndex = events.findIndex((e) => e.step >= loop);
    if (loopIndex < 0) loopIndex = events.length;
    tracks[ch] = { events, length, loopIndex };
  }
  return {
    id,
    stepSec: 15 / def.bpm,
    length,
    loop,
    key: def.key,
    tracks: /** @type {Record<ChannelId, Track>} */ (tracks),
  };
}
