// @ts-check
// Every item. Names are pokosmari's own, except the evolution stones, which carry the names
// species.json gives them (the generator names them; a species evolves with the item whose
// name matches its `evolution.item`).
//
// `battle` and `field` are data: the battle engine applies `battle`, the overworld `field`.

/** @typedef {import("../game/creature.js").Status} Status */
/** @typedef {import("./moves.js").BattleStat} BattleStat */

/**
 * @typedef {{kind: "heal", hp: number, status?: "all"}
 *   | {kind: "cure", status: Status | "all"}
 *   | {kind: "revive", fraction: number}
 *   | {kind: "pp", amount: number}
 *   | {kind: "stat", stat: BattleStat, stages: number}
 *   | {kind: "ball", multiplier: number, guaranteed?: boolean}
 *   | {kind: "repel", steps: number}
 *   | {kind: "escape"}
 *   | {kind: "evolve", item: string}
 *   | {kind: "level"}
 *   | {kind: "key", use: string}} ItemEffect
 *
 * heal.hp is HP restored (FULL_HP means all of it); status "all" also cures every status.
 * cure "psn" cures both kinds of poison; "all" cures every status and confusion.
 * evolve.item is the stone's name as species.json writes it in `evolution.item`.
 */

/**
 * @typedef {object} Item
 * @property {string} id
 * @property {string} name
 * @property {number} price     what a shop charges; 0 means it isn't sold
 * @property {"items"|"balls"|"key"} pocket
 * @property {string} description
 * @property {ItemEffect} [battle]
 * @property {ItemEffect} [field]
 */

/** heal.hp for an item that restores all HP. */
export const FULL_HP = 9999;

/**
 * @param {string} id
 * @param {string} name
 * @param {number} price
 * @param {"items"|"balls"|"key"} pocket
 * @param {string} description
 * @param {{battle?: ItemEffect, field?: ItemEffect}} [effects]
 * @returns {Item}
 */
function it(id, name, price, pocket, description, effects = {}) {
  return { id, name, price, pocket, description, ...effects };
}

/** @param {ItemEffect} e */
const both = (e) => ({ battle: e, field: e });

