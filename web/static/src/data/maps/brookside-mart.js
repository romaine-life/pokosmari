// @ts-check
// Brookside's mart: the clerk hands over Linden's parcel to the first trainer from Fernhollow.
import { mart } from "./_interiors.js";

const STOCK = ["capture-orb", "tonic", "antivenom", "nerve-balm", "burn-salve", "ward-mist"];

export default mart("brookside-mart", { map: "brookside", x: 13, y: 12 }, STOCK, {
  clerk: async (g) => {
    if (g.starter() && !g.flag("early-parcel")) {
      await g.say("Oh! You're from Fernhollow, aren't you? You know Professor Linden?\fHis order came in this morning. Would you take it to him?");
      await g.give("lab-parcel");
      g.setFlag("early-parcel");
      await g.say("Thanks a bunch! Tell him it's still warm from the printer.");
      return;
    }
    await g.shop(STOCK);
  },
  npcs: [
    {
      id: "girl", x: 5, y: 4, sprite: "girl", move: "wander",
      text: "Antivenom for poison, Nerve Balm for paralysis...\fMom says always pack one of each!",
    },
  ],
});
