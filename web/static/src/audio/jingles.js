// @ts-check
// Jingles: short pieces that play once over paused music (audio.js resumes the song
// after). All original. The three victory themes loop, so they are songs (songs.js).

/** @typedef {import("./notation.js").PieceDef} PieceDef */

/** @type {Record<string, PieceDef>} */
export const JINGLES = {
  // Healed at a center: a rising chime that settles.
  heal: {
    bpm: 132,
    key: "C",
    p1: "d2 v11 ~2 E5:2 G5:2 C6:4 B5:2 A5:2 G5:4 | A5:2 B5:2 C6:4 E6:4 r:4 |",
    p2: "d1 v7 C5:2 E5:2 G5:4 G5:2 F5:2 E5:4 | F5:2 G5:2 E5:4 G5:4 r:4 |",
    w: "w0 v13 q7 C3:8 G2:8 | F2:4 G2:4 C3:4 r:4 |",
  },
  // Picked up an item.
  item: {
    bpm: 150,
    key: "C",
    p1: "d1 v11 G4:2 C5:2 E5:2 G5:2 C6:6 r:2 |",
    p2: "d2 v7 E4:2 G4:2 C5:2 E5:2 G5:6 r:2 |",
    w: "w0 v13 q7 C3:8 C3:6 r:2 |",
  },
  // Got a key item: bigger.
  "key-item": {
    bpm: 132,
    key: "D",
    p1: "d1 v12 ~2 D5:2 F#5:2 A5:2 D6:6 C#6:2 D6:2 | E6:4 F#6:10 r:2 |",
    p2: "d2 v7 A4:2 D5:2 F#5:2 A5:6 A5:2 A5:2 | A5:4 A5:10 r:2 |",
    w: "w0 v13 q7 D3:8 A2:8 | A2:4 D3:10 r:2 |",
    n: "v9 r:8 x:8 | s:2 s:2 x:12 |",
  },
  // Won a Warden's badge: a full fanfare.
  badge: {
    bpm: 140,
    key: "Bb",
    p1: "d1 v12 ~2 F5:2 F5:2 F5:2 Bb5:6 A5:2 Bb5:2 | C6:4 D6:4 F6:8 | Bb5:14 r:2 |",
    p2: "d2 v8 D5:2 D5:2 D5:2 F5:6 F5:2 F5:2 | A5:4 Bb5:4 C6:8 | F5:14 r:2 |",
    w: "w1 v12 q7 Bb2:6 Bb2:2 F2:8 | F2:8 F2:8 | Bb2:14 r:2 |",
    n: "v10 s:2 s:2 s:2 x:10 | s:4 s:4 s:2 s:2 s:2 s:2 | x:16 |",
  },
  // Level up.
  levelup: {
    bpm: 160,
    key: "C",
    p1: "d1 v11 C5:2 G5:2 C6:2 D6:2 E6:2 G6:4 r:2 |",
    p2: "d2 v7 E4:2 E5:2 G5:2 B5:2 C6:2 E6:4 r:2 |",
    w: "w0 v13 q7 C3:4 G2:4 C3:6 r:2 |",
  },
  // An evolution finished.
  "evolution-done": {
    bpm: 120,
    key: "G",
    p1: "d2 v11 ~2 D5:2 G5:2 B5:2 D6:2 B5:2 G5:2 B5:4 | C6:2 E6:2 C6:2 A5:2 F#5:4 A5:4 | G5:14 r:2 |",
    p2: "d1 v7 B4:2 D5:2 G5:2 B5:2 G5:2 D5:2 G5:4 | E5:2 G5:2 E5:2 C5:2 D5:4 F#5:4 | D5:14 r:2 |",
    w: "w0 v13 q7 G2:8 D3:8 | C3:8 D3:8 | G2:14 r:2 |",
    n: "v8 r:16 | r:12 s:2 s:2 | x:16 |",
  },
  // A creature caught.
  caught: {
    bpm: 144,
    key: "C",
    p1: "d1 v11 E5:2 G5:2 C6:4 G5:2 C6:2 E6:4 | D6:2 C6:2 B5:2 D6:2 C6:6 r:2 |",
    p2: "d2 v7 C5:2 E5:2 G5:4 E5:2 G5:2 C6:4 | B5:2 A5:2 G5:2 F5:2 E5:6 r:2 |",
    w: "w0 v13 q7 C3:8 C3:8 | G2:8 C3:6 r:2 |",
    n: "v8 r:16 | r:8 x:8 |",
  },
  // The game saved.
  save: {
    bpm: 160,
    key: "C",
    p1: "d2 v10 E5:2 G5:2 C6:2 G5:2 E6:6 r:2 |",
    p2: "d1 v6 C5:2 E5:2 G5:2 E5:2 C6:6 r:2 |",
    w: "w0 v12 q7 C3:8 C3:6 r:2 |",
  },
};
