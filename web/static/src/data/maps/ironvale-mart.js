// @ts-check
import { mart } from "./_interiors.js";

export default mart("ironvale-mart", { map: "ironvale", x: 12, y: 15 },
  ["great-orb", "prime-orb", "tonic-plus", "mega-tonic", "remedy-spray", "wake-bloom", "ward-mist", "long-ward-mist", "homing-thread"],
  {
    npcs: [
      { id: "lass", x: 4, y: 4, sprite: "lass", move: "wander",
        text: "A Homing Thread\npulls you out of a\ncave in a snap.\fHandy in that\nmine!" },
    ],
  });
