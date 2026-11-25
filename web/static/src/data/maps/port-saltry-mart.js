// @ts-check
import { mart } from "./_interiors.js";

export default mart("port-saltry-mart", { map: "port-saltry", x: 10, y: 5 },
  ["capture-orb", "great-orb", "tonic", "tonic-plus", "antivenom", "nerve-balm", "burn-salve", "rouse-salts", "ward-mist", "homing-thread"], {
    npcs: [
      { id: "lass", x: 5, y: 4, sprite: "lass", move: "wander",
        text: "Great Orbs catch things Capture Orbs miss. Worth it!" },
    ],
  });
