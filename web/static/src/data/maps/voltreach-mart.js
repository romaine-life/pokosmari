// @ts-check
import { mart } from "./_interiors.js";

export default mart("voltreach-mart", { map: "voltreach", x: 11, y: 5 },
  ["capture-orb", "great-orb", "tonic-plus", "mega-tonic", "antivenom", "nerve-balm", "burn-salve", "rouse-salts", "thaw-gel", "remedy-spray", "long-ward-mist", "homing-thread"], {
    npcs: [
      { id: "worker", x: 5, y: 4, sprite: "worker", move: "wander",
        text: "Nerve Balm fixes paralysis. Stock up before the spire!" },
    ],
  });
