// @ts-check
// The overworld: the map on screen, the player and the people in it, walking, warps,
// edges into neighbouring maps, ledges, surfing, cutting, boulders, trainers' sight lines,
// triggers and wild encounters.

import { WorldMap, DELTA, OPPOSITE, across } from "./map.js";
import { TILES, BUILDINGS } from "../data/tiles.js";
import { tilePixels, buildingPixels, characterPixels, objectPixels, drawPixels, drawFrame, drawText } from "../gfx/index.js";
import { WIDTH, HEIGHT } from "../core/game.js";

/** @typedef {import("../core/game.js").Game} Game */
/** @typedef {import("./map.js").MapDef} MapDef */
/** @typedef {import("./map.js").NpcDef} NpcDef */
/** @typedef {import("./map.js").Dest} Dest */
/** @typedef {import("../game/state.js").Dir} Dir */

const TILE = 16;
/** Where the player stands on screen, in pixels: the Game Boy's spot, a little above centre. */
const PLAYER_SX = 64;
const PLAYER_SY = 64;

/**
 * Someone or something standing on the map: the player, a person, an item ball, a boulder.
 * @typedef {object} Actor
 * @property {string} id
 * @property {number} x          tile
 * @property {number} y
 * @property {Dir} dir
 * @property {string} sprite
 * @property {number} moveFrames frames left in the current step (0 = standing)
 * @property {number} stepLen    frames the current step takes
 * @property {Dir|null} moving
 * @property {number} hop        tiles a ledge jump covers (0 when walking)
 * @property {number} stride     alternates the walking frame
 * @property {boolean} hidden
 * @property {NpcDef|null} def
 * @property {number} homeX
 * @property {number} homeY
 * @property {number} idle       frames until a wandering person moves again
 * @property {string|null} emote "!" shown above the head, or null
 * @property {{item: string, count: number, index: number}|null} item  for an item ball
 */

/**
 * The map files load on demand: data/maps/<id>.js. Tests and the game share this.
 * @param {string} id
 * @returns {Promise<MapDef>}
 */
export async function loadMapDef(id) {
  const mod = await import(`../data/maps/${id}.js`);
  return mod.default;
}

export class Overworld {
  /** @param {Game} game */
  constructor(game) {
    this.game = game;
    /** @type {Map<string, WorldMap>} */
    this.cache = new Map();
    /** @type {WorldMap|null} */
    this.map = null;
    /** @type {Actor} */
    this.player = makeActor("player", 0, 0, "down", "player");
    /** @type {Actor[]} people and objects on the current map */
    this.actors = [];
    /** A map name shown briefly on arrival. */
    this.banner = { text: "", frames: 0 };
    /** Frames a quick tap turns the player without walking. */
    this.turnHold = 0;
    /** Set when something should be checked once the player's step finishes. */
    this.justArrived = false;
    /** @type {((game: Game) => Promise<void>)|null} the start menu, set by the game */
    this.openMenu = null;
    /** Set by enter(): the new map's onEnter hasn't run yet. */
    this.arrivalPending = false;
    /** @type {any} script runner, set by the game (script/context.js) */
    this.scripts = null;
  }

  /** @param {string} id */
  async load(id) {
    let m = this.cache.get(id);
    if (!m) {
      m = new WorldMap(await loadMapDef(id));
      this.cache.set(id, m);
    }
    return m;
  }

  /** @param {string} id */
  loaded(id) {
    return this.cache.get(id);
  }

  get state() {
    return /** @type {import("../game/state.js").State} */ (this.game.state);
  }

