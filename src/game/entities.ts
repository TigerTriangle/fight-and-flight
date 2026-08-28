import Phaser from "phaser";
import {
  BLAST_RADIUS,
  BOMB_GRAVITY,
  BULLET_SPEED,
  CRATE_FALL_SPEED,
  ENEMY_BULLET_SPEED,
  PLAYER_X_MAX,
  PLAYER_X_MIN,
} from "./config";

function bodyOf(sprite: Phaser.Physics.Arcade.Sprite) {
  return sprite.body as Phaser.Physics.Arcade.Body | null;
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  fromPlayer = true;
  dmg = 1;
  weave = 0;
  weaveT = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bullet");
  }

  fire(
    x: number,
    y: number,
    fromPlayer: boolean,
    opts?: { dmg?: number; scale?: number; tint?: number; weave?: number },
  ) {
    this.fromPlayer = fromPlayer;
    this.dmg = fromPlayer ? (opts?.dmg ?? 1) : 1;
    this.weave = fromPlayer ? (opts?.weave ?? 0) : 0;
    this.weaveT = 0;
    this.enableBody(true, x, y, true, true);
    this.setDepth(70);
    this.setScale(opts?.scale ?? (fromPlayer ? 0.34 : 0.3));
    this.setFlipX(!fromPlayer);
    this.setTint(opts?.tint ?? (fromPlayer ? 0xffffff : 0xff8866));
    this.setVelocity(fromPlayer ? BULLET_SPEED : -ENEMY_BULLET_SPEED, 0);
    this.play("bullet-fly", true);
    bodyOf(this)?.setSize(96, 36).setOffset(16, 46);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.weave > 0) {
      this.weaveT += delta * 0.014;
      this.setVelocityY(Math.sin(this.weaveT) * this.weave);
    }
    if (this.x > 1360 || this.x < -80) this.disableBody(true, true);
  }
}

export class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bomb");
  }

  drop(x: number, y: number) {
    this.enableBody(true, x, y, true, true);
    this.setDepth(65);
    this.setScale(0.38);
    this.setVelocity(40, 80);
    this.setAngularVelocity(40);
    const body = bodyOf(this);
    body?.setAllowGravity(true);
    body?.setGravityY(BOMB_GRAVITY);
    body?.setSize(48, 70).setOffset(40, 30);
    this.play("bomb-spin", true);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.y > 780) this.disableBody(true, true);
  }
}

export class EnemyFighter extends Phaser.Physics.Arcade.Sprite {
  hp = 2;
  fireAcc = 0.6;
  low = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy");
  }

  launch(x: number, y: number, speed: number, low: boolean) {
    this.hp = 2;
    this.low = low;
    this.fireAcc = 0.4 + Math.random() * 0.8;
    this.enableBody(true, x, y, true, true);
    this.setDepth(55);
    this.setScale(0.58);
    this.setVelocity(speed, (Math.random() - 0.5) * 30);
    this.play("enemy-fly", true);
    bodyOf(this)?.setSize(220, 88).setOffset(18, 84);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.x < -140) this.disableBody(true, true);
  }
}

export class Truck extends Phaser.Physics.Arcade.Sprite {
  hp = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "truck");
  }

  place(x: number, y: number, scroll: number) {
    this.hp = 1;
    this.enableBody(true, x, y, true, true);
    this.setDepth(42);
    this.setScale(0.52);
    this.setOrigin(0.5, 1);
    this.setVelocity(-scroll, 0);
    this.play("truck-idle", true);
    bodyOf(this)?.setSize(210, 90).setOffset(22, 150);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.x < -180) this.disableBody(true, true);
  }
}

export class CrateDrop extends Phaser.Physics.Arcade.Sprite {
  supply = true;
  kind: "bomb" = "bomb";
  sway = 0;
  private badge: Phaser.GameObjects.Sprite | null = null;
  private tag: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "crate");
    this.once("destroy", () => this.clearMarks());
  }

  drop(x: number, y: number) {
    this.supply = true;
    this.kind = "bomb";
    this.sway = Math.random() * Math.PI * 2;
    this.enableBody(true, x, y, true, true);
    this.setDepth(58);
    this.setScale(0.62);
    this.setVelocity(18, CRATE_FALL_SPEED);
    this.play("crate-fall", true);
    const body = bodyOf(this);
    body?.setAllowGravity(false);
    body?.setSize(88, 128).setOffset(52, 40);
    this.showMarks();
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) {
      this.hideMarks();
      return;
    }
    this.sway += delta * 0.0032;
    this.setVelocity(Math.sin(this.sway) * 42, CRATE_FALL_SPEED);
    this.x = Phaser.Math.Clamp(this.x, PLAYER_X_MIN + 24, PLAYER_X_MAX - 12);
    this.placeMarks();
    if (this.y > 760) this.disableBody(true, true);
  }

  disableBody(disableGameObject?: boolean, hideGameObject?: boolean) {
    this.hideMarks();
    return super.disableBody(disableGameObject, hideGameObject);
  }

  private showMarks() {
    if (!this.badge) {
      this.badge = this.scene.add.sprite(this.x, this.y, "bomb", 0);
      this.badge.setDepth(59);
    }
    this.badge.setScale(0.34);
    this.badge.setVisible(true);
    this.badge.play("bomb-spin", true);
    if (!this.tag) {
      this.tag = this.scene.add
        .text(this.x, this.y, "BOMB", {
          fontFamily: "Teko, Barlow, sans-serif",
          fontSize: "22px",
          color: "#e8c15a",
          stroke: "#1a1208",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(61);
    }
    this.tag.setVisible(true);
    this.placeMarks();
  }

  private placeMarks() {
    this.badge?.setPosition(this.x + 2, this.y + 30);
    this.tag?.setPosition(this.x, this.y + 62);
  }

  private hideMarks() {
    this.badge?.setVisible(false);
    this.tag?.setVisible(false);
  }

  private clearMarks() {
    this.badge?.destroy();
    this.tag?.destroy();
    this.badge = null;
    this.tag = null;
  }
}

export class FxSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "hit");
  }

  burst(x: number, y: number, kind: "hit" | "blast") {
    this.enableBody(true, x, y, true, true);
    bodyOf(this)?.setAllowGravity(false);
    this.setVelocity(0, 0);
    this.setDepth(80);
    this.setScale(kind === "blast" ? 0.95 : 0.7);
    this.off("animationcomplete");
    this.play(kind === "blast" ? "blast" : "hit");
    this.once("animationcomplete", () => this.disableBody(true, true));
  }
}

export function circleHits(
  x: number,
  y: number,
  sprite: Phaser.Physics.Arcade.Sprite,
  radius = BLAST_RADIUS,
) {
  if (!sprite.active) return false;
  return Phaser.Math.Distance.Between(x, y, sprite.x, sprite.y) <= radius;
}
