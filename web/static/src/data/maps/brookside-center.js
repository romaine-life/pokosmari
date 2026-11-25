// @ts-check
import { center } from "./_interiors.js";

export default center("brookside-center", { map: "brookside", x: 5, y: 12 }, {
  npcs: [
    {
      id: "hiker", x: 7, y: 6, sprite: "hiker", move: "wander",
      text: "The computer over there is the storage PC.\fCatch more than six and the rest wait in there for you.",
    },
  ],
});
