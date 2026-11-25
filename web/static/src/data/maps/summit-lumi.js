// @ts-check
import { councilRoom } from "./_summit.js";

export default councilRoom({
  id: "summit-lumi",
  name: "Lumi's Hall",
  trainer: "council-lumi",
  sprite: "council4",
  next: "summit-champion",
  blocked: "LUMI: Nuh-uh! Battle\nfirst, door after!",
});
