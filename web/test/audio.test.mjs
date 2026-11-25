// @ts-check
import { test } from "node:test";
import assert from "node:assert/strict";
import { createAudio } from "../static/src/audio/audio.js";
import { parsePiece, noteToMidi } from "../static/src/audio/notation.js";
import { SONGS } from "../static/src/audio/songs.js";
import { JINGLES } from "../static/src/audio/jingles.js";
import { SFX } from "../static/src/audio/sfx.js";
import { cryPiece } from "../static/src/audio/cry.js";
import { CHANNELS, lfsrNoise, pulseCoefficients, wavetableCoefficients, WAVETABLES } from "../static/src/audio/chip.js";

const SONG_IDS = [
  "title", "intro", "town-home", "town-2", "city", "route-1", "route-2", "route-3", "forest",
  "cave", "beach", "snow", "lab", "center", "mart", "spire", "villain", "hideout", "rival",
  "battle-wild", "battle-trainer", "battle-warden", "battle-villain", "battle-council",
  "battle-champion", "battle-legend", "surf", "bike", "ending", "hall",
  // the victory themes loop, so they are songs
  "victory-wild", "victory-trainer", "victory-warden",
];
const JINGLE_IDS = ["heal", "item", "key-item", "badge", "levelup", "evolution-done", "caught", "save"];
const SFX_IDS = [
  "select", "cancel", "bump", "door", "stairs", "ledge", "step-grass", "encounter", "hit",
  "hit-super", "hit-weak", "faint", "ball-throw", "ball-shake", "ball-click", "run", "menu-open",
  "text-advance", "heal-machine", "exp", "statup", "statdown", "status", "surf", "cut", "push", "error",
];

test("every required song, jingle and sound effect exists", () => {
  for (const id of SONG_IDS) assert.ok(Object.hasOwn(SONGS, id), `song ${id}`);
  for (const id of JINGLE_IDS) assert.ok(Object.hasOwn(JINGLES, id), `jingle ${id}`);
  for (const id of SFX_IDS) assert.ok(Object.hasOwn(SFX, id), `sfx ${id}`);
});

test("notation: notes, lengths, slides, arpeggios, repeats, ties, bars", () => {
  assert.equal(noteToMidi("C4"), 60);
  assert.equal(noteToMidi("A4"), 69);
  assert.equal(noteToMidi("Bb3"), 58);
  assert.equal(noteToMidi("F#5"), 78);
  const p = parsePiece("t", { bpm: 120, defs: { x: "D4:2" }, p1: "l4 C4 E4:2 _:2 [ $x ]4 | t12 G4>C5:8 C4+E4+G4:8 |" }, false);
  const ev = p.tracks.p1.events;
  assert.deepEqual(
    ev.map((e) => [e.step, e.len, e.pitch]),
    [[0, 4, 60], [4, 4, 64], [8, 2, 62], [10, 2, 62], [12, 2, 62], [14, 2, 62], [16, 8, 79], [24, 8, 72]],
  );
  assert.deepEqual(ev[6].bend, [{ at: 0, pitch: 79 }, { at: 8, pitch: 84 }]);
  assert.deepEqual(ev[7].arp, [72, 76, 79]);
  assert.equal(p.stepSec, 15 / 120);
  assert.throws(() => parsePiece("t", { bpm: 120, p1: "C4:3 |" }, false), /bar line/);
  assert.throws(() => parsePiece("t", { bpm: 120, p1: "C4:16", p2: "C4:8" }, true), /steps long/);
  assert.throws(() => parsePiece("t", { bpm: 120, p1: "Q4" }, false), /unknown token/);
});

test("every song parses, loops at the same step on every channel, and loops in 20-60 s", () => {
  for (const id of Object.keys(SONGS)) {
    const p = parsePiece(id, SONGS[id], true);
    assert.ok(p.loop >= 0 && p.loop < p.length, `${id} loop point`);
    for (const ch of CHANNELS) assert.equal(p.tracks[ch].length, p.length, `${id} ${ch} length`);
    const sec = (p.length - p.loop) * p.stepSec;
    assert.ok(sec >= 20 && sec <= 60, `${id} loops in ${sec.toFixed(1)} s`);
    for (const ch of ["p1", "w", "n"]) assert.ok(p.tracks[ch].events.length > 0, `${id} has a ${ch} part`);
  }
});

