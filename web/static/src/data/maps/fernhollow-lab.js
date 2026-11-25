// @ts-check
// Professor Linden's lab: the three starter orbs, Kip's first battle, the parcel and the dex,
// and after the High Council an aide with the two starters the player didn't pick.

/** @typedef {import("../../script/context.js").ScriptContext} G */

const STARTERS = ["sproufawn", "flaropaw", "hydrefry"];
/** Kip takes the one strong against the player's (as the engine's rival species does). */
const RIVAL_OF = { sproufawn: "flaropaw", flaropaw: "hydrefry", hydrefry: "sproufawn" };
const NAME = { sproufawn: "Sproufawn", flaropaw: "Flaropaw", hydrefry: "Hydrefry" };
const BLURB = {
  sproufawn: "Sproufawn, the grass creature? A gentle fawn that grows tougher every season.",
  flaropaw: "Flaropaw, the fire creature? A spirited cub with a warm, crackling tail.",
  hydrefry: "Hydrefry, the water creature? A playful little fish with a fairy's sparkle.",
};
/** Where each orb sits on the table (x; y is 3). */
const ORB_X = { sproufawn: 4, flaropaw: 5, hydrefry: 6 };

/**
 * Talking to a starter orb: choose it, then Kip picks his and battles.
 * @param {G} g @param {"sproufawn"|"flaropaw"|"hydrefry"} species
 */
