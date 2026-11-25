// @ts-check
import { center } from "./_interiors.js";

export default center("port-saltry-center", { map: "port-saltry", x: 4, y: 5 }, {
  npcs: [
    { id: "sailor", x: 7, y: 5, sprite: "sailor", move: "turn",
      text: "Old Gus the fisher lives by the dock. He hands out rods to anyone who'll listen to his stories." },
  ],
});