test("jingles and sound effects parse, play once and are short", () => {
  for (const [table, max] of /** @type {const} */ ([[JINGLES, 7], [SFX, 2]])) {
    for (const id of Object.keys(table)) {
      const p = parsePiece(id, table[id], false);
      assert.equal(p.loop, -1);
      const sec = p.length * p.stepSec;
      assert.ok(sec > 0 && sec <= max, `${id} lasts ${sec.toFixed(2)} s`);
    }
  }
});

test("notes stay in a sane range", () => {
  const all = [
    ...Object.entries(SONGS).map(([id, d]) => parsePiece(id, d, true)),
    ...Object.entries(JINGLES).map(([id, d]) => parsePiece(id, d, false)),
    ...Object.entries(SFX).map(([id, d]) => parsePiece(id, d, false)),
  ];
  for (const p of all) {
    for (const ch of CHANNELS) {
      for (const e of p.tracks[ch].events) {
        const pitches = [e.pitch, ...(e.arp ?? []), ...(e.bend ?? []).map((b) => b.pitch)];
        for (const m of pitches) {
          if (ch === "n") assert.ok(m >= 0 && m <= 15, `${p.id} noise ${m}`);
          else assert.ok(m >= 31 && m <= 100, `${p.id} ${ch} midi ${m}`);
        }
        assert.ok(e.vol >= 0 && e.vol <= 15, `${p.id} volume`);
        if (ch === "w" && SONGS[p.id]) assert.ok(e.pitch <= 72, `${p.id} bass ${e.pitch} stays low`);
      }
    }
  }
});

test("chip math: pulse duty, wavetables and LFSR noise", () => {
  const half = pulseCoefficients(0.5);
  assert.ok(Math.abs(half.imag[2]) < 1e-6, "a square has no even harmonics");
  assert.ok(half.imag[1] > 0.5);
  for (const t of WAVETABLES) {
    assert.equal(t.length, 32);
    assert.equal(wavetableCoefficients(t).real.length, 17);
  }
  const short = lfsrNoise(true, 1000);
  for (let i = 0; i < 500; i++) assert.equal(short[i], short[i + 127], "the metallic mode repeats every 127");
  const long = lfsrNoise(false, 4000);
  const ones = long.filter((x) => x > 0).length;
  assert.ok(ones > 1700 && ones < 2300, "white noise is balanced");
});

test("cries are deterministic per species, differ between species, last 0.3-0.8 s", () => {
  const ids = ["sprigling", "emberkit", "tidepup", 7, "voltmouse", ...Array.from({ length: 60 }, (_, i) => `sp${i}`)];
  const seen = new Set();
  for (const id of ids) {
    const a = cryPiece(id);
    assert.deepEqual(cryPiece(id), a, `${id} the same every time`);
    const sec = a.length * a.stepSec;
    assert.ok(sec >= 0.3 - 1e-9 && sec <= 0.8 + 1e-9, `${id} lasts ${sec}`);
    assert.ok(a.tracks.p1.events.length > 0);
    assert.equal(a.tracks.w.events.length, 0, "a cry leaves the music's wave channel alone");
    seen.add(JSON.stringify(a.tracks));
  }
  assert.equal(seen.size, ids.length, "every species sounds different");
});

// --- the player, against no AudioContext and against a fake one ---

test("without an AudioContext every call is a silent no-op", () => {
  const timers = [];
  const audio = createAudio({ setInterval: (fn) => timers.push(fn), clearInterval: () => {} });
  audio.playMusic("title");
  assert.equal(audio.current, "title", "the request is remembered");
  audio.jingle("heal");
  audio.playSfx("select");
  audio.playCry("sprigling");
  audio.setVolumes({ music: 0.5, sfx: 0.2 });
  audio.unlock(); // node has no AudioContext: stays silent
  audio.stopMusic();
  assert.equal(audio.current, null);
  assert.equal(timers.length, 0, "nothing scheduled");
  assert.throws(() => audio.playMusic("nope"), /unknown song nope/);
  assert.throws(() => audio.jingle("nope"), /unknown jingle/);
  assert.throws(() => audio.playSfx("nope"), /unknown sfx/);
});

