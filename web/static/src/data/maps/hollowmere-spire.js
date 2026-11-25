// @ts-check
// The Mist Spire: Warden Vesper (ghost). Her badge ("middle:badge-vesper") opens the road
// east to Route 6.

/** @type {import("../../world/map.js").MapDef} */
export default {
  id: "hollowmere-spire",
  name: "Mist Spire",
  theme: "spire",
  music: "spire",
  indoor: true,
  rows: [
    "%%%%%%%%%%",
    "%%%####%%%",
    "%%%####%%%",
    "%########%",
    "%%%%%%%%#%",
    "%########%",
    "%#%%%%#%%%",
    "%########%",
    "%%%#%%%%#%",
    "%########%",
    "%%%%##%%%%",
    "%########%",
    "%########%",
    "%%%%mm%%%%",
  ],
  spawns: { door: { x: 4, y: 13, dir: "up" } },
  warps: [
    { x: 4, y: 13, dir: "down", to: { map: "hollowmere", x: 15, y: 5 } },
    { x: 5, y: 13, dir: "down", to: { map: "hollowmere", x: 15, y: 5 } },
  ],
  npcs: [
    { id: "guide", x: 6, y: 12, sprite: "gentleman", dir: "left", move: "still",
      text: "H-hello, challenger.\fVesper's ghosts ignore normal and fighting moves. Dark moves work wonders. Brr!" },
    { id: "channeler", x: 3, y: 8, sprite: "channeler", dir: "up", move: "still", trainer: "mere-spire-1", sight: 1 },
    { id: "psychic", x: 6, y: 6, sprite: "psychic", dir: "down", move: "still", trainer: "mere-spire-2", sight: 1 },
    {
      id: "vesper", x: 4, y: 1, sprite: "warden5", dir: "down", move: "still",
      script: async (g) => {
        if (g.state.badges.includes("vesper")) {
          if (!g.flag("middle:badge-vesper")) g.setFlag("middle:badge-vesper");
          await g.say("The Syndicate fled east with the bell, toward Ironvale.\fThe road is yours now. Follow the bell.");
          return;
        }
        await g.say("...You came from the shrine. I felt the bell go silent.\fThe Syndicate wants Trancedome. You'll need strength to stop them.\fShow me that strength. My spirits are waiting.");
        if (!(await g.battle("vesper"))) return;
        await g.say("The mist clears. You are ready.");
        await g.badge("vesper", "Mistveil Badge");
        g.setFlag("middle:badge-vesper");
        await g.say("With the Mistveil Badge, the ranger will let you take the road east.\fThe Syndicate went that way, toward Ironvale. Follow the bell.");
      },
    },
  ],
  items: [
    { x: 1, y: 7, item: "dawn-bloom" },
  ],
};
