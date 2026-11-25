// @ts-check
// Level-up learnsets, derived from each species' types, its family's physical or special
// leaning, its stage and its family. A family shares one progression: an evolved stage keeps
// every move its pre-evolution learns, at the same levels, and adds a stronger one at the
// level it evolves.

import { previousStage } from "../game/dex.js";

/** @typedef {{level: number, move: string}} LearnEntry */

/**
 * Each type's moves by role: physical and special at weak/mid/late tiers, one status move
 * that hinders the target and one that helps the user. Lists are candidates in order.
 * @typedef {{pw: string[], pm: string[], pl: string[], sw: string[], sm: string[], sl: string[], inflict: string[], setup: string[]}} Kit
 */

/** @type {Record<string, Kit>} */
export const KITS = {
  normal: { pw: ["dart-step", "flurry-paws"], pm: ["brow-bash", "heavy-press"], pl: ["reckless-ram"], sw: ["hum-wave"], sm: ["seeking-glint"], sl: ["echo-roar", "full-blast"], inflict: ["lullaby"], setup: ["wind-up", "hasten"] },
  fire: { pw: ["singe-bite"], pm: ["flare-lash"], pl: ["furnace-charge"], sw: ["cinder-flick"], sm: ["kiln-breath"], sl: ["pyre-burst"], inflict: ["smolder-glare"], setup: ["stoke-flames"] },
  water: { pw: ["fin-slap"], pm: ["riptide-ram"], pl: ["undertow-claw"], sw: ["spritz"], sm: ["ripple-pulse"], sl: ["deluge-cannon"], inflict: ["mist-screen"], setup: ["foam-veil", "wellspring"] },
  grass: { pw: ["twig-swipe"], pm: ["bramble-lash"], pl: ["timberfall"], sw: ["sap-sip"], sm: ["bloom-drain"], sl: ["petal-gale", "sunlance"], inflict: ["drowse-spores", "numb-pollen", "creeper-seed"], setup: ["sunsoak"] },
  electric: { pw: ["volt-nip"], pm: ["live-wire"], pl: ["dynamo-ram"], sw: ["static-snap"], sm: ["arc-lance"], sl: ["skybolt"], inflict: ["numb-wave"], setup: ["supercharge"] },
  ice: { pw: ["sleet-dart", "shard-volley"], pm: ["floe-slam"], pl: ["glacier-fall"], sw: ["frost-puff"], sm: ["rime-ray"], sl: ["whiteout"], inflict: ["cold-snap"], setup: ["snow-cloak", "white-fog"] },
  fighting: { pw: ["palm-strike", "two-step-kick", "hip-throw"], pm: ["elbow-drop"], pl: ["crushing-knee"], sw: ["chi-spark"], sm: ["aura-palm"], sl: ["ki-cannon"], inflict: ["hard-stare"], setup: ["hard-stance", "parry"] },
  poison: { pw: ["venom-nip"], pm: ["venom-fang"], pl: ["rot-crush"], sw: ["sour-mist"], sm: ["bile-splash"], sl: ["miasma-wave"], inflict: ["creeping-blight", "etch-spray"], setup: ["slime-coat"] },
  ground: { pw: ["clod-kick", "sinking-sand"], pm: ["fault-stomp"], pl: ["rift-quake"], sw: ["grit-toss"], sm: ["silt-burst"], sl: ["mire-geyser"], inflict: ["grit-cloud"], setup: ["dig-in"] },
  flying: { pw: ["feather-flick"], pm: ["swoop-strike"], pl: ["talon-dive", "updraft-plunge"], sw: ["zephyr-cut"], sm: ["gale-slice"], sl: ["squall-burst"], inflict: ["dust-flap"], setup: ["preen"] },
  psychic: { pw: ["thought-tap"], pm: ["trance-ram"], pl: ["astral-crush"], sw: ["mind-prod"], sm: ["psi-ripple"], sl: ["psi-lance"], inflict: ["dream-lure"], setup: ["clear-thought", "psi-shield"] },
  bug: { pw: ["mandible-nip", "swarm-jabs"], pm: ["carapace-slash"], pl: ["great-horn"], sw: ["drone-buzz"], sm: ["wingdust-gale"], sl: ["hive-beam"], inflict: ["silk-snare", "web-wrap"], setup: ["molt"] },
  rock: { pw: ["pebble-pelt", "scree-barrage"], pm: ["boulder-toss"], pl: ["landslide", "monolith-drop"], sw: ["gravel-spray"], sm: ["geode-beam"], sl: ["prism-blast"], inflict: ["hard-stare"], setup: ["stone-skin"] },
  ghost: { pw: ["chill-touch"], pm: ["gloom-claw"], pl: ["specter-rend"], sw: ["spirit-flicker", "grave-gaze"], sm: ["phantom-orb"], sl: ["wraith-howl"], inflict: ["eerie-light"], setup: ["fade"] },
  dragon: { pw: ["drake-nip"], pm: ["scale-rake"], pl: ["cataclaw"], sw: ["wyrm-breath", "scale-fury"], sm: ["wyrmwave"], sl: ["comet-roar"], inflict: ["wyrm-glare"], setup: ["wyrm-dance"] },
  dark: { pw: ["sly-nip", "ambush"], pm: ["midnight-rake"], pl: ["dread-maul"], sw: ["murk-pulse"], sm: ["umbral-wave"], sl: ["abyss-blast"], inflict: ["menace"], setup: ["dark-scheme"] },
  steel: { pw: ["rivet-tap", "gear-grind"], pm: ["alloy-fist"], pl: ["anvil-drop"], sw: ["chime-ray"], sm: ["ferro-beam"], sl: ["railgun"], inflict: ["metal-squeal"], setup: ["plate-up", "bulwark"] },
  fairy: { pw: ["twinkle-tap"], pm: ["pixie-rush"], pl: ["fable-smash"], sw: ["glimmer", "dewkiss"], sm: ["lunar-chime"], sl: ["starfall"], inflict: ["doe-eyes"], setup: ["moonbathe"] },
};

