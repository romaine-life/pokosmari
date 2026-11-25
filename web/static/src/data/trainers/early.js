// @ts-check
// Route 1 to Route 3: the first two spires and their Wardens, Whisper Woods' bug catchers and
// Syndicate grunts, Kip's second battle and Ember Grotto.

/** @type {import("./index.js").TrainerDef[]} */
export default [
  // Route 1 (wild 2-4)
  {
    id: "route1-mira", name: "Mira", className: "Lass", sprite: "lass",
    party: [{ species: "leafonit", level: 4 }, { species: "nibakit", level: 5 }],
    intro: "You just started too? Perfect! Let's be beginners together!",
    defeat: "Okay, you're less of a beginner than me.",
    after: "I'm going to name my next creature after you. If I catch one.",
  },
  {
    id: "route1-ned", name: "Ned", className: "Youngster", sprite: "youngster",
    party: [{ species: "dappocub", level: 5 }, { species: "skyjay", level: 4 }],
    intro: "Hey! New face! My Dappocub needs the practice!",
    defeat: "Aw, Dappocub needs a nap now.",
    after: "Dappocub's been training since breakfast. And second breakfast.",
  },

  // Brookside Spire (Tamsin, grass)
  {
    id: "bspire-hollis", name: "Hollis", className: "Gardener", sprite: "hiker",
    party: [{ species: "verdapup", level: 9 }, { species: "leafonit", level: 9 }],
    intro: "Weeds don't pull themselves! Neither do challengers!",
    defeat: "Uprooted. Fair and square.",
    after: "Tamsin's been tending this spire since before I could hold a trowel.",
  },
  {
    id: "bspire-wren", name: "Wren", className: "Picnicker", sprite: "lass",
    party: [{ species: "leafonit", level: 9 }, { species: "sprounip", level: 11 }],
    intro: "Shh! The flowers are listening. Let's give them a show!",
    defeat: "The flowers are clapping. For you, sadly.",
    after: "Tamsin's leafy ace is fast. Don't let it sap your strength!",
  },
  {
    id: "tamsin", name: "Tamsin", className: "Warden", sprite: "warden1", ai: "smart",
    items: { tonic: 2 },
    party: [{ species: "leafonit", level: 10 }, { species: "verdapup", level: 11 }, { species: "leafomoth", level: 13 }],
    intro: "Roots hold fast through any storm. Let's see if yours do!",
    defeat: "My garden bows to you. Beautifully done.",
    after: "The guard at Whisper Woods will let you through now.",
  },

  // Whisper Woods (wild 5-10)
  {
    id: "ww-bug-tobi", name: "Tobi", className: "Bug Catcher", sprite: "bugcatcher",
    party: [{ species: "gnateworm", level: 7 }, { species: "gnateworm", level: 7 }, { species: "gnatoglop", level: 8 }],
    intro: "Don't move! You'll scare the bugs! ...Too late. Battle!",
    defeat: "My bugs scattered everywhere!",
    after: "Bugs grow up fast. Mine will be huge by next week. Probably.",
  },
  {
    id: "ww-bug-pell", name: "Pell", className: "Bug Catcher", sprite: "bugcatcher",
    party: [{ species: "beetloworm", level: 9 }, { species: "buzzimite", level: 9 }],
    intro: "Ow! Buzzimite stung me again! Let it sting you instead!",
    defeat: "Ow! Ow. Okay, you win.",
    after: "Buzzimite is part fire. Watch out, its sting is hot!",
  },
  {
    id: "ww-bug-sasha", name: "Sasha", className: "Bug Catcher", sprite: "bugcatcher",
    party: [{ species: "gnateworm", level: 9 }, { species: "beetloworm", level: 10 }, { species: "gnatoglop", level: 11 }],
    intro: "I've caught every bug in these woods! Well, most of them!",
    defeat: "I should have caught a few more.",
    after: "The exit to Route 2 is just north. The bugs thin out after that.",
  },
  {
    id: "ww-grunt-1", name: "Dax", className: "Grunt", sprite: "grunt-m",
    party: [{ species: "toxibean", level: 10 }, { species: "crowonip", level: 12 }],
    intro: "This is Eclipse Syndicate business, kid. Walk away!",
    defeat: "Ugh! The Director won't like this.",
    after: "You don't know who you're messing with. The Syndicate never forgets.",
  },
  {
    id: "ww-grunt-2", name: "Vell", className: "Grunt", sprite: "grunt-f",
    party: [{ species: "toxibean", level: 11 }, { species: "vennibit", level: 12 }],
    intro: "Those notes belong to the Syndicate now. Want to argue?",
    defeat: "Fine! Keep your stupid notes!",
    after: "When the guardian wakes, you'll wish you'd stayed home.",
  },

  // Route 2 (wild 9-13)
  {
    id: "route2-oda", name: "Oda", className: "Black Belt", sprite: "blackbelt",
    party: [{ species: "dojopupa", level: 14 }, { species: "mopip", level: 15 }],
    intro: "Hup! Every battle is training! Hyah!",
    defeat: "Hoo! A worthy opponent!",
    after: "Dojopupa trains inside its shell. Discipline, from the very start!",
  },
  {
    id: "route2-cole", name: "Cole", className: "Hiker", sprite: "hiker",
    party: [{ species: "mopip", level: 12 }, { species: "granagrub", level: 13 }],
    intro: "Climbed down from the volcano just for this! Battle me!",
    defeat: "Whew! Back up the mountain I go.",
    after: "Cinderford's just north. The hot springs fix everything. Except losing.",
  },
  {
    id: "route2-juno", name: "Juno", className: "Lass", sprite: "lass",
    party: [{ species: "nibakit", level: 13 }, { species: "wispuguppy", level: 13 }],
    intro: "Ooh, you came through the woods? Show me what you caught!",
    defeat: "Your creatures are cuter than I thought. And tougher!",
    after: "Nibakit changes with a special stone, not by training. Isn't that neat?",
  },
  {
    id: "route2-brin", name: "Brin", className: "Camper", sprite: "boy",
    party: [{ species: "dappocub", level: 12 }, { species: "verdapup", level: 12 }, { species: "voltupupa", level: 14 }],
    intro: "I set up camp right here so I could battle everyone. Including you!",
    defeat: "My tent's still standing, at least.",
    after: "A kid ran by earlier, bragging. He said he was waiting for someone.",
  },
  {
    id: "kip-2", name: "Kip", className: "Rival", sprite: "rival",
    party: [{ species: "skyjay", level: 12 }, { species: "dappocub", level: 13 }, { species: "@rival1", level: 15 }],
    intro: "{RIVAL}: Ready for a rematch? I've been training nonstop!",
    defeat: "{RIVAL}: Again?! How do you keep doing that?!",
    after: "{RIVAL}: Next time, {PLAYER}. Next time for sure.",
    win: "{RIVAL}: Ha! Told you I'd gotten stronger!",
  },

  // Cinderford Spire (Bram, fire)
  {
    id: "cspire-flint", name: "Flint", className: "Stoker", sprite: "worker",
    party: [{ species: "pyrapip", level: 15 }, { species: "dunulump", level: 16 }],
    intro: "Shovel coal, battle challengers, shovel more coal! Let's go!",
    defeat: "Phew. I need a break from the heat.",
    after: "Bram's creatures never cool down. Bring water if you've got it.",
  },
  {
    id: "cspire-ash", name: "Ash", className: "Beauty", sprite: "beauty",
    party: [{ species: "buzzimite", level: 16 }, { species: "kindlacada", level: 16 }],
    intro: "The heat here is wonderful for the skin. And for battling!",
    defeat: "Oh dear. I'm all flushed.",
    after: "Bram's ace is a real hothead. Just like him.",
  },
  {
    id: "bram", name: "Bram", className: "Warden", sprite: "warden2", ai: "smart",
    items: { tonic: 2 },
    party: [{ species: "pyrapip", level: 15 }, { species: "buzzimite", level: 16 }, { species: "pyrakid", level: 18 }],
    intro: "Show me you won't melt!",
    defeat: "Ha ha! You've got fire of your own!",
    after: "Go and see Old Hazel by the spire. She has something for you.",
  },

  // Route 3 (wild 13-17)
  {
    id: "route3-lark", name: "Lark", className: "Hiker", sprite: "hiker",
    party: [{ species: "granagrub", level: 15 }, { species: "dunulump", level: 16 }],
    intro: "You cleared the saplings? Then you can clear me! Maybe!",
    defeat: "I've been cleared.",
    after: "Ember Grotto's up north on this trail. Granagrubs everywhere in there.",
  },
  {
    id: "route3-pip", name: "Pip", className: "Youngster", sprite: "youngster",
    party: [{ species: "voltupupa", level: 15 }, { species: "dappocub", level: 15 }, { species: "mopip", level: 16 }],
    intro: "I've got three creatures now! Three! Wanna see?",
    defeat: "Three wasn't enough...",
    after: "I'm going to catch a fourth. Then nobody can stop me.",
  },
  {
    id: "route3-tess", name: "Tess", className: "Lass", sprite: "lass",
    party: [{ species: "wispuguppy", level: 16 }, { species: "nibakit", level: 17 }],
    intro: "I'm walking to Port Saltry to see the sea! But first, you!",
    defeat: "I can almost smell the sea air. And defeat.",
    after: "Port Saltry has boats and fishers and a spire right on the water!",
  },
  {
    id: "route3-gus", name: "Gus", className: "Black Belt", sprite: "blackbelt",
    party: [{ species: "dojopupa", level: 17 }, { species: "mopip", level: 18 }],
    intro: "I punch saplings for training! You're next!",
    defeat: "My fists are tired. My heart is not!",
    after: "A Brush Cutter? That's cheating. Effective, though.",
  },
  {
    id: "route3-nadia", name: "Nadia", className: "Beauty", sprite: "beauty",
    party: [{ species: "toxibean", level: 16 }, { species: "beetloworm", level: 17 }, { species: "buzzimite", level: 18 }],
    intro: "Leaving so soon? Not without a battle, darling.",
    defeat: "Well! Port Saltry won't know what hit it.",
    after: "Port Saltry's just east. I hear the Syndicate's been seen at the docks.",
  },

  // Ember Grotto (wild 14-18)
  {
    id: "grotto-odo", name: "Odo", className: "Hiker", sprite: "hiker",
    party: [{ species: "granagrub", level: 17 }, { species: "dunulump", level: 18 }],
    intro: "It's toasty down here! Let's warm up with a battle!",
    defeat: "I'm all steamed up!",
    after: "There's a strange humming stone somewhere in here. Makes certain creatures change!",
  },
];
