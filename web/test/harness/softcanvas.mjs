// A software 2D canvas with just what the game draws with, so the real game can run and be
// looked at in Node: no browser, no window. Pixels are RGBA bytes; screenshots are PNGs.

import { deflateSync } from "node:zlib";

/** @param {string} s @returns {[number, number, number, number]} */
export function parseColor(s) {
  s = String(s).trim();
  if (s.startsWith("#")) {
    const h = s.slice(1);
    const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
    const n = (i) => parseInt(full.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), full.length >= 8 ? n(6) : 255];
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b, a = "1"] = m[1].split(",").map((x) => x.trim());
    return [+r, +g, +b, Math.round(parseFloat(a) * 255)];
  }
  return [0, 0, 0, 255];
}

class ImageDataLike {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }
}

export class SoftCanvas {
  constructor(width = 300, height = 150) {
    this._w = width;
    this._h = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.style = {};
  }
  get width() { return this._w; }
  set width(v) { this._w = v; this.data = new Uint8ClampedArray(v * this._h * 4); }
  get height() { return this._h; }
  set height(v) { this._h = v; this.data = new Uint8ClampedArray(this._w * v * 4); }
  getContext() {
    return (this._ctx ??= new SoftContext(this));
  }
  /** The canvas as a PNG file's bytes. */
  png() {
    return encodePng(this._w, this._h, this.data);
  }
}

class SoftContext {
  /** @param {SoftCanvas} c */
  constructor(c) {
    this.canvas = c;
    this.fillStyle = "#000";
    this.font = "";
    this.imageSmoothingEnabled = false;
    this._path = [];
    this._clip = null;
    this._stack = [];
  }
  save() { this._stack.push({ fillStyle: this.fillStyle, clip: this._clip }); }
  restore() { const s = this._stack.pop(); if (s) { this.fillStyle = s.fillStyle; this._clip = s.clip; } }
  beginPath() { this._path = []; }
  rect(x, y, w, h) { this._path.push({ kind: "rect", x, y, w, h }); }
  arc(x, y, r, a0, a1, anti) { this._path.push({ kind: "circle", x, y, r, dir: anti ? -1 : 1 }); }
  clip() { this._clip = this._path.slice(); }
  fillText() {}
  _inside(path, px, py) {
    let wind = 0;
    for (const p of path) {
      if (p.kind === "rect" && px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h) wind += 1;
      if (p.kind === "circle" && (px - p.x) ** 2 + (py - p.y) ** 2 <= p.r * p.r) wind += p.dir;
    }
    return wind !== 0;
  }
  _blend(x, y, r, g, b, a) {
    const c = this.canvas;
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return;
    if (this._clip && !this._inside(this._clip, x + 0.5, y + 0.5)) return;
    const i = (y * c.width + x) * 4, d = c.data;
    if (a >= 255) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; return; }
    if (a <= 0) return;
    const f = a / 255;
    d[i] = d[i] * (1 - f) + r * f;
    d[i + 1] = d[i + 1] * (1 - f) + g * f;
    d[i + 2] = d[i + 2] * (1 - f) + b * f;
    d[i + 3] = Math.max(d[i + 3], a);
  }
  fillRect(x, y, w, h) {
    const [r, g, b, a] = parseColor(this.fillStyle);
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.canvas.width, Math.round(x + w)), y1 = Math.min(this.canvas.height, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) this._blend(xx, yy, r, g, b, a);
  }
  fill() {
    const [r, g, b, a] = parseColor(this.fillStyle);
    for (let y = 0; y < this.canvas.height; y++)
      for (let x = 0; x < this.canvas.width; x++) if (this._inside(this._path, x + 0.5, y + 0.5)) this._blend(x, y, r, g, b, a);
  }
  createImageData(w, h) { return new ImageDataLike(w, h); }
  putImageData(img, x, y) {
    const c = this.canvas;
    for (let yy = 0; yy < img.height; yy++)
      for (let xx = 0; xx < img.width; xx++) {
        const tx = x + xx, ty = y + yy;
        if (tx < 0 || ty < 0 || tx >= c.width || ty >= c.height) continue;
        const s = (yy * img.width + xx) * 4, t = (ty * c.width + tx) * 4;
        for (let k = 0; k < 4; k++) c.data[t + k] = img.data[s + k];
      }
  }
  /** drawImage(src, x, y) or drawImage(src, x, y, w, h), nearest-neighbour. */
  drawImage(src, x, y, w, h) {
    w ??= src.width;
    h ??= src.height;
    const x0 = Math.round(x), y0 = Math.round(y), W = Math.round(w), H = Math.round(h);
    for (let yy = 0; yy < H; yy++) {
      const sy = Math.floor((yy * src.height) / H);
      for (let xx = 0; xx < W; xx++) {
        const sx = Math.floor((xx * src.width) / W);
        const i = (sy * src.width + sx) * 4, d = src.data;
        if (d[i + 3] === 0) continue;
        this._blend(x0 + xx, y0 + yy, d[i], d[i + 1], d[i + 2], d[i + 3]);
      }
    }
  }
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** @param {number} w @param {number} h @param {Uint8ClampedArray} rgba @param {number} [scale] */
export function encodePng(w, h, rgba, scale = 3) {
  const W = w * scale, H = h * scale;
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const s = (Math.floor(y / scale) * w + Math.floor(x / scale)) * 4;
      const t = y * (W * 4 + 1) + 1 + x * 4;
      raw[t] = rgba[s]; raw[t + 1] = rgba[s + 1]; raw[t + 2] = rgba[s + 2]; raw[t + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
