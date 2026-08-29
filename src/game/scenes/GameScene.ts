import Phaser from "phaser";
import { audio } from "../audio";
import { bridge } from "../bridge";
import {
  AIR_KILLS_PER_CRATE,
  BOMB_COOLDOWN,
  BOMB_CRATE_AT,
  BOMB_PICKUP,
  BULLET_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_DRAW_H,
  GUN_COOL_RATE,
  GUN_OVERHEAT_LOCK,
  INVULN_TIME,
  PLAYER_X_MAX,
  PLAYER_X_MIN,
  PLAYER_Y_MIN,
  SCROLL_SPEED,
} from "../config";
import {
  SCORE_AA_BOMB,
  SCORE_AIR,
  SCORE_CLEAR,
  SCORE_GROUND_BOMB,
  SCORE_HEAVY,
  SCORE_BOSS,
  SCORE_LOW_CLIP,
  SCORE_SURVIVE_HULL,
  SCORE_TANK_BOMB,
  beatAt,
  medalFor,
  missionFor,
  type AirKind,
  type Beat,
  type EndCause,
  type GroundKind,
  type MissionDef,
  type Pack,
} from "../mission";
import {
  Bomb,
  Bullet,
  CrateDrop,
  EnemyFighter,
  FxSprite,
  Truck,
  circleHits,
} from "../entities";
import { input } from "../input";
import { planeById, type PlaneDef } from "../planes";
import { useGameStore } from "../store";
import { ceilingY, groundY, type Heightmap } from "../terrain";
import { stageKit, type StageKit } from "../worlds";

type Mode = "attract" | "play";

function asSprite(obj: unknown): Phaser.Physics.Arcade.Sprite | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as {
    disableBody?: unknown;
    gameObject?: Phaser.Physics.Arcade.Sprite;
  };
  if (typeof rec.disableBody === "function") {
    return obj as Phaser.Physics.Arcade.Sprite;
  }
  if (rec.gameObject && typeof rec.gameObject.disableBody === "function") {
    return rec.gameObject;
  }
  return null;
}

function asBullet(obj: unknown): Bullet | null {
  const s = asSprite(obj);
  if (s && "fromPlayer" in s) return s as Bullet;
  return null;
}

function asEnemy(obj: unknown): EnemyFighter | null {
  const s = asSprite(obj);
  if (s && "fireAcc" in s) return s as EnemyFighter;
  return null;
}

function asCrate(obj: unknown): CrateDrop | null {
  const s = asSprite(obj);
  if (s && "supply" in s) return s as CrateDrop;
  return null;
}

function asTruck(obj: unknown): Truck | null {
  const s = asSprite(obj);
  if (s && "ground" in s) return s as Truck;
  return null;
}

export class GameScene extends Phaser.Scene {
  private mode: Mode = "attract";
  private worldX = 0;
  private loadout: PlaneDef = planeById("hornet");
  private hull = 3;
  private bombs = 4;
  private score = 0;
  private dead = false;
  private gunCd = 0;
  private gunHeat = 0;
  private overheat = 0;
  private bombCd = 0;
  private invuln = 0;
  private stretch: "air" | "ground" = "air";
  private stretchT = 0;
  private spawnT = 0;
  private decorT = 0;
  private missionT = 0;
  private beat: Beat = "intro";
  private packI = 0;
  private batteryOut = false;
  private clearing = false;
  private airTally = 0;
  private groundTally = 0;
  private lastHit: EndCause = "air";
  private trauma = 0;
  private probeYaw = 0;
  private lastVx = 0;
  private lastVy = 0;
  private forced = new Set<string>();
  private unsub = () => {};
  private hm: Heightmap | null = null;
  private chm: Heightmap | null = null;
  private kit: StageKit = stageKit("heartland");
  private mission: MissionDef = missionFor("heartland");
  private groundDrawH = GROUND_DRAW_H;
  private yMin = PLAYER_Y_MIN;
  private scroll = SCROLL_SPEED;
  private overTimer: Phaser.Time.TimerEvent | null = null;
  private airKills = 0;

  private sky!: Phaser.GameObjects.TileSprite;
  private far!: Phaser.GameObjects.TileSprite;
  private mid!: Phaser.GameObjects.TileSprite;
  private near!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private fg!: Phaser.GameObjects.TileSprite;
  private ceiling!: Phaser.GameObjects.TileSprite;
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
  private eBullets!: Phaser.Physics.Arcade.Group;
  private bombGroup!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private trucks!: Phaser.Physics.Arcade.Group;
  private crates!: Phaser.Physics.Arcade.Group;
  private fx!: Phaser.Physics.Arcade.Group;
  private decor!: Phaser.GameObjects.Group;

  constructor() {
    super("game");
  }

