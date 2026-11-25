// The world's content holds together: every map, warp, edge, person, trainer, item and
// encounter names something that exists, and every map can be reached from the start.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import { TILES, BUILDINGS, THEMES } from "../static/src/data/tiles.js";
import { TRAINERS } from "../static/src/data/trainers/index.js";
import { ITEM_BY_ID } from "../static/src/data/items.js";
import { MOVE_BY_ID } from "../static/src/data/moves.js";
import { SONGS } from "../static/src/audio/songs.js";

const here = dirname(fileURLToPath(import.meta.url));
const mapsDir = join(here, "../static/src/data/maps");
const dex = JSON.parse(readFileSync(join(here, "../static/data/species.json"), "utf8"));
const species = new Set(dex.species.map((s) => s.id));

/** @type {Map<string, any>} */
const maps = new Map();
for (const f of readdirSync(mapsDir).filter((f) => f.endsWith(".js") && !f.startsWith("_"))) {
  const mod = await import(pathToFileURL(join(mapsDir, f)).href);
  maps.set(f.slice(0, -3), mod.default);
}

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function footprint(m) {
  const fp = new Map();
  for (const b of m.buildings ?? []) {
    const k = BUILDINGS[b.kind];
    for (let dy = 0; dy < k.h; dy++)
      for (let dx = 0; dx < k.w; dx++) fp.set(`${b.x + dx},${b.y + dy}`, dx === k.door[0] && dy === k.door[1] ? "door" : "wall");
  }
  return fp;
}

function walkable(m, x, y, { surf = true } = {}) {
  if (x < 0 || y < 0 || y >= m.rows.length || x >= m.rows[0].length) return false;
  const t = TILES[m.rows[y][x]];
  if (!t) return false;
  if (footprint(m).get(`${x},${y}`) === "wall") return false;
  if ((m.signs ?? []).some((s) => s.x === x && s.y === y)) return false;
  if (t.water) return surf;
  if (t.needs === "cut") return true;
  return !t.solid;
}

function dest(to) {
  const m = maps.get(to.map);
  if (!m) return null;
  if (to.at) return m.spawns?.[to.at] ? { m, ...m.spawns[to.at] } : null;
  return { m, x: to.x, y: to.y };
}

test("there are maps, and the start map exists", () => {
  assert.ok(maps.size > 0);
  assert.ok(maps.has("fernhollow-home"), "fernhollow-home is where a new game starts");
});

