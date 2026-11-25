// @ts-check
// The middle of the Isles: Port Saltry, the sea route, Voltreach, route 5, Hollowmere Cave
// and Hollowmere (docs/world.md rows 10-19).

/** @type {import("./index.js").TrainerDef[]} */
export default [
  // saltry-warehouse: the Syndicate holding the docks
  {
    id: "saltry-grunt-1", name: "Grunt", className: "Grunt", sprite: "grunt-m",
    party: [{ species: "toxibean", level: 19 }, { species: "crowonip", level: 19 }],
    intro: "Hey! This warehouse is Syndicate property now!",
    defeat: "Ow! Rude!",
    after: "The admin's in the back. Not that you'll get far.",
  },
  {
    id: "saltry-grunt-2", name: "Grunt", className: "Grunt", sprite: "grunt-f",
    party: [{ species: "slatafry", level: 20 }, { species: "vennibit", level: 20 }],
    intro: "Lost, kid? The fish market's the other way!",
    defeat: "Hmph. Lucky.",
    after: "We only wanted the port's boats. And its bikes. And...",
  },
  {
    id: "saltry-grunt-3", name: "Grunt", className: "Grunt", sprite: "grunt-m",
    party: [{ species: "umbrapup", level: 21 }],
    intro: "Nobody gets past me! I'm guarding these crates!",
    defeat: "My crates...",
    after: "Inside the crates? More crates. Don't ask.",
  },
  {
    id: "saltry-grunt-4", name: "Grunt", className: "Grunt", sprite: "grunt-f",
    party: [{ species: "toxibean", level: 20 }, { species: "slatafry", level: 21 }],
    intro: "The Eclipse Syndicate rises! And you fall!",
    defeat: "We... set?",
    after: "That slogan needs work, huh.",
  },
  {
    id: "saltry-admin", name: "Marlow", className: "Admin", sprite: "grunt-m", ai: "smart",
    party: [{ species: "toxisquish", level: 22 }, { species: "slatapike", level: 22 }, { species: "crowothane", level: 24 }],
    items: { tonic: 1 },
    intro: "You beat my grunts? Then I'll sink you myself!",
    defeat: "Tch. The Director won't like this.",
    after: "Fine. Take the Warden's key.",
  },

  // port-saltry-spire
  {
    id: "saltry-spire-1", name: "Coral", className: "Swimmer", sprite: "swimmer",
    party: [{ species: "brinip", level: 21 }, { species: "splasiray", level: 22 }],
    intro: "Nerys trains us in the deep end. Ready to splash?",
    defeat: "Glub!",
    after: "Water beats fire, but lightning beats water. Remember!",
  },
  {
    id: "saltry-spire-2", name: "Hal", className: "Sailor", sprite: "sailor",
    party: [{ species: "wavapaw", level: 22 }, { species: "umbrapup", level: 22 }],
    intro: "Ahoy! You'll have to sail past me first!",
    defeat: "Sunk!",
    after: "Nerys reads the tides like a book. Good luck up there.",
  },
  {
    id: "nerys", name: "Nerys", className: "Warden", sprite: "warden3", ai: "expert",
    party: [
      { species: "splasiray", level: 21 },
      { species: "wavaboar", level: 22 },
      { species: "rippleray", level: 22 },
      { species: "brinapard", level: 24 },
    ],
    items: { "tonic-plus": 2 },
    intro: "I'm Nerys, Warden of the Tide Spire. Show me your tide!",
    defeat: "The tide turns... and it turned for you.",
    after: "Ride the sea with the Tide Board. The isles open up.",
    win: "The sea is patient. Come back stronger.",
  },

  // route-4: the sea route
  {
    id: "route4-swimmer-1", name: "Finn", className: "Swimmer", sprite: "swimmer",
    party: [{ species: "brinip", level: 20 }, { species: "brinip", level: 21 }],
    intro: "I swam here from Port Saltry! Now I'm bored. Battle!",
    defeat: "Out of breath...",
    after: "Fish bite more in the deep blue. Got a rod?",
  },
  {
    id: "route4-swimmer-2", name: "Marina", className: "Swimmer", sprite: "swimmer",
    party: [{ species: "splasiray", level: 22 }],
    intro: "The water's lovely! Your battling, we'll see.",
    defeat: "Splash!",
    after: "Splasirays glide so gracefully. I want to be one.",
  },
  {
    id: "route4-swimmer-3", name: "Dory", className: "Swimmer", sprite: "swimmer",
    party: [{ species: "voltosquid", level: 21 }, { species: "wavapaw", level: 21 }],
    intro: "Careful! My squid sparks in the water!",
    defeat: "Zapped myself...",
    after: "Voltreach is just east. Everything there hums.",
  },
  {
    id: "route4-swimmer-4", name: "Gil", className: "Swimmer", sprite: "swimmer",
    party: [{ species: "rippleray", level: 23 }, { species: "wavaboar", level: 23 }],
    intro: "I train every day between these islets!",
    defeat: "My stroke is off!",
    after: "Your rival went by on the ferry. Show-off.",
  },
  {
    id: "route4-sailor-1", name: "Rudd", className: "Sailor", sprite: "sailor",
    party: [{ species: "pudutick", level: 21 }, { species: "brinapard", level: 22 }],
    intro: "Landlubber on my islet? Arr, battle!",
    defeat: "Shipwrecked!",
    after: "Islet grass hides all sorts. Even fluffy ones.",
  },
  {
    id: "route4-sailor-2", name: "Brine", className: "Sailor", sprite: "sailor",
    party: [{ species: "plumawing", level: 22 }, { species: "umbrapup", level: 22 }, { species: "brinapard", level: 23 }],
    intro: "Thirty years at sea and I still love a scrap!",
    defeat: "Ho! Fair winds to ya.",
    after: "The landing east leads to Voltreach.",
  },
  {
    id: "kip-3", name: "Kip", className: "Rival", sprite: "rival", ai: "smart",
    party: [
      { species: "crowothane", level: 22 },
      { species: "mudofawn", level: 21 },
      { species: "voltucada", level: 23 },
      { species: "@rival2", level: 25 },
    ],
    items: { tonic: 1 },
    intro: "{PLAYER}! Took you long enough!",
    defeat: "Whoa! You've got sea legs now, huh?",
    after: "Next time I'll win. Probably.",
    win: "Ha! Told you I'd get here first!",
    music: "battle-trainer",
  },

  // voltreach-spire
  {
    id: "volt-spire-1", name: "Tesla", className: "Scientist", sprite: "scientist",
    party: [{ species: "ampup", level: 25 }, { species: "voltucada", level: 26 }],
    intro: "Hypothesis: you lose. Let's test it!",
    defeat: "Data inconclusive!",
    after: "Ozzie's creatures hate ground types. Just saying.",
  },
  {
    id: "volt-spire-2", name: "Watts", className: "Scientist", sprite: "scientist",
    party: [{ species: "voltosquid", level: 26 }, { species: "ampoboar", level: 26 }],
    intro: "Mind the cables! And mind me!",
    defeat: "Short circuit!",
    after: "Ozzie built half this spire himself. The other half is duct tape.",
  },
  {
    id: "ozzie", name: "Ozzie", className: "Warden", sprite: "warden4", ai: "expert",
    party: [
      { species: "voltucada", level: 26 },
      { species: "ampoboar", level: 27 },
      { species: "voltosquid", level: 26 },
      { species: "voltomaw", level: 29 },
    ],
    items: { "tonic-plus": 2, "nerve-balm": 1 },
    intro: "Ozzie here! Let's make some sparks!",
    defeat: "Overloaded! Ha, that was electric!",
    after: "Go see Dr. Elm at the lab. She has something bright for you.",
    win: "Recharge and come back anytime!",
  },

  // route-5
  {
    id: "route5-youngster", name: "Theo", className: "Youngster", sprite: "youngster",
    party: [{ species: "pudutick", level: 24 }, { species: "ampup", level: 25 }],
    intro: "My shorts are comfy and my team is strong!",
    defeat: "My comfy shorts!",
    after: "There's a cave up north. It's SO dark in there.",
  },
  {
    id: "route5-lass", name: "Poppy", className: "Lass", sprite: "lass",
    party: [{ species: "piplop", level: 25 }, { species: "clovepip", level: 25 }],
    intro: "Aren't my creatures cute? Cute AND tough!",
    defeat: "Not cute enough!",
    after: "Piplops love the flowers here.",
  },
  {
    id: "route5-bugcatcher", name: "Nim", className: "Bug Catcher", sprite: "bugcatcher",
    party: [{ species: "gnateslith", level: 25 }, { species: "beetlonaga", level: 26 }],
    intro: "I came for bugs. I found you. Close enough!",
    defeat: "Squashed...",
    after: "Bugs don't live in the pond. I checked. Twice.",
  },
  {
    id: "route5-beauty", name: "Lena", className: "Beauty", sprite: "beauty",
    party: [{ species: "sprounip", level: 26 }, { species: "plumawing", level: 26 }, { species: "cosmustag", level: 26 }],
    intro: "A battle on a lovely day? Why not!",
    defeat: "How unlovely.",
    after: "A Bloomstone makes Sprounip bloom. Isn't that sweet?",
  },
  {
    id: "route5-hiker", name: "Burl", className: "Hiker", sprite: "hiker",
    party: [{ species: "ampup", level: 26 }, { species: "granagrub", level: 26 }, { species: "vennibit", level: 27 }],
    intro: "Ho! Heading for the cave? Prove you're tough!",
    defeat: "Rockslide of a battle!",
    after: "Don't go in that cave without a light!",
  },

  // hollowmere-cave
  {
    id: "cave-hiker-1", name: "Dirk", className: "Hiker", sprite: "hiker",
    party: [{ species: "ampoboar", level: 27 }, { species: "granamoth", level: 27 }],
    intro: "Who's that? Can't see a thing! Let's battle anyway!",
    defeat: "Lost in the dark!",
    after: "The ladders go down to the lake floor.",
  },
  {
    id: "cave-channeler", name: "Morwen", className: "Channeler", sprite: "channeler",
    party: [{ species: "booling", level: 27 }, { species: "murkasp", level: 28 }],
    intro: "The spirits of the cave whisper... they say FIGHT!",
    defeat: "The spirits sigh...",
    after: "Hollowmere is near. The mist there never lifts.",
  },
  {
    id: "cave-hiker-2", name: "Gordo", className: "Hiker", sprite: "hiker",
    party: [{ species: "slatapike", level: 28 }, { species: "ampoboar", level: 28 }, { species: "vennichamp", level: 28 }],
    intro: "Down here I'm the king of the dark!",
    defeat: "Dethroned...",
    after: "The ladder in the far corner goes up to the north exit.",
  },
  {
    id: "cave-psychic", name: "Iris", className: "Psychic", sprite: "psychic",
    party: [{ species: "cosmustag", level: 28 }, { species: "luminik", level: 29 }],
    intro: "I foresaw you. Also, your light is in my eyes.",
    defeat: "Didn't see that coming.",
    after: "I sense something stolen soon. A bell... how odd.",
  },

  // hollowmere-shrine
  {
    id: "hollowmere-admin", name: "Sable", className: "Admin", sprite: "grunt-f", ai: "smart",
    party: [{ species: "umbrastag", level: 29 }, { species: "toxisquish", level: 29 }, { species: "crowothane", level: 31 }],
    items: { "tonic-plus": 1 },
    intro: "Keep up if you can, kid!",
    defeat: "You're good. But this was never the point.",
    after: "Bye now!",
    win: "Stay down, kid. The bell is ours.",
  },

  // hollowmere-spire
  {
    id: "mere-spire-1", name: "Agnes", className: "Channeler", sprite: "channeler",
    party: [{ species: "booling", level: 30 }, { species: "booladder", level: 31 }],
    intro: "Do you feel the chill? That's my team.",
    defeat: "Brrr... I'm the cold one now.",
    after: "Normal moves pass right through ghosts.",
  },
  {
    id: "mere-spire-2", name: "Silas", className: "Psychic", sprite: "psychic",
    party: [{ species: "murkasp", level: 31 }, { species: "cosmustag", level: 31 }],
    intro: "Vesper sees what others can't. I see you losing.",
    defeat: "My vision failed...",
    after: "Dark moves scare ghosts silly.",
  },
  {
    id: "vesper", name: "Vesper", className: "Warden", sprite: "warden5", ai: "expert",
    party: [
      { species: "murkasp", level: 31 },
      { species: "booladder", level: 32 },
      { species: "umbrastag", level: 31 },
      { species: "wispogolem", level: 34 },
    ],
    items: { "mega-tonic": 2 },
    intro: "Show me your strength. My spirits are waiting.",
    defeat: "The mist clears. You are ready.",
    after: "The road east leads to Ironvale. Follow the bell.",
    win: "Rest, and return. The spirits will wait.",
  },
];
