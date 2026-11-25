// @ts-check
import { councilRoom } from "./_summit.js";

export default councilRoom({
  id: "summit-brakka",
  name: "Brakka's Hall",
  trainer: "council-brakka",
  sprite: "council1",
  next: "summit-selene",
  blocked: "BRAKKA: Ho! Doors are\nfor winners! Beat me\nfirst!",
});