/** A fake AudioParam that records its automation. */
class FakeParam {
  constructor(v = 0) {
    this.value = v;
    /** @type {[string, number, number][]} */
    this.calls = [];
  }
  /** @param {number} v @param {number} t */
  setValueAtTime(v, t) {
    this.calls.push(["set", v, t]);
    return this;
  }
  /** @param {number} v @param {number} t */
  linearRampToValueAtTime(v, t) {
    this.calls.push(["lin", v, t]);
    return this;
  }
  /** @param {number} v @param {number} t */
  exponentialRampToValueAtTime(v, t) {
    assert.ok(v > 0, "exponential ramps need a positive target");
    this.calls.push(["exp", v, t]);
    return this;
  }
  /** @param {number} v @param {number} t */
  setTargetAtTime(v, t) {
    this.calls.push(["target", v, t]);
    return this;
  }
  /** @param {number} t */
  cancelScheduledValues(t) {
    this.calls.push(["cancel", 0, t]);
    return this;
  }
}

class FakeNode {
  /** @param {FakeContext} ctx @param {string} kind */
  constructor(ctx, kind) {
    this.ctx = ctx;
    this.kind = kind;
    /** @type {FakeNode[]} */
    this.out = [];
    ctx.created.push(this);
  }
  /** @param {any} n */
  connect(n) {
    this.out.push(n);
    return n;
  }
  disconnect() {
    this.out = [];
  }
}

class FakeSource extends FakeNode {
  /** @param {FakeContext} ctx @param {string} kind */
  constructor(ctx, kind) {
    super(ctx, kind);
    this.frequency = new FakeParam(440);
    this.detune = new FakeParam(0);
    this.playbackRate = new FakeParam(1);
    /** @type {number | null} */ this.startAt = null;
    /** @type {number | null} */ this.stopAt = null;
    /** @type {any} */ this.wave = null;
    /** @type {any} */ this.buffer = null;
    this.loop = false;
    /** @type {(() => void) | null} */ this.onended = null;
  }
  /** @param {number} t */
  start(t) {
    assert.equal(this.startAt, null, "started once");
    this.startAt = t;
    this.ctx.started.push(this);
  }
  /** @param {number} t */
  stop(t) {
    assert.notEqual(this.startAt, null, "stopped after starting");
    this.stopAt = t;
  }
  /** @param {any} w */
  setPeriodicWave(w) {
    this.wave = w;
  }
}

class FakeContext {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 8000;
    this.state = "suspended";
    /** @type {FakeNode[]} */ this.created = [];
    /** @type {FakeSource[]} */ this.started = [];
    this.destination = new FakeNode(this, "destination");
  }
  resume() {
    this.state = "running";
    return Promise.resolve();
  }
  createGain() {
    const n = /** @type {any} */ (new FakeNode(this, "gain"));
    n.gain = new FakeParam(1);
    return n;
  }
  createBiquadFilter() {
    const n = /** @type {any} */ (new FakeNode(this, "filter"));
    n.frequency = new FakeParam(350);
    n.Q = new FakeParam(1);
    return n;
  }
  createOscillator() {
    return new FakeSource(this, "osc");
  }
  createBufferSource() {
    return new FakeSource(this, "buffer");
  }
  /** @param {Float32Array} real @param {Float32Array} imag */
  createPeriodicWave(real, imag) {
    return { real, imag };
  }
  /** @param {number} ch @param {number} len @param {number} rate */
  createBuffer(ch, len, rate) {
    const data = new Float32Array(len);
    return { numberOfChannels: ch, length: len, sampleRate: rate, getChannelData: () => data };
  }
}

function setup() {
  const ctx = new FakeContext();
  /** @type {(() => void)[]} */
  const ticks = [];
  const audio = createAudio({
    createContext: () => /** @type {any} */ (ctx),
    setInterval: (fn) => {
      ticks.push(fn);
      return ticks.length;
    },
    clearInterval: (h) => {
      ticks[h - 1] = () => {};
    },
  });
  /** Advance the audio clock in scheduler ticks. @param {number} sec */
  const advance = (sec) => {
    const end = ctx.currentTime + sec;
    while (ctx.currentTime < end - 1e-9) {
      ctx.currentTime = Math.min(end, ctx.currentTime + 0.025);
      for (const t of [...ticks]) t();
    }
  };
  return { ctx, audio, advance };
}

