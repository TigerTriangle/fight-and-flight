import Phaser from "phaser";
import {
  BLAST_RADIUS,
  BOMB_GRAVITY,
  BULLET_SPEED,
  CRATE_FALL_SPEED,
  ENEMY_BULLET_SPEED,
  FLARE_GRAVITY,
  FLARE_LIFE,
  LASER_STUN_MS,
  MISSILE_LIFE,
  MISSILE_SPEED,
  PLAYER_X_MAX,
  PLAYER_X_MIN,
} from "./config";
import { HP_AA, HP_TANK, HP_TRUCK } from "./mission";

function bodyOf(sprite: Phaser.Physics.Arcade.Sprite) {
  return sprite.body as Phaser.Physics.Arcade.Body | null;
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  fromPlayer = true;
  fromAa = false;
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
    opts?: { dmg?: number; scale?: number; tint?: number; weave?: number; fromAa?: boolean; texture?: string; anim?: string },
  ) {
    this.fromPlayer = fromPlayer;
    this.fromAa = !fromPlayer && !!opts?.fromAa;
    this.dmg = fromPlayer ? (opts?.dmg ?? 1) : 1;
    this.weave = fromPlayer ? (opts?.weave ?? 0) : 0;
    this.weaveT = 0;
    this.enableBody(true, x, y, true, true);
    this.setDepth(70);
    const tex = opts?.texture ?? "bullet";
    if (this.texture.key !== tex) this.setTexture(tex);
    this.setScale(opts?.scale ?? (fromPlayer ? 0.34 : 0.3));
    this.setFlipX(tex === "fireball" ? false : !fromPlayer);
    if (opts?.tint != null) this.setTint(opts.tint);
    else if (fromPlayer) this.clearTint();
    else if (tex === "fireball") this.clearTint();
    else this.setTint(0xff8866);
    this.setVelocity(fromPlayer ? BULLET_SPEED : -ENEMY_BULLET_SPEED, 0);
    this.play(opts?.anim ?? "bullet-fly", true);
    if (tex === "fireball") bodyOf(this)?.setSize(88, 88).setOffset(84, 84);
    else bodyOf(this)?.setSize(96, 36).setOffset(16, 46);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.weave > 0) {
      this.weaveT += delta * 0.014;
      this.setVelocityY(Math.sin(this.weaveT) * this.weave);
    }
    if (this.x > 1360 || this.x < -80 || this.y > 800 || this.y < -80) this.disableBody(true, true);
  }
}

export class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bomb");
  }

  drop(x: number, y: number, grav = 1) {
    this.enableBody(true, x, y, true, true);
    this.setDepth(65);
    this.setScale(0.38);
    this.setVelocity(40, 48 * grav);
    this.setAngularVelocity(28);
    const body = bodyOf(this);
    body?.setAllowGravity(true);
    body?.setGravityY(BOMB_GRAVITY * grav);
    body?.setSize(48, 70).setOffset(40, 30);
    this.play("bomb-spin", true);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.y > 780) this.disableBody(true, true);
  }
}

export class LaserBolt extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "laser-bolt");
  }

  fire(x: number, y: number, vx: number, vy: number) {
    this.enableBody(true, x, y, true, true);
    this.setDepth(68);
    this.setScale(0.72);
    this.setRotation(Math.atan2(vy, vx));
    this.setVelocity(vx, vy);
    const body = bodyOf(this);
    body?.setAllowGravity(false);
    body?.setSize(64, 64).setOffset(48, -12);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.x > 1400 || this.x < -80 || this.y > 800 || this.y < -80) this.disableBody(true, true);
  }
}

