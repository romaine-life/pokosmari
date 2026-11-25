// @ts-check
// The dex: every species, from data/species.json (built from pokemon-generator by
// cmd/species). Loaded once at boot; tests load the same file from disk.

/** @typedef {"hp"|"atk"|"def"|"spa"|"spd"|"spe"} StatId */
/** @typedef {Record<StatId, number>} Stats */

/**
 * @typedef {object} Species
 * @property {string} id         the name in lower case; game data names species by it
 * @property {number} num
 * @property {string} name
 * @property {string} category
 * @property {string[]} types
 * @property {Stats} base
 * @property {number} total
 * @property {string} entry
 * @property {number} heightM
 * @property {number} weightKg
 * @property {string} bodyPlan
 * @property {number} family
 * @property {string} [role]      "starter" or "legendary"
 * @property {number} stage
 * @property {number} stages
 * @property {boolean} [legendary]
 * @property {{to: string, level?: number, item?: string}} [evolution]
 * @property {{width: number, height: number, palette: string[], pixels: string}} sprite
 */

/** @typedef {{id: string, name: string, color: string}} TypeInfo */

/**
 * @typedef {object} Dex
 * @property {Species[]} list
 * @property {Map<string, Species>} byId
 * @property {TypeInfo[]} types
 * @property {(id: string) => Species} get   throws on an unknown id
 */

/**
 * @param {{generator: string, types: TypeInfo[], species: Species[]}} json
 * @returns {Dex}
 */
export function makeDex(json) {
  const byId = new Map(json.species.map((s) => [s.id, s]));
  return {
    list: json.species,
    byId,
    types: json.types,
    get(id) {
      const s = byId.get(id);
      if (!s) throw new Error(`unknown species ${id}`);
      return s;
    },
  };
}

/**
 * The species that evolves into this one, or undefined for a first stage.
 * @param {Dex} dex
 * @param {string} id
 */
export function previousStage(dex, id) {
  return dex.list.find((s) => s.evolution?.to === id);
}
