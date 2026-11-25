// @ts-check
// Every move in the game. Names are pokosmari's own; effects are data the battle engine
// interprets (battle/engine.js handles every key of MoveEffect).
//
// Power tiers: early moves 35-50, mid 60-85, late 90-120.

/** @typedef {"atk"|"def"|"spa"|"spd"|"spe"|"acc"|"eva"} BattleStat */
/** @typedef {import("../game/creature.js").Status} Status */

/**
 * Effects a move can carry. Chances are percentages; a missing chance means always.
 * @typedef {object} MoveEffect
 * @property {{who: "self"|"target", stages: Partial<Record<BattleStat, number>>, chance?: number}} [stat]
 * @property {{id: Status, chance?: number}} [status]   inflicts a major status on the target
 * @property {number} [confuse]     chance to confuse the target
 * @property {number} [flinch]      chance to make the target flinch
 * @property {number} [recoil]      the user takes this fraction of the damage dealt
 * @property {number} [drain]       the user heals this fraction of the damage dealt
 * @property {number} [heal]        the user heals this fraction of its max HP
 * @property {[number, number]} [hits]  strikes this many times (2-5 uses the 2/3/4/5 spread)
 * @property {number} [fixed]       deals exactly this much damage
 * @property {boolean} [levelDamage] deals damage equal to the user's level
 * @property {boolean} [highCrit]   critical hits are twice as likely
 * @property {boolean} [protect]    shields the user from moves this turn
 * @property {boolean} [recharge]   the user must rest the next turn
 * @property {boolean} [charge]     gathers power on the first turn, strikes on the second
 * @property {boolean} [bind]       traps the target for 2-5 turns, chipping 1/16 each turn
 * @property {boolean} [leech]      seeds the target: 1/8 of its max HP drains to the user each turn
 * @property {boolean} [rest]       the user sleeps two turns and recovers fully
 * @property {boolean} [haze]       wipes every stat change on both sides
 * @property {boolean} [struggle]   the move used when nothing has PP left: typeless, 1/4 recoil
 */

/**
 * @typedef {object} Move
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {"physical"|"special"|"status"} category
 * @property {number} power        0 for status moves and fixed-damage moves
 * @property {number|null} accuracy  percent, or null for a move that never misses
 * @property {number} pp
 * @property {number} priority
 * @property {MoveEffect} [effect]
 * @property {string} description
 */

/**
 * @param {string} id
 * @param {string} name
 * @param {string} type
 * @param {"physical"|"special"|"status"} category
 * @param {number} power
 * @param {number|null} accuracy
 * @param {number} pp
 * @param {string} description
 * @param {MoveEffect} [effect]
 * @param {number} [priority]
 * @returns {Move}
 */
function m(id, name, type, category, power, accuracy, pp, description, effect, priority = 0) {
  /** @type {Move} */
  const move = { id, name, type, category, power, accuracy, pp, priority, description };
  if (effect) move.effect = effect;
  return move;
}

const self = (/** @type {Partial<Record<BattleStat, number>>} */ stages, chance = 100) => ({ who: /** @type {"self"} */ ("self"), stages, chance });
const foe = (/** @type {Partial<Record<BattleStat, number>>} */ stages, chance = 100) => ({ who: /** @type {"target"} */ ("target"), stages, chance });
const st = (/** @type {Status} */ id, chance = 100) => ({ id, chance });

