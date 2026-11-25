// @ts-check
// A map as content writes it (data/maps/<id>.js), and the runtime questions the overworld
// asks of it: what tile is here, can I stand here, what's beyond the edge.

import { TILES, BUILDINGS } from "../data/tiles.js";

/** @typedef {import("../game/state.js").Dir} Dir */
/** @typedef {import("../script/context.js").ScriptContext} ScriptContext */
/** @typedef {(g: ScriptContext) => Promise<void>} Script */

/**
 * Where a warp lands: a tile, or a named spawn point of the target map (its `spawns`), which
 * lets maps written separately link up without knowing each other's coordinates.
 * @typedef {{map: string, x?: number, y?: number, at?: string, dir?: Dir}} Dest
 */

/**
 * @typedef {object} NpcDef
 * @property {string} id              unique within the map
 * @property {number} x
 * @property {number} y
 * @property {string} sprite          a character sprite id (gfx), or "itemball"/"boulder"
 * @property {Dir} [dir]              facing at rest (down)
 * @property {"still"|"turn"|"wander"} [move]   wander stays within 2 tiles of home
 * @property {string} [text]          what they say when talked to (no script)
 * @property {Script} [script]        run when talked to (instead of text)
 * @property {string} [trainer]       a trainer id (data/trainers.js): battles once
 * @property {number} [sight]         tiles a trainer sees ahead; 0 = only when talked to
 * @property {string} [hideIf]        hidden while this flag is set
 * @property {string} [showIf]        shown only while this flag is set
 */

/**
 * @typedef {object} EncounterTable
 * @property {number} rate                     chance per step, 0-1 (grass ~0.1)
 * @property {{species: string, min: number, max: number, weight: number}[]} table
 */

/**
 * @typedef {object} MapDef
 * @property {string} id
 * @property {string} name                     shown on the sign popup on arrival (outdoors)
 * @property {string} theme                    one of THEMES
 * @property {string} music                    song id
 * @property {string[]} rows                   tiles, one legend character each
 * @property {string} [border]                 the tile drawn beyond the edges (default: tree outdoors, void indoors)
 * @property {{kind: keyof typeof BUILDINGS, x: number, y: number, to: Dest}[]} [buildings]
 *           a building's door warps to `to`; to keep one shut, stand someone in front of it (hideIf)
 * @property {{x: number, y: number, to: Dest, dir?: Dir}[]} [warps]
 *           stepping onto the tile warps; with dir, pressing that way while standing on it does (a doormat, a map edge)
 * @property {Partial<Record<"north"|"south"|"east"|"west", {map: string, offset: number}>>} [connections]
 *           walking off an edge continues on the neighbour; offset shifts the neighbour along the edge
 * @property {NpcDef[]} [npcs]
 * @property {{x: number, y: number, text: string}[]} [signs]
 * @property {{x: number, y: number, item: string, count?: number, hidden?: boolean}[]} [items]
 * @property {{x: number, y: number, w?: number, h?: number, script: Script, once?: string, if?: string, unless?: string}[]} [triggers]
 *           run when the player steps into the area; `once` names a flag set after it runs; if/unless gate it on flags
 * @property {Partial<Record<"grass"|"cave"|"water"|"oldRod"|"goodRod", EncounterTable>>} [encounters]
 * @property {Script} [onEnter]                run each time the map is entered, before the player can move
 * @property {boolean} [town]                  a town's outdoor map: the Wing Whistle can fly here once visited
 * @property {{x: number, y: number}} [flyTo]  where the Wing Whistle lands (outside the center)
 * @property {{x: number, y: number}} [heal]   in a center: where the player stands at the counter
 * @property {boolean} [indoor]
 * @property {string[]} [reaches]          maps only its scripts warp to (g.warp), for the test that every map is reachable
 * @property {Record<string, {x: number, y: number, dir?: Dir}>} [spawns]  named arrival points other maps warp to
 */

export class WorldMap {
  /** @param {MapDef} def */
  constructor(def) {
    this.def = def;
    this.id = def.id;
    this.w = def.rows[0].length;
    this.h = def.rows.length;
    /** Building footprints: "x,y" → the building and whether it's the door. */
    /** @type {Map<string, {b: NonNullable<MapDef["buildings"]>[number], door: boolean}>} */
    this.footprint = new Map();
    for (const b of def.buildings ?? []) {
      const k = BUILDINGS[b.kind];
      for (let dy = 0; dy < k.h; dy++) {
        for (let dx = 0; dx < k.w; dx++) {
          this.footprint.set(`${b.x + dx},${b.y + dy}`, { b, door: dx === k.door[0] && dy === k.door[1] });
        }
      }
    }
    /** Small trees cut this visit: they grow back when the map is left. */
    /** @type {Set<string>} */
    this.cut = new Set();
  }

  /** @param {number} x @param {number} y */
  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  /** The legend character at a tile; the border beyond the edges. @param {number} x @param {number} y */
  tile(x, y) {
    if (!this.inside(x, y)) return this.def.border ?? (this.def.indoor ? " " : "T");
    const ch = this.def.rows[y][x];
    if (ch === "t" && this.cut.has(`${x},${y}`)) return ".";
    return ch;
  }

  /** @param {number} x @param {number} y */
  tileDef(x, y) {
    return TILES[this.tile(x, y)] ?? TILES[" "];
  }

  /** The building door at a tile, if any. @param {number} x @param {number} y */
  door(x, y) {
    const f = this.footprint.get(`${x},${y}`);
    return f?.door ? f.b : undefined;
  }

  /** Whether a building covers a tile (other than its door). @param {number} x @param {number} y */
  building(x, y) {
    const f = this.footprint.get(`${x},${y}`);
    return !!f && !f.door;
  }
}

/** @type {Record<Dir, [number, number]>} */
export const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** @type {Record<Dir, Dir>} */
export const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

/** @type {Record<Dir, "north"|"south"|"west"|"east">} */
export const EDGE = { up: "north", down: "south", left: "west", right: "east" };

/**
 * Where a tile beyond a map's edge lands in its neighbour, if it has one there.
 * @param {WorldMap} m
 * @param {(id: string) => WorldMap|undefined} get   a loaded neighbour
 * @param {number} x
 * @param {number} y
 * @returns {{map: WorldMap, x: number, y: number}|undefined}
 */
export function across(m, get, x, y) {
  const c = m.def.connections ?? {};
  /** @type {["north"|"south"|"east"|"west", boolean][]} */
  const sides = [["north", y < 0], ["south", y >= m.h], ["west", x < 0], ["east", x >= m.w]];
  for (const [side, beyond] of sides) {
    const conn = c[side];
    if (!beyond || !conn) continue;
    const n = get(conn.map);
    if (!n) continue;
    let nx = x, ny = y;
    if (side === "north" || side === "south") {
      nx = x - conn.offset;
      ny = side === "north" ? n.h + y : y - m.h;
    } else {
      ny = y - conn.offset;
      nx = side === "west" ? n.w + x : x - m.w;
    }
    if (n.inside(nx, ny)) return { map: n, x: nx, y: ny };
  }
  return undefined;
}
