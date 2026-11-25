// @ts-check
// Fernhollow: Kip's first battle, in the lab, right after the starters are chosen.

/** @type {import("./index.js").TrainerDef[]} */
export default [
  {
    id: "kip-1",
    name: "Kip",
    className: "Rival",
    sprite: "rival",
    party: [{ species: "@rival1", level: 5 }],
    intro: "{RIVAL}: Let's see whose creature is tougher!",
    defeat: "{RIVAL}: What?! I picked the strong one!",
    after: "{RIVAL}: Next time it's my win.",
    win: "{RIVAL}: Ha! Told you mine was tougher!",
  },
];