/** Oscillators/buffers on a given music voice started in [from, to). */
const startedBetween = (/** @type {FakeContext} */ ctx, /** @type {number} */ from, /** @type {number} */ to) =>
  ctx.started.filter((s) => s.startAt !== null && s.startAt >= from && s.startAt < to);

test("music requested before unlock starts on unlock and schedules ahead on the audio clock", () => {
  const { ctx, audio, advance } = setup();
  audio.playMusic("town-home");
  assert.equal(ctx.created.length, 1, "nothing but the fake's destination before unlock");
  audio.unlock();
  assert.equal(ctx.state, "running");
  assert.equal(audio.current, "town-home");
  const first = ctx.started.length;
  assert.ok(first > 0, "notes are scheduled at once");
  for (const s of ctx.started) assert.ok(s.startAt <= ctx.currentTime + 0.2, "only a short lookahead");
  advance(5);
  assert.ok(ctx.started.length > first + 10, "the scheduler keeps going");
  // notes land on the song's grid: town-home is 100 bpm, steps of 0.15 s
  const p = parsePiece("town-home", SONGS["town-home"], true);
  const origin = ctx.started[0].startAt;
  for (const s of ctx.started) {
    const steps = (s.startAt - origin) / p.stepSec;
    assert.ok(Math.abs(steps - Math.round(steps)) < 1e-6, "on the step grid");
  }
  // pulses use PeriodicWaves, noise a looping buffer
  assert.ok(ctx.started.some((s) => s.kind === "osc" && s.wave));
  assert.ok(ctx.started.some((s) => s.kind === "buffer" && s.loop && s.buffer));
});

test("the same song again does nothing; another song cuts cleanly", () => {
  const { ctx, audio, advance } = setup();
  audio.unlock();
  audio.playMusic("route-1");
  advance(1);
  const n = ctx.started.length;
  audio.playMusic("route-1");
  assert.equal(ctx.started.length, n, "no restart");
  const live = ctx.started.filter((s) => s.stopAt > ctx.currentTime + 0.05);
  const now = ctx.currentTime;
  audio.playMusic("cave");
  assert.equal(audio.current, "cave");
  for (const s of live) assert.ok(s.stopAt <= now + 0.03, "the old song's notes stop at once");
  advance(2);
  assert.ok(startedBetween(ctx, now, now + 2).length > 0, "the new song plays");
});

test("a song loops from its loop point", () => {
  const { ctx, audio, advance } = setup();
  audio.unlock();
  audio.playMusic("victory-wild");
  const p = parsePiece("victory-wild", SONGS["victory-wild"], true);
  const total = p.length * p.stepSec;
  advance(total + 3);
  const after = startedBetween(ctx, total, total + 2);
  assert.ok(after.length > 5, "notes keep coming after the end: the loop");
});

test("a jingle pauses the music and resumes it where it was", () => {
  const { ctx, audio, advance } = setup();
  audio.unlock();
  audio.playMusic("city");
  advance(3.0);
  const p = parsePiece("city", SONGS.city, true);
  const atJingle = ctx.currentTime;
  const stepAt = Math.ceil((atJingle - ctx.started[0].startAt) / p.stepSec);
  assert.ok(stepAt > 16, "well into the song");
  audio.jingle("heal");
  assert.equal(audio.current, "city", "the song is still the current music");
  const heal = parsePiece("heal", JINGLES.heal, false);
  const jingleEnd = atJingle + 0.03 + heal.length * heal.stepSec;
  advance(heal.length * heal.stepSec + 0.5);
  const hz = (/** @type {number} */ m) => 440 * 2 ** ((m - 69) / 12);
  // nothing from the song plays during the jingle: every tone started then is the jingle's
  const healHz = CHANNELS.flatMap((ch) => heal.tracks[ch].events.map((e) => hz(e.pitch)));
  for (const s of startedBetween(ctx, atJingle + 0.001, jingleEnd - 0.001)) {
    // (song notes scheduled before the jingle were stopped before they start: never heard)
    if (s.kind !== "osc" || !s.frequency.calls.length || s.stopAt <= s.startAt) continue;
    const f = s.frequency.calls[0][1];
    assert.ok(healHz.some((h) => Math.abs(h - f) < 1e-6), `only the jingle plays (${f} Hz)`);
  }
  const resumed = startedBetween(ctx, jingleEnd, jingleEnd + 1);
  assert.ok(resumed.length > 0, "the song comes back");
  // the song resumes at the step it had reached, not from the top: its first resumed
  // note is a note of city at or after that step
  const first = Math.min(...resumed.map((s) => s.startAt));
  const firstNotes = resumed.filter((s) => s.startAt === first && s.kind === "osc" && s.frequency.calls.length > 0);
  const cityAfter = CHANNELS.flatMap((ch) => p.tracks[ch].events.filter((e) => e.step >= stepAt).slice(0, 1));
  const wanted = Math.min(...cityAfter.map((e) => e.step));
  const expect = CHANNELS.flatMap((ch) => p.tracks[ch].events.filter((e) => e.step === wanted && ch !== "n"));
  assert.ok(expect.length > 0 && firstNotes.length > 0);
  const freqs = firstNotes.map((s) => s.frequency.calls[0][1]);
  for (const e of expect) assert.ok(freqs.some((f) => Math.abs(f - hz(e.pitch)) < 1e-6), `resumes with ${e.pitch}`);
});

