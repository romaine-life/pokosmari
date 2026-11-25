// @ts-check
import { councilRoom } from "./_summit.js";

export default councilRoom({
  id: "summit-selene",
  name: "Selene's Hall",
  trainer: "council-selene",
  sprite: "council2",
  next: "summit-mordecai",
  blocked: "SELENE: I knew you'd\ntry that. The door\nknows too.",
});
