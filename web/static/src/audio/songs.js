// @ts-check
// Every song in the game, in the tracker notation (notation.js). All original. Each has
// its melody on pulse 1, harmony or a counter-line on pulse 2, bass on the wave channel
// and rhythm on noise, loops from `@` (or the start), and loops in 20 to 60 seconds.

/** @typedef {import("./notation.js").PieceDef} PieceDef */

/**
 * Patterns every song can use, written on C and moved with `tN` (bass and drums mostly):
 * each is one 4/4 bar unless named otherwise.
 */
const COMMON = {
  // bass
  b8: "C3:2 C3:2 G3:2 C3:2 C4:2 C3:2 G3:2 C3:2", // pop eighths
  bo: "C3:2 C4:2 C3:2 C4:2 C3:2 C4:2 C3:2 C4:2", // driving octaves
  bq: "C3:4 G3:4 C4:4 G3:4", // walking quarters
  bh: "C3:8 G3:8", // halves
  bw: "C3:12 G2:4", // calm
  bs: "C3:3 C3:3 G3:2 r:2 C3:2 G3:2 C3:2", // syncopated
  bm: "C3:4 G2:4 C3:4 G2:4", // march
  bt: "C3:3 C3:3 C3:2 C3:3 C3:3 C3:2", // tense pulse
  vo: "C3:2 C3:2 G3:2 C3:2 C3:2 Db3:2 B2:2 G2:2", // the villain's creeping ostinato
  bl: "C3:16", // drone
  bz: "C3:6 r:2 G2:4", // waltz (3/4)
  // drums
  dr: "k:4 h:2 h:2 s:4 h:2 k:2",
  dd: "k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2",
  dx: "x:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2",
  dc: "k:8 h:4 h:4",
  dm: "k:4 s:2 s:2 k:4 s:2 s:2",
  ds: "k:3 h:1 h:2 h:2 s:3 h:1 h:2 h:2",
  dl: "k:4 h:4 s:4 h:4",
  df: "s:2 s:2 s:2 s:2 s:1 s:1 s:2 s:2 s:2",
  // pulse 2 accompaniment
  pk: "r:2 E4:2 r:2 G4:2 r:2 E4:2 r:2 G4:2", // offbeat stabs, major
  pm: "r:2 Eb4:2 r:2 G4:2 r:2 Eb4:2 r:2 G4:2", // offbeat stabs, minor
  ma: "C4:2 E4:2 G4:2 E4:2 C5:2 G4:2 E4:2 G4:2", // broken chord, major
  mi: "C4:2 Eb4:2 G4:2 Eb4:2 C5:2 G4:2 Eb4:2 G4:2", // broken chord, minor
  ka: "C4+E4+G4:2 r:6 C4+E4+G4:2 r:2 C4+E4+G4:2 r:2", // blips, major
  ki: "C4+Eb4+G4:2 r:6 C4+Eb4+G4:2 r:2 C4+Eb4+G4:2 r:2", // blips, minor
  sk: "C4:1 E4:1 G4:1 C5:1 C4:1 E4:1 G4:1 C5:1 C4:1 E4:1 G4:1 C5:1 C4:1 E4:1 G4:1 C5:1", // sparkle, major
  sm: "C4:1 Eb4:1 G4:1 C5:1 C4:1 Eb4:1 G4:1 C5:1 C4:1 Eb4:1 G4:1 C5:1 C4:1 Eb4:1 G4:1 C5:1", // sparkle, minor
  rf: "C4:2 G4:2 C5:2 G4:2 C4:2 G4:2 C5:2 G4:2", // rolling fifths
  wz: "r:4 E4+G4:4 E4+G4:4", // waltz stabs, major
  wm: "r:4 Eb4+G4:4 Eb4+G4:4", // waltz stabs, minor
};

/**
 * Bars of patterns, each moved to its chord: "b8:-3 b8:5" is `t-3 $b8 | t5 $b8 |`.
 * Ends with `t0`, so notes written after it are not moved.
 * @param {string} spec
 */
function bars(spec) {
  return (
    spec
      .trim()
      .split(/\s+/)
      .map((s) => {
        const [pat, t] = s.split(":");
        return `t${t ?? 0} $${pat} |`;
      })
      .join(" ") + " t0"
  );
}

/**
 * @param {PieceDef} def
 * @returns {PieceDef}
 */
const song = (def) => ({ ...def, defs: { ...COMMON, ...def.defs } });