  init(data: { mode?: Mode }) {
    const phase = useGameStore.getState().phase;
    this.mode = data?.mode === "play" || phase === "playing" ? "play" : "attract";
    this.worldX = 0;
    this.loadout = planeById(useGameStore.getState().planeId);
    this.hull = this.loadout.hull;
    this.bombs = this.loadout.bombs;
    this.score = 0;
    this.dead = false;
    this.gunCd = 0;
    this.gunHeat = 0;
    this.overheat = 0;
    this.bombCd = 0;
    this.invuln = 0;
    this.stretch = "air";
    this.stretchT = 0;
    this.spawnT = 0;
    this.decorT = 0;
    this.missionT = 0;
    this.beat = "intro";
    this.packI = 0;
    this.batteryOut = false;
    this.clearing = false;
    this.airTally = 0;
    this.groundTally = 0;
    this.lastHit = "air";
    this.trauma = 0;
    this.probeYaw = 0;
    this.lastVx = 0;
    this.lastVy = 0;
    this.forced = new Set();
    this.airKills = 0;
  }

  create() {
    window.__fnfBuild = 11;
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.physics.world.gravity.y = 0;

    const tile = (key: string, depth: number) => {
      const s = this.add
        .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, key)
        .setOrigin(0)
        .setDepth(depth)
        .setScrollFactor(0);
      s.tileScaleX = GAME_HEIGHT / 864;
      s.tileScaleY = GAME_HEIGHT / 864;
      return s;
    };
    this.sky = tile("sky", 0);
    this.far = tile("far", 1);
    this.mid = tile("mid", 2);
    this.near = tile("near", 3);

    this.ground = this.add
      .tileSprite(0, GAME_HEIGHT - GROUND_DRAW_H, GAME_WIDTH, GROUND_DRAW_H, "ground")
      .setOrigin(0)
      .setDepth(8)
      .setScrollFactor(0);
    this.ground.tileScaleY = GROUND_DRAW_H / 220;

