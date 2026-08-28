import Phaser from "phaser";
import { ART_REV } from "../config";
import { useGameStore } from "../store";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    const v = `?v=${ART_REV}`;
    this.load.image("sky", `/game/sky.png${v}`);
    this.load.image("far", `/game/far.png${v}`);
    this.load.image("mid", `/game/mid.png${v}`);
    this.load.image("near", `/game/near.png${v}`);
    this.load.image("foreground", `/game/foreground.png${v}`);
    this.load.image("ground", `/game/ground.png${v}`);
    this.load.image("fence", `/game/fence.png${v}`);
    this.load.image("barn", `/game/barn.png${v}`);
    this.load.image("silo", `/game/silo.png${v}`);
    this.load.image("hay", `/game/hay.png${v}`);
    this.load.spritesheet("hornet", `/game/hornet.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    for (const id of ["sparrow", "thunderhog", "ghost", "leviathan", "wisp"] as const) {
      this.load.spritesheet(id, `/game/${id}.png${v}`, {
        frameWidth: 256,
        frameHeight: 256,
      });
    }
    this.load.spritesheet("enemy", `/game/enemy.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("truck", `/game/truck.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("aa", `/game/aa.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("radar", `/game/radar.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("bullet", `/game/bullet.png${v}`, {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("bomb", `/game/bomb.png${v}`, {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("crate", `/game/crate.png${v}`, {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("hit", `/game/hit.png${v}`, {
      frameWidth: 160,
      frameHeight: 160,
    });
    this.load.spritesheet("blast", `/game/blast.png${v}`, {
      frameWidth: 220,
      frameHeight: 220,
    });
    this.load.json("heightmap", `/game/ground-heightmap.json${v}`);
  }

  create() {
    this.anims.create({
      key: "hornet-fly",
      frames: this.anims.generateFrameNumbers("hornet", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    for (const id of ["sparrow", "thunderhog", "ghost", "leviathan", "wisp"] as const) {
      this.anims.create({
        key: `${id}-fly`,
        frames: this.anims.generateFrameNumbers(id, { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    this.anims.create({
      key: "enemy-fly",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 3 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "truck-idle",
      frames: this.anims.generateFrameNumbers("truck", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "aa-idle",
      frames: this.anims.generateFrameNumbers("aa", { start: 0, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "radar-spin",
      frames: this.anims.generateFrameNumbers("radar", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "bullet-fly",
      frames: this.anims.generateFrameNumbers("bullet", { start: 0, end: 3 }),
      frameRate: 14,
      repeat: -1,
    });
    this.anims.create({
      key: "bomb-spin",
      frames: this.anims.generateFrameNumbers("bomb", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "crate-fall",
      frames: this.anims.generateFrameNumbers("crate", { start: 0, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "hit",
      frames: this.anims.generateFrameNumbers("hit", { start: 0, end: 3 }),
      frameRate: 16,
      hideOnComplete: true,
    });
    this.anims.create({
      key: "blast",
      frames: this.anims.generateFrameNumbers("blast", { start: 0, end: 3 }),
      frameRate: 12,
      hideOnComplete: true,
    });
    this.scene.start("game", { mode: "attract" });
  }
}
