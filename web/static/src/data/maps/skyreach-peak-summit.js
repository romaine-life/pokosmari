// @ts-check
// Skyreach Summit: the last battle with Director Halvard. The Storm Bell rings and
// Trancedome wakes, calm. It stays at the summit until the player catches it. Halvard
// leaves the bell in the snow where he stood; the player carries it back to the
// Stillwater Shrine ("bell-recovered", then "bell-returned" there).

/** @type {import("../../world/map.js").Script} */
async function bell(g) {
  await g.say("The Storm Bell lies in the snow, quiet now.\fIt belongs back at the shrine in Hollowmere.");
  g.hide("bell");
  g.setFlag("bell-recovered");
  await g.give("storm-bell");
}

/** @type {import("../../world/map.js").Script} */
async function trancedome(g) {
  await g.say("Trancedome is\nwatching {PLAYER}\nquietly...");
  const res = await g.wild("trancedome", 45, { music: "battle-legend" });
  if (res === "caught") {
    g.setFlag("trancedome-caught");
  } else {
    await g.say("Trancedome settled\nback onto the\nsummit, calm as\fthe clear sky.");
  }
}

/** @type {import("../../world/map.js").Script} */
async function finale(g) {
  g.music("villain");
  await g.exclaim("halvard");
  await g.approach("halvard");
  await g.say("HALVARD: You climbed\nall this way. Good.\fLook. Up here, the\nclouds are below us.\fMy family read the\nIsles' weather for\nthree hundred years,\fand it never once\nlistened to us.\fToday it will. One\nring, and Trancedome\nwakes. One word, and\fit obeys.\fStep aside, or be\nthe last thing it\nsees before it does.");
  await g.battle("halvard-2");
  g.music("villain");
  await g.say("HALVARD: ...Beaten.\nAgain. By a child.\fThen let the bell\ndecide!");
  g.face("halvard", "up");
  await g.wait(20);
  g.sfx("hit-super");
  await g.say("Halvard swung the\nStorm Bell!\f...GONNNNG...");
  await g.wait(40);
  g.sfx("statup");
  g.setFlag("trancedome-awake");
  await g.wait(30);
  await g.say("The clouds parted.\nSomething vast and\ngentle settled\fonto the summit.");
  await g.say("HALVARD: Trancedome!\nI command you!\fI... command...\f...It isn't\nlistening. It's\njust... looking.\fNot angry. Not\nobedient. Calm.\fIt never needed a\nmaster. It only\nneeded to be left\falone. And I rang\nthe bell anyway.");
  g.face("halvard", "down");
  await g.say("HALVARD: {PLAYER}.\nThe Eclipse\nSyndicate is\ffinished. I'll tell\nthem so myself.\fI'm leaving the\nIsles. Look after\nit, and after them.\fBetter than I\nwould have.\fThe bell stays\nhere. Take it home\nto its shrine.");
  g.hide("halvard");
  g.sfx("door");
  g.setFlag("halvard-defeated");
  g.mapMusic();
  await g.say("Halvard walked off\ndown the mountain.\fThe storm over the\npeak is gone. The\nroad north is open.");
  await bell(g);
  await trancedome(g);
}

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "skyreach-peak-summit",
  name: "Skyreach Summit",
  theme: "snow",
  music: "snow",
  rows: [
    'TTTTTTTTTTTTTTTTTTTT',
    'TTTRRRnnnnnnnnRRRTTT',
    'TTRRnnnnnnnnnnnnRRTT',
    'TTRnnnnnnnnnnnnnnRTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTnnnnRnnnnnnRnnnnTT',
    'TTnnnnnnnnnnnnnnnnTT',
    'TTTnnnnnnnnnnnnnnTTT',
    'TTTTnnnnnnnnnnnnTTTT',
    'TTTTTnnnnnnnnnnTTTTT',
    'TTTTTTTnn::nnTTTTTTT',
    'TTTTTTTTn::nTTTTTTTT',
    'TTTTTTTTT::TTTTTTTTT',
  ],
  connections: { south: { map: "skyreach-peak", offset: 0 } },
  triggers: [
    { x: 2, y: 7, w: 16, h: 1, unless: "halvard-defeated", script: finale },
  ],
  npcs: [
    { id: "halvard", x: 9, y: 3, sprite: "boss", dir: "down", move: "still", hideIf: "halvard-defeated",
      script: finale },
    { id: "bell", x: 9, y: 3, sprite: "itemball", showIf: "halvard-defeated", hideIf: "bell-recovered",
      script: bell },
    { id: "trancedome", x: 9, y: 1, sprite: "creature", dir: "down", move: "still",
      showIf: "trancedome-awake", hideIf: "trancedome-caught", script: trancedome },
  ],
};