export class Flare extends Phaser.Physics.Arcade.Sprite {
  life = FLARE_LIFE;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "flare");
  }

  pop(x: number, y: number, vx: number, vy: number) {
    this.life = FLARE_LIFE;
    this.enableBody(true, x, y, true, true);
    this.setDepth(72);
    this.setScale(0.38);
    this.setFlipX(false);
    this.clearTint();
    this.setVelocity(vx, vy);
    const body = bodyOf(this);
    body?.setAllowGravity(true);
    body?.setGravityY(FLARE_GRAVITY);
    body?.setSize(72, 72).setOffset(92, 92);
    this.play("flare-burn", true);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this.life -= delta / 1000;
    if (this.life <= 0 || this.y > 780 || this.x > 1400 || this.x < -80) this.disableBody(true, true);
  }
}

export class HeatMissile extends Phaser.Physics.Arcade.Sprite {
  life = MISSILE_LIFE;
  target: Phaser.Physics.Arcade.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "missile");
  }

  fire(x: number, y: number, target: Phaser.Physics.Arcade.Sprite | null) {
    this.life = MISSILE_LIFE;
    this.target = target;
    this.enableBody(true, x, y, true, true);
    this.setDepth(71);
    this.setScale(0.42);
    this.clearTint();
    this.setRotation(0);
    this.setVelocity(MISSILE_SPEED, 0);
    const body = bodyOf(this);
    body?.setAllowGravity(false);
    body?.setSize(96, 40).setOffset(80, 108);
    this.play("missile-fly", true);
  }

  home() {
    const t = this.target;
    if (!t || !t.active) {
      this.setRotation(0);
      this.setVelocity(MISSILE_SPEED, 0);
      return;
    }
    const dx = t.x - this.x;
    const dy = t.y - this.y;
    const mag = Math.hypot(dx, dy) || 1;
    this.setRotation(Math.atan2(dy, dx));
    this.setVelocity((dx / mag) * MISSILE_SPEED, (dy / mag) * MISSILE_SPEED);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this.life -= delta / 1000;
    this.home();
    if (this.life <= 0 || this.x > 1400 || this.x < -80 || this.y > 800 || this.y < -80) {
      this.target = null;
      this.disableBody(true, true);
    }
  }
}

export class EnemyFighter extends Phaser.Physics.Arcade.Sprite {
  hp = 2;
  fireAcc = 0.6;
  low = false;
  kind: "trainer" | "fighter" | "heavy" | "boss" = "fighter";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy");
  }

  launch(
    x: number,
    y: number,
    speed: number,
    opts?: {
      low?: boolean;
      kind?: "trainer" | "fighter" | "heavy" | "boss";
      texture?: string;
      anim?: string;
      hp?: number;
    },
  ) {
    this.kind = opts?.kind ?? "fighter";
    this.low = opts?.low ?? false;
    this.hp =
      opts?.hp ??
      (this.kind === "boss" ? 10 : this.kind === "heavy" ? 3 : this.kind === "trainer" ? 1 : 2);
    this.fireAcc =
      this.kind === "trainer" ? 99 : this.kind === "heavy" ? 1.1 : this.kind === "boss" ? 1.6 : 0.35 + Math.random() * 0.5;
    this.enableBody(true, x, y, true, true);
    this.setDepth(55);
    this.clearTint();
    const tex = opts?.texture ?? "enemy";
    if (this.texture.key !== tex) this.setTexture(tex);
    if (this.kind === "boss") {
      this.setScale(1.22);
      if (tex === "enemy") this.setTint(0xc9a07a);
    } else if (this.kind === "heavy") {
      this.setScale(0.82);
    } else if (this.kind === "trainer") {
      this.setScale(0.5);
      this.setTint(0xdde6ee);
    } else {
      this.setScale(0.6);
    }
    this.setVelocity(speed, this.kind === "boss" || this.kind === "heavy" ? 0 : (Math.random() - 0.5) * 36);
    this.play(opts?.anim ?? "enemy-fly", true);
    const body = bodyOf(this);
    if (this.kind === "boss") body?.setSize(230, 110).setOffset(12, 72);
    else if (this.kind === "heavy") body?.setSize(226, 96).setOffset(14, 80);
    else body?.setSize(220, 88).setOffset(18, 84);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.kind === "boss") {
      if (this.x < 620) {
        this.setVelocity(-8, Math.sin(time / 420) * 28);
      }
      return;
    }
    if (this.x < -140) this.disableBody(true, true);
  }
}

