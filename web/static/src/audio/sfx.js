// @ts-check
// Sound effects, in the tracker notation (notation.js). At bpm 900 a step is one frame
// (1/60 s). Frequent interface sounds sit on pulse 2 and noise so they rarely take the
// melody's voice (pulse 1) away from the music.

/** @typedef {import("./notation.js").PieceDef} PieceDef */

const F = 900;

/** @type {Record<string, PieceDef>} */
export const SFX = {
  select: { bpm: F, p2: "d2 v11 e1 B5:3 E6:7" },
  cancel: { bpm: F, p2: "d1 v10 e1 E6:3 A5:3 E5:7" },
  bump: { bpm: F, p2: "d2 v12 e2 A2>F2:9", n: "v8 e1 NC:5 r:4" },
  door: { bpm: F, n: "v12 e3 N3>N9:6 v9 e2 N8:8 r:6" },
  stairs: { bpm: F, n: "v11 e1 N9:5 N7:5 N5:5 v13 e2 N4>N8:10" },
  ledge: { bpm: F, p2: "d2 v11 e0 q7 C5>C6:7 e2 C6>G4:11", n: "r:15 v7 e1 NA:3" },
  "step-grass": { bpm: F, n: "v6 e1 N2:3 v5 N4:4" },
  encounter: {
    bpm: F,
    p1: "d3 v13 e0 q8 C4>C6:12 C6>C4:12 C4>C6:12 C6>C4:12 v12 e3 C3>C7:18",
    p2: "d1 v9 e0 q8 G4>G6:12 G6>G4:12 G4>G6:12 G6>G4:12 v8 e3 G3>G6:18",
    n: "r:48 v11 e6 N1>N5:18",
  },
  hit: { bpm: F, p2: "d2 v13 e1 E3>A2:8", n: "v15 e2 N2>N9:14" },
  "hit-super": {
    bpm: F,
    p1: "d3 v14 e1 G3>C2:10 r:2 v15 e2 G3>C2:14",
    n: "v15 e2 N1>N8:12 v15 e3 N1>NB:20",
  },
  "hit-weak": { bpm: F, n: "v10 e1 N4>N9:8 r:2" },
  faint: { bpm: F, p1: "d2 v13 e0 q8 ~3 G5>C3:40 v12 e3 C3>G2:16" },
  "ball-throw": { bpm: F, p2: "d0 v8 e0 C4>C6:22 r:2", n: "v6 e0 N7>N1:22 r:2" },
  "ball-shake": { bpm: F, p2: "d1 v10 e1 G4>D4:5 D4>G4:5", n: "v9 e1 M6:4 r:6" },
  "ball-click": { bpm: F, p2: "d2 v12 e1 E6:3 r:2 B6:8", n: "v12 e1 M2:5 r:8" },
  run: { bpm: F, n: "v10 e1 N3>N7:6 r:3 v9 N3>N7:6 r:3 v8 N3>N8:10" },
  "menu-open": { bpm: F, p2: "d2 v10 e1 E5:2 A5:2 E6:6" },
  "text-advance": { bpm: F, p2: "d2 v7 e1 A5:3" },
  "heal-machine": { bpm: F, p2: "d2 v10 e1 [ C6:4 r:4 G6:4 r:8 ]3 e2 C7:12" },
  exp: { bpm: F, p2: "d1 v7 e0 q7 [ C5>C6:5 ]5 D5>D6:5 E5>E6:6" },
  statup: {
    bpm: F,
    p1: "d2 v11 e0 q6 C5:3 E5:3 G5:3 E5:3 G5:3 C6:3 G5:3 C6:3 E6:3 e2 G6:12",
    p2: "d1 v7 e0 q6 G4:3 C5:3 E5:3 C5:3 E5:3 G5:3 E5:3 G5:3 C6:3 e2 E6:12",
  },
  statdown: {
    bpm: F,
    p1: "d2 v11 e0 q6 G6:3 E6:3 C6:3 E6:3 C6:3 G5:3 C6:3 G5:3 E5:3 e2 C5:12",
    p2: "d1 v7 e0 q6 E6:3 C6:3 G5:3 C6:3 G5:3 E5:3 G5:3 E5:3 C5:3 e2 G4:12",
  },
  status: { bpm: F, p2: "d3 v10 e0 [ G5:2 F#5:2 ]5 e2 G5>C5:10", n: "v5 e2 M8:6 r:24" },
  surf: { bpm: F, n: "v7 e0 q8 N9>N3:20 v9 e3 N3>NA:30" },
  cut: { bpm: F, n: "v13 e1 N0>N6:8 v10 e1 M2:6", p2: "d0 v8 e1 C7>C5:6 r:8" },
  push: { bpm: F, n: "v10 e4 NC>NE:24" },
  error: { bpm: F, p2: "d3 v12 e0 q7 A#2:8 r:3 A#2:14" },
};