/** @type {Item[]} */
export const ITEMS = [
  // Balls
  it("capture-orb", "Capture Orb", 200, "balls", "A sturdy orb for catching wild creatures.", { battle: { kind: "ball", multiplier: 1 } }),
  it("great-orb", "Great Orb", 600, "balls", "A better orb that catches more easily.", { battle: { kind: "ball", multiplier: 1.5 } }),
  it("prime-orb", "Prime Orb", 1200, "balls", "A finely made orb with a high catch rate.", { battle: { kind: "ball", multiplier: 2 } }),
  it("sovereign-orb", "Sovereign Orb", 0, "balls", "A one-of-a-kind orb that never fails to catch.", { battle: { kind: "ball", multiplier: 255, guaranteed: true } }),

  // HP
  it("tonic", "Tonic", 300, "items", "Restores 20 HP to one creature.", both({ kind: "heal", hp: 20 })),
  it("tonic-plus", "Tonic Plus", 700, "items", "Restores 60 HP to one creature.", both({ kind: "heal", hp: 60 })),
  it("mega-tonic", "Mega Tonic", 1200, "items", "Restores 120 HP to one creature.", both({ kind: "heal", hp: 120 })),
  it("grand-tonic", "Grand Tonic", 2500, "items", "Fully restores one creature's HP.", both({ kind: "heal", hp: FULL_HP })),
  it("panacea", "Panacea", 3000, "items", "Fully restores HP and cures every status.", both({ kind: "heal", hp: FULL_HP, status: "all" })),

  // Revival
  it("wake-bloom", "Wake Bloom", 1500, "items", "Revives a fainted creature with half its HP.", both({ kind: "revive", fraction: 0.5 })),
  it("dawn-bloom", "Dawn Bloom", 4000, "items", "Revives a fainted creature with all its HP.", both({ kind: "revive", fraction: 1 })),

  // Status
  it("burn-salve", "Burn Salve", 250, "items", "A cooling salve that heals a burn.", both({ kind: "cure", status: "brn" })),
  it("antivenom", "Antivenom", 100, "items", "Cures any kind of poisoning.", both({ kind: "cure", status: "psn" })),
  it("nerve-balm", "Nerve Balm", 200, "items", "Loosens stiff limbs to cure paralysis.", both({ kind: "cure", status: "par" })),
  it("rouse-salts", "Rouse Salts", 250, "items", "A sharp smell that wakes a sleeping creature.", both({ kind: "cure", status: "slp" })),
  it("thaw-gel", "Thaw Gel", 250, "items", "A warming gel that thaws a frozen creature.", both({ kind: "cure", status: "frz" })),
  it("remedy-spray", "Remedy Spray", 600, "items", "Cures every status, confusion included.", both({ kind: "cure", status: "all" })),

  // PP
  it("focus-drop", "Focus Drop", 1200, "items", "Restores 10 PP to one move.", both({ kind: "pp", amount: 10 })),
  it("deep-focus", "Deep Focus", 3000, "items", "Restores all PP to one move.", both({ kind: "pp", amount: 99 })),

  // Battle boosters
  it("brawn-draught", "Brawn Draught", 500, "items", "Raises Attack for the rest of the battle.", { battle: { kind: "stat", stat: "atk", stages: 1 } }),
  it("shell-draught", "Shell Draught", 550, "items", "Raises Defense for the rest of the battle.", { battle: { kind: "stat", stat: "def", stages: 1 } }),
  it("wit-draught", "Wit Draught", 350, "items", "Raises Sp. Atk for the rest of the battle.", { battle: { kind: "stat", stat: "spa", stages: 1 } }),
  it("calm-draught", "Calm Draught", 350, "items", "Raises Sp. Def for the rest of the battle.", { battle: { kind: "stat", stat: "spd", stages: 1 } }),
  it("swift-draught", "Swift Draught", 350, "items", "Raises Speed for the rest of the battle.", { battle: { kind: "stat", stat: "spe", stages: 1 } }),
  it("aim-draught", "Aim Draught", 950, "items", "Raises accuracy for the rest of the battle.", { battle: { kind: "stat", stat: "acc", stages: 1 } }),

  // Field
  it("ward-mist", "Ward Mist", 350, "items", "Keeps weak wild creatures away for 100 steps.", { field: { kind: "repel", steps: 100 } }),
  it("long-ward-mist", "Long Ward Mist", 650, "items", "Keeps weak wild creatures away for 250 steps.", { field: { kind: "repel", steps: 250 } }),
  it("homing-thread", "Homing Thread", 550, "items", "Follow it out of a cave or building, back to the last healing center.", { field: { kind: "escape" } }),
  it("growth-candy", "Growth Candy", 4800, "items", "Raises a creature's level by one.", { field: { kind: "level" } }),

  // Evolution stones (names as species.json writes them)
  it("hyper-stone", "Hyper Stone", 2100, "items", "A dense, humming stone that makes certain creatures evolve.", { field: { kind: "evolve", item: "Hyper Stone" } }),
  it("leaf-stone", "Leaf Stone", 2100, "items", "A stone with a leaf pattern that makes certain creatures evolve.", { field: { kind: "evolve", item: "Leaf Stone" } }),

  // Key items: tools
  it("brush-cutter", "Brush Cutter", 0, "key", "Clears small trees out of the way.", { field: { kind: "key", use: "brush-cutter" } }),
  it("tide-board", "Tide Board", 0, "key", "A board for riding across water.", { field: { kind: "key", use: "tide-board" } }),
  it("power-gloves", "Power Gloves", 0, "key", "Gloves strong enough to push boulders.", { field: { kind: "key", use: "power-gloves" } }),
  it("lantern", "Lantern", 0, "key", "Lights up dark caves.", { field: { kind: "key", use: "lantern" } }),
  it("wing-whistle", "Wing Whistle", 0, "key", "Calls a ride to any town you've visited.", { field: { kind: "key", use: "wing-whistle" } }),
  it("bicycle", "Trail Bike", 0, "key", "A folding bike; twice as fast as walking.", { field: { kind: "key", use: "bicycle" } }),
  it("old-rod", "Worn Rod", 0, "key", "A worn fishing rod. Fish where the water is.", { field: { kind: "key", use: "old-rod" } }),
  it("good-rod", "Sturdy Rod", 0, "key", "A sturdy rod that hooks better catches.", { field: { kind: "key", use: "good-rod" } }),
  it("town-map", "Region Map", 0, "key", "A map of the region. Shows where you are.", { field: { kind: "key", use: "town-map" } }),

  // Key items: story
  it("lab-parcel", "Lab Parcel", 0, "key", "A parcel to deliver to the lab."),
  it("spire-pass", "Spire Pass", 0, "key", "A pass that opens the way into the spire."),
  it("syndicate-keycard", "Syndicate Keycard", 0, "key", "A keycard that opens the syndicate's locked doors."),
  it("storm-bell", "Storm Bell", 0, "key", "An old bell that hums before a storm."),
];

/** @type {Map<string, Item>} */
export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

/**
 * @param {string} id
 * @returns {Item}
 */
export function getItem(id) {
  const i = ITEM_BY_ID.get(id);
  if (!i) throw new Error(`unknown item ${id}`);
  return i;
}

/**
 * The item a species' `evolution.item` names, or undefined.
 * @param {string} name
 * @returns {Item | undefined}
 */
export function evolutionItem(name) {
  return ITEMS.find((i) => i.field?.kind === "evolve" && i.field.item === name);
}
