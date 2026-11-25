// @ts-check
import { mart } from "./_interiors.js";

const STOCK = ["capture-orb", "great-orb", "tonic", "tonic-plus", "antivenom", "burn-salve", "nerve-balm", "rouse-salts", "ward-mist", "homing-thread"];

export default mart("cinderford-mart", { map: "cinderford", x: 14, y: 13 }, STOCK, {
  npcs: [
    {
      id: "hiker", x: 5, y: 4, sprite: "hiker", move: "still", dir: "left",
      text: "A Homing Thread gets you out of a cave in a jiffy.\fEmber Grotto off Route 3 is a maze. Trust me.",
    },
  ],
});
