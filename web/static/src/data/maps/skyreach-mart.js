// @ts-check
import { mart } from "./_interiors.js";

export default mart(
  "skyreach-mart",
  { map: "skyreach", x: 13, y: 15 },
  ["prime-orb", "great-orb", "grand-tonic", "mega-tonic", "panacea", "wake-bloom", "remedy-spray", "long-ward-mist", "homing-thread"],
  {
    npcs: [
      {
        id: "lass",
        x: 5,
        y: 4,
        sprite: "lass",
        move: "turn",
        text: "Wake Blooms! Lots of Wake Blooms! The Council won't wait for you to cry.",
      },
    ],
  },
);