  /**
   * Put the player on a map: load it and its neighbours, place its people, start its music.
   * @param {Dest} to
   * @param {{banner?: boolean}} [o]
   */
  async enter(to, o = {}) {
    const prev = this.map;
    const m = await this.load(to.map);
    if (to.at) {
      const sp = m.def.spawns?.[to.at];
      if (!sp) throw new Error(`${m.id} has no spawn point ${to.at}`);
      to = { map: m.id, x: sp.x, y: sp.y, dir: to.dir ?? sp.dir };
    }
    if (to.x == null || to.y == null) throw new Error(`a warp to ${m.id} names no tile`);
    await Promise.all(Object.values(m.def.connections ?? {}).map((c) => this.load(c.map)));
    if (prev && prev !== m) prev.cut.clear();
    this.map = m;
    const s = this.state;
    s.pos = { map: m.id, x: to.x, y: to.y, dir: to.dir ?? s.pos.dir };
    Object.assign(this.player, { x: to.x, y: to.y, dir: s.pos.dir, moveFrames: 0, moving: null, hop: 0 });
    if (!TILES[m.tile(to.x, to.y)]?.water) s.surfing = false;
    if (m.def.indoor) s.biking = false;
    this.player.sprite = s.surfing ? "surf" : "player";
    this.placeActors();
    if (m.def.town && !s.visited.includes(m.id)) s.visited.push(m.id);
    this.game.audio.playMusic(this.music());
    if (o.banner !== false && !m.def.indoor && (!prev || prev.def.name !== m.def.name)) {
      this.banner = { text: m.def.name, frames: 100 };
    }
    this.arrivalPending = true;
  }

  /**
   * Run the map's onEnter script, once the screen shows the map (after any fade in).
   * Every way onto a map ends with this.
   */
  async arrive() {
    if (!this.arrivalPending) return;
    this.arrivalPending = false;
    const m = this.map;
    if (m?.def.onEnter) await this.scripts.run(m.def.onEnter, `${m.id} onEnter`);
  }

  /** The song for where the player is. */
  music() {
    const s = this.state;
    if (s.surfing) return "surf";
    if (s.biking) return "bike";
    return this.map?.def.music ?? "route-1";
  }

  placeActors() {
    const m = /** @type {WorldMap} */ (this.map);
    const s = this.state;
    this.actors = [];
    for (const n of m.def.npcs ?? []) {
      const a = makeActor(n.id, n.x, n.y, n.dir ?? "down", n.sprite);
      a.def = n;
      this.actors.push(a);
    }
    (m.def.items ?? []).forEach((it, index) => {
      if (it.hidden || s.flags[`item:${m.id}:${index}`]) return;
      const a = makeActor(`item-${index}`, it.x, it.y, "down", "itemball");
      a.item = { item: it.item, count: it.count ?? 1, index };
      this.actors.push(a);
    });
    this.refreshVisibility();
  }

  /** Re-read hideIf/showIf flags (scripts call this after setting flags). */
  refreshVisibility() {
    const f = this.state.flags;
    for (const a of this.actors) {
      const d = a.def;
      if (!d) continue;
      a.hidden = (!!d.hideIf && !!f[d.hideIf]) || (!!d.showIf && !f[d.showIf]);
    }
  }

  /** @param {string} id */
  actor(id) {
    if (id === "player") return this.player;
    const a = this.actors.find((x) => x.id === id);
    if (!a) throw new Error(`no one called ${id} on ${this.map?.id}`);
    return a;
  }

  /**
   * What stands on a tile (of the current map's coordinates).
   * @param {number} x @param {number} y @param {Actor} [except]
   */
  actorAt(x, y, except) {
    for (const a of [this.player, ...this.actors]) {
      if (a === except || a.hidden) continue;
      if (a.x === x && a.y === y) return a;
      // A walking actor holds the tile it's going to as well.
      if (a.moving) {
        const [dx, dy] = DELTA[a.moving];
        if (a.x + dx === x && a.y + dy === y) return a;
      }
    }
    return undefined;
  }

  /**
   * The tile at a position, following the edge into a neighbour.
   * @param {number} x @param {number} y
   * @returns {{ch: string, map: WorldMap, x: number, y: number}}
   */
  tileAt(x, y) {
    const m = /** @type {WorldMap} */ (this.map);
    if (m.inside(x, y)) return { ch: m.tile(x, y), map: m, x, y };
    const n = across(m, (id) => this.loaded(id), x, y);
    if (n) return { ch: n.map.tile(n.x, n.y), map: n.map, x: n.x, y: n.y };
    return { ch: m.tile(x, y), map: m, x, y };
  }

  /**
   * Whether an actor can step onto a tile. The player may surf onto water.
   * @param {Actor} a @param {number} x @param {number} y
   */
  passable(a, x, y) {
    const t = this.tileAt(x, y);
    const def = TILES[t.ch] ?? TILES[" "];
    if (t.map.building(t.x, t.y)) return false;
    if (t.map === this.map && this.signAt(x, y)) return false;
    if (this.actorAt(x, y, a)) return false;
    if (def.ledge) return false;
    if (def.water) return a === this.player && this.state.surfing;
    if (a === this.player && this.state.surfing) return !def.solid;
    return !def.solid;
  }

