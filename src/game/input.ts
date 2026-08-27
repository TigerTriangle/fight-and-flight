export type Actions = {
  moveX: number;
  moveY: number;
  fire: boolean;
  bomb: boolean;
  pause: boolean;
};

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyF",
  "Escape",
]);

function radialDeadzone(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export class InputManager {
  keys = new Set<string>();
  injected = new Set<string>();
  mouseFire = false;
  mouseBomb = false;
  stick = { x: 0, y: 0 };
  touchFire = false;
  touchBombQueued = false;
  touchMode = false;
  private bombHeld = false;
  private pauseHeld = false;
  private bombEdge = false;
  private pauseEdge = false;

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.clear);
    document.addEventListener("visibilitychange", this.onVis);
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clear);
    document.removeEventListener("visibilitychange", this.onVis);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
  }

  setKeys(codes: string[]) {
    this.injected = new Set(codes);
  }

  setStick(x: number, y: number) {
    this.touchMode = true;
    const v = radialDeadzone(x, y);
    this.stick = v;
  }

  queueBomb() {
    this.touchMode = true;
    this.touchBombQueued = true;
  }

  sample(): Actions {
    const left =
      this.has("KeyA") || this.has("ArrowLeft") || this.stick.x < -0.12;
    const right =
      this.has("KeyD") || this.has("ArrowRight") || this.stick.x > 0.12;
    const up =
      this.has("KeyW") || this.has("ArrowUp") || this.stick.y < -0.12;
    const down =
      this.has("KeyS") || this.has("ArrowDown") || this.stick.y > 0.12;

    let moveX = 0;
    let moveY = 0;
    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (up) moveY -= 1;
    if (down) moveY += 1;
    if (this.touchMode && (this.stick.x !== 0 || this.stick.y !== 0)) {
      moveX = this.stick.x;
      moveY = this.stick.y;
    }
    const mag = Math.hypot(moveX, moveY);
    if (mag > 1) {
      moveX /= mag;
      moveY /= mag;
    }

    const fireHold =
      this.has("Space") || this.mouseFire || (this.touchMode && this.touchFire);
    const bombHold =
      this.has("ShiftLeft") ||
      this.has("ShiftRight") ||
      this.has("KeyF") ||
      this.mouseBomb;
    const bomb = (!this.bombHeld && bombHold) || this.touchBombQueued;
    const pause = !this.pauseHeld && this.has("Escape");
    this.bombHeld = bombHold;
    this.pauseHeld = this.has("Escape");
    this.touchBombQueued = false;
    this.bombEdge = bomb;
    this.pauseEdge = pause;

    return { moveX, moveY, fire: fireHold, bomb, pause };
  }

  private has(code: string) {
    return this.keys.has(code) || this.injected.has(code);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (GAME_CODES.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private clear = () => {
    this.keys.clear();
    this.mouseFire = false;
    this.mouseBomb = false;
    this.touchFire = false;
  };

  private onVis = () => {
    if (document.hidden) this.clear();
  };

  private onPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-ui]")) return;
    if (e.pointerType === "touch") this.touchMode = true;
    if (e.button === 0 && e.pointerType !== "touch") this.mouseFire = true;
    if (e.button === 2) {
      e.preventDefault();
      this.mouseBomb = true;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.button === 0) this.mouseFire = false;
    if (e.button === 2) this.mouseBomb = false;
  };
}

export const input = new InputManager();
