// The opening plays like a person would play it, headless (test/harness): title, new game,
// naming, out of the bedroom, into the lab, a starter chosen and the first battle with the
// rival fought, with no errors on the way.

import { test } from "node:test";
import assert from "node:assert/strict";
import { startGame } from "./harness/headless.mjs";

test("a new game reaches the first rival battle", async () => {
  const g = await startGame({ seed: 7 });
  const { game, world } = g;
  await g.wait(10);
  await g.press("start");
  await g.press("a"); // NEW GAME
  // Through the professor's welcome to the naming screen, then names typed and confirmed.
  for (let i = 0; i < 60 && game.state?.name === ""; i++) {
    if (!g.text() && game.layers.length > 2) {
      await g.type(game.state.rival === "Kip" && !game.state.name ? "Nel" : "Kip");
      await g.press("start");
    } else await g.press("a");
  }
  for (let i = 0; i < 80 && !world.map; i++) {
    if (!g.text() && game.layers.length > 2) await g.press("start");
    else await g.press("a");
  }
  assert.equal(world.map?.id, "fernhollow-home");
  assert.equal(game.state.name, "Nel");

  // Out of the house: down to the mat and through the door, talking through anything said.
  for (let i = 0; i < 20 && world.map.id === "fernhollow-home"; i++) {
    await g.hold("down", 18);
    for (let k = 0; k < 8 && g.text(); k++) await g.press("a");
  }
  assert.equal(world.map.id, "fernhollow");

  // The lab: warp to its door the way walking in would, then play the scene.
  const lab = world.map.def.buildings.find((b) => b.to.map === "fernhollow-lab");
  const warped = game.run(() => world.warp(lab.to, "door"), "lab");
  for (let i = 0; i < 120; i++) await g.wait(1);
  await warped;
  for (let n = 0; n < 500 && !game.state.flags["fern-kip-left"]; n++) {
    await g.press("a");
    if (!game.busy && !g.text()) await g.hold("up", 17);
  }
  assert.ok(game.state.flags.starter, "a starter was chosen");
  assert.equal(game.state.party.length, 1);
  assert.ok(game.state.flags["fern-kip-left"], "the rival battle was fought and Kip left");
  assert.deepEqual(g.errors, []);
});
