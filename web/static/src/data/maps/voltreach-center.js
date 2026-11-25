// @ts-check
import { center } from "./_interiors.js";

export default center("voltreach-center", { map: "voltreach", x: 3, y: 5 }, {
  npcs: [
    { id: "gentleman", x: 7, y: 5, sprite: "gentleman", move: "turn",
      text: "Ozzie's creatures hate the ground. Ground types shrug off every spark." },
  ],
});