  /**
   * Whether a trainer's line of sight passes a tile: anything walkable or water (a swimmer
   * sees across the sea), but not walls, buildings, signs or people.
   * @param {Actor} a @param {number} x @param {number} y
   */
  seeThrough(a, x, y) {
    const t = this.tileAt(x, y);
    const def = TILES[t.ch] ?? TILES[" "];
    if (t.map.building(t.x, t.y) || (t.map === this.map && this.signAt(x, y)) || this.actorAt(x, y, a)) return false;
    return !!def.water || !def.solid || !!def.ledge;
  }

  /** @param {number} x @param {number} y */
  signAt(x, y) {
    return (this.map?.def.signs ?? []).find((s) => s.x === x && s.y === y);
  }

  /**
   * Start a step. Returns false if the way is blocked (the actor turns to face it).
   * @param {Actor} a @param {Dir} dir @param {{frames?: number, force?: boolean}} [o]
   */
  tryStep(a, dir, o = {}) {
    a.dir = dir;
    const [dx, dy] = DELTA[dir];
    const nx = a.x + dx, ny = a.y + dy;
    const frames = o.frames ?? (a === this.player && this.state.biking ? 8 : 16);
    const def = TILES[this.tileAt(nx, ny).ch];
    if (a === this.player && def?.ledge === dir && !this.actorAt(nx + dx, ny + dy, a) && this.passable(a, nx + dx, ny + dy)) {
      a.moving = dir;
      a.hop = 2;
      a.stepLen = a.moveFrames = 24;
      this.game.audio.playSfx("ledge");
      return true;
    }
    if (!o.force && !this.passable(a, nx, ny)) return false;
    a.moving = dir;
    a.hop = 1;
    a.stepLen = a.moveFrames = frames;
    a.stride ^= 1;
    return true;
  }

  /**
   * Walk an actor one step and wait for it to arrive (scripts use this).
   * @param {Actor} a @param {Dir} dir @param {{force?: boolean}} [o]
   */
  async walk(a, dir, o = {}) {
    let tries = 0;
    while (!this.tryStep(a, dir, { force: o.force })) {
      // Someone is in the way: wait for them, but not forever.
      if (++tries > 120) throw new Error(`${a.id} can't walk ${dir} from ${a.x},${a.y} on ${this.map?.id}`);
      await this.game.frame();
    }
    while (a.moving) await this.game.frame();
  }

  /**
   * Advance an actor's step by one frame. Returns true on the frame it arrives.
   * @param {Actor} a
   */
  advance(a) {
    if (!a.moving) return false;
    a.moveFrames--;
    if (a.moveFrames > 0) return false;
    const [dx, dy] = DELTA[a.moving];
    a.x += dx * a.hop;
    a.y += dy * a.hop;
    a.moving = null;
    a.hop = 0;
    return true;
  }

  /** @param {Game} game */
  update(game) {
    if (!this.map || game.state == null) return;
    if (this.banner.frames > 0) this.banner.frames--;
    for (const a of this.actors) {
      this.advance(a);
      if (!game.busy) this.wander(a);
    }
    const p = this.player;
    if (this.advance(p)) {
      this.arrived();
      // Nothing started: keep walking this frame, so steps don't stutter.
      if (game.busy || p.moving) return;
    }
    if (p.moving || game.busy) return;
    this.playerInput(game);
  }

  /** @param {Actor} a */
  wander(a) {
    const d = a.def;
    if (!d || a.hidden || a.moving || !d.move || d.move === "still") return;
    if (a.idle-- > 0) return;
    const r = this.game.rng;
    a.idle = r.int(60, 180);
    const dir = r.pick(/** @type {Dir[]} */ (["up", "down", "left", "right"]));
    if (d.move === "turn") {
      a.dir = dir;
      return;
    }
    const [dx, dy] = DELTA[dir];
    if (Math.abs(a.x + dx - a.homeX) > 2 || Math.abs(a.y + dy - a.homeY) > 2) {
      a.dir = dir;
      return;
    }
    this.tryStep(a, dir);
  }

