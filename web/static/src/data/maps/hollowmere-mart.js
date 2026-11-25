// @ts-check
import { mart } from "./_interiors.js";

export default mart("hollowmere-mart", { map: "hollowmere", x: 9, y: 5 },
  ["capture-orb", "great-orb", "tonic-plus", "mega-tonic", "antivenom", "nerve-balm", "burn-salve", "rouse-salts", "thaw-gel", "remedy-spray", "wake-bloom", "long-ward-mist", "homing-thread"], {
    npcs: [
      { id: "gentleman", x: 5, y: 4, sprite: "gentleman", move: "wander",
        text: "A Homing Thread leads you out of any cave. Handy in the dark!" },
    ],
  });
