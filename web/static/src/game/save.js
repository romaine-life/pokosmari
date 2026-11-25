// @ts-check
// The save: one slot in the browser's local storage, plus download and upload so a save can
// move between browsers. A save that can't be read is never overwritten without the player
// choosing to start over.

import { STATE_VERSION } from "./state.js";

/** @typedef {import("./state.js").State} State */

export const SAVE_KEY = "pokosmari-save";
const BACKUP_KEY = "pokosmari-save-previous";

/**
 * The storage the save uses: the browser's localStorage, or a stand-in in tests.
 * @typedef {{getItem(k: string): string|null, setItem(k: string, v: string): void, removeItem(k: string): void}} Store
 */

/**
 * Bring an older save up to this version. Each step migrates one version.
 * @param {any} data
 * @returns {State}
 */
export function migrate(data) {
  if (!data || typeof data !== "object" || typeof data.version !== "number") {
    throw new Error("this isn't a pokosmari save");
  }
  if (data.version > STATE_VERSION) {
    throw new Error(`this save is from a newer version of the game (save version ${data.version})`);
  }
  // Version 1 is the first; later versions add their steps here, oldest first.
  if (!Array.isArray(data.party) || typeof data.pos?.map !== "string") {
    throw new Error("this save is missing its party or position");
  }
  return /** @type {State} */ (data);
}

/**
 * @typedef {{state: State} | {error: string, raw: string} | null} LoadResult
 */

/**
 * Read the save. Null when there is none; an error (with the raw text, kept as it was) when
 * there is one that can't be read.
 * @param {Store} store
 * @returns {LoadResult}
 */
export function load(store) {
  const raw = store.getItem(SAVE_KEY);
  if (raw == null) return null;
  try {
    return { state: migrate(JSON.parse(raw)) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e), raw };
  }
}

/**
 * Write the save. The previous save is kept as a backup, so a write cut short by a closed
 * tab can't lose both.
 * @param {Store} store
 * @param {State} state
 */
export function save(store, state) {
  state.savedAt = Date.now();
  const text = JSON.stringify(state);
  const prev = store.getItem(SAVE_KEY);
  if (prev != null) store.setItem(BACKUP_KEY, prev);
  store.setItem(SAVE_KEY, text);
  // Read it back: a full storage quota throws above, but a silently truncated write doesn't.
  if (store.getItem(SAVE_KEY) !== text) throw new Error("the browser didn't keep the save");
}

/**
 * The save as a downloadable file's text.
 * @param {State} state
 */
export function exportSave(state) {
  return JSON.stringify({ game: "pokosmari", exportedAt: new Date().toISOString(), state }, null, 1);
}

/**
 * Read an exported save file.
 * @param {string} text
 * @returns {State}
 */
export function importSave(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("that file isn't a save: it isn't JSON");
  }
  if (data?.game !== "pokosmari") throw new Error("that file isn't a pokosmari save");
  return migrate(data.state);
}

/** Whether a previous save exists to restore from. @param {Store} store */
export function backup(store) {
  return store.getItem(BACKUP_KEY);
}