/** Two coverage types per primary type; a family takes one by its number. */
export const COVERAGE = {
  normal: ["dark", "ground"], fire: ["ground", "fighting"], water: ["ice", "dark"], grass: ["ground", "poison"],
  electric: ["steel", "flying"], ice: ["water", "ground"], fighting: ["rock", "dark"], poison: ["dark", "ground"],
  ground: ["rock", "steel"], flying: ["dark", "steel"], psychic: ["fairy", "ghost"], bug: ["rock", "poison"],
  rock: ["ground", "fighting"], ghost: ["dark", "poison"], dragon: ["fire", "ground"], dark: ["fighting", "poison"],
  steel: ["rock", "ground"], fairy: ["psychic", "grass"],
};

/** The level the family's root learns each slot at. */
const SLOT_LEVELS = [1, 1, 6, 10, 14, 18, 23, 28, 33, 38, 43, 48, 53, 58];
/** The level an item-evolved stage learns its own stronger move. */
const ITEM_EVOLVE_LEVEL = 30;

/**
 * @param {import("../game/dex.js").Dex} dex
 * @param {import("../game/dex.js").Species} sp
 */
function familyRoot(dex, sp) {
  let s = sp;
  for (let p = previousStage(dex, s.id); p; p = previousStage(dex, s.id)) s = p;
  return s;
}

/**
 * @param {import("../game/dex.js").Dex} dex
 * @param {import("../game/dex.js").Species} root
 */
function familyFinal(dex, root) {
  let s = root;
  while (s.evolution) s = dex.get(s.evolution.to);
  return s;
}

/** @type {WeakMap<object, Map<string, LearnEntry[]>>} */
const cache = new WeakMap();

/**
 * The moves a species learns by level, sorted by level.
 * @param {import("../game/dex.js").Dex} dex
 * @param {string} speciesId
 * @returns {LearnEntry[]}
 */
