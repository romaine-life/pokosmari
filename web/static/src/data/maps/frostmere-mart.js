// @ts-check
import { mart } from "./_interiors.js";

export default mart("frostmere-mart", { map: "frostmere", x: 9, y: 15 },
  ["great-orb", "prime-orb", "mega-tonic", "grand-tonic", "thaw-gel", "remedy-spray", "wake-bloom", "long-ward-mist", "homing-thread", "focus-drop"],
  {
    npcs: [
      { id: "hiker", x: 5, y: 4, sprite: "hiker", move: "wander",
        text: "Stock up before the\npeak. There's no\nshop up there,\fjust wind." },
    ],
  });
