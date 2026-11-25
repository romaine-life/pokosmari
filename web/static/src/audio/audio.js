// @ts-check
// The game's sound: a four-voice chip synthesizer on Web Audio (two pulses with duty
// cycles, a wavetable channel, LFSR noise), a sequencer that schedules notes ahead on the
// audio clock, and the music, jingle, sound-effect and cry players on top.
//
// Nothing touches Web Audio until unlock(), which the game calls on the first key press
// (browsers refuse audio before a gesture). Until then every call is a silent no-op,
// except that playMusic remembers its song and unlock starts it.
//
// Layers: the music layer plays a song or a jingle (a jingle pauses the song and resumes
// it where it was); the sfx and cry layers play over it on the sfx bus. Like the GB, a
// sound effect or cry takes over the music's voices it uses while it sounds.

import * as chip from "./chip.js";
import { parsePiece } from "./notation.js";
import { SONGS } from "./songs.js";
import { JINGLES } from "./jingles.js";
import { SFX } from "./sfx.js";
import { cryPiece } from "./cry.js";

/** @typedef {import("./notation.js").Piece} Piece */
/** @typedef {import("./notation.js").NoteEvent} NoteEvent */

/** How far ahead notes are scheduled, and how often the scheduler runs. */
const LOOKAHEAD_SEC = 0.15;
const TICK_MS = 25;
/** A cut fades over this long so it never clicks. */
const CUT_SEC = 0.015;

/**
 * @typedef {object} AudioOptions
 * @property {() => AudioContext} [createContext]  defaults to the browser's AudioContext
 * @property {(fn: () => void, ms: number) => any} [setInterval]
 * @property {(handle: any) => void} [clearInterval]
 */

/**
 * @typedef {object} GameAudio
 * @property {() => void} unlock
 * @property {(id: string) => void} playMusic
 * @property {() => void} stopMusic
 * @property {(id: string) => void} jingle
 * @property {(id: string) => void} playSfx
 * @property {(speciesId: string | number) => void} playCry
 * @property {(v: {music?: number, sfx?: number}) => void} setVolumes
 * @property {string | null} current  the song playing, or waiting for unlock or a jingle
 */

/**
 * @typedef {object} Session
 * @property {Piece} piece
 * @property {GainNode} out
 * @property {GainNode[]} ch     one gain per voice, for channel stealing
 * @property {number} origin     audio time of step 0
 * @property {number[]} idx      next event per voice
 * @property {number[]} offset   steps added per voice by looping
 * @property {boolean[]} done
 * @property {{node: AudioScheduledSourceNode, end: number}[]} nodes
 * @property {number} end        audio time the piece ends (Infinity when it loops)
 */

/** @type {Map<string, Piece>} */
const parsed = new Map();

/**
 * @param {"song" | "jingle" | "sfx"} kind
 * @param {string} id
 * @returns {Piece}
 */
function piece(kind, id) {
  const key = `${kind}:${id}`;
  let p = parsed.get(key);
  if (!p) {
    const table = kind === "song" ? SONGS : kind === "jingle" ? JINGLES : SFX;
    if (!Object.hasOwn(table, id)) throw new Error(`unknown ${kind} ${id}`);
    p = parsePiece(id, table[id], kind === "song");
    parsed.set(key, p);
  }
  return p;
}

/**
 * The audio time a session is at, as a step within its piece.
 * @param {Session} s
 * @param {number} now
 */
function positionOf(s, now) {
  const { length, loop } = s.piece;
  let p = Math.max(0, Math.ceil((now - s.origin) / s.piece.stepSec));
  if (loop >= 0 && p >= length) p = loop + ((p - loop) % (length - loop));
  return p;
}

/**
 * @param {AudioOptions} [options]
 * @returns {GameAudio}
 */