  /** @param {Game} game */
  playerInput(game) {
    const input = game.input;
    const p = this.player;
    if (input.pressed("start") && this.openMenu) {
      const open = this.openMenu;
      game.run(() => open(game), "start menu");
      return;
    }
    if (input.pressed("a")) {
      this.interact();
      return;
    }
    if (input.pressed("select") && this.state.bag["bicycle"] && !this.map?.def.indoor && !this.state.surfing) {
      this.state.biking = !this.state.biking;
      game.audio.playMusic(this.music());
      return;
    }
    const dir = input.dir();
    if (!dir) {
      this.turnHold = 0;
      return;
    }
    // A tap on a new direction turns on the spot; holding it walks.
    if (dir !== p.dir && input.pressed(dir)) {
      p.dir = dir;
      this.turnHold = 6;
      return;
    }
    if (this.turnHold > 0) {
      this.turnHold--;
      return;
    }
    // Pressing a warp's direction while standing on it (a doormat, an edge exit).
    const w = (this.map?.def.warps ?? []).find((w) => w.dir === dir && w.x === p.x && w.y === p.y);
    if (w) {
      p.dir = dir;
      game.run(() => this.warp(w.to, "door"), "warp");
      return;
    }
    if (!this.tryStep(p, dir)) {
      // Walking into a door that's locked says why.
      const [dx, dy] = DELTA[dir];
      if (input.pressed(dir) || this.game.frameCount % 24 === 0) game.audio.playSfx("bump");
      const nx = p.x + dx, ny = p.y + dy;
      const t = this.tileAt(nx, ny);
      if (this.state.surfing && !TILES[t.ch]?.water && !TILES[t.ch]?.solid && !t.map.building(t.x, t.y) && !this.actorAt(nx, ny)) {
        // Stepping off the water onto land.
        this.state.surfing = false;
        p.sprite = "player";
        game.audio.playMusic(this.music());
        this.tryStep(p, dir, { force: true });
      }
    }
  }

  /** Whatever is in front of the player when A is pressed. */
  interact() {
    const p = this.player;
    const [dx, dy] = DELTA[p.dir];
    let tx = p.x + dx, ty = p.y + dy;
    let t = this.tileAt(tx, ty);
    // Talking across a counter reaches the person behind it.
    if (TILES[t.ch]?.talk) {
      tx += dx;
      ty += dy;
      t = this.tileAt(tx, ty);
    }
    const g = this.game;
    const a = this.actorAt(tx, ty, p);
    if (a) {
      g.run(() => this.talkTo(a), `talk ${a.id}`);
      return;
    }
    const sign = this.signAt(tx, ty);
    if (sign) {
      g.run(() => this.scripts.say(sign.text), "sign");
      return;
    }
    const hidden = (this.map?.def.items ?? []).findIndex((it) => it.hidden && it.x === tx && it.y === ty);
    if (hidden >= 0 && !this.state.flags[`item:${this.map?.id}:${hidden}`]) {
      const it = (this.map?.def.items ?? [])[hidden];
      g.run(() => this.scripts.pickUp(it.item, it.count ?? 1, `item:${this.map?.id}:${hidden}`), "hidden item");
      return;
    }
    const def = TILES[t.ch];
    if (def?.needs === "cut") {
      g.run(() => this.scripts.cutTree(t.map, t.x, t.y), "cut");
      return;
    }
    if (def?.water && !this.state.surfing) {
      g.run(() => this.scripts.water(), "water");
      return;
    }
    if (t.ch === "P") {
      g.run(() => this.scripts.pc(), "pc");
    }
  }

  /** @param {Actor} a */
  async talkTo(a) {
    if (a.item) {
      const { item, count, index } = a.item;
      await this.scripts.pickUp(item, count, `item:${this.map?.id}:${index}`);
      a.hidden = true;
      this.actors = this.actors.filter((x) => x !== a);
      return;
    }
    if (a.sprite === "boulder") {
      await this.scripts.boulder(a);
      return;
    }
    const d = a.def;
    if (!d) return;
    const before = a.dir;
    if (d.move !== "still" || !d.trainer) a.dir = OPPOSITE[this.player.dir];
    if (d.trainer) await this.scripts.trainer(a, false);
    else if (d.script) await this.scripts.run(d.script, `${this.map?.id} ${d.id}`, a);
    else if (d.text) await this.scripts.say(d.text);
    if (d.move === "still" && !d.trainer) a.dir = before;
  }

