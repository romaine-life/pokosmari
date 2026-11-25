// @ts-check
import { center } from "./_interiors.js";

export default center("frostmere-center", { map: "frostmere", x: 4, y: 14 }, {
  npcs: [
    { id: "skier", x: 2, y: 5, sprite: "ace-f", move: "wander",
      text: "Ice types hate fire,\nfighting, rock and\nsteel moves.\fYuki's spire is\nright across the\nsquare." },
  ],
});