/** @type {Move[]} */
export const MOVES = [
  // Normal
  m("bump", "Bump", "normal", "physical", 40, 100, 35, "A plain shove with the whole body."),
  m("dart-step", "Dart Step", "normal", "physical", 40, 100, 30, "A blur of a lunge that always goes first.", undefined, 1),
  m("flurry-paws", "Flurry Paws", "normal", "physical", 18, 85, 15, "Swipes two to five times in a row.", { hits: [2, 5] }),
  m("sure-tap", "Sure Tap", "normal", "physical", 0, 90, 20, "A practiced tap that always deals 20 damage.", { fixed: 20 }),
  m("coil-grip", "Coil Grip", "normal", "physical", 15, 85, 20, "Wraps the target and squeezes it for several turns.", { bind: true }),
  m("brow-bash", "Brow Bash", "normal", "physical", 70, 100, 15, "A headlong ram that may make the target flinch.", { flinch: 30 }),
  m("heavy-press", "Heavy Press", "normal", "physical", 85, 100, 15, "Drops its full weight on the target. May paralyze.", { status: st("par", 30) }),
  m("reckless-ram", "Reckless Ram", "normal", "physical", 120, 100, 15, "An all-out charge that also hurts the user.", { recoil: 1 / 3 }),
  m("hum-wave", "Hum Wave", "normal", "special", 40, 100, 35, "A droning wave of sound."),
  m("seeking-glint", "Seeking Glint", "normal", "special", 60, null, 20, "Flecks of light that home in and never miss."),
  m("echo-roar", "Echo Roar", "normal", "special", 90, 100, 10, "A roar that rebounds off everything around."),
  m("full-blast", "Full Blast", "normal", "special", 120, 90, 5, "Unleashes everything at once. The user must rest after.", { recharge: true }),
  m("hard-stare", "Hard Stare", "normal", "status", 0, 100, 30, "An unblinking stare that lowers the target's Defense.", { stat: foe({ def: -1 }) }),
  m("grumble", "Grumble", "normal", "status", 0, 100, 40, "A low grumble that lowers the target's Attack.", { stat: foe({ atk: -1 }) }),
  m("wind-up", "Wind Up", "normal", "status", 0, null, 20, "Gathers itself to sharply raise its Attack.", { stat: self({ atk: 2 }) }),
  m("hasten", "Hasten", "normal", "status", 0, null, 30, "Loosens up to sharply raise its Speed.", { stat: self({ spe: 2 }) }),
  m("lullaby", "Lullaby", "normal", "status", 0, 55, 15, "A soft tune that puts the target to sleep.", { status: st("slp") }),
  m("brace", "Brace", "normal", "status", 0, null, 10, "Shields itself from attacks this turn. Fails more if repeated.", { protect: true }, 4),
  m("deep-doze", "Deep Doze", "normal", "status", 0, null, 10, "Sleeps for two turns to recover all HP and status.", { rest: true }),

  // Fire
  m("cinder-flick", "Cinder Flick", "fire", "special", 40, 100, 25, "Flicks hot cinders. May burn.", { status: st("brn", 10) }),
  m("singe-bite", "Singe Bite", "fire", "physical", 45, 100, 25, "A bite with smoldering teeth. May burn.", { status: st("brn", 10) }),
  m("ring-of-fire", "Ring of Fire", "fire", "special", 35, 85, 15, "Traps the target in a ring of flame for several turns.", { bind: true }),
  m("flare-lash", "Flare Lash", "fire", "physical", 75, 100, 15, "A whip of flame. May burn.", { status: st("brn", 10) }),
  m("kiln-breath", "Kiln Breath", "fire", "special", 75, 100, 15, "Breath as hot as a kiln. May burn.", { status: st("brn", 10) }),
  m("pyre-burst", "Pyre Burst", "fire", "special", 105, 90, 5, "A towering burst of flame. May burn.", { status: st("brn", 10) }),
  m("furnace-charge", "Furnace Charge", "fire", "physical", 115, 100, 10, "Charges wreathed in fire; the user is hurt too.", { recoil: 1 / 3, status: st("brn", 10) }),
  m("smolder-glare", "Smolder Glare", "fire", "status", 0, 85, 15, "Eerie embers that burn the target.", { status: st("brn") }),
  m("stoke-flames", "Stoke Flames", "fire", "status", 0, null, 20, "Feeds its inner fire, raising Attack and Sp. Atk.", { stat: self({ atk: 1, spa: 1 }) }),

  // Water
  m("spritz", "Spritz", "water", "special", 40, 100, 25, "Squirts a jet of water."),
  m("fin-slap", "Fin Slap", "water", "physical", 40, 100, 25, "Slaps with a wet fin."),
  m("eddy-trap", "Eddy Trap", "water", "special", 35, 85, 15, "Spins the target in a swirling eddy for several turns.", { bind: true }),
  m("ripple-pulse", "Ripple Pulse", "water", "special", 65, 100, 20, "Rings of water that may confuse.", { confuse: 20 }),
  m("riptide-ram", "Riptide Ram", "water", "physical", 80, 100, 15, "Rides a rushing current into the target. May flinch.", { flinch: 20 }),
  m("undertow-claw", "Undertow Claw", "water", "physical", 95, 90, 10, "A dragging claw strike that crits easily.", { highCrit: true }),
  m("deluge-cannon", "Deluge Cannon", "water", "special", 110, 80, 5, "Fires a crushing torrent of water."),
  m("mist-screen", "Mist Screen", "water", "status", 0, 100, 20, "Sprays a fine mist that lowers the target's accuracy.", { stat: foe({ acc: -1 }) }),
  m("wellspring", "Wellspring", "water", "status", 0, null, 10, "Draws on hidden water to restore half its max HP.", { heal: 0.5 }),
  m("foam-veil", "Foam Veil", "water", "status", 0, null, 20, "Wraps itself in foam, raising Defense and Sp. Def.", { stat: self({ def: 1, spd: 1 }) }),

  // Grass
  m("twig-swipe", "Twig Swipe", "grass", "physical", 40, 100, 25, "Swipes with a stiff twig."),
  m("sap-sip", "Sap Sip", "grass", "special", 40, 100, 20, "Drinks the target's strength; heals half the damage.", { drain: 0.5 }),
  m("bramble-lash", "Bramble Lash", "grass", "physical", 70, 100, 15, "Whips with thorny brambles. Crits easily.", { highCrit: true }),
  m("bloom-drain", "Bloom Drain", "grass", "special", 75, 100, 10, "A blossom that drinks deeply; heals half the damage.", { drain: 0.5 }),
  m("petal-gale", "Petal Gale", "grass", "special", 100, 90, 10, "A gale of razor petals."),
  m("sunlance", "Sunlance", "grass", "special", 120, 100, 10, "Gathers light for a turn, then fires it.", { charge: true }),
  m("timberfall", "Timberfall", "grass", "physical", 115, 100, 10, "Crashes down like a felled tree; the user is hurt too.", { recoil: 1 / 3 }),
  m("drowse-spores", "Drowse Spores", "grass", "status", 0, 75, 15, "Scatters spores that put the target to sleep.", { status: st("slp") }),
  m("numb-pollen", "Numb Pollen", "grass", "status", 0, 75, 30, "Scatters pollen that paralyzes.", { status: st("par") }),
  m("creeper-seed", "Creeper Seed", "grass", "status", 0, 90, 10, "Plants a seed that saps the target every turn.", { leech: true }),
  m("sunsoak", "Sunsoak", "grass", "status", 0, null, 10, "Basks in light to restore half its max HP.", { heal: 0.5 }),

  // Electric
  m("static-snap", "Static Snap", "electric", "special", 40, 100, 30, "A snap of static. May paralyze.", { status: st("par", 10) }),
  m("volt-nip", "Volt Nip", "electric", "physical", 45, 100, 25, "A charged nip. May paralyze.", { status: st("par", 10) }),
  m("arc-lance", "Arc Lance", "electric", "special", 75, 100, 15, "A lance of arcing current. May paralyze.", { status: st("par", 10) }),
  m("live-wire", "Live Wire", "electric", "physical", 75, 100, 15, "Lashes out with a crackling tail. May paralyze.", { status: st("par", 10) }),
  m("skybolt", "Skybolt", "electric", "special", 110, 70, 10, "Calls a bolt down from above. Often paralyzes.", { status: st("par", 30) }),
  m("dynamo-ram", "Dynamo Ram", "electric", "physical", 110, 100, 15, "A sparking full-body charge; the user is hurt too.", { recoil: 1 / 3 }),
  m("numb-wave", "Numb Wave", "electric", "status", 0, 90, 20, "A weak pulse that paralyzes.", { status: st("par") }),
  m("supercharge", "Supercharge", "electric", "status", 0, null, 20, "Builds up charge to sharply raise Sp. Atk.", { stat: self({ spa: 2 }) }),

  // Ice
  m("frost-puff", "Frost Puff", "ice", "special", 40, 100, 25, "A puff of freezing air. May freeze.", { status: st("frz", 10) }),
  m("sleet-dart", "Sleet Dart", "ice", "physical", 40, 100, 30, "A dart of sleet that always goes first.", undefined, 1),
  m("shard-volley", "Shard Volley", "ice", "physical", 25, 100, 20, "Flings ice shards two to five times.", { hits: [2, 5] }),
  m("rime-ray", "Rime Ray", "ice", "special", 70, 100, 15, "A beam of rime. May freeze.", { status: st("frz", 10) }),
  m("floe-slam", "Floe Slam", "ice", "physical", 80, 95, 15, "Slams down like an ice floe. May flinch.", { flinch: 20 }),
  m("glacier-fall", "Glacier Fall", "ice", "physical", 100, 90, 10, "Drops a glacier's weight on the target."),
  m("whiteout", "Whiteout", "ice", "special", 110, 70, 5, "A blinding storm of snow. May freeze.", { status: st("frz", 10) }),
  m("cold-snap", "Cold Snap", "ice", "status", 0, 95, 40, "A sudden chill that sharply lowers the target's Speed.", { stat: foe({ spe: -2 }) }),
  m("white-fog", "White Fog", "ice", "status", 0, null, 30, "A freezing fog that erases every stat change.", { haze: true }),
  m("snow-cloak", "Snow Cloak", "ice", "status", 0, null, 15, "Hides in drifting snow to raise its evasiveness.", { stat: self({ eva: 1 }) }),

  // Fighting
  m("palm-strike", "Palm Strike", "fighting", "physical", 40, 100, 30, "An open-palm strike."),
  m("two-step-kick", "Two-Step Kick", "fighting", "physical", 30, 100, 30, "Kicks twice in quick succession.", { hits: [2, 2] }),
  m("chi-spark", "Chi Spark", "fighting", "special", 40, 100, 25, "A spark of inner energy."),
  m("hip-throw", "Hip Throw", "fighting", "physical", 0, 100, 20, "Throws the target; damage equals the user's level.", { levelDamage: true }),
  m("elbow-drop", "Elbow Drop", "fighting", "physical", 75, 100, 15, "A falling elbow. May flinch.", { flinch: 10 }),
  m("aura-palm", "Aura Palm", "fighting", "special", 70, 100, 15, "Pushes a wave of aura from the palm."),
  m("crushing-knee", "Crushing Knee", "fighting", "physical", 110, 90, 10, "A leaping knee with everything behind it."),
  m("ki-cannon", "Ki Cannon", "fighting", "special", 110, 85, 5, "Fires gathered spirit. May lower Sp. Def.", { stat: foe({ spd: -1 }, 10) }),
  m("hard-stance", "Hard Stance", "fighting", "status", 0, null, 20, "Plants its feet, raising Attack and Defense.", { stat: self({ atk: 1, def: 1 }) }),
  m("parry", "Parry", "fighting", "status", 0, null, 10, "Turns every blow aside this turn. Fails more if repeated.", { protect: true }, 4),

  // Poison
  m("venom-nip", "Venom Nip", "poison", "physical", 40, 100, 30, "A nip with venomous teeth. May poison.", { status: st("psn", 30) }),
  m("sour-mist", "Sour Mist", "poison", "special", 40, 100, 30, "A sour, stinging mist. May poison.", { status: st("psn", 30) }),
  m("bile-splash", "Bile Splash", "poison", "special", 70, 100, 15, "Splashes caustic bile. May poison.", { status: st("psn", 30) }),
  m("venom-fang", "Venom Fang", "poison", "physical", 75, 100, 15, "Sinks in dripping fangs. May badly poison.", { status: st("tox", 20) }),
  m("miasma-wave", "Miasma Wave", "poison", "special", 95, 100, 10, "A rolling wave of foul air. May poison.", { status: st("psn", 30) }),
  m("rot-crush", "Rot Crush", "poison", "physical", 100, 90, 10, "A crushing blow that festers. May poison.", { status: st("psn", 20) }),
  m("creeping-blight", "Creeping Blight", "poison", "status", 0, 90, 10, "A blight that badly poisons; it worsens every turn.", { status: st("tox") }),
  m("etch-spray", "Etch Spray", "poison", "status", 0, 100, 20, "An etching spray that sharply lowers Sp. Def.", { stat: foe({ spd: -2 }) }),
  m("slime-coat", "Slime Coat", "poison", "status", 0, null, 20, "Coats itself in slime to sharply raise Defense.", { stat: self({ def: 2 }) }),

  // Ground
  m("grit-toss", "Grit Toss", "ground", "special", 35, 100, 20, "Tosses grit in the eyes, lowering accuracy.", { stat: foe({ acc: -1 }) }),
  m("clod-kick", "Clod Kick", "ground", "physical", 45, 100, 25, "Kicks a clod of earth."),
  m("sinking-sand", "Sinking Sand", "ground", "physical", 35, 85, 15, "Sinks the target in sand for several turns.", { bind: true }),
  m("fault-stomp", "Fault Stomp", "ground", "physical", 75, 100, 15, "A stomp that cracks the ground. May flinch.", { flinch: 10 }),
  m("silt-burst", "Silt Burst", "ground", "special", 75, 100, 15, "A burst of wet silt. May lower accuracy.", { stat: foe({ acc: -1 }, 30) }),
  m("rift-quake", "Rift Quake", "ground", "physical", 100, 100, 10, "Splits the earth beneath the target."),
  m("mire-geyser", "Mire Geyser", "ground", "special", 100, 90, 10, "A geyser of boiling mud."),
  m("grit-cloud", "Grit Cloud", "ground", "status", 0, 100, 15, "Kicks up a cloud that lowers the target's accuracy.", { stat: foe({ acc: -1 }) }),
  m("dig-in", "Dig In", "ground", "status", 0, null, 20, "Digs in to sharply raise its Defense.", { stat: self({ def: 2 }) }),

  // Flying
  m("feather-flick", "Feather Flick", "flying", "physical", 40, 100, 35, "Flicks with stiff feathers."),
  m("zephyr-cut", "Zephyr Cut", "flying", "special", 40, 100, 30, "A slicing breeze."),
  m("swoop-strike", "Swoop Strike", "flying", "physical", 60, null, 20, "A diving strike that never misses."),
  m("gale-slice", "Gale Slice", "flying", "special", 75, 95, 15, "A blade of wind. May flinch.", { flinch: 30 }),
  m("talon-dive", "Talon Dive", "flying", "physical", 110, 100, 15, "Dives talons-first; the user is hurt too.", { recoil: 1 / 3 }),
  m("updraft-plunge", "Updraft Plunge", "flying", "physical", 120, 95, 5, "Rides an updraft for a turn, then plunges. Crits easily.", { charge: true, highCrit: true }),
  m("squall-burst", "Squall Burst", "flying", "special", 110, 70, 10, "A violent squall. May confuse.", { confuse: 30 }),
  m("dust-flap", "Dust Flap", "flying", "status", 0, 100, 15, "Flaps up dust that lowers the target's accuracy.", { stat: foe({ acc: -1 }) }),
  m("preen", "Preen", "flying", "status", 0, null, 10, "Tends its feathers to restore half its max HP.", { heal: 0.5 }),

  // Psychic
  m("mind-prod", "Mind Prod", "psychic", "special", 40, 100, 25, "A prod of thought. May confuse.", { confuse: 10 }),
  m("thought-tap", "Thought Tap", "psychic", "physical", 40, 100, 25, "A tap guided by the mind."),
  m("psi-ripple", "Psi Ripple", "psychic", "special", 70, 100, 15, "Rippling psychic waves. May confuse.", { confuse: 10 }),
  m("trance-ram", "Trance Ram", "psychic", "physical", 80, 90, 15, "A ram from a focused trance. May flinch.", { flinch: 20 }),
  m("psi-lance", "Psi Lance", "psychic", "special", 100, 100, 10, "A lance of pure will. May lower Sp. Def.", { stat: foe({ spd: -1 }, 10) }),
  m("astral-crush", "Astral Crush", "psychic", "physical", 100, 90, 10, "Crushes with an unseen weight."),
  m("dream-lure", "Dream Lure", "psychic", "status", 0, 65, 20, "A swaying lure that puts the target to sleep.", { status: st("slp") }),
  m("clear-thought", "Clear Thought", "psychic", "status", 0, null, 20, "Clears its mind, raising Sp. Atk and Sp. Def.", { stat: self({ spa: 1, spd: 1 }) }),
  m("psi-shield", "Psi Shield", "psychic", "status", 0, null, 20, "A shield of thought that sharply raises Defense.", { stat: self({ def: 2 }) }),

  // Bug
  m("mandible-nip", "Mandible Nip", "bug", "physical", 40, 100, 30, "A nip of sharp mandibles."),
  m("drone-buzz", "Drone Buzz", "bug", "special", 40, 100, 30, "A droning buzz of wings."),
  m("swarm-jabs", "Swarm Jabs", "bug", "physical", 20, 95, 20, "Jabs two to five times like a swarm.", { hits: [2, 5] }),
  m("carapace-slash", "Carapace Slash", "bug", "physical", 70, 100, 20, "Slashes with a hard shell edge. Crits easily.", { highCrit: true }),
  m("wingdust-gale", "Wingdust Gale", "bug", "special", 75, 100, 15, "A gale of wing scales. May lower Sp. Atk.", { stat: foe({ spa: -1 }, 20) }),
  m("great-horn", "Great Horn", "bug", "physical", 110, 85, 10, "Gores with a great horn."),
  m("hive-beam", "Hive Beam", "bug", "special", 95, 100, 10, "A humming beam. May lower Sp. Def.", { stat: foe({ spd: -1 }, 10) }),
  m("silk-snare", "Silk Snare", "bug", "status", 0, 95, 40, "Snares the target in silk, sharply lowering Speed.", { stat: foe({ spe: -2 }) }),
  m("web-wrap", "Web Wrap", "bug", "physical", 30, 85, 15, "Wraps the target in web for several turns.", { bind: true }),
  m("molt", "Molt", "bug", "status", 0, null, 20, "Sheds its old shell, raising Defense and Speed.", { stat: self({ def: 1, spe: 1 }) }),

  // Rock
  m("pebble-pelt", "Pebble Pelt", "rock", "physical", 45, 95, 25, "Pelts the target with pebbles."),
  m("gravel-spray", "Gravel Spray", "rock", "special", 40, 100, 25, "Sprays a fan of gravel."),
  m("scree-barrage", "Scree Barrage", "rock", "physical", 25, 90, 15, "Hurls loose scree two to five times.", { hits: [2, 5] }),
  m("boulder-toss", "Boulder Toss", "rock", "physical", 75, 90, 15, "Throws a boulder. May flinch.", { flinch: 30 }),
  m("geode-beam", "Geode Beam", "rock", "special", 75, 100, 15, "A beam refracted through crystal."),
  m("landslide", "Landslide", "rock", "physical", 100, 85, 10, "Brings a slope of rock down. Crits easily.", { highCrit: true }),
  m("monolith-drop", "Monolith Drop", "rock", "physical", 120, 80, 5, "Drops a standing stone; the user is hurt too.", { recoil: 1 / 3 }),
  m("prism-blast", "Prism Blast", "rock", "special", 100, 95, 10, "Splits light through stone into a searing blast."),
  m("stone-skin", "Stone Skin", "rock", "status", 0, null, 15, "Hardens its hide to sharply raise Defense.", { stat: self({ def: 2 }) }),

  // Ghost
  m("chill-touch", "Chill Touch", "ghost", "physical", 40, 100, 30, "A cold, clammy touch. May paralyze.", { status: st("par", 30) }),
  m("spirit-flicker", "Spirit Flicker", "ghost", "special", 40, 100, 25, "A flicker of ghostly flame."),
  m("grave-gaze", "Grave Gaze", "ghost", "special", 0, 100, 15, "A dreadful gaze; damage equals the user's level.", { levelDamage: true }),
  m("gloom-claw", "Gloom Claw", "ghost", "physical", 70, 100, 15, "A claw of shadow. Crits easily.", { highCrit: true }),
  m("phantom-orb", "Phantom Orb", "ghost", "special", 80, 100, 15, "Hurls an orb of shade. May lower Sp. Def.", { stat: foe({ spd: -1 }, 20) }),
  m("specter-rend", "Specter Rend", "ghost", "physical", 100, 95, 10, "Tears at the spirit itself."),
  m("wraith-howl", "Wraith Howl", "ghost", "special", 100, 100, 10, "A howl from beyond. May make the target flinch.", { flinch: 10 }),
  m("eerie-light", "Eerie Light", "ghost", "status", 0, 100, 10, "A wavering light that confuses the target.", { confuse: 100 }),
  m("fade", "Fade", "ghost", "status", 0, null, 15, "Fades half from sight, raising evasiveness.", { stat: self({ eva: 1 }) }),

  // Dragon
  m("drake-nip", "Drake Nip", "dragon", "physical", 40, 100, 25, "A nip from scaled jaws."),
  m("wyrm-breath", "Wyrm Breath", "dragon", "special", 45, 100, 20, "A crackling breath. May paralyze.", { status: st("par", 20) }),
  m("scale-fury", "Scale Fury", "dragon", "special", 0, 100, 10, "A burst of fury that always deals 40 damage.", { fixed: 40 }),
  m("scale-rake", "Scale Rake", "dragon", "physical", 80, 100, 15, "Rakes with sharp scales."),
  m("wyrmwave", "Wyrmwave", "dragon", "special", 80, 100, 10, "A shockwave from the depths of the lungs."),
  m("cataclaw", "Cataclaw", "dragon", "physical", 115, 90, 10, "A world-splitting claw."),
  m("comet-roar", "Comet Roar", "dragon", "special", 120, 90, 5, "A roar like a falling comet. Sharply lowers the user's Sp. Atk.", { stat: self({ spa: -2 }) }),
  m("wyrm-glare", "Wyrm Glare", "dragon", "status", 0, 90, 20, "A serpent's glare that paralyzes.", { status: st("par") }),
  m("wyrm-dance", "Wyrm Dance", "dragon", "status", 0, null, 20, "A coiling dance that raises Attack and Speed.", { stat: self({ atk: 1, spe: 1 }) }),

  // Dark
  m("sly-nip", "Sly Nip", "dark", "physical", 40, 100, 25, "A sneaky nip. May make the target flinch.", { flinch: 10 }),
  m("ambush", "Ambush", "dark", "physical", 40, 100, 30, "Strikes from cover before the target can act.", undefined, 1),
  m("murk-pulse", "Murk Pulse", "dark", "special", 40, 100, 25, "A pulse of murk."),
  m("midnight-rake", "Midnight Rake", "dark", "physical", 75, 100, 15, "A rake in the dark. Crits easily.", { highCrit: true }),
  m("umbral-wave", "Umbral Wave", "dark", "special", 80, 100, 15, "A wave of shadow. May make the target flinch.", { flinch: 20 }),
  m("dread-maul", "Dread Maul", "dark", "physical", 100, 95, 10, "A savage mauling. May lower Defense.", { stat: foe({ def: -1 }, 20) }),
  m("abyss-blast", "Abyss Blast", "dark", "special", 100, 100, 10, "Fires a blast of pure dark."),
  m("menace", "Menace", "dark", "status", 0, 100, 20, "A menacing look that lowers Attack and Defense.", { stat: foe({ atk: -1, def: -1 }) }),
  m("dark-scheme", "Dark Scheme", "dark", "status", 0, null, 20, "Plots something wicked, sharply raising Sp. Atk.", { stat: self({ spa: 2 }) }),

  // Steel
  m("rivet-tap", "Rivet Tap", "steel", "physical", 40, 100, 30, "A tap like a riveting hammer."),
  m("chime-ray", "Chime Ray", "steel", "special", 40, 100, 30, "A ringing ray of metal sound."),
  m("gear-grind", "Gear Grind", "steel", "physical", 40, 90, 15, "Grinds the target twice with toothed gears.", { hits: [2, 2] }),
  m("alloy-fist", "Alloy Fist", "steel", "physical", 75, 95, 15, "A metal fist. May raise the user's Attack.", { stat: self({ atk: 1 }, 20) }),
  m("ferro-beam", "Ferro Beam", "steel", "special", 80, 100, 10, "A beam of magnetized iron filings."),
  m("anvil-drop", "Anvil Drop", "steel", "physical", 100, 90, 10, "Drops like an anvil. May flinch.", { flinch: 20 }),
  m("railgun", "Railgun", "steel", "special", 110, 85, 5, "Launches a slug of metal at terrible speed."),
  m("metal-squeal", "Metal Squeal", "steel", "status", 0, 85, 40, "A grating squeal that sharply lowers Defense.", { stat: foe({ def: -2 }) }),
  m("plate-up", "Plate Up", "steel", "status", 0, null, 15, "Locks its plates, sharply raising Defense.", { stat: self({ def: 2 }) }),
  m("bulwark", "Bulwark", "steel", "status", 0, null, 10, "Becomes an unbreakable wall this turn. Fails more if repeated.", { protect: true }, 4),

  // Fairy
  m("twinkle-tap", "Twinkle Tap", "fairy", "physical", 40, 100, 30, "A sparkling tap."),
  m("glimmer", "Glimmer", "fairy", "special", 40, 100, 30, "A burst of bright motes."),
  m("dewkiss", "Dewkiss", "fairy", "special", 50, 100, 10, "A kiss of dew that heals the user by most of the damage.", { drain: 0.75 }),
  m("pixie-rush", "Pixie Rush", "fairy", "physical", 75, 95, 15, "A giddy, sparkling rush. May lower Attack.", { stat: foe({ atk: -1 }, 10) }),
  m("lunar-chime", "Lunar Chime", "fairy", "special", 80, 100, 15, "A chime that rings like moonlight."),
  m("starfall", "Starfall", "fairy", "special", 100, 95, 10, "Calls down falling stars. May lower Sp. Atk.", { stat: foe({ spa: -1 }, 30) }),
  m("fable-smash", "Fable Smash", "fairy", "physical", 100, 90, 10, "A storybook smash. May lower Attack.", { stat: foe({ atk: -1 }, 10) }),
  m("doe-eyes", "Doe Eyes", "fairy", "status", 0, 100, 20, "Wide pleading eyes that sharply lower Attack.", { stat: foe({ atk: -2 }) }),
  m("moonbathe", "Moonbathe", "fairy", "status", 0, null, 10, "Bathes in moonlight to restore half its max HP.", { heal: 0.5 }),
];

/** The move used when every move is out of PP. Not learnable. */
export const STRUGGLE = m("struggle", "Desperation", "normal", "physical", 50, null, 1, "A desperate flail used when nothing else is left. Hurts the user.", { struggle: true });

/** @type {Map<string, Move>} */
export const MOVE_BY_ID = new Map([...MOVES, STRUGGLE].map((mv) => [mv.id, mv]));

/**
 * @param {string} id
 * @returns {Move}
 */
export function getMove(id) {
  const mv = MOVE_BY_ID.get(id);
  if (!mv) throw new Error(`unknown move ${id}`);
  return mv;
}