  /** The player finished a step: edges, warps, triggers, trainers, encounters. */
  arrived() {
    const g = this.game;
    const p = this.player;
    const m = /** @type {WorldMap} */ (this.map);
    const s = this.state;
    if (s.repel > 0) {
      s.repel--;
      if (s.repel === 0) {
        g.run(() => this.scripts.say("The repellent wore off."), "repel");
        return;
      }
    }
    // Off the edge into the neighbour.
    if (!m.inside(p.x, p.y)) {
      const n = across(m, (id) => this.loaded(id), p.x, p.y);
      if (n) {
        g.run(async () => {
          await this.enter({ map: n.map.id, x: n.x, y: n.y, dir: p.dir });
          await this.arrive();
        }, "edge");
        return;
      }
    }
    const door = m.door(p.x, p.y);
    if (door) {
      g.run(() => this.warp(door.to, "door"), "door");
      return;
    }
    const w = (m.def.warps ?? []).find((w) => !w.dir && w.x === p.x && w.y === p.y);
    if (w) {
      g.run(() => this.warp(w.to, m.tile(p.x, p.y) === "L" ? "stairs" : "door"), "warp");
      return;
    }
    for (const tr of m.def.triggers ?? []) {
      const inside = p.x >= tr.x && p.y >= tr.y && p.x < tr.x + (tr.w ?? 1) && p.y < tr.y + (tr.h ?? 1);
      if (!inside) continue;
      if (tr.once && s.flags[tr.once]) continue;
      if (tr.if && !s.flags[tr.if]) continue;
      if (tr.unless && s.flags[tr.unless]) continue;
      g.run(async () => {
        // A blackout part way through leaves the trigger to run again next time.
        const finished = await this.scripts.run(tr.script, `${m.id} trigger`);
        if (finished && tr.once) s.flags[tr.once] = true;
      }, "trigger");
      return;
    }
    if (this.checkTrainers()) return;
    const kind = TILES[m.tile(p.x, p.y)]?.encounter;
    if (kind) {
      const key = kind === "water" ? "water" : kind;
      const table = m.def.encounters?.[key];
      if (table && g.rng.chance(table.rate)) {
        g.run(() => this.scripts.wildEncounter(table), "encounter");
      }
    }
  }

  /** A trainer who can see the player walks over and battles. Returns true if one did. */
  checkTrainers() {
    const p = this.player;
    for (const a of this.actors) {
      const d = a.def;
      if (!d?.trainer || !d.sight || a.hidden || this.state.flags[`trainer:${d.trainer}`]) continue;
      const [dx, dy] = DELTA[a.dir];
      for (let i = 1; i <= d.sight; i++) {
        const x = a.x + dx * i, y = a.y + dy * i;
        if (x === p.x && y === p.y) {
          this.game.run(() => this.scripts.trainer(a, true), `trainer ${d.trainer}`);
          return true;
        }
        if (!this.seeThrough(a, x, y)) break;
      }
    }
    return false;
  }

