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
    this.load.image("laser-bolt", `/game/laser-bolt.png${v}`);
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
    this.load.image("tide-sky", `/game/tide-sky.png${v}`);
    this.load.image("tide-far", `/game/tide-far.png${v}`);
    this.load.image("tide-mid", `/game/tide-mid.png${v}`);
    this.load.image("tide-near", `/game/tide-near.png${v}`);
    this.load.image("tide-fg", `/game/tide-fg.png${v}`);
    this.load.image("tide-ground", `/game/tide-ground.png${v}`);
    this.load.json("tide-heightmap", `/game/tide-heightmap.json${v}`);
    this.load.image("cyn-sky", `/game/cyn-sky.png${v}`);
    this.load.image("cyn-far", `/game/cyn-far.png${v}`);
    this.load.image("cyn-mid", `/game/cyn-mid.png${v}`);
    this.load.image("cyn-near", `/game/cyn-near.png${v}`);
    this.load.image("cyn-fg", `/game/cyn-fg.png${v}`);
    this.load.image("cyn-ground", `/game/cyn-ground.png${v}`);
    this.load.image("cyn-ceiling", `/game/cyn-ceiling.png${v}`);
    this.load.json("cyn-heightmap", `/game/cyn-heightmap.json${v}`);
    this.load.json("cyn-ceilingmap", `/game/cyn-ceilingmap.json${v}`);
    this.load.spritesheet("tide-enemy", `/game/tide-enemy.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("cyn-enemy", `/game/cyn-enemy.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("boat", `/game/boat.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("ship", `/game/ship.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("naval-aa", `/game/naval-aa.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("jeep", `/game/jeep.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("crawler", `/game/crawler.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("ledge-aa", `/game/ledge-aa.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.image("buoy", `/game/buoy.png${v}`);
    this.load.image("lighthouse", `/game/lighthouse.png${v}`);
    this.load.image("seastack", `/game/seastack.png${v}`);
    this.load.image("cactus", `/game/cactus.png${v}`);
    this.load.image("spire", `/game/spire.png${v}`);
    this.load.image("mesa", `/game/mesa.png${v}`);
    this.load.image("peaks-sky", `/game/peaks-sky.png${v}`);
    this.load.image("peaks-far", `/game/peaks-far.png${v}`);
    this.load.image("peaks-mid", `/game/peaks-mid.png${v}`);
    this.load.image("peaks-near", `/game/peaks-near.png${v}`);
    this.load.image("peaks-fg", `/game/peaks-fg.png${v}`);
    this.load.image("peaks-ground", `/game/peaks-ground.png${v}`);
    this.load.json("peaks-heightmap", `/game/peaks-heightmap.json${v}`);
    this.load.spritesheet("peaks-enemy", `/game/peaks-enemy.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("peaks-boss", `/game/peaks-boss.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("snowcat", `/game/snowcat.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("snow-halftrack", `/game/snow-halftrack.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("alpine-aa", `/game/alpine-aa.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.image("pine", `/game/pine.png${v}`);
    this.load.image("hut", `/game/hut.png${v}`);
    this.load.image("cairn", `/game/cairn.png${v}`);
    this.load.image("canopy-sky", `/game/canopy-sky.png${v}`);
    this.load.image("canopy-far", `/game/canopy-far.png${v}`);
    this.load.image("canopy-mid", `/game/canopy-mid.png${v}`);
    this.load.image("canopy-near", `/game/canopy-near.png${v}`);
    this.load.image("canopy-fg", `/game/canopy-fg.png${v}`);
    this.load.image("canopy-ground", `/game/canopy-ground.png${v}`);
    this.load.json("canopy-heightmap", `/game/canopy-heightmap.json${v}`);
    this.load.spritesheet("canopy-kite", `/game/canopy-kite.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("canopy-howler", `/game/canopy-howler.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("sampan", `/game/sampan.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("jungle-halftrack", `/game/jungle-halftrack.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("jungle-aa", `/game/jungle-aa.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.image("palm", `/game/palm.png${v}`);
    this.load.image("stilt-hut", `/game/stilt-hut.png${v}`);
    this.load.image("stupa", `/game/stupa.png${v}`);
    this.load.image("dark-sky", `/game/dark-sky.png${v}`);
    this.load.image("dark-far", `/game/dark-far.png${v}`);
    this.load.image("dark-mid", `/game/dark-mid.png${v}`);
    this.load.image("dark-near", `/game/dark-near.png${v}`);
    this.load.image("dark-fg", `/game/dark-fg.png${v}`);
    this.load.image("dark-ground", `/game/dark-ground.png${v}`);
    this.load.image("dark-ceiling", `/game/dark-ceiling.png${v}`);
    this.load.json("dark-heightmap", `/game/dark-heightmap.json${v}`);
    this.load.json("dark-ceilingmap", `/game/dark-ceilingmap.json${v}`);
    this.load.spritesheet("cave-drone", `/game/cave-drone.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("borer-boss", `/game/borer-boss.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("minecart", `/game/minecart.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet("drill-tank", `/game/drill-tank.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("cave-aa", `/game/cave-aa.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.image("stalagmite", `/game/stalagmite.png${v}`);
    this.load.image("crystal", `/game/crystal.png${v}`);
    this.load.image("lantern-post", `/game/lantern-post.png${v}`);
    this.load.image("orbit-sky", `/game/orbit-sky.png${v}`);
    this.load.image("orbit-far", `/game/orbit-far.png${v}`);
    this.load.image("orbit-mid", `/game/orbit-mid.png${v}`);
    this.load.image("orbit-near", `/game/orbit-near.png${v}`);
    this.load.image("orbit-fg", `/game/orbit-fg.png${v}`);
    this.load.image("orbit-ground", `/game/orbit-ground.png${v}`);
    this.load.json("orbit-heightmap", `/game/orbit-heightmap.json${v}`);
    this.load.spritesheet("orbit-needle", `/game/orbit-needle.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("orbit-ring", `/game/orbit-ring.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("cargo-hulk", `/game/cargo-hulk.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("barge-hulk", `/game/barge-hulk.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("gun-sat", `/game/gun-sat.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.image("rocklet", `/game/rocklet.png${v}`);
    this.load.image("solar-spar", `/game/solar-spar.png${v}`);
    this.load.image("nav-buoy", `/game/nav-buoy.png${v}`);
    this.load.image("mare-sky", `/game/mare-sky.png${v}`);
    this.load.image("mare-far", `/game/mare-far.png${v}`);
    this.load.image("mare-mid", `/game/mare-mid.png${v}`);
    this.load.image("mare-near", `/game/mare-near.png${v}`);
    this.load.image("mare-fg", `/game/mare-fg.png${v}`);
    this.load.image("mare-ground", `/game/mare-ground.png${v}`);
    this.load.json("mare-heightmap", `/game/mare-heightmap.json${v}`);
    this.load.spritesheet("mare-hopper", `/game/mare-hopper.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("mare-walker", `/game/mare-walker.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("lunar-rover", `/game/lunar-rover.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("lunar-crawler", `/game/lunar-crawler.png${v}`, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("lunar-aa", `/game/lunar-aa.png${v}`, { frameWidth: 256, frameHeight: 256 });
    this.load.image("moon-rock", `/game/moon-rock.png${v}`);
    this.load.image("moon-antenna", `/game/moon-antenna.png${v}`);
    this.load.image("moon-lander", `/game/moon-lander.png${v}`);
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
    for (const [key, anim] of [
      ["tide-enemy", "tide-enemy-fly"],
      ["cyn-enemy", "cyn-enemy-fly"],
      ["boat", "boat-idle"],
      ["ship", "ship-idle"],
      ["naval-aa", "naval-aa-idle"],
      ["jeep", "jeep-idle"],
      ["crawler", "crawler-idle"],
      ["ledge-aa", "ledge-aa-idle"],
      ["peaks-enemy", "peaks-enemy-fly"],
      ["peaks-boss", "peaks-boss-fly"],
      ["snowcat", "snowcat-idle"],
      ["snow-halftrack", "snow-halftrack-idle"],
      ["alpine-aa", "alpine-aa-idle"],
      ["canopy-kite", "canopy-kite-fly"],
      ["canopy-howler", "canopy-howler-fly"],
      ["sampan", "sampan-idle"],
      ["jungle-halftrack", "jungle-halftrack-idle"],
      ["jungle-aa", "jungle-aa-idle"],
      ["cave-drone", "cave-drone-fly"],
      ["borer-boss", "borer-boss-fly"],
      ["minecart", "minecart-idle"],
      ["drill-tank", "drill-tank-idle"],
      ["cave-aa", "cave-aa-idle"],
      ["orbit-needle", "orbit-needle-fly"],
      ["orbit-ring", "orbit-ring-fly"],
      ["cargo-hulk", "cargo-hulk-idle"],
      ["barge-hulk", "barge-hulk-idle"],
      ["gun-sat", "gun-sat-idle"],
      ["mare-hopper", "mare-hopper-fly"],
      ["mare-walker", "mare-walker-fly"],
      ["lunar-rover", "lunar-rover-idle"],
      ["lunar-crawler", "lunar-crawler-idle"],
      ["lunar-aa", "lunar-aa-idle"],
    ] as const) {
      this.anims.create({
        key: anim,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: key.endsWith("enemy") || key.endsWith("boss") || key.endsWith("drone") ? 9 : 6,
        repeat: -1,
      });
    }
    this.scene.start("game", { mode: "attract" });
  }
}