export class Truck extends Phaser.Physics.Arcade.Sprite {
  hp = 4;
  kind: "truck" | "tank" | "aa" = "truck";
  fireAcc = 1.2;
  ground = true;
  ledge = 0;
  laserHits = 0;
  private stunUntil = 0;
  private radar: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "truck");
    this.once("destroy", () => this.clearRadar());
  }

  place(
    x: number,
    y: number,
    scroll: number,
    kind: "truck" | "tank" | "aa" = "truck",
    art?: {
      truck: string;
      tank: string;
      aa: string;
      truckAnim: string;
      tankAnim: string;
      aaAnim: string;
      radar: boolean;
      hpTruck?: number;
      hpAa?: number;
      hpTank?: number;
    },
  ) {
    this.kind = kind;
    this.ledge = 0;
    this.laserHits = 0;
    this.stunUntil = 0;
    this.anims.resume();
    this.hp =
      kind === "tank"
        ? (art?.hpTank ?? HP_TANK)
        : kind === "aa"
          ? (art?.hpAa ?? HP_AA)
          : (art?.hpTruck ?? HP_TRUCK);
    this.fireAcc = 0.6 + Math.random() * 0.5;
    this.enableBody(true, x, y, true, true);
    this.setDepth(42);
    this.clearTint();
    this.setOrigin(0.5, 1);
    this.setVelocity(-scroll, 0);
    const truckTex = art?.truck ?? "truck";
    const tankTex = art?.tank ?? "truck";
    const aaTex = art?.aa ?? "aa";
    const truckAnim = art?.truckAnim ?? "truck-idle";
    const tankAnim = art?.tankAnim ?? "truck-idle";
    const aaAnim = art?.aaAnim ?? "aa-idle";
    const useRadar = art?.radar ?? true;
    if (kind === "aa") {
      this.setTexture(aaTex);
      this.setScale(
        aaTex === "alpine-aa" ||
          aaTex === "jungle-aa" ||
          aaTex === "cave-aa" ||
          aaTex === "gun-sat" ||
          aaTex === "lunar-aa" ||
          aaTex === "spore-turret" ||
          aaTex === "lumen-spire"
          ? 0.88
          : 0.9,
      );
      this.play(aaAnim, true);
      bodyOf(this)?.setSize(132, 210).setOffset(62, 38);
      if (useRadar) this.showRadar();
      else this.hideRadar();
    } else if (kind === "tank") {
      this.hideRadar();
      this.setTexture(tankTex);
      this.setScale(
        tankTex === "ship"
          ? 0.92
          : tankTex === "snow-halftrack" ||
              tankTex === "jungle-halftrack" ||
              tankTex === "drill-tank" ||
              tankTex === "barge-hulk" ||
              tankTex === "lunar-crawler" ||
              tankTex === "spore-carapace" ||
              tankTex === "isle-behemoth"
            ? 0.86
            : 0.78,
      );
      if (tankTex === "truck") this.setTint(0x9a8a68);
      this.play(tankAnim, true);
      bodyOf(this)?.setSize(200, 120).setOffset(28, 128);
    } else {
      this.hideRadar();
      this.setTexture(truckTex);
      this.setScale(
        truckTex === "boat" ||
          truckTex === "sampan" ||
          truckTex === "minecart" ||
          truckTex === "cargo-hulk" ||
          truckTex === "lunar-rover" ||
          truckTex === "spore-beetle" ||
          truckTex === "rune-golem"
          ? 0.7
          : truckTex === "snowcat"
            ? 0.62
            : 0.52,
      );
      this.play(truckAnim, true);
      bodyOf(this)?.setSize(190, 118).setOffset(32, 130);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) {
      this.hideRadar();
      return;
    }
    this.placeRadar();
    if (this.x < -240) this.disableBody(true, true);
    if (this.stunUntil && this.scene.time.now >= this.stunUntil) {
      this.stunUntil = 0;
      this.anims.resume();
      this.refreshTint();
    }
  }

  isStunned() {
    return this.scene.time.now < this.stunUntil;
  }

  tagFromLaser(): "stun" | "kill" {
    this.laserHits += 1;
    if (this.laserHits >= 2) return "kill";
    this.stunUntil = this.scene.time.now + LASER_STUN_MS;
    this.anims.pause();
    this.refreshTint();
    return "stun";
  }

  refreshTint() {
    if (this.isStunned()) this.setTint(0x4de8ff);
    else if (this.laserHits > 0) this.setTint(0x9fd4ee);
    else this.clearTint();
  }

  disableBody(disableGameObject?: boolean, hideGameObject?: boolean) {
    this.hideRadar();
    return super.disableBody(disableGameObject, hideGameObject);
  }

  private showRadar() {
    if (!this.radar) {
      this.radar = this.scene.add.sprite(this.x, this.y, "radar", 0);
      this.radar.setDepth(41);
      this.radar.setOrigin(0.5, 1);
    }
    this.radar.setVisible(true);
    this.radar.setScale(0.42);
    this.radar.play("radar-spin", true);
    this.placeRadar();
  }

  private placeRadar() {
    if (!this.radar?.visible) return;
    this.radar.setPosition(this.x + 108, this.y + 6);
  }

  private hideRadar() {
    this.radar?.setVisible(false);
  }

  private clearRadar() {
    this.radar?.destroy();
    this.radar = null;
  }
}

