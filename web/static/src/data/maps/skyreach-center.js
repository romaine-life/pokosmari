// @ts-check
import { center } from "./_interiors.js";

export default center("skyreach-center", { map: "skyreach", x: 14, y: 9 }, {
  npcs: [
    {
      id: "ace",
      x: 7,
      y: 5,
      sprite: "ace-m",
      move: "turn",
      text: "The Council fights back to back. No healing in between, but you can bring your own items.",
    },
  ],
});
