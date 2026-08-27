import { a as useGameStore, c as GAME_WIDTH, d as INVULN_TIME, f as PLAYER_X_MAX, i as audio, n as bridge, r as input, s as BOMB_COOLDOWN, u as GUN_COOLDOWN } from "./routes-DiLhIvX-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createGame-Dux8zLyW.js
var Phaser = {
	Scene: class Scene {
		constructor() {}
	},
	Game: class Game {
		constructor() {}
		destroy() {}
		events = { once() {} };
	},
	AUTO: 1,
	Scale: {
		FIT: 0,
		CENTER_BOTH: 0
	},
	Core: { Events: { DESTROY: "destroy" } }
};
var BootScene = class extends Phaser.Scene {
	constructor() {
		super("boot");
	}
	create() {
		this.scene.start("preload");
	}
};
function bodyOf(sprite) {
	return sprite.body;
}
var Bullet = class extends Phaser.Physics.Arcade.Sprite {
	fromPlayer = true;
	constructor(scene, x, y) {
		super(scene, x, y, "bullet");
	}
	fire(x, y, fromPlayer) {
		this.fromPlayer = fromPlayer;
		this.enableBody(true, x, y, true, true);
		this.setDepth(70);
		this.setScale(fromPlayer ? .34 : .3);
		this.setFlipX(!fromPlayer);
		this.setTint(fromPlayer ? 16777215 : 16746598);
		this.setVelocity(fromPlayer ? 780 : -300, 0);
		this.play("bullet-fly", true);
		bodyOf(this)?.setSize(96, 36).setOffset(16, 46);
	}
	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (!this.active) return;
		if (this.x > 1360 || this.x < -80) this.disableBody(true, true);
	}
};
var Bomb = class extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "bomb");
	}
	drop(x, y) {
		this.enableBody(true, x, y, true, true);
		this.setDepth(65);
		this.setScale(.38);
		this.setVelocity(40, 80);
		this.setAngularVelocity(40);
		const body = bodyOf(this);
		body?.setAllowGravity(true);
		body?.setGravityY(980);
		body?.setSize(48, 70).setOffset(40, 30);
		this.play("bomb-spin", true);
	}
	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (!this.active) return;
		if (this.y > 780) this.disableBody(true, true);
	}
};
var EnemyFighter = class extends Phaser.Physics.Arcade.Sprite {
	hp = 2;
	fireAcc = .6;
	low = false;
	constructor(scene, x, y) {
		super(scene, x, y, "enemy");
	}
	launch(x, y, speed, low) {
		this.hp = 2;
		this.low = low;
		this.fireAcc = .4 + Math.random() * .8;
		this.enableBody(true, x, y, true, true);
		this.setDepth(55);
		this.setScale(.58);
		this.setVelocity(speed, (Math.random() - .5) * 30);
		this.play("enemy-fly", true);
		bodyOf(this)?.setSize(220, 88).setOffset(18, 84);
	}
	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (!this.active) return;
		if (this.x < -140) this.disableBody(true, true);
	}
};
var Truck = class extends Phaser.Physics.Arcade.Sprite {
	hp = 1;
	constructor(scene, x, y) {
		super(scene, x, y, "truck");
	}
	place(x, y, scroll) {
		this.hp = 1;
		this.enableBody(true, x, y, true, true);
		this.setDepth(42);
		this.setScale(.52);
		this.setOrigin(.5, 1);
		this.setVelocity(-scroll, 0);
		this.play("truck-idle", true);
		bodyOf(this)?.setSize(210, 90).setOffset(22, 150);
	}
	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		if (!this.active) return;
		if (this.x < -180) this.disableBody(true, true);
	}
};
var FxSprite = class extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "hit");
	}
	burst(x, y, kind) {
		this.enableBody(true, x, y, true, true);
		bodyOf(this)?.setAllowGravity(false);
		this.setVelocity(0, 0);
		this.setDepth(80);
		this.setScale(kind === "blast" ? .95 : .7);
		this.off("animationcomplete");
		this.play(kind === "blast" ? "blast" : "hit");
		this.once("animationcomplete", () => this.disableBody(true, true));
	}
};
function circleHits(x, y, sprite, radius = 92) {
	if (!sprite.active) return false;
	return Phaser.Math.Distance.Between(x, y, sprite.x, sprite.y) <= radius;
}
function groundY(worldX, hm) {
	const w = hm.width;
	const local = (worldX % w + w) % w;
	const i = Math.min(w - 1, Math.floor(local));
	return 552 + (hm.tops[i] ?? 8) / hm.height * 168;
}
function asSprite(obj) {
	if (!obj || typeof obj !== "object") return null;
	const rec = obj;
	if (typeof rec.disableBody === "function") return obj;
	if (rec.gameObject && typeof rec.gameObject.disableBody === "function") return rec.gameObject;
	return null;
}
function asBullet(obj) {
	const s = asSprite(obj);
	if (s && "fromPlayer" in s) return s;
	return null;
}
function asEnemy(obj) {
	const s = asSprite(obj);
	if (s && "fireAcc" in s) return s;
	return null;
}
var GameScene = class extends Phaser.Scene {
	mode = "attract";
	worldX = 0;
	hull = 3;
	bombs = 8;
	score = 0;
	dead = false;
	gunCd = 0;
	bombCd = 0;
	invuln = 0;
	stretch = "air";
	stretchT = 0;
	spawnT = 0;
	decorT = 0;
	trauma = 0;
	probeYaw = 0;
	lastVx = 0;
	lastVy = 0;
	forced = /* @__PURE__ */ new Set();
	unsub = () => {};
	hm = null;
	overTimer = null;
	sky;
	far;
	mid;
	near;
	ground;
	fg;
	player;
	bullets;
	eBullets;
	bombGroup;
	enemies;
	trucks;
	fx;
	decor;
	constructor() {
		super("game");
	}
	init(data) {
		const phase = useGameStore.getState().phase;
		this.mode = data?.mode === "play" || phase === "playing" ? "play" : "attract";
		this.worldX = 0;
		this.hull = 3;
		this.bombs = 8;
		this.score = 0;
		this.dead = false;
		this.gunCd = 0;
		this.bombCd = 0;
		this.invuln = 0;
		this.stretch = "air";
		this.stretchT = 0;
		this.spawnT = 0;
		this.decorT = 0;
		this.trauma = 0;
		this.probeYaw = 0;
		this.lastVx = 0;
		this.lastVy = 0;
		this.forced = /* @__PURE__ */ new Set();
	}
	create() {
		this.hm = this.cache.json.get("heightmap");
		window.__fnfBuild = 6;
		this.physics.world.setBounds(0, 0, GAME_WIDTH, 720);
		this.physics.world.gravity.y = 0;
		const tile = (key, depth) => {
			const s = this.add.tileSprite(0, 0, GAME_WIDTH, 720, key).setOrigin(0).setDepth(depth).setScrollFactor(0);
			s.tileScaleX = 720 / 864;
			s.tileScaleY = 720 / 864;
			return s;
		};
		this.sky = tile("sky", 0);
		this.far = tile("far", 1);
		this.mid = tile("mid", 2);
		this.near = tile("near", 3);
		this.ground = this.add.tileSprite(0, 552, GAME_WIDTH, 168, "ground").setOrigin(0).setDepth(8).setScrollFactor(0);
		this.ground.tileScaleY = 168 / 220;
		this.fg = tile("foreground", 90);
		this.bullets = this.physics.add.group({
			classType: Bullet,
			maxSize: 48,
			runChildUpdate: true
		});
		this.eBullets = this.physics.add.group({
			classType: Bullet,
			maxSize: 32,
			runChildUpdate: true
		});
		this.bombGroup = this.physics.add.group({
			classType: Bomb,
			maxSize: 12,
			runChildUpdate: true
		});
		this.enemies = this.physics.add.group({
			classType: EnemyFighter,
			maxSize: 16,
			runChildUpdate: true
		});
		this.trucks = this.physics.add.group({
			classType: Truck,
			maxSize: 12,
			runChildUpdate: true
		});
		this.fx = this.physics.add.group({
			classType: FxSprite,
			maxSize: 20,
			runChildUpdate: true
		});
		this.decor = this.add.group();
		this.player = this.physics.add.sprite(260, 260, "hornet");
		this.player.setDepth(60);
		this.player.setScale(.7);
		this.player.setCollideWorldBounds(false);
		const pbody = this.player.body;
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
			asBullet(a)?.disableBody(true, true);
			this.hurt();
		});
		this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
			const enemy = asEnemy(e);
			if (enemy) this.ramAir(enemy);
		});
		this.physics.add.overlap(this.player, this.trucks, () => this.hurt());
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
			getBuild: () => 6
		};
		if (this.mode === "play") this.beginRun();
		this.syncHud();
		useGameStore.getState().setReady();
	}
	update(_time, deltaMs) {
		const raw = this.game.loop.rawDelta || deltaMs;
		const dt = Math.min(Math.max(raw, deltaMs) / 1e3, .5);
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
		this.worldX += 195 * dt;
		this.scrollBg();
		if (this.mode === "play" && !this.dead) {
			this.steer(actions, dt);
			this.combat(actions, dt);
			this.waves(dt);
			this.strikeAir();
			this.bombsFall();
			this.enemyGuns(dt);
			this.terrainKill();
		} else if (this.mode === "attract") this.wavesDecor(dt);
		else this.wavesDecor(dt);
		this.shake(dt);
	}
	onCmd(cmd) {
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
	clearEntities() {
		const groups = [
			this.bullets,
			this.eBullets,
			this.bombGroup,
			this.enemies,
			this.trucks,
			this.fx
		];
		for (const g of groups) {
			if (!g) continue;
			for (const child of g.getChildren()) {
				const s = child;
				if (s.disableBody) s.disableBody(true, true);
			}
		}
		this.decor?.clear(true, true);
	}
	bootRun() {
		this.overTimer?.remove(false);
		this.overTimer = null;
		this.mode = "play";
		this.worldX = 0;
		this.hull = 3;
		this.bombs = 8;
		this.score = 0;
		this.dead = false;
		this.gunCd = 0;
		this.bombCd = 0;
		this.invuln = 0;
		this.stretch = "air";
		this.stretchT = 0;
		this.spawnT = 0;
		this.decorT = 0;
		this.trauma = 0;
		this.probeYaw = 0;
		this.lastVx = 0;
		this.lastVy = 0;
		this.forced.clear();
		input.setKeys([]);
		this.clearEntities();
		this.beginRun();
		this.syncHud();
	}
	bootAttract() {
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
	beginRun() {
		this.player.enableBody(true, 260, 260, true, true);
		this.player.setVisible(true);
		this.player.setVelocity(0, 0);
		this.player.setAlpha(1);
		audio.startEngine();
		this.syncHud();
	}
	scrollBg() {
		const x = this.worldX;
		this.sky.tilePositionX = x * .12;
		this.far.tilePositionX = x * .28;
		this.mid.tilePositionX = x * .5;
		this.near.tilePositionX = x * .74;
		this.ground.tilePositionX = x;
		this.fg.tilePositionX = x * 1.18;
	}
	steer(actions, dt) {
		if (actions.moveX < -.05) this.probeYaw += 2.6 * dt;
		if (actions.moveX > .05) this.probeYaw -= 2.6 * dt;
		this.lastVx = actions.moveX * 305;
		this.lastVy = actions.moveY * 305;
		this.player.setVelocity(0, 0);
		let x = this.player.x + this.lastVx * dt;
		let y = this.player.y + this.lastVy * dt;
		x = Phaser.Math.Clamp(x, 88, PLAYER_X_MAX);
		const gy = this.hm ? groundY(this.worldX + x, this.hm) : 640;
		if (y >= gy - 48) {
			this.player.setPosition(x, Math.min(y, gy - 8));
			this.crash();
			return;
		}
		y = Phaser.Math.Clamp(y, 48, gy - 36);
		this.player.setPosition(x, y);
		this.player.setRotation(Phaser.Math.Clamp(this.lastVy * .00115, -.38, .38));
		if (this.invuln > 0) {
			this.invuln -= dt;
			this.player.setAlpha(Math.sin(this.invuln * 22) > 0 ? .35 : 1);
			if (this.invuln <= 0) this.player.setAlpha(1);
		}
	}
	combat(actions, dt) {
		if (actions.fire) {
			this.gunCd -= dt;
			let spread = 0;
			while (this.gunCd <= 0) {
				const bx = this.player.x + 70 + spread;
				const b = this.bullets.get(bx, this.player.y + 8);
				if (b) {
					b.fire(bx, this.player.y + 8, true);
					audio.gun();
				}
				this.gunCd += GUN_COOLDOWN;
				spread += 780 * GUN_COOLDOWN * .35;
				if (spread > 420) break;
			}
		} else this.gunCd = Math.max(0, this.gunCd - dt);
		this.bombCd = Math.max(0, this.bombCd - dt);
		if (actions.bomb && this.bombCd <= 0 && this.bombs > 0) {
			this.bombCd = BOMB_COOLDOWN;
			this.bombs -= 1;
			const bomb = this.bombGroup.get(this.player.x, this.player.y + 24);
			if (bomb) {
				bomb.drop(this.player.x, this.player.y + 24);
				audio.bombDrop();
			}
			this.syncHud();
		}
	}
	strikeAir() {
		for (const child of this.bullets.getChildren()) {
			const bullet = child;
			if (!bullet.active || !bullet.fromPlayer) continue;
			for (const eChild of this.enemies.getChildren()) {
				const enemy = eChild;
				if (!enemy.active) continue;
				if (Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < 96) {
					this.hitAir(bullet, enemy);
					break;
				}
			}
		}
	}
	bombsFall() {
		for (const child of this.bombGroup.getChildren()) {
			const bomb = child;
			if (!bomb.active || !this.hm) continue;
			const gy = groundY(this.worldX + bomb.x, this.hm);
			if (bomb.y >= gy - 8) this.detonate(bomb.x, gy - 6, bomb);
		}
	}
	detonate(x, y, bomb) {
		bomb.disableBody(true, true);
		this.playFx(x, y, "blast");
		this.trauma = Math.min(1, this.trauma + .72);
		audio.boom();
		for (const child of this.trucks.getChildren()) {
			const truck = child;
			if (circleHits(x, y, truck, 112)) this.killTruck(truck);
		}
		for (const child of this.enemies.getChildren()) {
			const en = child;
			if (en.active && en.y > 720 * .52 && circleHits(x, y, en, 92)) this.killEnemy(en, true);
		}
	}
	waves(dt) {
		this.stretchT += dt;
		this.spawnT += dt;
		this.decorT += dt;
		if (this.stretch === "air") {
			if (this.spawnT >= 1.2) {
				this.spawnT = 0;
				this.spawnEnemy(false);
			}
			if (this.stretchT >= 9.2) {
				this.stretch = "ground";
				this.stretchT = 0;
				this.spawnT = 1.2;
			}
		} else {
			if (this.spawnT >= 2.35) {
				this.spawnT = 0;
				this.spawnTruck();
			}
			if (this.stretchT > 4.6 && this.stretchT < 4.6 + dt + .02) this.spawnEnemy(true);
			if (this.stretchT >= 10.4) {
				this.stretch = "air";
				this.stretchT = 0;
				this.spawnT = .4;
			}
		}
		if (this.decorT > 3.4) {
			this.decorT = 0;
			this.spawnDecor();
		}
		this.reapDecor();
	}
	wavesDecor(dt) {
		this.decorT += dt;
		if (this.decorT > 2.8) {
			this.decorT = 0;
			this.spawnDecor();
		}
		this.reapDecor();
	}
	spawnEnemy(low) {
		const py = this.player?.active ? this.player.y : 260;
		const y = low ? Phaser.Math.Between(720 * .52, 446.4) : Math.random() < .6 ? Phaser.Math.Clamp(py + Phaser.Math.Between(-42, 42), 90, 360) : Phaser.Math.Between(80, 720 * .48);
		const speed = -(160 + Math.random() * 90);
		this.enemies.get(GAME_WIDTH + 70, y)?.launch(GAME_WIDTH + 70, y, speed, low);
	}
	spawnTruck() {
		if (!this.hm) return;
		const x = GAME_WIDTH + 90;
		const y = groundY(this.worldX + x, this.hm) + 6;
		this.trucks.get(x, y)?.place(x, y, 195);
	}
	spawnDecor() {
		if (!this.hm) return;
		const pick = [
			"barn",
			"silo",
			"hay",
			"fence",
			"fence"
		][Math.floor(Math.random() * 5)];
		const x = GAME_WIDTH + 80 + Math.random() * 80;
		const gy = groundY(this.worldX + x, this.hm);
		const img = this.add.image(x, gy + 8, pick).setOrigin(.5, 1).setDepth(20);
		if (pick === "barn") img.setScale(.72);
		if (pick === "silo") img.setScale(.7);
		if (pick === "hay") img.setScale(.55);
		if (pick === "fence") img.setScale(1).setDepth(35);
		this.decor.add(img);
	}
	reapDecor() {
		const dt = Math.min((this.game.loop.rawDelta || this.game.loop.delta) / 1e3, .5);
		for (const child of this.decor.getChildren().slice()) {
			const img = child;
			img.x -= 195 * dt;
			if (img.x < -240) this.decor.remove(img, true, true);
		}
	}
	enemyGuns(dt) {
		for (const child of this.enemies.getChildren()) {
			const en = child;
			if (!en.active) continue;
			en.fireAcc -= dt;
			if (en.fireAcc <= 0 && en.x < 1240 && en.x > 280) {
				en.fireAcc = 1.8 + Math.random() * .8;
				this.eBullets.get(en.x - 40, en.y + 6)?.fire(en.x - 40, en.y + 6, false);
			}
		}
	}
	hitAir(bullet, enemy) {
		if (!bullet.active || !enemy.active) return;
		if (!bullet.fromPlayer) return;
		bullet.disableBody(true, true);
		enemy.hp -= 1;
		enemy.setTintFill(16777215);
		this.time.delayedCall(40, () => enemy.clearTint());
		this.playFx(enemy.x, enemy.y, "hit");
		audio.spark();
		if (enemy.hp <= 0) this.killEnemy(enemy, false);
	}
	ramAir(enemy) {
		if (!enemy.active) return;
		this.killEnemy(enemy, false);
		this.hurt();
	}
	killEnemy(enemy, bombClip) {
		if (!enemy.active) return;
		this.playFx(enemy.x, enemy.y, "hit");
		enemy.disableBody(true, true);
		this.score += bombClip ? 230 : 150;
		this.syncHud();
	}
	killTruck(truck) {
		if (!truck.active) return;
		this.playFx(truck.x, truck.y - 30, "blast");
		truck.disableBody(true, true);
		this.score += 300;
		this.syncHud();
	}
	playFx(x, y, kind) {
		this.fx.get(x, y)?.burst(x, y, kind);
	}
	hurt() {
		if (this.dead || this.invuln > 0 || this.mode !== "play") return;
		this.hull -= 1;
		this.invuln = INVULN_TIME;
		this.trauma = Math.min(1, this.trauma + .4);
		audio.hurt();
		this.syncHud();
		if (this.hull <= 0) this.crash();
	}
	terrainKill() {
		if (!this.hm || this.dead) return;
		const gy = groundY(this.worldX + this.player.x, this.hm);
		if (this.player.y + 22 >= gy) this.crash();
	}
	crash() {
		if (this.dead) return;
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
			useGameStore.getState().recordScore(this.score);
		});
	}
	shake(dt) {
		this.trauma = Math.max(0, this.trauma - dt * 2.4);
		const mag = this.trauma * this.trauma * 16;
		this.cameras.main.setScroll((Math.random() - .5) * mag, (Math.random() - .5) * mag);
	}
	syncHud() {
		useGameStore.getState().setHud({
			hull: this.hull,
			bombs: this.bombs,
			score: this.score
		});
	}
};
var PreloadScene = class extends Phaser.Scene {
	constructor() {
		super("preload");
	}
	preload() {
		this.load.image("sky", "/game/sky.png");
		this.load.image("far", "/game/far.png");
		this.load.image("mid", "/game/mid.png");
		this.load.image("near", "/game/near.png");
		this.load.image("foreground", "/game/foreground.png");
		this.load.image("ground", "/game/ground.png");
		this.load.image("fence", "/game/fence.png");
		this.load.image("barn", "/game/barn.png");
		this.load.image("silo", "/game/silo.png");
		this.load.image("hay", "/game/hay.png");
		this.load.spritesheet("hornet", "/game/hornet.png", {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet("enemy", "/game/enemy.png", {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet("truck", "/game/truck.png", {
			frameWidth: 256,
			frameHeight: 256
		});
		this.load.spritesheet("bullet", "/game/bullet.png", {
			frameWidth: 128,
			frameHeight: 128
		});
		this.load.spritesheet("bomb", "/game/bomb.png", {
			frameWidth: 128,
			frameHeight: 128
		});
		this.load.spritesheet("hit", "/game/hit.png", {
			frameWidth: 160,
			frameHeight: 160
		});
		this.load.spritesheet("blast", "/game/blast.png", {
			frameWidth: 220,
			frameHeight: 220
		});
		this.load.json("heightmap", "/game/ground-heightmap.json");
	}
	create() {
		this.anims.create({
			key: "hornet-fly",
			frames: this.anims.generateFrameNumbers("hornet", {
				start: 0,
				end: 3
			}),
			frameRate: 10,
			repeat: -1
		});
		this.anims.create({
			key: "enemy-fly",
			frames: this.anims.generateFrameNumbers("enemy", {
				start: 0,
				end: 3
			}),
			frameRate: 9,
			repeat: -1
		});
		this.anims.create({
			key: "truck-idle",
			frames: this.anims.generateFrameNumbers("truck", {
				start: 0,
				end: 3
			}),
			frameRate: 6,
			repeat: -1
		});
		this.anims.create({
			key: "bullet-fly",
			frames: this.anims.generateFrameNumbers("bullet", {
				start: 0,
				end: 3
			}),
			frameRate: 14,
			repeat: -1
		});
		this.anims.create({
			key: "bomb-spin",
			frames: this.anims.generateFrameNumbers("bomb", {
				start: 0,
				end: 3
			}),
			frameRate: 12,
			repeat: -1
		});
		this.anims.create({
			key: "hit",
			frames: this.anims.generateFrameNumbers("hit", {
				start: 0,
				end: 3
			}),
			frameRate: 16,
			hideOnComplete: true
		});
		this.anims.create({
			key: "blast",
			frames: this.anims.generateFrameNumbers("blast", {
				start: 0,
				end: 3
			}),
			frameRate: 12,
			hideOnComplete: true
		});
		this.scene.start("game", { mode: "attract" });
	}
};
function createGame(parent) {
	input.attach();
	const game = new Phaser.Game({
		type: Phaser.AUTO,
		parent,
		width: GAME_WIDTH,
		height: 720,
		backgroundColor: "#6aa7d1",
		antialias: true,
		roundPixels: false,
		autoFocus: false,
		physics: {
			default: "arcade",
			arcade: {
				gravity: {
					x: 0,
					y: 0
				},
				debug: false,
				fps: 60,
				fixedStep: true
			}
		},
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			width: GAME_WIDTH,
			height: 720
		},
		input: { activePointers: 3 },
		scene: [
			BootScene,
			PreloadScene,
			GameScene
		],
		fps: {
			target: 60,
			forceSetTimeOut: true,
			smoothStep: false
		},
		audio: { disableWebAudio: false }
	});
	game.events.once(Phaser.Core.Events.DESTROY, () => {
		input.detach();
		audio.stopEngine();
	});
	game.events.on(Phaser.Core.Events.HIDDEN, () => {
		game.loop.resume();
	});
	document.addEventListener("visibilitychange", () => {
		if (!document.hidden) audio.unlock();
	});
	return game;
}
//#endregion
export { createGame };
