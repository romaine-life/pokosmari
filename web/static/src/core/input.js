// @ts-check
// Buttons from the keyboard and any standard gamepad, read once per frame.

/** @typedef {"up"|"down"|"left"|"right"|"a"|"b"|"start"|"select"} Button */

/** @type {Button[]} */
export const BUTTONS = ["up", "down", "left", "right", "a", "b", "start", "select"];

/** @type {Record<string, Button>} */
const KEYS = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  KeyZ: "a", KeyJ: "a", Space: "a",
  KeyX: "b", KeyK: "b", Backspace: "b", Escape: "b",
  Enter: "start",
  ShiftLeft: "select", ShiftRight: "select",
};

// The standard gamepad mapping's buttons.
/** @type {[number, Button][]} */
const PAD = [[12, "up"], [13, "down"], [14, "left"], [15, "right"], [0, "a"], [1, "b"], [9, "start"], [8, "select"]];

const REPEAT_DELAY = 18;
const REPEAT_EVERY = 5;

export class Input {
  constructor() {
    /** @type {Set<Button>} keys held right now */
    this.keys = new Set();
    /** @type {Set<Button>} keys pressed since the last frame, even if already let go: a tap
     * shorter than a frame still counts as a press */
    this.tapped = new Set();
    /** @type {Set<Button>} */
    this.down = new Set();
    /** @type {Set<Button>} pressed this frame */
    this.edge = new Set();
    /** @type {Map<Button, number>} frames each button has been held */
    this.heldFor = new Map();
    /** @type {(() => void)[]} called on the first key or pad press (audio unlock) */
    this.onFirstPress = [];
    /** The last direction pressed, so the newest of two held directions wins. */
    /** @type {Button|null} */
    this.lastDir = null;
  }

  /** @param {Window} win */
  attach(win) {
    win.addEventListener("keydown", (e) => {
      const b = KEYS[e.code];
      if (!b) return;
      e.preventDefault();
      if (!this.keys.has(b) && (b === "up" || b === "down" || b === "left" || b === "right")) this.lastDir = b;
      this.keys.add(b);
      if (!e.repeat) this.tapped.add(b);
      this.firstPress();
    });
    win.addEventListener("keyup", (e) => {
      const b = KEYS[e.code];
      if (b) this.keys.delete(b);
    });
    // A window that loses focus never sees the key-up: let go of everything.
    win.addEventListener("blur", () => this.keys.clear());
  }

  firstPress() {
    const fns = this.onFirstPress;
    this.onFirstPress = [];
    for (const f of fns) f();
  }

  /** Read the pads and work out this frame's presses. Called once per frame. */
  update() {
    const now = new Set([...this.keys, ...this.tapped]);
    // A tap seen as held this frame must read as released next frame, so it's a fresh press
    // again if tapped again.
    for (const b of this.tapped) if (this.down.has(b) && !this.keys.has(b)) now.delete(b);
    this.tapped.clear();
    const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (!pad) continue;
      for (const [i, b] of PAD) {
        if (pad.buttons[i]?.pressed) now.add(b);
      }
      const [x, y] = [pad.axes[0] ?? 0, pad.axes[1] ?? 0];
      if (x < -0.5) now.add("left");
      if (x > 0.5) now.add("right");
      if (y < -0.5) now.add("up");
      if (y > 0.5) now.add("down");
    }
    this.edge.clear();
    for (const b of now) {
      if (!this.down.has(b)) {
        this.edge.add(b);
        if (b === "up" || b === "down" || b === "left" || b === "right") this.lastDir = b;
        if (!this.keys.has(b)) this.firstPress();
      }
      this.heldFor.set(b, (this.heldFor.get(b) ?? 0) + 1);
    }
    for (const b of this.down) if (!now.has(b)) this.heldFor.delete(b);
    this.down = now;
  }

  /** @param {Button} b */
  held(b) {
    return this.down.has(b);
  }

  /** @param {Button} b */
  pressed(b) {
    return this.edge.has(b);
  }

  /** Pressed this frame, or held long enough to repeat (for moving a menu cursor). @param {Button} b */
  repeat(b) {
    if (this.edge.has(b)) return true;
    const n = this.heldFor.get(b) ?? 0;
    return n > REPEAT_DELAY && (n - REPEAT_DELAY) % REPEAT_EVERY === 0;
  }

  /** The direction held, preferring the one pressed last. @returns {"up"|"down"|"left"|"right"|null} */
  dir() {
    const dirs = /** @type {("up"|"down"|"left"|"right")[]} */ (["up", "down", "left", "right"]);
    const last = dirs.find((d) => d === this.lastDir);
    if (last && this.down.has(last)) return last;
    for (const b of dirs) if (this.down.has(b)) return b;
    return null;
  }

  /** Forget presses, so one press isn't seen by two consumers. */
  consume() {
    this.edge.clear();
  }
}
