// @ts-check
// gfx: all drawing that isn't a creature's own art. Pure functions return Pixels data;
// draw.js puts Pixels, text, windows and backdrops on a canvas.

/** @typedef {import("./grid.js").Pixels} Pixels */

export { tilePixels, ANIMATED_TILES, TILE_ANIM_FRAMES } from "./tiles.js";
export { buildingPixels } from "./buildings.js";
export { characterPixels, CHARACTER_SPRITES } from "./characters.js";
export { portraitPixels, PORTRAIT_SPRITES } from "./portraits.js";
export { objectPixels, OBJECT_KINDS } from "./objects.js";
export { fontGlyph, FONT_CHARS, TEXT_COLORS } from "./font.js";
export { titlePixels } from "./title.js";
export { themePalette, UI } from "./palettes.js";
export {
  drawPixels,
  drawText,
  drawFrame,
  drawBattleBackground,
  battleBackgroundPixels,
  BATTLE_LAYOUT,
  creatureCanvas,
  pixelsCanvas,
} from "./draw.js";
