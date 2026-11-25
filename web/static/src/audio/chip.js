// @ts-check
// The chip's math, shared by the Web Audio voices (audio.js) and anything that renders
// offline: pitches, duty cycles, the wave channel's wavetables, the noise channel's
// LFSR, volume envelopes and the mix. Pure: no Web Audio here, so node can use it.

/** The four voices, in the Game Boy's order: two pulses, the wave channel, noise. */
export const CHANNELS = /** @type {const} */ (["p1", "p2", "w", "n"]);
/** @typedef {typeof CHANNELS[number]} ChannelId */

/** Pulse duty cycles for duty settings 0..3, as on the Game Boy. */
export const DUTIES = [0.125, 0.25, 0.5, 0.75];

/**
 * Wave-channel tables: 32 samples of 4 bits each, written as hex like the Game Boy's
 * wave RAM. Index 0 is the default soft triangle.
 */
export const WAVETABLES = [
  "0123456789ABCDEFFEDCBA9876543210", // 0 triangle: round, the default bass
  "02468ACEEFFFFFFFFFFFFFEECA864200", // 1 rounded square: fuller, organ-like
  "0011223344556677889AABBCCDDEEFF0", // 2 saw: brighter, for leads
  "89ABCDEFFFEDCBA98765432100012345", // 3 sine-ish, offset: a soft flute
  "FFEEDDCCBBAA99887766554433221100", // 4 falling saw
  "08CFFFC80000000008CFFFC800000000", // 5 hollow double pulse, woody
];

/** Peak gain of one voice at volume 15, before the music/sfx buses. Four at once sum to 1. */
export const VOICE_GAIN = 0.25;

/** How long one arpeggio note lasts, in seconds (fast, as GB drivers do per frame). */
export const ARP_SEC = 1 / 30;

/** Vibrato: rate in Hz and how long a note holds before it starts. */
export const VIBRATO_HZ = 5.5;
export const VIBRATO_DELAY = 0.18;

/** Attack and release ramps that keep notes from clicking, in seconds. */
export const ATTACK_SEC = 0.004;
export const RELEASE_SEC = 0.006;

/** @param {number} midi */
export function midiToHz(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Playback rate of a noise buffer for a noise pitch index (0 brightest .. 15 darkest).
 * Fractional indexes are allowed (slides pass through them).
 * @param {number} index
 */
export function noiseRate(index) {
  return 2 ** ((3 - index) / 3);
}

/**
 * Envelope level 0..1 at `sec` seconds after a note's onset. `env` 0 holds the volume;
 * otherwise the volume drops one of its 16 levels every env/64 s, as the GB envelope
 * does (smoothed into a line instead of steps).
 * @param {number} vol 0..15
 * @param {number} env
 * @param {number} sec
 */
export function envLevel(vol, env, sec) {
  if (env <= 0) return vol / 15;
  return Math.max(0, vol - (sec * 64) / env) / 15;
}

/**
 * Seconds until an envelope reaches silence (Infinity when it holds).
 * @param {number} vol
 * @param {number} env
 */
export function envDuration(vol, env) {
  return env <= 0 ? Infinity : (vol * env) / 64;
}

/**
 * Fourier coefficients of a bipolar pulse wave with the given duty, for PeriodicWave.
 * @param {number} duty 0..1
 * @param {number} [harmonics]
 * @returns {{real: Float32Array, imag: Float32Array}}
 */
export function pulseCoefficients(duty, harmonics = 96) {
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    real[n] = (2 * Math.sin(2 * Math.PI * n * duty)) / (Math.PI * n);
    imag[n] = (2 * (1 - Math.cos(2 * Math.PI * n * duty))) / (Math.PI * n);
  }
  return { real, imag };
}

/**
 * A wavetable's 32 samples as -1..1 values.
 * @param {string} hex
 */
export function wavetableSamples(hex) {
  return Array.from(hex, (c) => (parseInt(c, 16) - 7.5) / 7.5);
}

/**
 * Fourier coefficients of a 32-sample wavetable (a DFT, so harmonics stop at 16: the
 * soft version of the 4-bit wave).
 * @param {string} hex
 * @returns {{real: Float32Array, imag: Float32Array}}
 */
export function wavetableCoefficients(hex) {
  const s = wavetableSamples(hex);
  const n = s.length;
  const half = n / 2;
  const real = new Float32Array(half + 1);
  const imag = new Float32Array(half + 1);
  for (let k = 1; k <= half; k++) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * k * i) / n;
      re += s[i] * Math.cos(a);
      im += s[i] * Math.sin(a);
    }
    real[k] = (2 * re) / n;
    imag[k] = (2 * im) / n;
  }
  return { real, imag };
}

/**
 * The noise channel's LFSR output, one step per sample, as -1/1 values. `short` is the
 * 7-bit mode with its period of 127, the metallic buzz; otherwise the 15-bit white noise.
 * @param {boolean} short
 * @param {number} length samples
 */
export function lfsrNoise(short, length) {
  const out = new Float32Array(length);
  let lfsr = 0x7fff;
  for (let i = 0; i < length; i++) {
    const bit = (lfsr ^ (lfsr >> 1)) & 1;
    lfsr = (lfsr >> 1) | (bit << 14);
    if (short) lfsr = (lfsr & ~0x40) | (bit << 6);
    out[i] = lfsr & 1 ? -1 : 1;
  }
  return out;
}