test("playMusic during a jingle changes what resumes; stopMusic leaves silence after it", () => {
  const { ctx, audio, advance } = setup();
  audio.unlock();
  audio.playMusic("city");
  advance(1);
  audio.jingle("badge");
  audio.playMusic("mart");
  assert.equal(audio.current, "mart");
  advance(7);
  assert.equal(audio.current, "mart");
  audio.jingle("save");
  audio.stopMusic();
  const t = ctx.currentTime;
  advance(4);
  assert.equal(startedBetween(ctx, t + 2, t + 4).length, 0, "silence after the jingle");
});

test("sound effects play over the music and take its voices only while they sound", () => {
  const { ctx, audio, advance } = setup();
  audio.unlock();
  audio.playMusic("route-2");
  advance(1);
  const before = ctx.started.length;
  audio.playSfx("hit");
  assert.ok(ctx.started.length > before, "the effect is scheduled at once");
  // the music's pulse 2 and noise gains dip to 0 and come back
  const gains = /** @type {any[]} */ (ctx.created.filter((n) => n.kind === "gain"));
  const dipped = gains.filter((g) => g.gain.calls.some((/** @type {any[]} */ c) => c[0] === "lin" && c[1] === 0) && g.gain.calls.some((/** @type {any[]} */ c) => c[0] === "lin" && c[1] === 1));
  assert.ok(dipped.length >= 2, "two music voices handed over and back");
  advance(1);
  audio.setVolumes({ music: 0.3, sfx: 2 });
  const targets = gains.flatMap((g) => g.gain.calls.filter((/** @type {any[]} */ c) => c[0] === "target").map((/** @type {any[]} */ c) => c[1]));
  assert.deepEqual(targets.sort(), [0.3, 1], "volumes set and clamped");
});

test("cries play through the fake context, the same per species and different between them", () => {
  /** @param {string} id */
  const record = (id) => {
    const { ctx, audio, advance } = setup();
    audio.unlock();
    audio.playCry(id);
    advance(1);
    return ctx.started.map((s) => ({
      kind: s.kind,
      at: +(s.startAt ?? 0).toFixed(6),
      f: s.frequency.calls.map((c) => [c[0], +c[1].toFixed(4), +c[2].toFixed(6)]),
      r: s.playbackRate.calls.map((c) => [c[0], +c[1].toFixed(4), +c[2].toFixed(6)]),
    }));
  };
  const a = record("emberkit");
  assert.ok(a.length > 0);
  assert.deepEqual(record("emberkit"), a);
  assert.notDeepEqual(record("tidepup"), a);
});

test("the scheduler timer stops when nothing plays", () => {
  const ctx = new FakeContext();
  let live = 0;
  const audio = createAudio({
    createContext: () => /** @type {any} */ (ctx),
    setInterval: (fn) => {
      live++;
      handle = fn;
      return 1;
    },
    clearInterval: () => {
      live--;
    },
  });
  /** @type {() => void} */
  let handle = () => {};
  audio.unlock();
  audio.playSfx("select");
  assert.equal(live, 1);
  for (let i = 0; i < 40; i++) {
    ctx.currentTime += 0.025;
    handle();
  }
  assert.equal(live, 0);
});