export function createAudio(options = {}) {
  const setI = options.setInterval ?? ((fn, ms) => globalThis.setInterval(fn, ms));
  const clearI = options.clearInterval ?? ((h) => globalThis.clearInterval(h));

  /** @type {AudioContext | null} */
  let ctx = null;
  /** @type {GainNode} */ let musicBus;
  /** @type {GainNode} */ let sfxBus;
  /** @type {PeriodicWave[]} */ let pulseWaves = [];
  /** @type {PeriodicWave[]} */ let tableWaves = [];
  /** @type {AudioBuffer} */ let longNoise;
  /** @type {AudioBuffer} */ let shortNoise;
  let volumes = { music: 1, sfx: 1 };

  /** The song asked for (playing, or waiting for unlock or the end of a jingle). */
  /** @type {string | null} */ let wanted = null;
  /** @type {Session | null} */ let music = null;
  let musicIsJingle = false;
  /** Where to resume once a jingle ends. */
  /** @type {{id: string, step: number} | null} */ let resume = null;
  /** @type {Session | null} */ let sfx = null;
  /** @type {Session | null} */ let cry = null;
  /** Sessions fading out, disconnected once silent. */
  /** @type {{s: Session, at: number}[]} */ let dying = [];
  /** Audio time until which an effect holds each voice of the music. */
  const stolen = [0, 0, 0, 0];
  /** @type {any} */ let timer = null;

  const AC = () =>
    options.createContext ??
    (() => {
      const g = /** @type {any} */ (globalThis);
      const C = g.AudioContext ?? g.webkitAudioContext;
      return C ? /** @type {AudioContext} */ (new C()) : null;
    });

  function build() {
    const c = /** @type {AudioContext} */ (ctx);
    musicBus = c.createGain();
    sfxBus = c.createGain();
    musicBus.gain.value = volumes.music;
    sfxBus.gain.value = volumes.sfx;
    // The master: a low-pass takes the edge off the pulses, a high-pass removes the
    // rumble below the bass, as the GB's own output stage did.
    const lowpass = c.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 7000;
    lowpass.Q.value = 0.5;
    const highpass = c.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 30;
    const master = c.createGain();
    master.gain.value = 0.8;
    musicBus.connect(lowpass);
    sfxBus.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(master);
    master.connect(c.destination);

    const wave = (/** @type {{real: Float32Array, imag: Float32Array}} */ k) =>
      c.createPeriodicWave(k.real, k.imag);
    pulseWaves = chip.DUTIES.map((d) => wave(chip.pulseCoefficients(d)));
    tableWaves = chip.WAVETABLES.map((t) => wave(chip.wavetableCoefficients(t)));
    const noise = (/** @type {boolean} */ short) => {
      const len = c.sampleRate; // one second, looped
      const buf = c.createBuffer(1, len, c.sampleRate);
      buf.getChannelData(0).set(chip.lfsrNoise(short, len));
      return buf;
    };
    longNoise = noise(false);
    shortNoise = noise(true);
  }

  /**
   * @param {Piece} p
   * @param {GainNode} bus
   * @param {number} atStep
   * @param {number} startTime
   * @returns {Session}
   */
  function startSession(p, bus, atStep, startTime) {
    const c = /** @type {AudioContext} */ (ctx);
    const out = c.createGain();
    out.connect(bus);
    const ch = chip.CHANNELS.map(() => {
      const g = c.createGain();
      g.connect(out);
      return g;
    });
    const idx = chip.CHANNELS.map((id) => {
      const evs = p.tracks[id].events;
      const i = evs.findIndex((e) => e.step >= atStep);
      return i < 0 ? evs.length : i;
    });
    /** @type {Session} */
    const s = {
      piece: p,
      out,
      ch,
      origin: startTime - atStep * p.stepSec,
      idx,
      offset: [0, 0, 0, 0],
      done: [false, false, false, false],
      nodes: [],
      end: p.loop >= 0 ? Infinity : startTime + (p.length - atStep) * p.stepSec,
    };
    pump(s);
    ensureTimer();
    return s;
  }

  /** @param {Session | null} s */
  function cut(s) {
    if (!s || !ctx) return;
    const now = ctx.currentTime;
    s.out.gain.cancelScheduledValues(now);
    s.out.gain.setValueAtTime(1, now);
    s.out.gain.linearRampToValueAtTime(0, now + CUT_SEC);
    for (const { node, end } of s.nodes) {
      if (end > now) {
        try {
          node.stop(now + CUT_SEC + 0.005);
        } catch {
          // already stopped
        }
      }
    }
    s.nodes = [];
    s.done = [true, true, true, true];
    dying.push({ s, at: now + CUT_SEC + 0.05 });
  }

  /** Schedule every event of a session that starts before the lookahead horizon. */
  /** @param {Session} s */
  function pump(s) {
    const c = /** @type {AudioContext} */ (ctx);
    const now = c.currentTime;
    const until = now + LOOKAHEAD_SEC;
    const p = s.piece;
    const loopLen = p.length - p.loop;
    chip.CHANNELS.forEach((id, v) => {
      const tr = p.tracks[id];
      while (!s.done[v]) {
        if (s.idx[v] >= tr.events.length) {
          if (p.loop < 0 || tr.loopIndex >= tr.events.length) {
            s.done[v] = true;
            break;
          }
          s.idx[v] = tr.loopIndex;
          s.offset[v] += loopLen;
          continue;
        }
        const ev = tr.events[s.idx[v]];
        const t = s.origin + (ev.step + s.offset[v]) * p.stepSec;
        if (t >= until) break;
        // A note already late (the tab was asleep) is dropped, not played late.
        if (t >= now - 0.01) voice(s, v, ev, Math.max(t, now), p.stepSec);
        s.idx[v]++;
      }
    });
  }

  /**
   * Schedule one note on voice v.
   * @param {Session} s
   * @param {number} v
   * @param {NoteEvent} ev
   * @param {number} t
   * @param {number} stepSec
   */
  function voice(s, v, ev, t, stepSec) {
    const c = /** @type {AudioContext} */ (ctx);
    const dur = Math.max(0.01, ev.len * stepSec * (ev.gate / 8));
    const end = t + dur;
    const isNoise = v === 3;

    const g = c.createGain();
    const gp = g.gain;
    gp.setValueAtTime(0, t);
    if (ev.amp) {
      for (const pt of ev.amp) gp.linearRampToValueAtTime(pt.vol / 15, t + Math.min(dur, pt.at * stepSec));
    } else {
      const a = Math.min(chip.ATTACK_SEC, dur / 4);
      const rel = Math.max(a, dur - chip.RELEASE_SEC);
      gp.linearRampToValueAtTime(chip.envLevel(ev.vol, ev.env, 0), t + a);
      const silentAt = chip.envDuration(ev.vol, ev.env);
      if (silentAt < rel) gp.linearRampToValueAtTime(0, t + silentAt);
      else if (ev.env > 0) gp.linearRampToValueAtTime(chip.envLevel(ev.vol, ev.env, rel), t + rel);
      else gp.setValueAtTime(chip.envLevel(ev.vol, ev.env, rel), t + rel);
    }
    gp.linearRampToValueAtTime(0, end);

    /** @type {AudioScheduledSourceNode} */
    let src;
    /** @type {AudioParam} */
    let param;
    /** @type {(pitch: number) => number} */
    let value;
    if (isNoise) {
      const b = c.createBufferSource();
      b.buffer = ev.short ? shortNoise : longNoise;
      b.loop = true;
      src = b;
      param = b.playbackRate;
      value = chip.noiseRate;
    } else {
      const o = c.createOscillator();
      o.setPeriodicWave(v === 2 ? tableWaves[ev.wave % tableWaves.length] : pulseWaves[ev.duty & 3]);
      src = o;
      param = o.frequency;
      value = chip.midiToHz;
      if (ev.vib > 0 && dur > chip.VIBRATO_DELAY + 0.05) {
        const lfo = c.createOscillator();
        lfo.frequency.value = chip.VIBRATO_HZ;
        const depth = c.createGain();
        depth.gain.setValueAtTime(0, t);
        depth.gain.setValueAtTime(0, t + chip.VIBRATO_DELAY);
        depth.gain.linearRampToValueAtTime(ev.vib * 10, t + chip.VIBRATO_DELAY + 0.12);
        lfo.connect(depth);
        depth.connect(o.detune);
        lfo.start(t);
        lfo.stop(end + 0.01);
        s.nodes.push({ node: lfo, end: end + 0.01 });
      }
    }

    param.setValueAtTime(value(ev.pitch), t);
    if (ev.bend) {
      for (const pt of ev.bend) {
        if (pt.at <= 0) continue;
        param.exponentialRampToValueAtTime(value(pt.pitch), t + Math.min(dur, pt.at * stepSec));
      }
    } else if (ev.arp && ev.arp.length > 1) {
      for (let k = 1; k * chip.ARP_SEC < dur; k++)
        param.setValueAtTime(value(ev.arp[k % ev.arp.length]), t + k * chip.ARP_SEC);
    }

    src.connect(g);
    g.connect(s.ch[v]);
    src.onended = () => g.disconnect();
    src.start(t);
    src.stop(end + 0.01);
    s.nodes.push({ node: src, end: end + 0.01 });
  }

  /** Mute the music's voices an effect uses while it sounds (and only then). */
  function applySteal() {
    if (!ctx || !music) return;
    const now = ctx.currentTime;
    music.ch.forEach((g, v) => {
      const until = stolen[v];
      const p = g.gain;
      p.cancelScheduledValues(now);
      p.setValueAtTime(p.value, now);
      if (until > now) {
        p.linearRampToValueAtTime(0, now + chip.ATTACK_SEC * 2);
        p.setValueAtTime(0, until);
        p.linearRampToValueAtTime(1, until + 0.01);
      } else {
        p.linearRampToValueAtTime(1, now + 0.01);
      }
    });
  }

  function recomputeSteal() {
    for (let v = 0; v < 4; v++) {
      let until = 0;
      for (const s of [sfx, cry]) {
        if (s && s.piece.tracks[chip.CHANNELS[v]].events.length) until = Math.max(until, s.end);
      }
      stolen[v] = until;
    }
    applySteal();
  }

  /**
   * @param {string} id
   * @param {number} step
   */
  function startSong(id, step) {
    const c = /** @type {AudioContext} */ (ctx);
    cut(music);
    music = startSession(piece("song", id), musicBus, step, c.currentTime + 0.03);
    musicIsJingle = false;
    applySteal();
  }

  function tick() {
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const s of [music, sfx, cry]) {
      if (!s) continue;
      pump(s);
      s.nodes = s.nodes.filter((n) => n.end > now);
    }
    if (music && musicIsJingle && now >= music.end) {
      const done = music;
      music = null;
      musicIsJingle = false;
      dying.push({ s: done, at: now });
      if (resume) {
        const r = resume;
        resume = null;
        startSong(r.id, r.step);
      }
    }
    if (sfx && now >= sfx.end + 0.05) {
      dying.push({ s: sfx, at: now });
      sfx = null;
    }
    if (cry && now >= cry.end + 0.05) {
      dying.push({ s: cry, at: now });
      cry = null;
    }
    dying = dying.filter((d) => {
      if (now < d.at) return true;
      d.s.out.disconnect();
      return false;
    });
    if (!music && !sfx && !cry && !dying.length && timer !== null) {
      clearI(timer);
      timer = null;
    }
  }

  function ensureTimer() {
    if (timer === null) timer = setI(tick, TICK_MS);
  }

  return {
    unlock() {
      if (ctx) {
        if (ctx.state !== "running") ctx.resume().catch(() => {});
        return;
      }
      const made = AC()();
      if (!made) return;
      ctx = made;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      build();
      if (wanted) startSong(wanted, 0);
    },

    playMusic(id) {
      piece("song", id); // an unknown id throws even before unlock
      if (id === wanted) return;
      wanted = id;
      if (!ctx) return;
      if (musicIsJingle) {
        resume = { id, step: 0 };
        return;
      }
      startSong(id, 0);
    },

    stopMusic() {
      wanted = null;
      resume = null;
      if (!ctx || musicIsJingle) return; // a jingle plays out, then silence
      cut(music);
      music = null;
    },

    jingle(id) {
      const p = piece("jingle", id);
      if (!ctx) return;
      const now = ctx.currentTime;
      if (music && !musicIsJingle && wanted) resume = { id: wanted, step: positionOf(music, now) };
      cut(music);
      music = startSession(p, musicBus, 0, now + 0.03);
      musicIsJingle = true;
      applySteal();
    },

    playSfx(id) {
      const p = piece("sfx", id);
      if (!ctx) return;
      cut(sfx);
      sfx = startSession(p, sfxBus, 0, ctx.currentTime + 0.005);
      recomputeSteal();
    },

    playCry(speciesId) {
      if (!ctx) return;
      cut(cry);
      cry = startSession(cryPiece(speciesId), sfxBus, 0, ctx.currentTime + 0.005);
      recomputeSteal();
    },

    setVolumes(v) {
      volumes = {
        music: clamp01(v.music ?? volumes.music),
        sfx: clamp01(v.sfx ?? volumes.sfx),
      };
      if (!ctx) return;
      const now = ctx.currentTime;
      musicBus.gain.setTargetAtTime(volumes.music, now, 0.02);
      sfxBus.gain.setTargetAtTime(volumes.sfx, now, 0.02);
    },

    get current() {
      return wanted;
    },
  };
}

/** @param {number} x */
function clamp01(x) {
  return Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0));
}