for (const [file, m] of maps) {
  test(`map ${file}`, () => {
    assert.equal(m.id, file, "id matches the file name");
    assert.ok(m.name, "has a name");
    assert.ok(THEMES.includes(m.theme), `theme ${m.theme} is one of ${THEMES}`);
    assert.ok(m.music in SONGS, `music ${m.music} is a song`);
    const w = m.rows[0].length;
    m.rows.forEach((r, y) => {
      assert.equal(r.length, w, `row ${y} is ${r.length} wide, not ${w}`);
      for (const ch of r) assert.ok(TILES[ch], `row ${y} uses ${JSON.stringify(ch)}, which isn't in the legend`);
    });
    const fp = new Map();
    for (const b of m.buildings ?? []) {
      const k = BUILDINGS[b.kind];
      assert.ok(k, `building kind ${b.kind}`);
      assert.ok(b.x >= 0 && b.y >= 0 && b.x + k.w <= w && b.y + k.h <= m.rows.length, `${b.kind} at ${b.x},${b.y} fits on the map`);
      for (let dy = 0; dy < k.h; dy++)
        for (let dx = 0; dx < k.w; dx++) {
          const key = `${b.x + dx},${b.y + dy}`;
          assert.ok(!fp.has(key), `buildings overlap at ${key}`);
          fp.set(key, true);
        }
      const d = dest(b.to);
      assert.ok(d, `${b.kind} at ${b.x},${b.y} leads to ${JSON.stringify(b.to)}, which exists`);
      assert.ok(walkable(m, b.x + k.door[0], b.y + k.door[1] + 1), `the tile below the ${b.kind} door at ${b.x},${b.y} is walkable`);
    }
    for (const wp of m.warps ?? []) {
      const d = dest(wp.to);
      assert.ok(d, `warp at ${wp.x},${wp.y} leads to ${JSON.stringify(wp.to)}, which exists`);
      assert.ok(walkable(d.m, d.x, d.y), `warp at ${wp.x},${wp.y} lands on a walkable tile of ${wp.to.map} (${d.x},${d.y})`);
      assert.ok(walkable(m, wp.x, wp.y) || m.rows[wp.y]?.[wp.x] === "L", `warp tile ${wp.x},${wp.y} can be stood on`);
    }
    for (const [name, sp] of Object.entries(m.spawns ?? {})) {
      assert.ok(walkable(m, sp.x, sp.y), `spawn ${name} is on a walkable tile`);
    }
    for (const [side, c] of Object.entries(m.connections ?? {})) {
      const n = maps.get(c.map);
      assert.ok(n, `${side} connection to ${c.map} exists`);
      const back = { north: "south", south: "north", east: "west", west: "east" }[side];
      assert.deepEqual(n.connections?.[back], { map: m.id, offset: c.offset ? -c.offset : 0 }, `${c.map} connects back ${back} with offset ${-c.offset}`);
    }
    const ids = new Set();
    for (const n of m.npcs ?? []) {
      assert.ok(!ids.has(n.id), `npc id ${n.id} is unique`);
      ids.add(n.id);
      assert.ok(n.x >= 0 && n.y >= 0 && n.x < w && n.y < m.rows.length, `${n.id} is on the map`);
      if (n.sprite !== "boulder") assert.ok(walkable(m, n.x, n.y, { surf: n.sprite === "swimmer" }), `${n.id} stands on a walkable tile (${n.x},${n.y})`);
      assert.ok(n.text || n.script || n.trainer || n.sprite === "boulder", `${n.id} has something to say or do`);
      if (n.trainer) assert.ok(TRAINERS[n.trainer], `${n.id}'s trainer ${n.trainer} exists`);
    }
    for (const it of m.items ?? []) {
      assert.ok(ITEM_BY_ID.has(it.item), `item ${it.item} at ${it.x},${it.y} exists`);
    }
    for (const [kind, table] of Object.entries(m.encounters ?? {})) {
      assert.ok(table.rate > 0 && table.rate <= 0.3, `${kind} rate ${table.rate} is sensible`);
      for (const e of table.table) {
        assert.ok(species.has(e.species), `${kind} encounter ${e.species} exists`);
        assert.ok(e.min >= 1 && e.max >= e.min && e.max <= 100, `${e.species} levels ${e.min}-${e.max}`);
        assert.ok(e.weight > 0, `${e.species} has a weight`);
      }
    }
    for (const tr of m.triggers ?? []) assert.equal(typeof tr.script, "function", "a trigger has a script");
  });
}

test("trainers name real species, moves and sprites", () => {
  for (const t of Object.values(TRAINERS)) {
    assert.ok(t.party.length >= 1 && t.party.length <= 6, `${t.id} has 1-6 creatures`);
    for (const p of t.party) {
      assert.ok(species.has(p.species) || /^@rival[123]$/.test(p.species), `${t.id}: species ${p.species}`);
      assert.ok(p.level >= 2 && p.level <= 100, `${t.id}: level ${p.level}`);
      for (const mv of p.moves ?? []) assert.ok(MOVE_BY_ID.has(mv), `${t.id}: move ${mv}`);
    }
    assert.ok(t.intro && t.defeat && t.after, `${t.id} has intro, defeat and after text`);
  }
});

test("every map can be reached from the start", () => {
  // With every field item, walking, warps and edges reach every map.
  const seen = new Set(["fernhollow-home"]);
  const queue = ["fernhollow-home"];
  while (queue.length) {
    const m = maps.get(queue.shift());
    const next = [
      ...(m.buildings ?? []).map((b) => b.to.map),
      ...(m.warps ?? []).map((w) => w.to.map),
      ...Object.values(m.connections ?? {}).map((c) => c.map),
      ...(m.reaches ?? []),
    ];
    for (const id of next) {
      if (!seen.has(id) && maps.has(id)) {
        seen.add(id);
        queue.push(id);
      }
    }
  }
  const missing = [...maps.keys()].filter((k) => !seen.has(k));
  assert.deepEqual(missing, [], "maps nothing leads to");
});