    this.fg = tile("foreground", 90);
    this.ceiling = tile("cyn-ceiling", 91);
    this.ceiling.setVisible(false);
    this.applyStage();

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 48,
      runChildUpdate: true,
    });
    this.eBullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 32,
      runChildUpdate: true,
    });
    this.bombGroup = this.physics.add.group({
      classType: Bomb,
      maxSize: 12,
      runChildUpdate: true,
    });
    this.enemies = this.physics.add.group({
      classType: EnemyFighter,
      maxSize: 24,
      runChildUpdate: true,
    });
    this.trucks = this.physics.add.group({
      classType: Truck,
      maxSize: 20,
      runChildUpdate: true,
    });
    this.crates = this.physics.add.group({
      classType: CrateDrop,
      maxSize: 4,
      runChildUpdate: true,
    });
    this.fx = this.physics.add.group({
      classType: FxSprite,
      maxSize: 20,
      runChildUpdate: true,
    });
    this.decor = this.add.group();

    this.player = this.physics.add.sprite(260, 260, "hornet");
    this.player.setDepth(60);
    this.player.setScale(0.7);
    this.player.setCollideWorldBounds(false);
    const pbody = this.player.body as Phaser.Physics.Arcade.Body;
    pbody.setAllowGravity(false);
    pbody.setImmovable(true);
    pbody.setSize(168, 52).setOffset(44, 104);
    this.player.play("hornet-fly");
    if (this.mode !== "play") this.player.setVisible(false).disableBody(true, true);

    this.physics.add.overlap(this.bullets, this.enemies, (a, b) => {
      const bullet = asBullet(a) ?? asBullet(b);
      const enemy = asEnemy(a) ?? asEnemy(b);
      if (bullet && enemy) this.hitAir(bullet, enemy);
    });
    this.physics.add.overlap(this.eBullets, this.player, (a) => {
      const bullet = asBullet(a);
      const cause: EndCause = bullet?.fromAa ? "aa" : "air";
      bullet?.disableBody(true, true);
      this.hurt(cause);
    });
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      const enemy = asEnemy(e);
      if (enemy) this.ramAir(enemy);
    });
    this.physics.add.overlap(this.bullets, this.trucks, (a, b) => {
      const bullet = asBullet(a) ?? asBullet(b);
      const truck = asTruck(a) ?? asTruck(b);
      if (bullet && truck) this.hitGround(bullet, truck);
    });
    this.physics.add.overlap(this.player, this.trucks, () => this.hurt("obstacle"));
    this.physics.add.overlap(this.player, this.crates, (a, b) => {
      const crate = asCrate(a) ?? asCrate(b);
      if (crate) this.snagCrate(crate);
    });

    this.unsub = bridge.on((cmd) => this.onCmd(cmd));
    this.events.once("shutdown", () => {
      this.unsub();
      this.decor.clear(true, true);
      audio.stopEngine();
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      const phase = useGameStore.getState().phase;
      if (phase === "playing") this.onCmd("pause");
      else if (phase === "paused") this.onCmd("resume");
    });

    window.__controlsTest = {
      getYaw: () => this.probeYaw,
      getSpeed: () => Math.hypot(this.lastVx, this.lastVy),
      setKeys: (codes) => {
        this.forced = new Set(codes);
        input.setKeys(codes);
      },
      getY: () => this.player.y,
      getEnemies: () => this.enemies.countActive(true),
      getBullets: () => this.bullets.countActive(true),
      getMode: () => this.mode,
      getScore: () => this.score,
      getHull: () => this.hull,
      getBombs: () => this.bombs,
      getFps: () => this.game.loop.actualFps,
      getDead: () => this.dead,
      getPhase: () => useGameStore.getState().phase,
      getBuild: () => 8,
      getCrates: () => this.crates.countActive(true),
      getAirKills: () => this.airKills,
      spawnCrate: () => this.spawnCrate(),
      getHeat: () => this.gunHeat,
      getHot: () => this.overheat > 0,
      getPlane: () => this.loadout.id,
      getBeat: () => this.beat,
      getMissionT: () => this.missionT,
      getAirTally: () => this.airTally,
      getGroundTally: () => this.groundTally,
      getLastHit: () => this.lastHit,
      skipTo: (t: number) => {
        this.missionT = t;
        this.beat = beatAt(t, this.mission);
        this.packI = this.mission.packs.findIndex((p) => p.t >= t - 0.05);
        if (this.packI < 0) this.packI = this.mission.packs.length;
        this.batteryOut = this.beat === "battery";
        this.syncHud();
      },
      getWorld: () => useGameStore.getState().worldId,
    };

    if (this.mode === "play") this.beginRun();
    this.syncHud();
    useGameStore.getState().setReady();
  }

  update(_time: number, deltaMs: number) {
    const raw = this.game.loop.rawDelta || deltaMs;
    const dt = Math.min(Math.max(raw, deltaMs) / 1000, 0.5);
    const phase = useGameStore.getState().phase;
    if (phase === "paused") return;
    if (phase === "playing" && this.mode !== "play") this.bootRun();

    const actions = input.sample();
    if (this.forced.has("KeyA") || this.forced.has("ArrowLeft")) actions.moveX = Math.min(1, actions.moveX - 1);
    if (this.forced.has("KeyD") || this.forced.has("ArrowRight")) actions.moveX = Math.min(1, actions.moveX + 1);
    if (this.forced.has("KeyW") || this.forced.has("ArrowUp")) actions.moveY = Math.min(1, actions.moveY - 1);
    if (this.forced.has("KeyS") || this.forced.has("ArrowDown")) actions.moveY = Math.min(1, actions.moveY + 1);
    if (this.forced.has("Space")) actions.fire = true;
    if (this.forced.has("KeyF") || this.forced.has("ShiftLeft")) actions.bomb = true;
    const mag = Math.hypot(actions.moveX, actions.moveY);
    if (mag > 1) {
      actions.moveX /= mag;
      actions.moveY /= mag;
    }
    this.worldX += this.scroll * dt;
    this.scrollBg();

    if (this.mode === "play" && !this.dead) {
      this.steer(actions, dt);
      this.combat(actions, dt);
      this.waves(dt);
      this.pinGround();
      this.pinAir();
      this.strikeAir();
      this.bombsFall();
      this.cratesFall();
      this.steerDarts();
      this.enemyGuns(dt);
      this.groundGuns(dt);
      this.terrainKill();
    } else if (this.mode === "attract") {
      this.wavesDecor(dt);
    } else {
      this.wavesDecor(dt);
    }

    this.shake(dt);
  }

  private onCmd(cmd: "play" | "pause" | "resume" | "retry" | "title") {
    if (cmd === "pause" && this.mode === "play" && !this.dead) {
      this.scene.pause();
      useGameStore.getState().setPhase("paused");
      audio.stopEngine();
      return;
    }
    if (cmd === "resume") {
      if (this.scene.isPaused()) this.scene.resume();
      useGameStore.getState().setPhase("playing");
      audio.startEngine();
      return;
    }
    if (this.scene.isPaused()) this.scene.resume();
    if (cmd === "play" || cmd === "retry") {
      this.bootRun();
      useGameStore.getState().setPhase("playing");
      return;
    }
    if (cmd === "title") {
      this.bootAttract();
      useGameStore.getState().setPhase("title");
    }
  }

  private clearEntities() {
    const groups = [
      this.bullets,
      this.eBullets,
      this.bombGroup,
      this.enemies,
      this.trucks,
      this.crates,
      this.fx,
    ];
    for (const g of groups) {
      if (!g) continue;
      for (const child of g.getChildren()) {
        const s = child as Phaser.Physics.Arcade.Sprite;
        if (s.disableBody) s.disableBody(true, true);
      }
    }
    this.decor?.clear(true, true);
  }

  private bootRun() {
    this.overTimer?.remove(false);
    this.overTimer = null;
    this.mode = "play";
    this.worldX = 0;
    this.loadout = planeById(useGameStore.getState().planeId);
    this.hull = this.loadout.hull;
    this.bombs = this.loadout.bombs;
    this.score = 0;
    this.dead = false;
    this.gunCd = 0;
    this.gunHeat = 0;
    this.overheat = 0;
    this.bombCd = 0;
    this.invuln = 0;
    this.stretch = "air";
    this.stretchT = 0;
    this.spawnT = 0;
    this.decorT = 0;
    this.missionT = 0;
    this.beat = "intro";
    this.packI = 0;
    this.batteryOut = false;
    this.clearing = false;
    this.airTally = 0;
    this.groundTally = 0;
    this.lastHit = "air";
    this.trauma = 0;
    this.probeYaw = 0;
    this.lastVx = 0;
    this.lastVy = 0;
    this.forced.clear();
    input.setKeys([]);
    this.airKills = 0;
    this.clearEntities();
    this.applyStage();
    this.beginRun();
    this.syncHud();
  }

  private bootAttract() {
    this.overTimer?.remove(false);
    this.overTimer = null;
    this.mode = "attract";
    this.dead = false;
    this.forced.clear();
    input.setKeys([]);
    this.clearEntities();
    audio.stopEngine();
    if (this.player) {
      this.player.disableBody(true, true);
      this.player.setVisible(false);
    }
  }

  private beginRun() {
    this.applyLoadout();
    this.player.enableBody(true, 260, this.kit.startY, true, true);
    this.player.setVisible(true);
    this.player.setVelocity(0, 0);
    this.player.setAlpha(1);
    this.player.clearTint();
    audio.startEngine();
    this.syncHud();
  }

  private applyLoadout() {
    const p = planeById(useGameStore.getState().planeId);
    this.loadout = p;
    this.hull = p.hull;
    this.bombs = p.bombs;
    this.player.setTexture(p.id);
    this.player.setScale(p.scale);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(p.bodyW, p.bodyH).setOffset(p.bodyOx, p.bodyOy);
    this.player.play(`${p.id}-fly`, true);
    this.syncHud();
  }

  private applyStage() {
    const id = useGameStore.getState().worldId;
    this.kit = stageKit(id);
    this.mission = missionFor(id);
    this.groundDrawH = this.kit.groundDrawH;
    this.yMin = this.kit.yMin;
    this.scroll = this.kit.scroll ?? SCROLL_SPEED;
    const k = this.kit;
    const ts = GAME_HEIGHT / 864;
    const plate = (s: Phaser.GameObjects.TileSprite, key: string) => {
      if (s.texture.key !== key) s.setTexture(key);
      s.tileScaleX = ts;
      s.tileScaleY = ts;
    };
    plate(this.sky, k.sky);
    plate(this.far, k.far);
    plate(this.mid, k.mid);
    plate(this.near, k.near);
    plate(this.fg, k.fg);
    this.ground.setTexture(k.ground);
    const src = this.textures.get(k.ground).getSourceImage() as { height?: number };
    const texH = src?.height || 220;
    this.ground.setY(GAME_HEIGHT - k.groundDrawH);
    this.ground.setSize(GAME_WIDTH, k.groundDrawH);
    this.ground.tileScaleY = k.groundDrawH / texH;
    this.hm = this.cache.json.get(k.heightmap) as Heightmap;
    if (k.ceiling && k.ceilingmap) {
      plate(this.ceiling, k.ceiling);
      this.ceiling.setVisible(true);
      this.chm = this.cache.json.get(k.ceilingmap) as Heightmap;
    } else {
      this.ceiling.setVisible(false);
      this.chm = null;
    }
  }

  private poseCraft(moving: boolean, dt: number) {
    const key = `${this.loadout.id}-fly`;
    if (moving) {
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== key) {
        this.player.play(key, true);
      }
    } else if (this.player.anims.isPlaying) {
      this.player.anims.stop();
      this.player.setFrame(0);
    }
    const target = moving
      ? Phaser.Math.Clamp(this.lastVy * 0.00105, -0.32, 0.32) + this.loadout.trim
      : this.loadout.trim;
    const k = 1 - Math.exp(-12 * dt);
    this.player.setRotation(Phaser.Math.Linear(this.player.rotation, target, k));
  }

  private scrollBg() {
    const x = this.worldX;
    this.sky.tilePositionX = x * 0.12;
    this.far.tilePositionX = x * 0.28;
    this.mid.tilePositionX = x * 0.5;
    this.near.tilePositionX = x * 0.74;
    this.ground.tilePositionX = x;
    this.fg.tilePositionX = x * 1.18;
    if (this.ceiling.visible) this.ceiling.tilePositionX = x * 1.05;
  }

  private steer(actions: ReturnType<typeof input.sample>, dt: number) {
    if (actions.moveX < -0.05) this.probeYaw += 2.6 * dt;
    if (actions.moveX > 0.05) this.probeYaw -= 2.6 * dt;

    this.lastVx = actions.moveX * this.loadout.speed;
    this.lastVy = actions.moveY * this.loadout.speed;
    this.player.setVelocity(0, 0);

    let x = this.player.x + this.lastVx * dt;
    let y = this.player.y + this.lastVy * dt;
    x = Phaser.Math.Clamp(x, PLAYER_X_MIN, PLAYER_X_MAX);
    const gy = this.hm ? groundY(this.worldX + x, this.hm, this.groundDrawH) : GAME_HEIGHT - 80;
    const ceil = this.chm
      ? Math.max(this.yMin, ceilingY(this.worldX + x, this.chm) + 18)
      : this.yMin;
    if (y >= gy - 48) {
      this.player.setPosition(x, Math.min(y, gy - 8));
      this.crash("ground");
      return;
    }
    if (y <= ceil + 6) {
      this.player.setPosition(x, ceil + 10);
      this.crash("ground");
      return;
    }
    y = Phaser.Math.Clamp(y, ceil, gy - 36);
    this.player.setPosition(x, y);
    this.poseCraft(Math.hypot(actions.moveX, actions.moveY) > 0.12, dt);

    if (this.overheat > 0) {
      this.player.setTint(0xff6a4a);
    } else if (this.gunHeat > 0.7) {
      this.player.setTint(0xffb080);
    } else {
      this.player.clearTint();
    }

    if (this.invuln > 0) {
      this.invuln -= dt;
      this.player.setAlpha(Math.sin(this.invuln * 22) > 0 ? 0.35 : 1);
      if (this.invuln <= 0) this.player.setAlpha(1);
    }
  }

  private combat(actions: ReturnType<typeof input.sample>, dt: number) {
    this.tickGun(actions.fire, dt);
    this.bombCd = Math.max(0, this.bombCd - dt);
    if (actions.bomb && this.bombCd <= 0 && this.bombs > 0) {
      this.bombCd = BOMB_COOLDOWN;
      this.bombs -= 1;
      const bomb = this.bombGroup.get(this.player.x, this.player.y + 24) as Bomb | null;
      if (bomb) {
        bomb.drop(this.player.x, this.player.y + 24);
        audio.bombDrop();
      }
      this.syncHud();
      this.trySpawnCrate();
    }
  }

  private tickGun(firing: boolean, dt: number) {
    if (this.overheat > 0) {
      this.overheat = Math.max(0, this.overheat - dt);
      this.gunHeat = this.overheat / GUN_OVERHEAT_LOCK;
      if (this.overheat <= 0) {
        this.gunHeat = 0;
        audio.gunReady();
      }
      this.syncHud();
      return;
    }
    if (firing) {
      this.gunCd -= dt;
      let spread = 0;
      const p = this.loadout;
      while (this.gunCd <= 0) {
        const bx = this.player.x + p.muzzle + spread;
        const shot = (yOff: number) => {
          const b = this.bullets.get(bx, this.player.y + 8 + yOff) as Bullet | null;
          b?.fire(bx, this.player.y + 8 + yOff, true, {
            dmg: p.gunDamage,
            scale: p.bulletScale,
            tint: p.bulletTint,
            weave: p.weave,
          });
        };
        if (p.twin) {
          shot(-16);
          shot(16);
        } else {
          shot(0);
        }
        audio.gun();
        this.gunHeat = Math.min(1, this.gunHeat + p.heatPerShot);
        this.gunCd += p.gunCd;
        spread += BULLET_SPEED * p.gunCd * 0.35;
        if (this.gunHeat >= 1) {
          this.gunHeat = 1;
          this.overheat = GUN_OVERHEAT_LOCK;
          audio.overheat();
          break;
        }
        if (spread > 420) break;
      }
    } else {
      this.gunCd = Math.max(0, this.gunCd - dt);
      this.gunHeat = Math.max(0, this.gunHeat - GUN_COOL_RATE * dt);
    }
    this.syncHud();
  }

  private strikeAir() {
    for (const child of this.bullets.getChildren()) {
      const bullet = child as Bullet;
      if (!bullet.active || !bullet.fromPlayer) continue;
      for (const eChild of this.enemies.getChildren()) {
        const enemy = eChild as EnemyFighter;
        if (!enemy.active) continue;
        if (Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < 96) {
          this.hitAir(bullet, enemy);
          break;
        }
      }
    }
  }

  private steerDarts() {
    const pull = this.loadout.homing;
    if (pull <= 0) return;
    for (const child of this.bullets.getChildren()) {
      const b = child as Bullet;
      if (!b.active || !b.fromPlayer) continue;
      let best: EnemyFighter | null = null;
      let bestD = 420;
      for (const eChild of this.enemies.getChildren()) {
        const en = eChild as EnemyFighter;
        if (!en.active || en.x < b.x - 10) continue;
        const d = Phaser.Math.Distance.Between(b.x, b.y, en.x, en.y);
        if (d < bestD) {
          bestD = d;
          best = en;
        }
      }
      if (!best) continue;
      const vy = Phaser.Math.Clamp((best.y - b.y) * pull, -240, 240);
      b.setVelocity(BULLET_SPEED, vy);
    }
  }

  private bombsFall() {
    for (const child of this.bombGroup.getChildren()) {
      const bomb = child as Bomb;
      if (!bomb.active || !this.hm) continue;
      const gy = groundY(this.worldX + bomb.x, this.hm, this.groundDrawH);
      if (bomb.y >= gy - 8) this.detonate(bomb.x, gy - 6, bomb);
    }
  }

  private cratesFall() {
    if (!this.hm || this.dead) return;
    for (const child of this.crates.getChildren()) {
      const crate = child as CrateDrop;
      if (!crate.active) continue;
      if (Phaser.Math.Distance.Between(crate.x, crate.y, this.player.x, this.player.y) < 110) {
        this.snagCrate(crate);
        continue;
      }
      const gy = groundY(this.worldX + crate.x, this.hm, this.groundDrawH);
      if (crate.y >= gy - 28) crate.disableBody(true, true);
    }
  }

  private trySpawnCrate() {
    if (this.mode !== "play" || this.dead) return;
    if (this.airKills < AIR_KILLS_PER_CRATE) return;
    if (this.crates.countActive(true) > 0) return;
    if (this.bombs >= this.loadout.bombs) return;
    if (this.loadout.bombs > 3 && this.bombs > BOMB_CRATE_AT) return;
    this.airKills = 0;
    this.spawnCrate();
  }

  private spawnCrate() {
    const x = Phaser.Math.Clamp(this.player.x + 48, PLAYER_X_MIN + 40, PLAYER_X_MAX - 16);
    const crate = this.crates.get(x, -36) as CrateDrop | null;
    crate?.drop(x, -36);
  }

  private snagCrate(crate: CrateDrop) {
    if (!crate.active || this.dead) return;
    crate.disableBody(true, true);
    this.bombs = Math.min(this.loadout.bombs, this.bombs + BOMB_PICKUP);
    this.playFx(this.player.x + 20, this.player.y, "hit");
    this.trauma = Math.min(1, this.trauma + 0.18);
    audio.pickup();
    this.syncHud();
  }

  private detonate(x: number, y: number, bomb: Bomb) {
    bomb.disableBody(true, true);
    this.playFx(x, y, "blast");
    this.trauma = Math.min(1, this.trauma + this.loadout.bombTrauma);
    audio.boom();
    const blast = this.loadout.blast;
    for (const child of this.trucks.getChildren()) {
      const truck = child as Truck;
      if (!circleHits(x, y, truck, blast + 20)) continue;
      this.killTruck(truck);
    }
    for (const child of this.enemies.getChildren()) {
      const en = child as EnemyFighter;
      if (en.active && en.y > GAME_HEIGHT * 0.52 && circleHits(x, y, en, blast)) {
        this.killEnemy(en, true);
      }
    }
  }

  private waves(dt: number) {
    if (this.clearing || this.dead) {
      this.reapDecor();
      return;
    }
    this.missionT += dt;
    this.decorT += dt;
    const next = beatAt(this.missionT, this.mission);
    if (next !== this.beat) {
      this.beat = next;
      this.syncHud();
    }
    const packs = this.mission.packs;
    while (this.packI < packs.length && this.missionT >= packs[this.packI].t) {
      this.firePack(packs[this.packI]);
      this.packI += 1;
    }
    if (this.beat === "battery") {
      const left = this.trucks.countActive(true);
      let bossUp = false;
      for (const child of this.enemies.getChildren()) {
        const e = child as EnemyFighter;
        if (e.active && e.kind === "boss") bossUp = true;
      }
      const wait = this.mission.holdForBoss ? 14 : 10;
      if (this.batteryOut && left === 0 && !bossUp && this.missionT > this.mission.countyEnd + wait) {
        this.finishMission();
      }
    }
    if (this.missionT >= this.mission.end) {
      let bossUp = false;
      if (this.mission.holdForBoss) {
        for (const child of this.enemies.getChildren()) {
          const e = child as EnemyFighter;
          if (e.active && e.kind === "boss") bossUp = true;
        }
      }
      if (!bossUp) this.finishMission();
    }

    if (this.decorT > (this.kit.decorEvery ?? 3.4)) {
      this.decorT = 0;
      this.spawnDecor();
    }
    this.reapDecor();
  }

  private firePack(pack: Pack) {
    for (const a of pack.air ?? []) {
      this.spawnEnemy(a.kind, a.y, a.dx ?? 0, a.speed);
    }
    for (const g of pack.ground ?? []) {
      this.spawnTruck(g.kind, g.dx ?? 0, g.ledge ?? 0);
    }
    if (this.beat === "battery") this.batteryOut = true;
  }

  private wavesDecor(dt: number) {
    this.decorT += dt;
    if (this.decorT > (this.kit.decorEvery ?? 2.8)) {
      this.decorT = 0;
      this.spawnDecor();
    }
    this.reapDecor();
  }

  private spawnEnemy(kind: AirKind, y: number, dx = 0, speed?: number) {
    const x = GAME_WIDTH + 70 + dx;
    let vy = Phaser.Math.Clamp(y, this.kit.airMin, this.kit.airMax);
    if (this.chm && this.hm) {
      const ceil = ceilingY(this.worldX + x, this.chm) + 40;
      const floor = groundY(this.worldX + x, this.hm, this.groundDrawH) - 56;
      vy = Phaser.Math.Clamp(vy, ceil, Math.max(ceil + 20, floor));
    }
    const mul = this.kit.airSpeed ?? 1;
    const base =
      speed ??
      (kind === "trainer"
        ? -(130 + Math.random() * 30)
        : kind === "boss"
          ? -92
          : kind === "heavy"
            ? -140
            : -(185 + Math.random() * 50));
    const vx = speed != null || kind === "boss" ? base : base * mul;
    const tex = kind === "boss" ? (this.kit.enemyBoss ?? this.kit.enemy) : this.kit.enemy;
    const anim = kind === "boss" ? (this.kit.enemyBossAnim ?? this.kit.enemyAnim) : this.kit.enemyAnim;
    const hp =
      kind === "boss"
        ? this.kit.hp?.boss
        : kind === "heavy"
          ? this.kit.hp?.heavy
          : kind === "trainer"
            ? this.kit.hp?.trainer
            : this.kit.hp?.fighter;
    const e = this.enemies.get(x, vy) as EnemyFighter | null;
    e?.launch(x, vy, vx, {
      kind,
      texture: tex,
      anim,
      hp,
    });
  }

  private spawnTruck(kind: GroundKind = "truck", dx = 0, _ledge = 0) {
    if (!this.hm) return;
    const x = GAME_WIDTH + 90 + dx;
    const y = groundY(this.worldX + x, this.hm, this.groundDrawH) + 6;
    const t = this.trucks.get(x, y) as Truck | null;
    t?.place(x, y, this.scroll, kind, {
      truck: this.kit.truck,
      tank: this.kit.tank,
      aa: this.kit.aa,
      truckAnim: this.kit.truckAnim,
      tankAnim: this.kit.tankAnim,
      aaAnim: this.kit.aaAnim,
      radar: this.kit.radar,
      hpTruck: this.kit.hp?.truck,
      hpAa: this.kit.hp?.aa,
      hpTank: this.kit.hp?.tank,
    });
  }

  private pinGround() {
    if (!this.hm) return;
    for (const child of this.trucks.getChildren()) {
      const t = child as Truck;
      if (!t.active) continue;
      t.y = groundY(this.worldX + t.x, this.hm, this.groundDrawH) + 6 - (t.ledge || 0);
      t.setVelocity(-this.scroll, 0);
    }
  }

  private pinAir() {
    if (!this.chm || !this.hm) return;
    for (const child of this.enemies.getChildren()) {
      const e = child as EnemyFighter;
      if (!e.active) continue;
      const ceil = ceilingY(this.worldX + e.x, this.chm) + 40;
      const floor = groundY(this.worldX + e.x, this.hm, this.groundDrawH) - 56;
      if (e.y < ceil) e.y = ceil;
      if (e.y > floor) e.y = floor;
    }
  }

  private spawnDecor() {
    if (!this.hm) return;
    const props = this.kit.decor;
    const pick = props[Math.floor(Math.random() * props.length)];
    const x = GAME_WIDTH + 80 + Math.random() * 80;
    const gy = groundY(this.worldX + x, this.hm, this.groundDrawH);
    const img = this.add
      .image(x, gy + pick.plant, pick.key)
      .setOrigin(0.5, 1)
      .setDepth(pick.depth ?? 20)
      .setScale(pick.scale);
    this.decor.add(img);
  }

  private reapDecor() {
    const dt = Math.min((this.game.loop.rawDelta || this.game.loop.delta) / 1000, 0.5);
    for (const child of this.decor.getChildren().slice()) {
      const img = child as Phaser.GameObjects.Image;
      img.x -= this.scroll * dt;
      if (img.x < -240) {
        this.decor.remove(img, true, true);
      }
    }
  }

  private enemyGuns(dt: number) {
    for (const child of this.enemies.getChildren()) {
      const en = child as EnemyFighter;
      if (!en.active || en.kind === "trainer") continue;
      en.fireAcc -= dt;
      if (en.fireAcc <= 0 && en.x < GAME_WIDTH - 40 && en.x > 280) {
        en.fireAcc = en.kind === "heavy" ? 1.7 : 1.35 + Math.random() * 0.5;
        const b = this.eBullets.get(en.x - 40, en.y + 6) as Bullet | null;
        b?.fire(en.x - 40, en.y + 6, false);
      }
    }
  }

  private groundGuns(dt: number) {
    for (const child of this.trucks.getChildren()) {
      const truck = child as Truck;
      if (!truck.active || truck.kind !== "aa") continue;
      truck.fireAcc -= dt;
      if (truck.fireAcc > 0 || truck.x > GAME_WIDTH - 30 || truck.x < 160) continue;
      truck.fireAcc = 1.55;
      const muzzleY = truck.y - 128;
      const b = this.eBullets.get(truck.x - 10, muzzleY) as Bullet | null;
      if (!b) continue;
      b.fire(truck.x - 10, muzzleY, false, { fromAa: true });
      const px = this.player?.x ?? 200;
      const py = this.player?.y ?? 200;
      const dx = px - (truck.x - 10);
      const dy = py - muzzleY;
      const mag = Math.hypot(dx, dy) || 1;
      b.setVelocity((dx / mag) * 320, (dy / mag) * 320);
    }
  }

  private hitGround(bullet: Bullet, truck: Truck) {
    if (!bullet.active || !truck.active) return;
    if (!bullet.fromPlayer) return;
    bullet.disableBody(true, true);
    truck.hp -= bullet.dmg;
    truck.setTintFill(0xffffff);
    this.time.delayedCall(40, () => {
      if (truck.active) truck.clearTint();
    });
    this.playFx(truck.x, truck.y - 56, "hit");
    audio.spark();
    if (truck.hp <= 0) this.killTruck(truck);
  }

  private hitAir(bullet: Bullet, enemy: EnemyFighter) {
    if (!bullet.active || !enemy.active) return;
    if (!bullet.fromPlayer) return;
    bullet.disableBody(true, true);
    enemy.hp -= bullet.dmg;
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(40, () => enemy.clearTint());
    this.playFx(enemy.x, enemy.y, "hit");
    audio.spark();
    if (enemy.hp <= 0) this.killEnemy(enemy, false, true);
  }

  private ramAir(enemy: EnemyFighter) {
    if (!enemy.active) return;
    if (enemy.kind === "heavy") {
      enemy.hp -= 1;
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(40, () => enemy.clearTint());
      this.hurt("ram");
      if (enemy.hp <= 0) this.killEnemy(enemy, false);
      return;
    }
    this.killEnemy(enemy, false);
    this.hurt("ram");
  }

  private killEnemy(enemy: EnemyFighter, bombClip: boolean, fromGun = false) {
    if (!enemy.active) return;
    this.playFx(enemy.x, enemy.y, "hit");
    const heavy = enemy.kind === "heavy";
    enemy.disableBody(true, true);
    this.score +=
      enemy.kind === "boss"
        ? SCORE_BOSS
        : heavy
          ? SCORE_HEAVY
          : bombClip
            ? SCORE_AIR + SCORE_LOW_CLIP
            : SCORE_AIR;
    this.airTally += 1;
    if (fromGun) {
      this.airKills += 1;
      this.trySpawnCrate();
    }
    this.syncHud();
  }

  private killTruck(truck: Truck) {
    if (!truck.active) return;
    this.playFx(truck.x, truck.y - 30, "blast");
    const kind = truck.kind;
    truck.disableBody(true, true);
    this.score +=
      kind === "tank" ? SCORE_TANK_BOMB : kind === "aa" ? SCORE_AA_BOMB : SCORE_GROUND_BOMB;
    this.groundTally += 1;
    this.syncHud();
  }

  private playFx(x: number, y: number, kind: "hit" | "blast") {
    const s = this.fx.get(x, y) as FxSprite | null;
    s?.burst(x, y, kind);
  }

  private hurt(cause: EndCause = "air") {
    if (this.dead || this.invuln > 0 || this.mode !== "play") return;
    this.lastHit = cause;
    this.hull -= 1;
    this.invuln = INVULN_TIME;
    this.trauma = Math.min(1, this.trauma + 0.4);
    audio.hurt();
    this.syncHud();
    if (this.hull <= 0) this.crash();
  }

  private terrainKill() {
    if (!this.hm || this.dead) return;
    const gy = groundY(this.worldX + this.player.x, this.hm, this.groundDrawH);
    if (this.player.y + 22 >= gy) this.crash("ground");
    if (this.chm && this.player.y - 18 <= ceilingY(this.worldX + this.player.x, this.chm)) {
      this.crash("ground");
    }
  }

  private crash(cause?: EndCause) {
    if (this.dead || this.clearing) return;
    if (cause) this.lastHit = cause;
    this.dead = true;
    this.playFx(this.player.x, this.player.y, "blast");
    this.player.disableBody(true, true);
    this.player.setVisible(false);
    this.trauma = 1;
    audio.crash();
    audio.stopEngine();
    this.overTimer?.remove(false);
    this.overTimer = this.time.delayedCall(480, () => {
      if (!this.dead) return;
      useGameStore.getState().recordScore(this.score, {
        cleared: false,
        medal: medalFor(this.score, useGameStore.getState().worldId),
        airKills: this.airTally,
        groundKills: this.groundTally,
        endCause: this.lastHit,
      });
    });
  }

  private finishMission() {
    if (this.dead || this.clearing) return;
    this.clearing = true;
    this.beat = "clear";
    this.score += this.hull * SCORE_SURVIVE_HULL + SCORE_CLEAR;
    this.syncHud();
    audio.pickup();
    this.overTimer?.remove(false);
    this.overTimer = this.time.delayedCall(1100, () => {
      if (this.dead) return;
      this.player.disableBody(true, true);
      audio.stopEngine();
      useGameStore.getState().recordScore(this.score, {
        cleared: true,
        medal: medalFor(this.score, useGameStore.getState().worldId),
        airKills: this.airTally,
        groundKills: this.groundTally,
        endCause: "clear",
      });
    });
  }

  private shake(dt: number) {
    this.trauma = Math.max(0, this.trauma - dt * 2.4);
    const mag = this.trauma * this.trauma * 16;
    this.cameras.main.setScroll(
      (Math.random() - 0.5) * mag,
      (Math.random() - 0.5) * mag,
    );
  }

  private syncHud() {
    useGameStore.getState().setHud({
      hull: this.hull,
      hullMax: this.loadout.hull,
      bombs: this.bombs,
      bombsMax: this.loadout.bombs,
      score: this.score,
      gunHeat: this.gunHeat,
      gunHot: this.overheat > 0,
      beat: this.mission.beats[this.beat],
    });
  }
}