async function orb(g, species) {
  if (g.starter()) {
    await g.say("Linden: That one stays with me for now.\fSomebody has to keep an old professor company!");
    return;
  }
  if (!(await g.yesNo(`${BLURB[species]}\nWill you choose it?`))) return;
  await g.say(`Linden: ${NAME[species]} it is! A fine choice.`);
  if (!(await g.giveCreature(species, 5))) return;
  g.setFlag(`fern-orb-${species}`);
  g.setFlag("starter", species);

  // Kip takes the one strong against it.
  const his = RIVAL_OF[species];
  await g.say(`{RIVAL}: Then I'll take this one!`);
  await g.move("kip", `R${ORB_X[his] - 2}U`);
  g.face("kip", "up");
  g.setFlag(`fern-orb-${his}`);
  g.sfx("ball-click");
  await g.say(`{RIVAL} received ${NAME[his]}!`);
  await g.say("{RIVAL}: Ha! Mine's strong against yours, {PLAYER}. I checked.\fCome on, let's see whose is tougher!");
  await g.approach("kip");
  const won = await g.battle("kip-1", { canLose: true });
  if (won) {
    await g.say("{RIVAL}: No way! Okay, okay. Beginner's luck.\fI'm going to train until mine's the strongest in the Isles!");
  } else {
    await g.say("{RIVAL}: Yes! First battle, first win!\fDon't feel bad, {PLAYER}. Somebody had to lose.");
  }
  await g.say("{RIVAL}: See you out there. Try to keep up!");
  const kip = g.npc("kip");
  await g.move("kip", `D${Math.max(0, 10 - kip.y)}`);
  g.sfx("door");
  g.setFlag("fern-kip-left");
  await g.say("Linden: Ah, youth. That boy has never walked anywhere in his life.\fHere, let me patch your creature up after all that.");
  g.healParty();
  g.jingle("heal");
  await g.say("Linden: {PLAYER}, your creature grows by battling. Explore Route 1, north of town.\fAnd if you reach Brookside, the mart clerk there is holding a parcel of mine. Would you fetch it?");
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "fernhollow-lab",
  name: "Linden's Lab",
  theme: "indoor",
  music: "lab",
  indoor: true,
  rows: [
    "||||||||||||",
    "|bbbb__bbbb|",
    "|__________|",
    "|__x___x___|",
    "|__________|",
    "|__________|",
    "|p________p|",
    "|bb______bb|",
    "|__________|",
    "|__________|",
    "|____mm____|",
  ],
  spawns: {
    door: { x: 5, y: 10, dir: "up" },
  },
  warps: [
    { x: 5, y: 10, dir: "down", to: { map: "fernhollow", x: 9, y: 12 } },
    { x: 6, y: 10, dir: "down", to: { map: "fernhollow", x: 9, y: 12 } },
  ],
  npcs: [
    {
      id: "linden", x: 5, y: 2, sprite: "professor", move: "still",
      script: async (g) => {
        if (!g.starter()) {
          await g.say("Linden: Go on, {PLAYER}. Pick the one that speaks to you.");
          return;
        }
        if (g.has("lab-parcel")) {
          await g.say("Linden: My parcel from Brookside! Thank you, {PLAYER}.\fLet's see... yes! The new Creature Dex, fresh from the printer.");
          g.take("lab-parcel");
          await g.say("Linden: A dex records every creature you see and catch.\fMy dream is a complete record of every creature in the Osmari Isles.\fI'm far too old to tramp through tall grass. But you aren't!");
          await g.jingle("key-item");
          await g.say("{PLAYER} received the Creature Dex!");
          g.setFlag("dex");
          await g.say("Linden: You can't fill it without these. Weaken a wild creature, then throw one.");
          await g.give("capture-orb", 5);
          await g.say("Linden: One more thing. The Isles have eight Wardens, each keeping one of the old spires.\fBeat all eight and the High Council will hear your name.\fBrookside Spire will let you in now that you carry a dex. Good luck!");
          return;
        }
        if (!g.flag("dex")) {
          await g.say("Linden: Brookside is just north, past Route 1.\fThe mart clerk there is holding a parcel for me.");
          return;
        }
        if (g.flag("champion")) {
          await g.say("Linden: Champion of the Isles! And to think it started at this table.\fMy aide has something for you, {PLAYER}.");
          return;
        }
        const n = g.caughtCount();
        await g.say(`Linden: Let's see your dex... ${n} kind${n === 1 ? "" : "s"} caught!`);
        await g.say(n < 10 ? "Linden: A fine start. The woods past Brookside are full of bugs to catch."
          : n < 40 ? "Linden: Splendid! Every route has creatures you won't see anywhere else."
            : "Linden: Remarkable! You'll fill that dex before I finish my tea.");
      },
    },
    {
      id: "kip", x: 2, y: 5, sprite: "rival", dir: "right", move: "still", hideIf: "fern-kip-left",
      script: async (g) => {
        await g.say("{RIVAL}: Go on, pick one! I'll take mine after you.\fI'm generous like that.");
      },
    },
    { id: "orb-sproufawn", x: 4, y: 3, sprite: "itemball", hideIf: "fern-orb-sproufawn", script: (g) => orb(g, "sproufawn") },
    { id: "orb-flaropaw", x: 5, y: 3, sprite: "itemball", hideIf: "fern-orb-flaropaw", script: (g) => orb(g, "flaropaw") },
    { id: "orb-hydrefry", x: 6, y: 3, sprite: "itemball", hideIf: "fern-orb-hydrefry", script: (g) => orb(g, "hydrefry") },
    {
      id: "aide", x: 9, y: 8, sprite: "scientist", move: "turn",
      script: async (g) => {
        if (!g.flag("dex")) {
          await g.say("I'm one of the professor's aides. Creatures you catch go to the storage PC when your party is full.\fAny healing center's computer can reach it.");
          return;
        }
        await g.say("A wild creature is easier to catch when its health is low.\fSleep or paralysis helps even more!");
      },
    },
    {
      id: "gift-aide", x: 2, y: 8, sprite: "scientist", move: "still", showIf: "champion",
      script: async (g) => {
        if (g.flag("fern-aide-gift")) {
          await g.say("Those two are happy with you. I can tell.");
          return;
        }
        await g.say("Congratulations, Champion!\fThe professor kept these two safe for you. They've waited a long time to meet you.");
        for (const sp of STARTERS) {
          if (sp === g.starter() || g.flag(`fern-gift-${sp}`)) continue;
          if (!(await g.giveCreature(sp, 30))) return;
          g.setFlag(`fern-gift-${sp}`);
        }
        for (const sp of STARTERS) g.setFlag(`fern-orb-${sp}`);
        g.setFlag("fern-aide-gift");
        await g.say("Now your dex can hold all three. Take good care of them!");
      },
    },
  ],
  triggers: [
    {
      // The first step into the lab.
      x: 1, y: 9, w: 10, once: "fern-lab-intro", unless: "starter",
      script: async (g) => {
        await g.say("Linden: Ah, {PLAYER}! There you are.");
        await g.say("{RIVAL}: Finally! I've been here for hours!");
        await g.say("Linden: Twenty minutes, {RIVAL}.\fNow. On that table are three orbs, each holding a young creature.\fThey'll be your partners, so choose carefully.");
        await g.say("{RIVAL}: Hey! I was here first!");
        await g.say("Linden: Patience, {RIVAL}. {PLAYER} chooses first. Manners.");
      },
    },
  ],
};
