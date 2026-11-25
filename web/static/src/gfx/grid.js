// @ts-check
// The raster every piece of art is authored on: a grid of colours (or null for transparent)
// with a few drawing operations, turned into the compact `Pixels` form the game draws.

/**
 * Pixel art as data: `rows[y][x]` is a palette index character ('0' transparent, then
 * '1'-'9', 'a'-'z'), `palette[i]` its '#rrggbb' colour (`palette[0]` is unused).
 * @typedef {object} Pixels
 * @property {number} w
 * @property {number} h
 * @property {string[]} rows
 * @property {string[]} palette
 */

/** @typedef {string | null} Color */

export class Grid {
  /**
   * @param {number} w
   * @param {number} h
   * @param {Color} [fill]
   */
  constructor(w, h, fill = null) {
    this.w = w;
    this.h = h;
    /** @type {Color[]} */
    this.c = new Array(w * h).fill(fill);
  }

  /** @param {number} x @param {number} y @returns {Color} */
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.c[y * this.w + x];
  }

  /** @param {number} x @param {number} y @param {Color} c */
  set(x, y, c) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.c[y * this.w + x] = c;
    return this;
  }

  /** @param {number} x @param {number} y @param {number} w @param {number} h @param {Color} c */
  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
    return this;
  }

  /** @param {number} x0 @param {number} y0 @param {number} x1 @param {number} y1 @param {Color} c */
  line(x0, y0, x1, y1, c) {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
    return this;
  }

  /**
   * A filled ellipse through pixel centres; (cx, cy) may be fractional.
   * @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {Color} c
   */
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny <= 1) this.set(x, y, c);
      }
    }
    return this;
  }

  /**
   * Paint a template: each character looks itself up in `map`; a character missing from
   * the map (or '.') leaves the pixel alone, one mapped to null clears it.
   * @param {string[]} rows
   * @param {Record<string, Color>} map
   * @param {number} [x]
   * @param {number} [y]
   * @param {boolean} [flip] mirror the template horizontally
   */
  stamp(rows, map, x = 0, y = 0, flip = false) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = flip ? row[row.length - 1 - i] : row[i];
        if (ch === "." || !(ch in map)) continue;
        this.set(x + i, y + j, map[ch]);
      }
    });
    return this;
  }

  /** @param {Grid} g @param {number} x @param {number} y */
  blit(g, x, y) {
    for (let j = 0; j < g.h; j++) {
      for (let i = 0; i < g.w; i++) {
        const c = g.get(i, j);
        if (c !== null) this.set(x + i, y + j, c);
      }
    }
    return this;
  }

  /**
   * Put `c` on every transparent pixel next to an opaque one (4-neighbours, or 8 with
   * `diagonal`), giving a shape its outline.
   * @param {Color} c @param {boolean} [diagonal]
   */
  outline(c, diagonal = false) {
    const add = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y) !== null) continue;
        const n =
          this.get(x - 1, y) !== null ||
          this.get(x + 1, y) !== null ||
          this.get(x, y - 1) !== null ||
          this.get(x, y + 1) !== null ||
          (diagonal &&
            (this.get(x - 1, y - 1) !== null ||
              this.get(x + 1, y - 1) !== null ||
              this.get(x - 1, y + 1) !== null ||
              this.get(x + 1, y + 1) !== null));
        if (n) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  /** @param {Color} from @param {Color} to */
  replace(from, to) {
    for (let i = 0; i < this.c.length; i++) if (this.c[i] === from) this.c[i] = to;
    return this;
  }

  copy() {
    const g = new Grid(this.w, this.h);
    g.c = this.c.slice();
    return g;
  }

  flipX() {
    const g = new Grid(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) g.set(this.w - 1 - x, y, this.get(x, y));
    return g;
  }

  /** @param {number} dx @param {number} dy shift contents, wrapping around */
  wrap(dx, dy) {
    const g = new Grid(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        g.set((((x + dx) % this.w) + this.w) % this.w, (((y + dy) % this.h) + this.h) % this.h, this.get(x, y));
      }
    }
    return g;
  }

  /** @returns {Pixels} */
  toPixels() {
    /** @type {string[]} */
    const palette = ["#000000"];
    /** @type {Map<string, string>} */
    const index = new Map();
    const rows = [];
    for (let y = 0; y < this.h; y++) {
      let row = "";
      for (let x = 0; x < this.w; x++) {
        const c = this.get(x, y);
        if (c === null) {
          row += "0";
          continue;
        }
        let ch = index.get(c);
        if (ch === undefined) {
          if (palette.length >= 36) throw new Error("more than 35 colours in one piece of art");
          ch = palette.length.toString(36);
          index.set(c, ch);
          palette.push(c);
        }
        row += ch;
      }
      rows.push(row);
    }
    return { w: this.w, h: this.h, rows, palette };
  }
}

/**
 * Remember each piece of art by key, so the same object comes back and its canvas cache
 * (draw.js) is reused.
 * @template T
 * @param {(key: string) => T} make
 * @returns {(key: string) => T}
 */
export function memo(make) {
  /** @type {Map<string, T>} */
  const cache = new Map();
  return (key) => {
    let v = cache.get(key);
    if (v === undefined) {
      v = make(key);
      cache.set(key, v);
    }
    return v;
  };
}

/**
 * A small deterministic hash for scattering details without randomness at runtime.
 * @param {number} a @param {number} b @param {number} [seed]
 */
export function hash(a, b, seed = 0) {
  let h = (a * 374761393 + b * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Blend two '#rrggbb' colours: t=0 gives a, t=1 gives b.
 * @param {string} a @param {string} b @param {number} t
 */
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1, 7), 16);
  const pb = parseInt(b.slice(1, 7), 16);
  let out = "#";
  for (const sh of [16, 8, 0]) {
    const va = (pa >> sh) & 255;
    const vb = (pb >> sh) & 255;
    out += Math.round(va + (vb - va) * t)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}
