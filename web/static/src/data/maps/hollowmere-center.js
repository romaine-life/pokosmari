// @ts-check
import { center } from "./_interiors.js";

export default center("hollowmere-center", { map: "hollowmere", x: 4, y: 5 }, {
  npcs: [
    { id: "channeler", x: 7, y: 5, sprite: "channeler", move: "turn",
      text: "Ghosts shrug off normal and fighting moves. Dark moves though... eek!" },
  ],
});