export class CrateDrop extends Phaser.Physics.Arcade.Sprite {
  supply = true;
  kind: "bomb" = "bomb";
  sway = 0;
  fall = CRATE_FALL_SPEED;
  private badge: Phaser.GameObjects.Sprite | null = null;
  private tag: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "crate");
    this.once("destroy", () => this.clearMarks());
  }

  drop(x: number, y: number, fall = CRATE_FALL_SPEED, label = "BOMB") {
    this.supply = true;
    this.kind = "bomb";
    this.sway = Math.random() * Math.PI * 2;
    this.fall = fall;
    this.enableBody(true, x, y, true, true);
    this.setDepth(58);
    this.setScale(0.62);
    this.setVelocity(18, this.fall);
    this.play("crate-fall", true);
    const body = bodyOf(this);
    body?.setAllowGravity(false);
    body?.setSize(88, 128).setOffset(52, 40);
    this.showMarks(label);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) {
      this.hideMarks();
      return;
    }
    this.sway += delta * 0.0032;
    this.setVelocity(Math.sin(this.sway) * 42, this.fall);
    this.x = Phaser.Math.Clamp(this.x, PLAYER_X_MIN + 24, PLAYER_X_MAX - 12);
    this.placeMarks();
    if (this.y > 760) this.disableBody(true, true);
  }

  disableBody(disableGameObject?: boolean, hideGameObject?: boolean) {
    this.hideMarks();
    return super.disableBody(disableGameObject, hideGameObject);
  }

  private showMarks(label = "BOMB") {
    const laser = label === "BURST";
    if (!this.badge) {
      this.badge = this.scene.add.sprite(this.x, this.y, laser ? "laser-bolt" : "bomb", 0);
      this.badge.setDepth(59);
    }
    this.badge.setTexture(laser ? "laser-bolt" : "bomb");
    this.badge.setScale(laser ? 0.55 : 0.34);
    this.badge.setVisible(true);
    if (!laser) this.badge.play("bomb-spin", true);
    else this.badge.anims.stop();
    if (!this.tag) {
      this.tag = this.scene.add
        .text(this.x, this.y, label, {
          fontFamily: "Teko, Barlow, sans-serif",
          fontSize: "22px",
          color: "#e8c15a",
          stroke: "#1a1208",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(61);
    }
    this.tag.setText(label);
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