  /**
   * Fade out, change map, fade in.
   * @param {Dest} to @param {"door"|"stairs"|"fly"|"none"} sound
   */
  async warp(to, sound) {
    const g = this.game;
    if (sound !== "none") g.audio.playSfx(sound === "fly" ? "door" : sound);
    await g.fadeTo(1, 8);
    await this.enter(to);
    await g.fadeTo(0, 8);
    await this.arrive();
    // Arriving on a door tile from inside: step out of the doorway.
    const m = /** @type {WorldMap} */ (this.map);
    if (m.door(this.player.x, this.player.y)) await this.walk(this.player, "down", { force: true });
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const m = this.map;
    if (!m) return;
    const p = this.player;
    const [ppx, ppy] = this.pixelPos(p);
    const camX = ppx - PLAYER_SX;
    const camY = ppy - PLAYER_SY;
    const frame = this.game.frameCount;
    const theme = m.def.theme;

    // Tiles, from this map or a neighbour across an edge.
    const x0 = Math.floor(camX / TILE), y0 = Math.floor(camY / TILE);
    for (let ty = y0; ty <= y0 + 9; ty++) {
      for (let tx = x0; tx <= x0 + 10; tx++) {
        const t = this.tileAt(tx, ty);
        const th = t.map.def.theme;
        drawPixels(ctx, tilePixels(t.ch, th, frame), tx * TILE - camX, ty * TILE - camY);
      }
    }
    // Buildings, on this map and on the neighbours in view.
    for (const [mm, ox, oy] of this.mapsInView()) {
      for (const b of mm.def.buildings ?? []) {
        const k = BUILDINGS[b.kind];
        const bx = (ox + b.x) * TILE - camX, by = (oy + b.y) * TILE - camY;
        if (bx > WIDTH || by > HEIGHT || bx + k.w * TILE < 0 || by + k.h * TILE < 0) continue;
        drawPixels(ctx, buildingPixels(b.kind, mm.def.theme), bx, by);
      }
    }
    for (const s of m.def.signs ?? []) drawPixels(ctx, objectPixels("sign"), s.x * TILE - camX, s.y * TILE - camY);

    // People and objects, back to front.
    const all = [...this.actors.filter((a) => !a.hidden), p].sort((a, b) => this.pixelPos(a)[1] - this.pixelPos(b)[1]);
    for (const a of all) {
      const [ax, ay] = this.pixelPos(a);
      const sx = ax - camX, sy = ay - camY;
      if (sx < -16 || sy < -16 || sx > WIDTH || sy > HEIGHT) continue;
      const lift = a.hop === 2 ? Math.round(Math.sin((1 - a.moveFrames / a.stepLen) * Math.PI) * 8) : 0;
      if (a.sprite === "itemball" || a.sprite === "boulder") {
        drawPixels(ctx, objectPixels(a.sprite), sx, sy);
      } else {
        const walking = a.moving && a.moveFrames < a.stepLen / 2;
        const step = walking ? 1 + a.stride : 0;
        const pix = characterPixels(a.sprite === "surf" ? "player" : a.sprite, a.dir, step);
        // Characters stand 4 pixels up their tile, as on the Game Boy.
        drawPixels(ctx, pix, sx, sy - 4 - lift);
      }
      if (a.emote) {
        drawFrame(ctx, sx, sy - 24, 16, 16);
        drawText(ctx, a.emote, sx + 4, sy - 20);
      }
    }

    // A dark cave without the Lantern: only a small circle around the player shows.
    if (TILES[m.tile(p.x, p.y)]?.dark && !this.state.bag["lantern"]) {
      ctx.save();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.rect(0, 0, WIDTH, HEIGHT);
      ctx.arc(PLAYER_SX + 8, PLAYER_SY + 4, 20, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    }

    if (this.banner.frames > 0) {
      const w = Math.max(64, (this.banner.text.length + 2) * 8);
      const y = this.banner.frames > 90 ? -24 + (100 - this.banner.frames) * 3 : this.banner.frames < 10 ? -24 + this.banner.frames * 3 : 6;
      drawFrame(ctx, 4, y, Math.ceil(w / 8) * 8, 24);
      drawText(ctx, this.banner.text, 12, y + 8);
    }
  }

  /** This map and its neighbours, with each one's top-left in this map's tile coordinates. */
  mapsInView() {
    const m = /** @type {WorldMap} */ (this.map);
    /** @type {[WorldMap, number, number][]} */
    const out = [[m, 0, 0]];
    for (const [side, c] of Object.entries(m.def.connections ?? {})) {
      const n = this.loaded(c.map);
      if (!n) continue;
      if (side === "north") out.push([n, c.offset, -n.h]);
      if (side === "south") out.push([n, c.offset, m.h]);
      if (side === "west") out.push([n, -n.w, c.offset]);
      if (side === "east") out.push([n, m.w, c.offset]);
    }
    return out;
  }

  /** @param {Actor} a @returns {[number, number]} */
  pixelPos(a) {
    let x = a.x * TILE, y = a.y * TILE;
    if (a.moving) {
      const [dx, dy] = DELTA[a.moving];
      const done = (1 - a.moveFrames / a.stepLen) * TILE * a.hop;
      x += Math.round(dx * done);
      y += Math.round(dy * done);
    }
    return [x, y];
  }
}

/**
 * @param {string} id @param {number} x @param {number} y @param {Dir} dir @param {string} sprite
 * @returns {Actor}
 */
function makeActor(id, x, y, dir, sprite) {
  return { id, x, y, dir, sprite, moveFrames: 0, stepLen: 16, moving: null, hop: 0, stride: 0, hidden: false,
    def: null, homeX: x, homeY: y, idle: 60, emote: null, item: null };
}