/** @type {Record<string, PieceDef>} */
export const SONGS = {
  // Bright and heroic: a two-bar fanfare, then the theme.
  title: song({
    bpm: 132,
    key: "C",
    p1: `d1 v12 ~2 G4:2 C5:2 E5:2 G5:2 C6:8 | B5:4 A5:4 G5:4 D5:4 | @
      E5:6 D5:2 C5:4 G4:4 | D5:6 E5:2 D5:4 B4:4 | C5:6 D5:2 E5:4 A5:4 | A5:8 G5:4 F5:4 |
      E5:6 F5:2 G5:4 C6:4 | B5:6 A5:2 G5:4 D5:4 | A5:4 G5:4 F5:4 A5:4 | G5:12 r:4 |
      E5:2 A5:2 C6:4 B5:2 A5:2 E5:4 | F5:2 A5:2 C6:4 A5:4 F5:4 | G5:2 C6:2 E6:4 D6:2 C6:2 G5:4 | B5:4 D6:4 G5:8 |
      A5:6 B5:2 C6:4 E6:4 | F6:6 E6:2 D6:4 C6:4 | D6:6 C6:2 B5:4 A5:2 B5:2 | G5:8 D5:2 E5:2 F5:2 G5:2 |`,
    p2: `d2 v8 e6 E4:8 G4:8 | D4:8 B3:8 | @
      C5:8 G4:8 | B4:8 G4:8 | A4:8 C5:8 | C5:8 A4:8 |
      C5:8 E5:8 | D5:8 B4:8 | C5:8 A4:8 | B4:8 D5:4 B4:4 |
      C5:8 E5:8 | A4:8 C5:8 | E5:8 G5:8 | D5:8 B4:8 |
      E5:8 A5:8 | A5:8 F5:8 | G5:8 D5:8 | B4:8 D5:8 |`,
    w: `w0 v13 q7 C3:8 C3:8 | G2:8 G2:4 G2:4 | @
      ${bars("b8:0 b8:-5 b8:-3 b8:-7 b8:0 b8:-5 b8:-7 b8:-5 b8:-3 b8:-7 b8:0 b8:-5 b8:-3 b8:-7 b8:-5 b8:-5")}`,
    n: `x:8 s:4 s:2 s:2 | $df | @ [ $dr ]15 $df |`,
  }),

  // The professor's talk: warm and unhurried.
  intro: song({
    bpm: 96,
    key: "F",
    p1: `d2 v11 ~2 @
      A4:4 C5:4 F5:6 E5:2 | E5:4 D5:2 C5:2 G4:8 | F4:4 A4:4 D5:6 C5:2 | D5:4 C5:2 Bb4:2 F4:8 |
      A4:2 Bb4:2 C5:4 F5:4 A5:4 | G5:6 F5:2 D5:4 Bb4:4 | C5:4 E5:4 G5:4 Bb5:4 | G5:12 r:4 |
      F5:6 D5:2 Bb4:4 D5:4 | E5:6 C5:2 G4:4 E5:4 | E5:4 A5:4 C6:4 A5:4 | F5:8 D5:4 A4:4 |
      Bb4:4 D5:4 F5:4 D5:4 | E5:4 G5:4 C6:4 Bb5:4 | A5:12 F5:4 | G5:8 E5:4 C5:4 |`,
    p2: `d1 v7 e8 @
      F4:8 A4:8 | C5:8 E4:8 | D4:8 F4:8 | Bb4:8 D4:8 |
      F4:8 C5:8 | Bb4:8 G4:8 | E4:8 E5:8 | E5:8 C5:8 |
      F4:8 D4:8 | C5:8 E4:8 | C5:8 E5:8 | A4:8 F4:8 |
      F4:8 Bb4:8 | C5:8 E5:8 | C5:8 A4:8 | Bb4:8 G4:8 |`,
    w: `w3 v13 q7 @ ${bars("bq:5 bq:0 bq:2 bq:-2 bq:5 bq:-5 bq:0 bq:0 bq:-2 bq:0 bq:-3 bq:2 bq:-2 bq:0 bq:5 bq:0")}`,
    n: `v5 @ [ h:4 h:4 h:4 h:4 ]16`,
  }),

  // Home town: calm, pastoral.
  "town-home": song({
    bpm: 100,
    key: "G",
    p1: `d2 v11 ~2 @
      B4:4 D5:4 G5:6 F#5:2 | E5:6 D5:2 B4:8 | C5:4 E5:4 G5:4 E5:4 | D5:6 E5:2 F#5:8 |
      G5:4 B5:4 A5:4 G5:4 | E5:4 G5:4 B4:8 | C5:4 E5:4 A5:6 G5:2 | F#5:12 r:4 |
      E5:6 G5:2 C6:4 B5:4 | A5:6 F#5:2 D5:8 | D5:4 F#5:4 B5:6 A5:2 | G5:8 E5:8 |
      E5:4 G5:4 C6:6 B5:2 | A5:4 F#5:4 D5:4 C5:4 | B4:6 A4:2 G4:8 | A4:4 B4:2 A4:2 D5:4 C5:4 |`,
    p2: `d1 v7 e10 @
      G4:8 B4:8 | B4:8 G4:8 | G4:8 C5:8 | A4:8 D5:8 |
      D5:16 | B4:8 E4:8 | A4:8 C5:8 | D5:8 A4:8 |
      C5:8 E5:8 | F#5:8 A4:8 | B4:8 D5:8 | B4:8 G4:8 |
      C5:8 E5:8 | F#5:8 A4:8 | D4:8 B3:8 | F#4:8 D4:8 |`,
    w: `w0 v13 q7 @ ${bars("bh:-5 bh:4 bh:0 bh:2 bh:-5 bh:4 bh:-3 bh:2 bh:0 bh:2 bh:-1 bh:4 bh:0 bh:2 bh:-5 bh:2")}`,
    n: `v8 @ [ $dc ]16`,
  }),

  // The second town: breezy, syncopated.
  "town-2": song({
    bpm: 104,
    key: "D",
    p1: `d1 v11 ~1 @
      F#5:3 A5:3 F#5:2 E5:2 D5:2 A4:4 | C#5:3 E5:3 C#5:2 B4:2 A4:2 E4:4 | D5:3 F#5:3 D5:2 C#5:2 B4:2 F#4:4 | G4:4 B4:4 D5:6 r:2 |
      F#5:3 A5:3 D6:2 C#6:2 A5:2 F#5:4 | E5:3 A5:3 C#6:2 B5:2 A5:2 E5:4 | D5:4 G5:4 B5:4 A5:2 G5:2 | A5:8 E5:4 C#5:4 |
      B4:3 D5:3 F#5:2 r:2 E5:2 D5:4 | C#5:3 F#5:3 A5:2 r:2 F#5:2 E5:4 | D5:3 G5:3 B5:2 r:2 A5:2 G5:4 | F#5:8 A5:8 |
      G5:4 E5:4 B4:4 E5:4 | C#5:4 E5:4 A5:4 G5:4 | F#5:6 E5:2 D5:8 | r:8 A4:2 B4:2 C#5:2 E5:2 |`,
    p2: `d2 v7 e2 @ ${bars("pk:2 pk:-3 pm:-1 pk:7 pk:2 pk:-3 pk:7 pk:-3 pm:-1 pm:6 pk:7 pk:2 pm:4 pk:-3 pk:2 pk:2")}`,
    w: `w0 v13 q7 @ ${bars("bs:2 bs:-3 bs:-1 bs:-5 bs:2 bs:-3 bs:-5 bs:-3 bs:-1 bs:-6 bs:-5 bs:2 bs:4 bs:-3 bs:2 bs:2")}`,
    n: `v9 @ [ $dr ]16`,
  }),

  // The city: bustling, a swung walk.
  city: song({
    bpm: 120,
    key: "Bb",
    p1: `d2 v11 ~1 @
      D5:2 F5:2 r:2 Bb5:4 A5:2 Bb5:2 F5:2 | G5:6 F5:2 D5:4 Bb4:4 | Eb5:2 G5:2 r:2 Bb5:4 C6:2 Bb5:2 G5:2 | A5:6 G5:2 F5:4 C5:4 |
      D5:2 F5:2 r:2 Bb5:4 C6:2 D6:2 Bb5:2 | D6:6 C6:2 Bb5:4 G5:4 | Eb5:4 G5:4 C6:4 Bb5:2 G5:2 | A5:8 F5:4 Eb5:4 |
      G5:3 Eb5:3 Bb4:2 G5:3 Eb5:3 Bb4:2 | A5:3 F5:3 C5:2 A5:3 F5:3 C5:2 | F5:3 D5:3 A4:2 F5:2 A5:2 D6:4 | Bb5:8 G5:4 D5:4 |
      Eb5:2 G5:2 Bb5:2 Eb6:6 D6:2 C6:2 | C6:4 A5:4 F5:4 Eb5:4 | D5:6 F5:2 Bb5:8 | A5:4 G5:2 F5:2 Eb5:4 C5:4 |`,
    p2: `d1 v6 @
      Bb4+D5+F5:16 | G4+Bb4+D5:16 | G4+Bb4+Eb5:16 | A4+C5+F5:16 |
      Bb4+D5+F5:16 | G4+Bb4+D5:16 | G4+C5+Eb5:16 | A4+C5+Eb5:16 |
      G4+Bb4+Eb5:16 | A4+C5+F5:16 | A4+D5+F5:16 | G4+Bb4+D5:16 |
      G4+Bb4+Eb5:16 | A4+C5+F5:16 | Bb4+D5+F5:16 | A4+C5+Eb5:16 |`,
    w: `w1 v11 q6 @ ${bars("bq:-2 bq:-5 bq:3 bq:5 bq:-2 bq:-5 bq:0 bq:-7 bq:3 bq:-7 bq:2 bq:-5 bq:3 bq:-7 bq:-2 bq:-7")}`,
    n: `v9 @ [ $ds ]16`,
  }),

  // Route 1: off on an adventure.
  "route-1": song({
    bpm: 140,
    key: "A",
    p1: `d1 v12 ~1 @
      E5:4 A5:4 C#6:6 B5:2 | B5:4 G#5:2 E5:2 B4:8 | C#5:2 E5:2 F#5:4 A5:4 F#5:4 | F#5:6 E5:2 D5:8 |
      E5:4 A5:4 C#6:4 E6:4 | D6:6 C#6:2 B5:4 G#5:4 | A5:4 F#5:4 D6:4 C#6:2 B5:2 | B5:12 r:4 |
      A5:2 F#5:2 C#5:2 F#5:2 A5:4 C#6:4 | D6:4 A5:4 F#5:4 A5:4 | E5:2 A5:2 C#6:2 E6:2 C#6:4 A5:4 | B5:4 G#5:4 E5:4 G#5:4 |
      A5:6 G#5:2 F#5:4 C#5:4 | D5:4 F#5:4 A5:4 D6:4 | E6:6 D6:2 C#6:4 B5:4 | E6:8 D6:4 B5:4 |`,
    p2: `d2 v7 e10 @
      C#5:8 E5:8 | G#5:8 G#4:8 | A4:8 C#5:8 | A4:8 F#4:8 |
      C#5:8 A5:8 | B5:8 E5:8 | F#5:8 A5:8 | G#5:8 E5:8 |
      C#5:8 F#5:8 | F#5:8 D5:8 | C#5:8 E5:8 | E5:8 B4:8 |
      C#5:8 A4:8 | A4:8 D5:8 | G#5:8 E5:8 | B5:8 G#5:8 |`,
    w: `w0 v13 q7 @ ${bars("b8:-3 b8:4 b8:6 b8:2 b8:-3 b8:4 b8:2 b8:4 b8:6 b8:2 b8:-3 b8:4 b8:6 b8:2 b8:4 b8:4")}`,
    n: `v10 @ [ $dr ]15 $df |`,
  }),

  // Route 2: minor-key, striding.
  "route-2": song({
    bpm: 136,
    key: "Em",
    p1: `d2 v12 ~1 @
      B4:2 E5:2 G5:4 F#5:2 E5:2 B4:4 | C5:2 E5:2 G5:4 E5:4 C5:4 | D5:2 G5:2 B5:4 A5:2 G5:2 D5:4 | F#5:6 E5:2 D5:4 A4:4 |
      B4:2 E5:2 G5:4 B5:4 E6:4 | E6:6 D6:2 C6:4 G5:4 | A5:4 C6:4 E6:4 D6:2 C6:2 | B5:8 D#6:4 B5:4 |
      C6:6 B5:2 G5:4 E5:4 | D6:6 C6:2 A5:4 F#5:4 | G5:4 B5:4 D6:4 B5:4 | E6:8 B5:4 G5:4 |
      A5:2 C6:2 E6:4 C6:2 A5:2 E5:4 | G5:4 E5:4 C6:4 G5:4 | F#5:4 A5:4 B5:4 D#6:4 | B5:8 A5:4 F#5:4 |`,
    p2: `d1 v6 q6 @ ${bars("mi:4 ma:0 ma:-5 ma:2 mi:4 ma:0 mi:-3 ma:-1 ma:0 ma:2 ma:-5 mi:4 mi:-3 ma:0 ma:-1 ma:-1")}`,
    w: `w0 v13 q6 @ ${bars("bo:4 bo:0 bo:-5 bo:2 bo:4 bo:0 bo:-3 bo:-1 bo:0 bo:2 bo:-5 bo:4 bo:-3 bo:0 bo:-1 bo:-1")}`,
    n: `v10 @ [ $dd ]15 $df |`,
  }),

  // Route 3: bright, dotted, a long stride.
  "route-3": song({
    bpm: 148,
    key: "D",
    p1: `d1 v12 ~1 @
      D5:3 E5:1 F#5:4 A5:3 G5:1 F#5:4 | D5:3 C#5:1 B4:4 F#4:8 | G4:3 A4:1 B4:4 D5:3 C#5:1 B4:4 | C#5:6 B4:2 A4:8 |
      F#5:3 G5:1 A5:4 D6:3 C#6:1 A5:4 | B5:3 A5:1 F#5:4 D5:8 | E5:3 F#5:1 G5:4 B5:3 A5:1 G5:4 | A5:12 r:4 |
      B5:4 G5:4 D5:4 G5:4 | C#6:4 A5:4 E5:4 A5:4 | A5:3 F#5:1 C#5:4 F#5:3 A5:1 C#6:4 | B5:8 D6:4 B5:4 |
      G5:3 A5:1 B5:4 D6:4 B5:4 | A5:3 B5:1 C#6:4 E6:4 C#6:4 | D6:8 A5:4 F#5:4 | A5:4 F#5:4 E5:4 C#5:4 |`,
    p2: `d2 v7 e10 @
      A4:8 D5:8 | B4:8 D4:8 | D4:8 G4:8 | A4:8 E4:8 |
      A4:8 F#5:8 | F#5:8 B4:8 | G4:8 E5:8 | E5:8 C#5:8 |
      D5:8 B4:8 | E5:8 C#5:8 | A4:8 C#5:8 | D5:8 F#5:8 |
      B4:8 G5:8 | C#5:8 A5:8 | F#5:8 D5:8 | F#4:8 A4:8 |`,
    w: `w0 v13 q7 @ ${bars("bs:2 bs:-1 bs:-5 bs:-3 bs:2 bs:-1 bs:4 bs:-3 bs:-5 bs:-3 bs:6 bs:-1 bs:-5 bs:-3 bs:2 bs:2")}`,
    n: `v10 @ [ $dr ]15 $df |`,
  }),

  // The forest: mysterious, with a GB-style echo on pulse 2.
  forest: song({
    bpm: 108,
    key: "Am",
    defs: {
      m: `A4:6 C5:2 F5:4 E5:4 | D5:6 B4:2 G4:4 B4:4 | C5:4 B4:4 A4:4 E4:4 | A4:12 r:4 |
        F5:6 E5:2 D5:4 A4:4 | C5:6 B4:2 A4:4 E5:4 | F5:4 A5:4 C6:4 A5:4 | G#5:8 E5:4 B4:4 |
        A5:6 G5:2 E5:4 C5:4 | D5:6 B4:2 G4:4 D5:4 | C5:4 A4:4 F4:4 A4:4 | B4:8 G#4:4`,
      a: `E5:6 A5:2 E5:4 C5:4 | D5:8 B4:4 G4:4 | A4:4 C5:4 E5:4 G5:4 | B4:12 r:4 |`,
    },
    p1: `d2 v10 ~3 @ $a $m E4:4 |`,
    p2: `d1 v4 ~3 @ b2 r:2 $a $m E4:2 b0 |`,
    w: `w3 v14 q7 @ ${bars("bw:-3 bw:-5 bw:-3 bw:4 bw:5 bw:-5 bw:-3 bw:-3 bw:2 bw:-3 bw:5 bw:4 bw:-3 bw:-5 bw:5 bw:4")}`,
    n: `v6 @ [ k:8 h:6 h:2 ]16`,
  }),

  // The cave: slow, sparse, dripping.
  cave: song({
    bpm: 84,
    key: "Dm",
    p1: `d0 v9 ~4 @
      r:4 D5:4 F5:4 A5:4 | A5:12 r:4 | r:4 F5:4 D5:4 Bb4:4 | C#5:12 r:4 |
      r:4 F5:4 A5:4 D6:4 | D6:8 Bb5:8 | A5:4 G5:4 E5:4 C#5:4 | A4:12 r:4 |
      r:4 D5:4 F5:4 Bb5:4 | Bb5:8 G5:8 | F5:8 A5:4 F5:4 | E5:12 r:4 |
      r:4 G5:4 Bb5:4 D6:4 | F6:8 D6:8 | C#6:8 E5:8 | A5:12 r:4 |`,
    p2: `d2 v6 e4 @
      D4:8 F4:8 | A4:8 F4:8 | D4:8 F4:8 | E4:8 C#4:8 |
      D4:8 A4:8 | G4:8 D4:8 | E4:8 A4:8 | C#4:8 E4:8 |
      F4:8 D4:8 | D4:8 G4:8 | A4:8 D4:8 | C#4:8 A4:8 |
      Bb4:8 G4:8 | D5:8 F4:8 | E5:8 A4:8 | C#5:8 E4:8 |`,
    w: `w3 v14 q8 @ ${bars("bl:2 bl:2 bl:-2 bl:-3 bl:2 bl:-5 bl:-3 bl:-3 bl:-2 bl:-5 bl:2 bl:-3 bl:-5 bl:-2 bl:-3 bl:-3")}`,
    n: `@ [ v7 k:8 r:4 v4 e1 M4:2 r:2 ]16`,
  }),

  // The beach: tropical, syncopated.
  beach: song({
    bpm: 112,
    key: "F",
    p1: `d2 v11 ~2 @
      A5:3 G5:3 F5:2 C5:4 F5:4 | D5:3 F5:3 Bb5:2 F5:4 D5:4 | E5:3 G5:3 C6:2 Bb5:4 G5:4 | A5:8 r:4 C5:4 |
      F5:3 E5:3 D5:2 A4:4 D5:4 | F5:3 D5:3 Bb4:2 D5:4 F5:4 | G5:3 F5:3 E5:2 C5:4 E5:4 | G5:12 r:4 |
      Bb5:3 A5:3 F5:2 D5:4 F5:4 | G5:3 E5:3 C5:2 E5:4 G5:4 | A5:3 C6:3 A5:2 E5:4 A5:4 | F5:8 D5:4 A4:4 |
      D5:3 F5:3 Bb5:2 D6:4 C6:2 Bb5:2 | C6:3 Bb5:3 G5:2 E5:4 G5:4 | F5:8 A5:4 C6:4 | Bb5:4 G5:4 E5:4 G5:4 |`,
    p2: `d2 v6 e2 @ ${bars("pk:5 pk:-2 pk:0 pk:5 pm:2 pk:-2 pk:0 pk:0 pk:-2 pk:0 pm:-3 pm:2 pk:-2 pk:0 pk:5 pk:0")}`,
    w: `w5 v14 q7 @ ${bars("bs:5 bs:-2 bs:0 bs:5 bs:2 bs:-2 bs:0 bs:0 bs:-2 bs:0 bs:-3 bs:2 bs:-2 bs:0 bs:5 bs:0")}`,
    n: `v9 @ [ k:3 h:3 s:2 h:2 k:2 s:4 ]16`,
  }),

  // Snow: crystalline, slow.
  snow: song({
    bpm: 90,
    key: "Em",
    p1: `d1 v10 ~2 @
      B5:8 G5:4 E5:4 | E5:8 G5:4 B5:4 | C6:8 B5:4 A5:4 | F#5:12 r:4 |
      E5:4 G5:4 B5:4 E6:4 | C6:8 G5:4 E5:4 | F#5:4 A5:4 D6:4 A5:4 | B5:12 r:4 |
      G5:6 A5:2 G5:4 E5:4 | F#5:6 G5:2 F#5:4 D5:4 | B5:8 D6:4 B5:4 | G5:12 r:4 |
      A5:4 C6:4 E6:4 C6:4 | E6:4 D6:2 C6:2 G5:8 | F#5:4 A5:4 B5:4 D#6:4 | B5:12 r:4 |`,
    p2: `d0 v5 e3 @ ${bars("sm:4 sk:0 sm:-3 sk:-1 sm:4 sk:0 sk:2 sk:-1 sk:0 sk:2 sk:-5 sm:4 sm:-3 sk:0 sk:-1 sk:-1")}`,
    w: `w3 v14 q8 @ ${bars("bw:4 bw:0 bw:-3 bw:-1 bw:4 bw:0 bw:2 bw:-1 bw:0 bw:2 bw:-5 bw:4 bw:-3 bw:0 bw:-1 bw:-1")}`,
    n: `v4 @ [ o:8 h:8 ]16`,
  }),

  // The lab: curious, staccato.
  lab: song({
    bpm: 112,
    key: "C",
    p1: `d2 v11 q5 @
      C5:2 E5:2 G5:2 E5:2 C6:4 G5:4 | A5:2 E5:2 C5:2 E5:2 A4:4 C5:4 | F5:2 A5:2 C6:2 A5:2 F5:4 C5:4 | D5:2 G5:2 B5:2 G5:2 D6:8 |
      E6:2 D6:2 C6:2 G5:2 E5:4 G5:4 | A5:2 G5:2 E5:2 C5:2 A4:8 | F#5:2 A5:2 D6:2 A5:2 F#5:4 D5:4 | G5:4 B5:4 D6:8 |
      A5:4 F5:2 A5:2 C6:4 A5:4 | B5:4 G5:2 B5:2 D6:4 B5:4 | G5:4 E5:2 G5:2 B5:4 G5:4 | A5:2 B5:2 C6:2 E6:2 A5:8 |
      F5:2 G5:2 A5:2 C6:2 F6:4 C6:4 | D6:2 C6:2 B5:2 G5:2 D5:4 B4:4 | C5:4 G5:4 E5:4 C5:4 | D5:2 E5:2 F5:2 G5:2 B4:4 D5:4 |`,
    p2: `d1 v6 e2 @ ${bars("ka:0 ki:-3 ka:5 ka:-5 ka:0 ki:-3 ka:2 ka:-5 ka:5 ka:-5 ki:4 ki:-3 ka:5 ka:-5 ka:0 ka:-5")}`,
    w: `w0 v13 q5 @ ${bars("b8:0 b8:-3 b8:5 b8:-5 b8:0 b8:-3 b8:2 b8:-5 b8:5 b8:-5 b8:4 b8:-3 b8:5 b8:-5 b8:0 b8:-5")}`,
    n: `v8 @ [ k:4 h:2 h:2 s:4 h:2 h:2 ]16`,
  }),

  // The healing center: a gentle waltz.
  center: song({
    bpm: 108,
    key: "G",
    bar: 12,
    p1: `d2 v10 ~2 @
      D5:4 G5:4 B5:4 | A5:8 F#5:4 | G5:4 E5:4 B4:4 | C5:8 E5:4 |
      D5:4 G5:4 B5:4 | C6:8 A5:4 | F#5:4 A5:4 D6:4 | C6:8 A5:4 |
      G5:8 E5:4 | F#5:8 D5:4 | D5:4 F#5:4 B5:4 | B5:8 G5:4 |
      E5:4 G5:4 C6:4 | C6:4 A5:4 F#5:4 | G5:12 | r:4 B4:4 C5:4 |`,
    p2: `d1 v6 q5 @ ${bars("wz:-5 wz:2 wm:4 wz:0 wz:-5 wm:-3 wz:2 wz:2 wz:0 wz:2 wm:-1 wm:4 wz:0 wz:2 wz:-5 wz:-5")}`,
    w: `w3 v13 q7 @ ${bars("bz:-5 bz:2 bz:4 bz:0 bz:-5 bz:-3 bz:2 bz:2 bz:0 bz:2 bz:-1 bz:4 bz:0 bz:2 bz:-5 bz:-5")}`,
    n: `v4 @ [ k:4 h:4 h:4 ]16`,
  }),

  // The mart: jaunty.
  mart: song({
    bpm: 120,
    key: "F",
    p1: `d1 v11 q6 @
      C5:2 F5:2 A5:2 F5:2 C6:4 A5:4 | D6:2 C6:2 A5:2 F5:2 D5:4 F5:4 | G5:2 Bb5:2 D6:2 Bb5:2 G5:4 D5:4 | E5:4 G5:4 C6:4 Bb5:4 |
      A5:2 C6:2 F6:2 C6:2 A5:4 F5:4 | F5:2 A5:2 D6:2 A5:2 F5:4 D5:4 | D5:2 F5:2 Bb5:2 D6:2 Bb5:4 F5:4 | G5:8 E5:4 C5:4 |
      F5:4 D5:2 F5:2 Bb5:4 F5:4 | G5:4 E5:2 G5:2 C6:4 G5:4 | A5:4 E5:2 A5:2 C6:4 A5:4 | D6:8 A5:4 F5:4 |
      G5:2 A5:2 Bb5:2 D6:2 G6:4 D6:4 | E6:4 C6:4 G5:4 E5:4 | F5:4 A5:4 C6:4 A5:4 | G5:2 A5:2 Bb5:2 G5:2 E5:4 C5:4 |`,
    p2: `d2 v6 e2 @ ${bars("pk:5 pm:2 pm:-5 pk:0 pk:5 pm:2 pk:-2 pk:0 pk:-2 pk:0 pm:-3 pm:2 pm:-5 pk:0 pk:5 pk:0")}`,
    w: `w1 v11 q6 @ ${bars("bm:5 bm:2 bm:-5 bm:0 bm:5 bm:2 bm:-2 bm:0 bm:-2 bm:0 bm:-3 bm:2 bm:-5 bm:0 bm:5 bm:0")}`,
    n: `v9 @ [ $dl ]16`,
  }),

  // A Warden's tower: solemn and determined, a march.
  spire: song({
    bpm: 120,
    key: "Gm",
    p1: `d2 v12 ~2 @
      G4:6 Bb4:2 D5:8 | Eb5:6 D5:2 Bb4:8 | C5:6 D5:2 F5:4 A5:4 | F#5:12 r:4 |
      G5:6 F5:2 D5:4 Bb4:4 | G5:6 F5:2 Eb5:4 Bb4:4 | C5:4 Eb5:4 G5:4 C6:4 | A5:8 F#5:4 D5:4 |
      Bb5:6 G5:2 Eb5:8 | C6:6 A5:2 F5:8 | D6:6 C6:2 Bb5:4 F5:4 | G5:12 r:4 |
      Eb6:6 D6:2 C6:4 G5:4 | Bb5:6 G5:2 Eb5:4 G5:4 | F#5:4 A5:4 D6:4 C6:4 | A5:8 F#5:4 D5:4 |`,
    p2: `d1 v7 e12 @
      D4:8 G4:8 | G4:8 Eb4:8 | A4:8 C5:8 | A4:8 D5:8 |
      Bb4:8 G4:8 | Bb4:8 G4:8 | G4:8 Eb5:8 | F#5:8 A4:8 |
      G5:8 Bb4:8 | A5:8 C5:8 | F5:8 D5:8 | D5:8 Bb4:8 |
      G5:8 Eb5:8 | G5:8 Bb4:8 | D5:8 F#5:8 | F#5:8 A4:8 |`,
    w: `w1 v12 q6 @ ${bars("bm:-5 bm:3 bm:5 bm:2 bm:-5 bm:3 bm:0 bm:2 bm:3 bm:5 bm:-2 bm:-5 bm:0 bm:3 bm:2 bm:2")}`,
    n: `v10 @ [ $dm ]15 $df |`,
  }),

  // The Eclipse Syndicate: menacing, a creeping chromatic bass.
  villain: song({
    bpm: 126,
    key: "Cm",
    p1: `d0 v12 @
      C5:6 Eb5:2 r:2 D5:2 C5:4 | G4:6 Ab4:2 r:2 G4:2 F#4:2 G4:2 | Ab4:6 C5:2 r:2 Eb5:2 C5:4 | B4:6 D5:2 r:2 F5:2 D5:4 |
      C6:6 Bb5:2 r:2 G5:2 Eb5:4 | G5:6 F5:2 r:2 Eb5:2 D5:4 | C5:6 Ab4:2 r:2 F4:2 Ab4:4 | G4:6 B4:2 r:2 D5:2 F5:4 |
      Eb5:4 C5:4 Ab4:4 C5:4 | Eb5:2 F5:2 G5:2 Ab5:2 C6:4 Ab5:4 | F5:4 Ab5:4 C6:4 Ab5:4 | Ab5:4 G5:2 F5:2 Eb5:4 C5:4 |
      Db5:6 F5:2 Ab5:4 F5:4 | Db6:6 C6:2 Ab5:4 F5:4 | G5:4 B5:4 D6:4 F6:4 | G5:2 Ab5:2 G5:2 F5:2 Eb5:2 D5:2 B4:4 |`,
    p2: `d3 v7 @
      G4:8 Eb4:8 | Eb4:8 C4:8 | Eb4:8 C4:8 | D4:8 B3:8 |
      Eb5:8 C5:8 | Eb5:8 C5:8 | F4:8 C4:8 | D4:8 B3:8 |
      C5:8 Eb4:8 | Ab4:8 Eb5:8 | C5:8 F5:8 | C5:8 Ab4:8 |
      Ab4:8 Db5:8 | F5:8 Db5:8 | D5:8 B4:8 | B4:8 G4:8 |`,
    w: `w2 v12 q6 @ ${bars("vo:0 vo:0 vo:-4 vo:-5 vo:0 vo:0 vo:5 vo:-5 vo:-4 vo:-4 vo:5 vo:5 vo:1 vo:1 vo:-5 vo:-5")}`,
    n: `v10 @ [ k:2 h:2 h:2 k:2 s:2 h:2 h:2 h:2 ]15 $df |`,
  }),

  // The Syndicate's hideout: tense, ticking.
  hideout: song({
    bpm: 110,
    key: "Fm",
    defs: { tk: "C5:1 r:3 C5:1 r:3 C5:1 r:3 C5:1 r:3" },
    p1: `d1 v10 @
      F5:2 r:2 Ab5:2 r:2 C6:2 r:2 Ab5:2 F5:2 | C5:2 r:2 F5:2 r:2 G5:2 r:2 Ab5:4 | F5:2 r:2 Ab5:2 r:2 Db6:2 r:2 C6:2 Ab5:2 | G5:6 E5:2 C5:8 |
      C5:2 r:2 F5:2 r:2 Ab5:2 r:2 F5:2 C5:2 | Db5:2 r:2 F5:2 r:2 Bb5:2 r:2 Ab5:2 F5:2 | E5:4 G5:4 Bb5:4 G5:4 | C6:12 r:4 |
      Ab5:4 F5:4 Db5:4 F5:4 | G5:4 Eb5:4 Bb4:4 Eb5:4 | Ab5:4 F5:4 C5:4 F5:4 | Ab5:2 G5:2 F5:2 E5:2 F5:8 |
      Bb5:4 Db6:4 F6:4 Db6:4 | Ab5:4 F5:4 Db5:4 Ab4:4 | G4:4 C5:4 E5:4 G5:4 | Bb5:4 G5:4 E5:4 C5:4 |`,
    p2: `d2 v6 e1 @ ${bars("tk:0 tk:0 tk:-4 tk:-5 tk:0 tk:-7 tk:-5 tk:-5 tk:-4 tk:-5 tk:0 tk:0 tk:-7 tk:-4 tk:-5 tk:-5")}`,
    w: `w0 v13 q6 @ ${bars("bt:5 bt:5 bt:1 bt:0 bt:5 bt:-2 bt:0 bt:0 bt:1 bt:3 bt:5 bt:5 bt:-2 bt:1 bt:0 bt:0")}`,
    n: `v8 @ [ k:4 h:2 h:2 h:2 h:2 s:2 h:2 ]16`,
  }),

  // The rival appears: cocky, quick.
  rival: song({
    bpm: 152,
    key: "Bm",
    p1: `d1 v12 ~1 F#4:2 r:2 F#4:2 r:2 F#4:2 A#4:2 C#5:2 F#5:2 | @
      B4:2 D5:2 F#5:2 B5:4 A5:2 F#5:2 D5:2 | G5:6 F#5:2 D5:4 B4:4 | C#5:2 E5:2 A5:2 C#6:4 B5:2 A5:2 E5:2 | A#5:6 F#5:2 C#5:8 |
      D6:2 C#6:2 B5:2 F#5:2 D5:4 F#5:4 | G5:2 A5:2 B5:2 D6:2 B5:4 G5:4 | E5:2 G5:2 B5:2 E6:2 D6:4 B5:4 | C#6:8 A#5:4 F#5:4 |
      B5:3 G5:3 D5:2 B5:3 G5:3 D5:2 | C#6:3 A5:3 E5:2 C#6:3 A5:3 E5:2 | D6:6 C#6:2 A5:4 F#5:4 | B5:8 F#5:4 D5:4 |
      E5:4 G5:4 B5:4 E6:4 | D6:4 B5:4 G5:4 D5:4 | C#5:4 E5:4 F#5:4 A#5:4 | C#6:6 B5:2 A#5:4 F#5:4 |`,
    p2: `d2 v6 q6 C#4:8 A#3:8 | @ ${bars("mi:-1 ma:-5 ma:-3 ma:-6 mi:-1 ma:-5 mi:4 ma:-6 ma:-5 ma:-3 ma:2 mi:-1 mi:4 ma:-5 ma:-6 ma:-6")}`,
    w: `w0 v13 q6 t-6 $bo | @ ${bars("bo:-1 bo:-5 bo:-3 bo:-6 bo:-1 bo:-5 bo:4 bo:-6 bo:-5 bo:-3 bo:2 bo:-1 bo:4 bo:-5 bo:-6 bo:-6")}`,
    n: `v10 s:2*8 | @ [ $dd ]15 $df |`,
  }),

  // A wild creature: driving.
  "battle-wild": song({
    bpm: 168,
    key: "Am",
    p1: `d2 v12 ~1 [ E5:1 G#5:1 B5:1 E6:1 ]4 | [ D6:1 B5:1 G#5:1 E5:1 ]2 E6:2 r:2 E6:2 r:2 | @
      A5:4 E5:2 A5:2 C6:4 B5:2 A5:2 | C6:6 A5:2 F5:4 A5:4 | B5:4 G5:2 B5:2 D6:4 C6:2 B5:2 | G#5:6 B5:2 E6:8 |
      E6:4 D6:2 C6:2 B5:4 A5:4 | A5:4 G5:2 F5:2 C6:8 | D6:4 C6:2 A5:2 F5:4 D5:4 | E5:4 G#5:4 B5:4 D6:4 |
      C6:2 A5:2 F5:2 A5:2 C6:4 F6:4 | D6:2 B5:2 G5:2 B5:2 D6:4 G6:4 | E6:2 B5:2 G5:2 B5:2 E6:4 B5:4 | C6:8 A5:8 |
      F6:4 D6:4 A5:4 D6:4 | C6:4 A5:4 F5:4 C6:4 | B5:4 G#5:4 E5:4 G#5:4 | B5:2 C6:2 D6:2 E6:2 G#6:4 B6:4 |`,
    p2: `d1 v7 q6 E4:1*16 | E4:1*8 E5:2 r:2 E5:2 r:2 | @
      C5:2*4 E5:2*4 | F5:2*4 C5:2*4 | G5:2*4 B4:2*4 | E5:2*4 G#5:2*4 |
      C6:2*4 E5:2*4 | F5:2*4 A5:2*4 | A5:2*4 A4:2*4 | B4:2*4 E5:2*4 |
      F5:2*4 A5:2*4 | G5:2*4 B5:2*4 | B5:2*4 G5:2*4 | E5:2*4 C5:2*4 |
      A5:2*4 F5:2*4 | F5:2*4 A4:2*4 | E5:2*4 B4:2*4 | E5:2*4 G#5:2*4 |`,
    w: `w0 v14 q6 t4 $bo | $bo | @ ${bars("bo:-3 bo:5 bo:-5 bo:4 bo:-3 bo:5 bo:2 bo:4 bo:5 bo:-5 bo:4 bo:-3 bo:2 bo:5 bo:4 bo:4")}`,
    n: `v11 s:2*8 | s:1*8 s:2*4 | @ $dx | [ $dd ]14 $df |`,
  }),

  // A trainer: faster, syncopated.
  "battle-trainer": song({
    bpm: 176,
    key: "Em",
    p1: `d1 v12 ~1 B4:2 r:2 B4:2 r:2 B4:2 r:2 B4:2 D#5:2 | F#5:2 r:2 F#5:2 r:2 B5:4 F#5:2 D#5:2 | @
      E5:3 G5:3 B5:2 E6:3 D6:3 B5:2 | C6:3 G5:3 E5:2 G5:4 C6:4 | D6:3 A5:3 F#5:2 A5:3 D6:3 F#6:2 | D#6:6 B5:2 F#5:8 |
      G5:3 B5:3 E6:2 G6:4 F#6:2 E6:2 | E6:3 C6:3 G5:2 C6:4 E6:4 | A5:2 B5:2 C6:2 E6:2 D6:2 C6:2 B5:2 A5:2 | B5:4 F#5:4 D#5:4 F#5:4 |
      G5:6 E5:2 C5:4 E5:4 | A5:6 F#5:2 D5:4 F#5:4 | B5:6 F#5:2 D6:4 B5:4 | E6:12 r:4 |
      G6:4 E6:2 C6:2 G5:4 C6:4 | E6:4 C6:2 A5:2 E5:4 A5:4 | F#5:4 B5:4 D#6:4 F#6:4 | B5:2 C6:2 B5:2 A5:2 F#5:4 D#5:4 |`,
    p2: `d2 v7 q6 F#4:2*8 | B4:2*8 | @
      B4:2*4 G5:2*4 | E5:2*4 E5:2*4 | F#5:2*4 F#5:2*4 | F#5:2*4 D#5:2*4 |
      E5:2*4 B5:2*4 | G5:2*4 G5:2*4 | E5:2*4 A5:2*4 | D#5:2*4 B4:2*4 |
      E5:2*4 G4:2*4 | F#5:2*4 A4:2*4 | D5:2*4 F#5:2*4 | G5:2*4 B5:2*4 |
      C6:2*4 E5:2*4 | C6:2*4 C5:2*4 | B4:2*4 F#5:2*4 | F#5:2*4 B4:2*4 |`,
    w: `w0 v14 q6 t-1 $bo | $bo | @ ${bars("bo:4 bo:0 bo:2 bo:-1 bo:4 bo:0 bo:-3 bo:-1 bo:0 bo:2 bo:-1 bo:4 bo:0 bo:-3 bo:-1 bo:-1")}`,
    n: `v11 k:4 k:4 k:4 k:4 | s:2*8 | @ $dx | [ $dd ]14 $df |`,
  }),

  // A Warden: proud and hard-driving.
  "battle-warden": song({
    bpm: 176,
    key: "Gm",
    p1: `d2 v12 ~1 [ D4:1 F#4:1 A4:1 D5:1 ]4 | [ D5:1 F#5:1 A5:1 D6:1 ]2 D6:2 r:2 D5:2 r:2 | @
      D5:2 G5:2 Bb5:2 D6:2 Bb5:2 G5:2 D5:2 G5:2 | Eb6:6 D6:2 Bb5:4 G5:4 | F5:2 A5:2 C6:2 F6:2 Eb6:2 C6:2 A5:2 F5:2 | F#5:6 A5:2 D6:8 |
      G6:6 F6:2 D6:4 Bb5:4 | F6:6 D6:2 Bb5:4 F5:4 | Eb6:4 D6:2 C6:2 G5:4 C6:4 | D6:4 A5:4 F#5:4 A5:4 |
      G5:3 Bb5:3 Eb6:2 G5:3 Bb5:3 Eb6:2 | A5:3 C6:3 F6:2 A5:3 C6:3 F6:2 | Bb5:4 A5:2 G5:2 D6:8 | G5:8 r:4 D5:4 |
      Eb5:4 G5:4 C6:4 Eb6:4 | G6:6 F6:2 Eb6:4 Bb5:4 | A5:4 D6:4 F#6:4 A6:4 | F#6:6 E6:2 D6:4 A5:4 |`,
    p2: `d1 v7 q6 D4:2*8 | A4:2*8 | @
      Bb4:2*4 D5:2*4 | G5:2*4 Eb5:2*4 | C5:2*4 C5:2*4 | D5:2*4 F#5:2*4 |
      Bb5:2*4 G5:2*4 | D6:2*4 F5:2*4 | G5:2*4 Eb5:2*4 | F#5:2*4 D5:2*4 |
      Eb5:2*4 Eb5:2*4 | F5:2*4 F5:2*4 | G5:2*4 Bb5:2*4 | D5:2*4 Bb4:2*4 |
      C5:2*4 Eb5:2*4 | Bb5:2*4 G5:2*4 | F#5:2*4 A5:2*4 | A5:2*4 F#5:2*4 |`,
    w: `w0 v14 q6 t2 $bo | $bo | @ ${bars("bo:-5 bo:3 bo:5 bo:2 bo:-5 bo:-2 bo:0 bo:2 bo:3 bo:5 bo:-5 bo:-5 bo:0 bo:3 bo:2 bo:2")}`,
    n: `v11 s:2*8 | s:1*8 s:2*4 | @ $dx | [ $dd ]14 $df |`,
  }),

  // The Syndicate in battle: menace at speed.
  "battle-villain": song({
    bpm: 172,
    key: "Cm",
    p1: `d0 v12 C5:2 r:2 C5:2 r:2 C5:2 r:2 Eb5:2 D5:2 | C5:2 r:2 B4:2 r:2 G4:8 | @
      C5:2 C5:2 Eb5:2 C5:2 G5:4 F#5:2 G5:2 | C6:4 Bb5:2 G5:2 Eb5:4 D5:2 Eb5:2 | Ab5:2 Ab5:2 C6:2 Ab5:2 Eb6:4 D6:2 Eb6:2 | D6:6 B5:2 G5:4 F5:4 |
      G5:2 G5:2 C6:2 G5:2 Eb6:4 D6:2 C6:2 | C6:4 Ab5:2 F5:2 C5:4 Ab4:4 | Eb5:4 Ab5:4 C6:4 Eb6:4 | D6:4 B5:4 G5:4 B5:4 |
      Ab5:3 C6:3 F6:2 Eb6:3 C6:3 Ab5:2 | G5:3 B5:3 D6:2 F6:3 D6:3 B5:2 | C6:6 Eb6:2 G6:8 | Eb6:6 C6:2 Ab5:8 |
      F5:4 Ab5:4 C6:4 F6:4 | F6:6 Eb6:2 Db6:4 Ab5:4 | G5:2 Ab5:2 G5:2 F5:2 D5:4 B4:4 | D5:2 Eb5:2 D5:2 C5:2 B4:4 G4:4 |`,
    p2: `d3 v7 q6 G4:2*8 | G4:2*8 | @
      Eb5:2*4 Eb5:2*4 | G5:2*4 C5:2*4 | C5:2*4 Ab5:2*4 | G5:2*4 D5:2*4 |
      Eb5:2*4 G5:2*4 | Ab5:2*4 F4:2*4 | C5:2*4 Ab5:2*4 | G5:2*4 D5:2*4 |
      F5:2*4 Ab5:2*4 | D5:2*4 G5:2*4 | G5:2*4 C6:2*4 | Ab5:2*4 C5:2*4 |
      C5:2*4 Ab5:2*4 | Ab5:2*4 F5:2*4 | D5:2*4 B4:2*4 | B4:2*4 D4:2*4 |`,
    w: `w2 v12 q6 $vo | t-5 $vo | @ ${bars("vo:0 vo:0 vo:-4 vo:-5 vo:0 vo:5 vo:-4 vo:-5 vo:5 vo:-5 vo:0 vo:-4 vo:5 vo:1 vo:-5 vo:-5")}`,
    n: `v11 k:2 h:2 k:2 h:2 k:2 h:2 s:2 s:2 | s:2*4 s:1*8 | @ $dx | [ k:2 k:2 s:2 h:2 k:2 k:2 s:2 s:2 ]14 $df |`,
  }),

  // A member of the High Council: epic.
  "battle-council": song({
    bpm: 180,
    key: "Dm",
    p1: `d2 v13 ~1 [ A4:1 C#5:1 E5:1 A5:1 ]4 | A5:2 r:2 A5:2 r:2 A5:2 G5:2 F5:2 E5:2 | @
      D5:4 A5:4 F5:2 A5:2 D6:4 | D6:6 C6:2 Bb5:4 F5:4 | E5:4 G5:4 C6:6 Bb5:2 | A5:4 C#6:4 E6:8 |
      F6:6 E6:2 D6:4 A5:4 | Bb5:6 C6:2 D6:4 F6:4 | G6:4 F6:2 D6:2 Bb5:4 G5:4 | A5:4 E5:4 C#5:4 E5:4 |
      F5:3 Bb5:3 D6:2 F6:3 D6:3 Bb5:2 | G5:3 C6:3 E6:2 G6:3 E6:3 C6:2 | A6:8 F6:4 C6:4 | D6:8 A5:4 F5:4 |
      G5:2 A5:2 Bb5:2 D6:2 G6:4 D6:4 | F6:4 D6:4 Bb5:4 F5:4 | E5:2 F5:2 E5:2 C#5:2 A4:4 C#5:4 | E6:4 C#6:4 A5:4 E5:4 |`,
    p2: `d1 v7 q6 E4:2*8 | C#5:2*8 | @
      F5:2*4 D5:2*4 | F5:2*4 D5:2*4 | C5:2*4 E5:2*4 | E5:2*4 A5:2*4 |
      A5:2*4 F5:2*4 | D5:2*4 Bb5:2*4 | Bb5:2*4 D5:2*4 | C#5:2*4 A4:2*4 |
      D5:2*4 Bb5:2*4 | E5:2*4 C6:2*4 | C6:2*4 A5:2*4 | F5:2*4 D5:2*4 |
      D5:2*4 Bb5:2*4 | Bb5:2*4 F5:2*4 | C#5:2*4 E4:2*4 | C#5:2*4 C#5:2*4 |`,
    w: `w0 v14 q6 t-3 $bo | $bo | @ ${bars("bo:2 bo:-2 bo:0 bo:-3 bo:2 bo:-2 bo:-5 bo:-3 bo:-2 bo:0 bo:5 bo:2 bo:-5 bo:-2 bo:-3 bo:-3")}`,
    n: `v11 x:4 s:2 s:2 s:2 s:2 s:2 s:2 | s:2*4 s:1*8 | @ $dx | [ $dd ]14 $df |`,
  }),

  // The Champion: the biggest fight.
  "battle-champion": song({
    bpm: 184,
    key: "F#m",
    p1: `d1 v13 ~1 [ C#5:1 F5:1 G#5:1 C#6:1 ]4 | C#6:2 r:2 C#6:2 r:2 G#5:2 C#6:2 F5:2 G#5:2 | @
      F#5:2 A5:2 C#6:2 F#6:2 E6:2 C#6:2 A5:2 C#6:2 | D6:6 C#6:2 A5:4 F#5:4 | E5:2 G#5:2 B5:2 E6:2 D6:2 B5:2 G#5:2 B5:2 | C#6:6 G#5:2 F5:4 C#5:4 |
      A5:4 C#6:4 F#6:6 E6:2 | F#6:4 D6:4 A5:4 D6:4 | B5:4 D6:4 F#6:4 D6:4 | C#6:4 G#5:4 F5:4 G#5:4 |
      A5:3 D6:3 F#6:2 A6:3 F#6:3 D6:2 | B5:3 E6:3 G#6:2 B6:3 G#6:3 E6:2 | A6:8 E6:4 C#6:4 | F#6:8 C#6:4 A5:4 |
      B5:2 C#6:2 D6:2 F#6:2 B6:4 F#6:4 | A6:4 F#6:4 D6:4 A5:4 | G#5:4 C#6:4 F6:4 G#6:4 | F6:2 F#6:2 F6:2 D#6:2 C#6:4 G#5:4 |`,
    p2: `d2 v7 q6 G#4:2*8 | F5:2*8 | @
      A5:2*4 A5:2*4 | F#5:2*4 D5:2*4 | G#5:2*4 B5:2*4 | G#5:2*4 C#5:2*4 |
      F#5:2*4 A5:2*4 | A5:2*4 F#5:2*4 | F#5:2*4 B5:2*4 | F5:2*4 C#5:2*4 |
      F#5:2*4 A5:2*4 | G#5:2*4 B5:2*4 | C#6:2*4 A5:2*4 | A5:2*4 F#5:2*4 |
      D5:2*4 D6:2*4 | D6:2*4 A5:2*4 | F5:2*4 G#5:2*4 | G#5:2*4 F5:2*4 |`,
    w: `w2 v12 q6 t1 $bo | $bo | @ ${bars("bo:6 bo:2 bo:4 bo:1 bo:6 bo:2 bo:-1 bo:1 bo:2 bo:4 bo:-3 bo:6 bo:-1 bo:2 bo:1 bo:1")}`,
    n: `v11 x:4 s:2 s:2 x:4 s:2 s:2 | s:1*16 | @ $dx | [ $dd ]7 $dx | [ $dd ]6 $df |`,
  }),

  // A legendary creature: heavy and mythic.
  "battle-legend": song({
    bpm: 160,
    key: "Bbm",
    p1: `d3 v13 ~2 F4:2 r:2 F4:2 r:2 F4:2 r:2 F4:2 r:2 | F4:1 A4:1 C5:1 F5:1 A5:1 C6:1 F6:2 r:8 | @
      Bb4:4 F5:4 Db6:8 | Bb5:6 Db6:2 Gb5:8 | C6:6 Eb6:2 Ab5:8 | A5:8 C6:4 F6:4 |
      F6:6 Eb6:2 Db6:4 Bb5:4 | Gb5:4 Bb5:4 Db6:4 Gb6:4 | Gb6:6 F6:2 Eb6:4 Bb5:4 | A5:4 C6:4 Eb6:4 F6:4 |
      Db6:6 Bb5:2 Gb5:8 | Eb6:6 C6:2 Ab5:8 | F6:8 Db6:4 Ab5:4 | Bb5:12 r:4 |
      Eb5:2 F5:2 Gb5:2 Bb5:2 Eb6:4 Gb6:4 | Gb6:4 Db6:4 Bb5:4 Gb5:4 | F5:4 A5:4 C6:4 Eb6:4 | F6:4 Eb6:4 C6:4 A5:4 |`,
    p2: `d1 v8 q6 C4:2*8 | r:16 | @
      F4:2*4 F5:2*4 | Db5:2*4 Bb4:2*4 | Eb5:2*4 C5:2*4 | F5:2*4 A5:2*4 |
      Bb5:2*4 F5:2*4 | Db5:2*4 Bb5:2*4 | Bb5:2*4 Gb5:2*4 | F5:2*4 C5:2*4 |
      Bb5:2*4 Db5:2*4 | C6:2*4 Eb5:2*4 | Ab5:2*4 F5:2*4 | Db5:2*4 F5:2*4 |
      Bb4:2*4 Bb5:2*4 | Bb5:2*4 Db5:2*4 | C5:2*4 F5:2*4 | A5:2*4 F5:2*4 |`,
    w: `w1 v13 q6 t5 $bo | $bo | @ ${bars("bo:-2 bo:6 bo:-4 bo:5 bo:-2 bo:6 bo:3 bo:5 bo:6 bo:-4 bo:1 bo:-2 bo:3 bo:6 bo:5 bo:5")}`,
    n: `v12 k:4 k:4 k:4 k:4 | s:1*6 x:10 | @ x:4 h:2 h:2 s:4 k:2 h:2 | [ k:4 h:2 h:2 s:4 k:2 h:2 ]14 $df |`,
  }),

  // Surfing: flowing, open.
  surf: song({
    bpm: 92,
    key: "D",
    p1: `d2 v10 ~3 @
      F#5:8 E5:4 D5:4 | B4:8 D5:4 G5:4 | F#5:6 G5:2 A5:8 | E5:12 r:4 |
      D5:6 F#5:2 B5:8 | B5:6 A5:2 G5:4 D5:4 | E5:4 G5:4 B5:4 A5:4 | A5:8 E5:4 C#5:4 |
      D5:4 F#5:4 A5:6 B5:2 | B5:8 G5:4 D5:4 | C#6:6 A5:2 F#5:8 | D6:8 B5:4 F#5:4 |
      G5:6 A5:2 B5:4 D6:4 | C#6:8 E5:4 A5:4 | D6:12 A5:4 | F#5:8 A4:8 |`,
    p2: `d1 v5 e6 @ ${bars("rf:2 rf:-5 rf:2 rf:-3 rf:-1 rf:-5 rf:4 rf:-3 rf:2 rf:-5 rf:6 rf:-1 rf:-5 rf:-3 rf:2 rf:2")}`,
    w: `w3 v14 q8 @ ${bars("bw:2 bw:-5 bw:2 bw:-3 bw:-1 bw:-5 bw:4 bw:-3 bw:2 bw:-5 bw:6 bw:-1 bw:-5 bw:-3 bw:2 bw:2")}`,
    n: `v6 @ [ k:6 h:2 o:8 ]16`,
  }),

  // The bike: quick and carefree.
  bike: song({
    bpm: 152,
    key: "G",
    p1: `d1 v12 @
      G5:2 G5:2 B5:2 D6:4 B5:2 G5:2 D5:2 | E5:2 G5:2 C6:4 E6:4 D6:2 C6:2 | D6:2 A5:2 F#5:2 A5:2 D6:4 C6:4 | B5:8 G5:4 r:4 |
      G5:2 B5:2 E6:4 B5:2 G5:2 E5:4 | E5:2 G5:2 C6:4 G5:2 E5:2 C5:4 | C#5:2 E5:2 A5:4 G5:4 E5:4 | F#5:8 A5:4 D6:4 |
      E6:4 C6:2 G5:2 E5:4 G5:4 | F#6:4 D6:2 A5:2 F#5:4 A5:4 | D6:4 B5:2 F#5:2 D5:4 F#5:4 | G5:4 B5:4 E6:8 |
      E6:2 D6:2 C6:2 G5:2 E5:4 G5:4 | F#5:2 G5:2 A5:2 D6:2 F#6:4 D6:4 | G6:8 D6:4 B5:4 | A5:2 B5:2 A5:2 F#5:2 D5:4 F#5:4 |`,
    p2: `d2 v6 e2 @ ${bars("pk:7 pk:0 pk:2 pk:7 pm:4 pk:0 pk:-3 pk:2 pk:0 pk:2 pm:-1 pm:4 pk:0 pk:2 pk:7 pk:2")}`,
    w: `w0 v13 q6 @ ${bars("b8:-5 b8:0 b8:2 b8:-5 b8:4 b8:0 b8:-3 b8:2 b8:0 b8:2 b8:-1 b8:4 b8:0 b8:2 b8:-5 b8:2")}`,
    n: `v10 @ [ $dr ]15 $df |`,
  }),

  // The ending: slow and warm.
  ending: song({
    bpm: 84,
    key: "C",
    p1: `d2 v10 ~3 @
      G5:8 E5:4 C5:4 | A4:4 C5:4 E5:8 | F5:6 E5:2 C5:4 A4:4 | D5:12 r:4 |
      E5:6 G5:2 B5:8 | A5:6 G5:2 E5:8 | F5:4 A5:4 D6:4 C6:4 | B5:12 r:4 |
      A5:6 G5:2 F5:4 C6:4 | B5:6 A5:2 G5:4 D6:4 | E6:6 D6:2 B5:4 G5:4 | C6:6 B5:2 A5:8 |
      F5:4 A5:4 C6:4 F6:4 | D6:6 C6:2 B5:4 G5:4 | C6:12 r:4 | r:4 E5:4 F5:4 D5:4 |`,
    p2: `d1 v6 e12 @
      E5:8 G4:8 | E4:8 A4:8 | A4:8 F4:8 | B4:8 G4:8 |
      G4:8 E5:8 | E5:8 C5:8 | D5:8 F5:8 | G5:8 D5:8 |
      F5:8 A4:8 | G5:8 B4:8 | G5:8 E5:8 | E5:8 C5:8 |
      C5:8 A5:8 | B5:8 D5:8 | E5:8 G5:8 | G4:8 A4:8 |`,
    w: `w3 v14 q8 @ ${bars("bh:0 bh:-3 bh:5 bh:-5 bh:4 bh:-3 bh:2 bh:-5 bh:5 bh:-5 bh:4 bh:-3 bh:5 bh:-5 bh:0 bh:0")}`,
    n: `v5 @ [ k:8 h:8 ]16`,
  }),

  // The hall of fame: stately triumph.
  hall: song({
    bpm: 100,
    key: "Eb",
    p1: `d1 v12 ~2 @
      G5:6 F5:2 Eb5:4 Bb4:4 | D5:6 Eb5:2 F5:8 | Eb5:6 D5:2 C5:4 G5:4 | Ab5:8 C6:4 Eb6:4 |
      Bb5:6 G5:2 Eb5:4 G5:4 | F5:6 D5:2 Bb4:4 D5:4 | C5:4 Eb5:4 Ab5:4 C6:4 | Bb5:12 r:4 |
      C6:6 Bb5:2 G5:4 Eb5:4 | Ab5:6 G5:2 Eb5:4 C5:4 | Eb5:4 G5:4 Bb5:4 Eb6:4 | D6:8 F6:4 D6:4 |
      C6:6 Ab5:2 Eb5:4 Ab5:4 | Bb5:6 D6:2 F6:4 D6:4 | Eb6:12 r:4 | r:4 Bb4:4 C5:4 D5:4 |`,
    p2: `d2 v6 @
      Eb4+G4+Bb4:16 | D4+F4+Bb4:16 | C4+Eb4+G4:16 | C4+Eb4+Ab4:16 |
      Eb4+G4+Bb4:16 | D4+F4+Bb4:16 | C4+Eb4+Ab4:16 | D4+F4+Bb4:16 |
      C4+Eb4+G4:16 | C4+Eb4+Ab4:16 | Eb4+G4+Bb4:16 | D4+F4+Bb4:16 |
      C4+Eb4+Ab4:16 | D4+F4+Bb4:16 | Eb4+G4+Bb4:16 | D4+F4+Bb4:16 |`,
    w: `w1 v12 q7 @ ${bars("bq:3 bq:-2 bq:0 bq:-4 bq:3 bq:-2 bq:-4 bq:-2 bq:0 bq:-4 bq:3 bq:-2 bq:-4 bq:-2 bq:3 bq:-2")}`,
    n: `v8 @ [ $dm ]15 $df |`,
  }),

  // After beating a wild creature: a fanfare, then a light loop.
  "victory-wild": song({
    bpm: 140,
    key: "C",
    p1: `d1 v11 G4:2 B4:2 D5:2 G5:2 F5:2 D5:2 B4:4 | C6:12 r:4 | @
      E5:4 G5:2 E5:2 C5:4 G4:4 | A4:4 C5:2 F5:2 A5:4 F5:4 | G5:4 B5:2 G5:2 D5:4 B4:4 | C5:6 D5:2 E5:8 |
      E5:4 A5:2 E5:2 C5:4 A4:4 | F5:4 A5:2 F5:2 C6:4 A5:4 | F#5:4 A5:2 F#5:2 D5:4 C6:4 | B5:8 G5:4 D5:4 |
      A5:4 F5:2 A5:2 C6:4 A5:4 | B5:4 G5:2 B5:2 D6:4 B5:4 | C6:8 G5:4 E5:4 | C5:4 E5:4 G5:4 r:4 |`,
    p2: `d2 v6 e2 B3:2*4 D4:2*4 | E4:12 r:4 | @ ${bars("pk:0 pk:5 pk:7 pk:0 pm:-3 pk:5 pk:2 pk:7 pk:5 pk:7 pk:0 pk:0")}`,
    w: `w0 v13 q7 G2:4 D3:4 G2:4 D3:4 | C3:12 r:4 | @ ${bars("bq:0 bq:5 bq:-5 bq:0 bq:-3 bq:5 bq:2 bq:-5 bq:5 bq:-5 bq:0 bq:0")}`,
    n: `v9 s:2*8 | x:12 r:4 | @ [ $dl ]12`,
  }),

  // After beating a trainer.
  "victory-trainer": song({
    bpm: 144,
    key: "F",
    p1: `d2 v11 C5:2 F5:2 A5:2 C6:2 A5:2 C6:2 F6:4 | F6:12 r:4 | @
      C6:4 A5:2 F5:2 A5:4 C6:4 | D6:6 C6:2 A5:4 F5:4 | F5:4 D5:2 F5:2 Bb5:4 D6:4 | C6:8 G5:4 E5:4 |
      F5:4 A5:2 C6:2 F6:4 C6:4 | E6:6 C6:2 A5:4 E5:4 | D6:4 Bb5:2 F5:2 D5:4 F5:4 | G5:8 E5:4 C5:4 |
      A5:4 D6:2 A5:2 F5:4 A5:4 | Bb5:4 D6:2 Bb5:2 F5:4 D5:4 | E5:4 G5:2 C6:2 Bb5:4 G5:4 | A5:8 F5:4 C5:4 |`,
    p2: `d1 v6 e2 A4:2*4 C5:2*4 | A5:12 r:4 | @ ${bars("pk:5 pm:2 pk:-2 pk:0 pk:5 pm:-3 pk:-2 pk:0 pm:2 pk:-2 pk:0 pk:5")}`,
    w: `w0 v13 q7 F3:4 C3:4 F3:4 C3:4 | F3:12 r:4 | @ ${bars("bq:5 bq:2 bq:-2 bq:0 bq:5 bq:-3 bq:-2 bq:0 bq:2 bq:-2 bq:0 bq:5")}`,
    n: `v9 s:2*8 | x:12 r:4 | @ [ $dl ]12`,
  }),

  // After beating a Warden: grand.
  "victory-warden": song({
    bpm: 132,
    key: "G",
    p1: `d1 v12 ~2 D5:2 F#5:2 A5:2 D6:2 C6:2 A5:2 F#5:4 | G5:12 r:4 | @
      B5:6 A5:2 G5:4 D5:4 | E5:6 G5:2 B5:8 | C6:6 B5:2 G5:4 E5:4 | F#5:6 G5:2 A5:8 |
      D6:6 C6:2 B5:4 G5:4 | F#5:6 B5:2 D6:8 | E6:6 D6:2 C6:4 G5:4 | A5:12 r:4 |
      C6:6 B5:2 A5:4 E5:4 | F#5:6 A5:2 D6:4 C6:4 | B5:8 D6:4 G6:4 | G5:8 r:4 D5:4 |`,
    p2: `d2 v6 F#4+A4+D5:16 | G4+B4+D5:12 r:4 | @
      G4+B4+D5:16 | E4+G4+B4:16 | E4+G4+C5:16 | F#4+A4+D5:16 |
      G4+B4+D5:16 | F#4+B4+D5:16 | E4+G4+C5:16 | F#4+A4+D5:16 |
      E4+A4+C5:16 | F#4+A4+D5:16 | G4+B4+D5:16 | G4+B4+D5:16 |`,
    w: `w1 v12 q7 D3:4 A2:4 D3:4 A2:4 | G2:12 r:4 | @ ${bars("bq:-5 bq:4 bq:0 bq:2 bq:-5 bq:-1 bq:0 bq:2 bq:-3 bq:2 bq:-5 bq:-5")}`,
    n: `v9 s:2*8 | x:12 r:4 | @ [ $dm ]12`,
  }),
};