export function learnsetFor(dex, speciesId) {
  let byDex = cache.get(dex);
  if (!byDex) cache.set(dex, (byDex = new Map()));
  let list = byDex.get(speciesId);
  if (!list) byDex.set(speciesId, (list = build(dex, dex.get(speciesId))));
  return list;
}

/**
 * @param {import("../game/dex.js").Dex} dex
 * @param {import("../game/dex.js").Species} sp
 * @returns {LearnEntry[]}
 */
function build(dex, sp) {
  const root = familyRoot(dex, sp);
  const final = familyFinal(dex, root);
  const phys = final.base.atk >= final.base.spa;
  const [p, s] = root.types;
  const kp = KITS[p];
  const ks = s ? KITS[s] : null;
  const cov = COVERAGE[p].filter((t) => !root.types.includes(t));
  const kc = KITS[cov[root.family % cov.length]];
  const kn = KITS.normal;
  const w = phys ? "pw" : "sw", mid = phys ? "pm" : "sm", late = phys ? "pl" : "sl";
  const ow = phys ? "sw" : "pw", omid = phys ? "sm" : "pm", olate = phys ? "sl" : "pl";

  /** @type {Set<string>} */
  const used = new Set();
  /** @type {LearnEntry[]} */
  const out = [];
  /** @param {number} level @param {string[][]} options */
  const add = (level, ...options) => {
    for (const list of options) {
      for (const move of list) {
        if (!used.has(move)) {
          used.add(move);
          out.push({ level, move });
          return;
        }
      }
    }
  };

  const L = SLOT_LEVELS;
  const bulky = final.base.hp >= 100;
  add(L[0], phys ? ["bump"] : ["hum-wave"]);
  add(L[1], root.family % 2 ? ["grumble"] : ["hard-stare"], ["grumble"]);
  add(L[2], kp[w], kp[ow]);
  add(L[3], kp.inflict, kn.inflict);
  add(L[4], ks ? ks[w] : kp[ow], kn[w], kn.pw);
  add(L[5], kp[mid], kp[omid]);
  add(L[6], kc[w], kc[mid]);
  add(L[7], ks ? ks[mid] : kn[mid], kn[mid], kp[omid]);
  add(L[8], bulky ? ["deep-doze"] : kp.setup, kp.setup, kn.setup);
  add(L[9], kc[mid], kp[omid], kn[mid]);
  add(L[10], kp[late], kp[olate]);
  add(L[11], ks ? ks[late] : kn[late], kn[late], kp[olate]);
  add(L[12], kp[late].slice(1), kp[omid], kp[olate], kc[late]);
  add(L[13], kn[late], kn[olate], kc[late], kn.sl);

  // Each evolved stage on the way to this species adds one stronger move.
  // Early evolutions add a mid-tier move, later ones a late-tier move, in the family's
  // leaning first.
  const kc2 = KITS[cov[(root.family + 1) % cov.length]];
  const ksx = ks || { pw: [], pm: [], pl: [], sw: [], sm: [], sl: [] };
  /** @param {string} t @param {string} ot */
  const tier = (t, ot) => [kp[t].slice(1), ksx[t], kc[t], kc2[t], kn[t], kp[ot].slice(1), kp[ot], ksx[ot], kc[ot], kn[ot]];
  const midBonus = tier(mid, omid);
  const lateBonus = tier(late, olate);
  const chain = [];
  for (let prev = previousStage(dex, sp.id); prev; prev = previousStage(dex, prev.id)) {
    chain.unshift(prev.evolution.level ?? ITEM_EVOLVE_LEVEL);
  }
  for (const level of chain) add(level, ...(level < 30 ? [...midBonus, ...lateBonus] : [...lateBonus, ...midBonus]));

  return out.sort((a, b) => a.level - b.level);
}

/**
 * Moves a species learns at exactly this level (what a level-up or an evolution teaches).
 * @param {import("../game/dex.js").Dex} dex
 * @param {string} speciesId
 * @param {number} level
 * @returns {string[]}
 */
export function movesLearnedAt(dex, speciesId, level) {
  return learnsetFor(dex, speciesId).filter((e) => e.level === level).map((e) => e.move);
}
