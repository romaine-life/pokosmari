// @ts-check
import { center } from "./_interiors.js";

export default center("ironvale-center", { map: "ironvale", x: 4, y: 14 }, {
  npcs: [
    { id: "worker", x: 7, y: 5, sprite: "worker", move: "wander",
      text: "A shift in the mine\nand a stop here.\nBest routine there\fis!" },
  ],
});
