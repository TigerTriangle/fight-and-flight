import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as Pause } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DiLhIvX-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var GAME_WIDTH = 1280;
var PLAYER_X_MAX = GAME_WIDTH * .38;
var GUN_COOLDOWN = .12;
var BOMB_COOLDOWN = .4;
var INVULN_TIME = 1.15;
var HIGH_SCORE_KEY = "fnf-highscore-v1";
function readHighScore() {
	if (typeof window === "undefined") return 0;
	const n = Number(window.localStorage.getItem("fnf-highscore-v1") ?? 0);
	return Number.isFinite(n) ? n : 0;
}
var useGameStore = create((set, get) => ({
	phase: "booting",
	ready: false,
	hull: 3,
	bombs: 8,
	score: 0,
	highScore: 0,
	muted: false,
	touch: false,
	setReady: () => {
		set({
			ready: true,
			phase: get().phase === "booting" ? "title" : get().phase,
			highScore: readHighScore()
		});
	},
	setTouch: (touch) => set({ touch }),
	setHud: (p) => set(p),
	setPhase: (phase) => set({ phase }),
	setMuted: (muted) => set({ muted }),
	recordScore: (score) => {
		const highScore = Math.max(get().highScore, score);
		if (typeof window !== "undefined") window.localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
		set({
			score,
			highScore,
			phase: "gameover"
		});
	},
	resetRun: () => set({
		hull: 3,
		bombs: 8,
		score: 0
	})
}));
var GameAudio = class {
	ctx = null;
	master = null;
	sfx = null;
	noise = null;
	engine = null;
	engineGain = null;
	unlock() {
		if (!this.ctx) {
			const ctx = new AudioContext({ latencyHint: "interactive" });
			this.ctx = ctx;
			this.master = ctx.createGain();
			this.sfx = ctx.createGain();
			this.sfx.gain.value = .7;
			this.master.connect(ctx.destination);
			this.sfx.connect(this.master);
			this.noise = this.makeNoise(ctx);
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
		this.applyMute();
	}
	applyMute() {
		if (!this.master || !this.ctx) return;
		const muted = useGameStore.getState().muted;
		this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, .02);
	}
	gun() {
		this.blip(980, .045, .09, "square");
		this.burst(.03, .05, 1800);
	}
	bombDrop() {
		this.sweep(420, 140, .22, .08);
	}
	boom() {
		this.burst(.22, .22, 400);
		this.blip(90, .28, .16, "sine");
	}
	spark() {
		this.burst(.06, .08, 2400);
		this.blip(1480, .05, .06, "square");
	}
	hurt() {
		this.blip(220, .14, .12, "sawtooth");
		this.burst(.1, .1, 700);
	}
	crash() {
		this.burst(.45, .28, 300);
		this.sweep(180, 40, .5, .18);
	}
	startEngine() {
		if (!this.ctx || !this.sfx || this.engine) return;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		osc.type = "triangle";
		osc.frequency.value = 68;
		g.gain.value = .035;
		osc.connect(g);
		g.connect(this.sfx);
		osc.start();
		this.engine = osc;
		this.engineGain = g;
	}
	stopEngine() {
		try {
			this.engine?.stop();
		} catch {}
		this.engine?.disconnect();
		this.engineGain?.disconnect();
		this.engine = null;
		this.engineGain = null;
	}
	blip(freq, dur, gain, type) {
		if (!this.ctx || !this.sfx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq * (1 + (Math.random() * 2 - 1) * .06);
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(.001, t + dur);
		osc.connect(g);
		g.connect(this.sfx);
		osc.start(t);
		osc.stop(t + dur + .02);
	}
	sweep(from, to, dur, gain) {
		if (!this.ctx || !this.sfx) return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(from, t);
		osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(.001, t + dur);
		osc.connect(g);
		g.connect(this.sfx);
		osc.start(t);
		osc.stop(t + dur + .02);
	}
	burst(dur, gain, filterHz) {
		if (!this.ctx || !this.sfx || !this.noise) return;
		const t = this.ctx.currentTime;
		const src = this.ctx.createBufferSource();
		src.buffer = this.noise;
		const f = this.ctx.createBiquadFilter();
		f.type = "lowpass";
		f.frequency.value = filterHz;
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(.001, t + dur);
		src.connect(f);
		f.connect(g);
		g.connect(this.sfx);
		src.start(t);
		src.stop(t + dur + .02);
	}
	makeNoise(ctx) {
		const buf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		return buf;
	}
};
var audio = new GameAudio();
var GAME_CODES = /* @__PURE__ */ new Set([
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
	"Escape"
]);
function radialDeadzone(x, y, dz = .16) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
var InputManager = class {
	keys = /* @__PURE__ */ new Set();
	injected = /* @__PURE__ */ new Set();
	mouseFire = false;
	mouseBomb = false;
	stick = {
		x: 0,
		y: 0
	};
	touchFire = false;
	touchBombQueued = false;
	touchMode = false;
	bombHeld = false;
	pauseHeld = false;
	bombEdge = false;
	pauseEdge = false;
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
	setKeys(codes) {
		this.injected = new Set(codes);
	}
	setStick(x, y) {
		this.touchMode = true;
		const v = radialDeadzone(x, y);
		this.stick = v;
	}
	queueBomb() {
		this.touchMode = true;
		this.touchBombQueued = true;
	}
	sample() {
		const left = this.has("KeyA") || this.has("ArrowLeft") || this.stick.x < -.12;
		const right = this.has("KeyD") || this.has("ArrowRight") || this.stick.x > .12;
		const up = this.has("KeyW") || this.has("ArrowUp") || this.stick.y < -.12;
		const down = this.has("KeyS") || this.has("ArrowDown") || this.stick.y > .12;
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
		const fireHold = this.has("Space") || this.mouseFire || this.touchMode && this.touchFire;
		const bombHold = this.has("ShiftLeft") || this.has("ShiftRight") || this.has("KeyF") || this.mouseBomb;
		const bomb = !this.bombHeld && bombHold || this.touchBombQueued;
		const pause = !this.pauseHeld && this.has("Escape");
		this.bombHeld = bombHold;
		this.pauseHeld = this.has("Escape");
		this.touchBombQueued = false;
		this.bombEdge = bomb;
		this.pauseEdge = pause;
		return {
			moveX,
			moveY,
			fire: fireHold,
			bomb,
			pause
		};
	}
	has(code) {
		return this.keys.has(code) || this.injected.has(code);
	}
	onKeyDown = (e) => {
		if (GAME_CODES.has(e.code)) e.preventDefault();
		this.keys.add(e.code);
	};
	onKeyUp = (e) => {
		this.keys.delete(e.code);
	};
	clear = () => {
		this.keys.clear();
		this.mouseFire = false;
		this.mouseBomb = false;
	};
	onVis = () => {
		if (document.hidden) this.clear();
	};
	onPointerDown = (e) => {
		if (e.target?.closest("[data-ui]")) return;
		if (e.pointerType === "touch") this.touchMode = true;
		if (e.button === 0 && e.pointerType !== "touch") this.mouseFire = true;
		if (e.button === 2) {
			e.preventDefault();
			this.mouseBomb = true;
		}
	};
	onPointerUp = (e) => {
		if (e.button === 0) this.mouseFire = false;
		if (e.button === 2) this.mouseBomb = false;
	};
};
var input = new InputManager();
var handlers = /* @__PURE__ */ new Set();
var last = null;
var bridge = {
	send(cmd) {
		last = cmd;
		if (handlers.size === 0) return;
		for (const h of handlers) h(cmd);
	},
	on(handler) {
		handlers.add(handler);
		if (last === "play" || last === "retry") handler(last);
		return () => {
			handlers.delete(handler);
		};
	}
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			primary: "bg-primary text-bg hover:opacity-90 active:scale-[0.98]",
			secondary: "bg-transparent text-fg border border-border hover:bg-surface",
			ghost: "bg-transparent text-fg hover:bg-surface"
		},
		size: {
			md: "h-11 px-5 text-base rounded-[var(--radius-sm)]",
			lg: "h-14 px-8 text-lg rounded-[var(--radius-md)] min-w-44",
			icon: "size-11 rounded-[var(--radius-sm)]"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function GameOverScreen() {
	const score = useGameStore((s) => s.score);
	const highScore = useGameStore((s) => s.highScore);
	const isBest = score > 0 && score >= highScore;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-ui": true,
		className: "absolute inset-0 z-30 flex items-center justify-center bg-bg/60 px-6",
		role: "dialog",
		"aria-labelledby": "over-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "over-title",
					className: "font-display text-4xl tracking-tight text-fg",
					children: "Downed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-display text-5xl tabular-nums leading-none text-fg",
					children: score.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: isBest ? "New best over Heartland." : `Best ${highScore.toLocaleString()}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						onClick: () => {
							audio.unlock();
							useGameStore.getState().resetRun();
							useGameStore.getState().setPhase("playing");
							bridge.send("retry");
						},
						children: "Retry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => bridge.send("title"),
						children: "Title"
					})]
				})
			]
		})
	});
}
function Hud() {
	const hull = useGameStore((s) => s.hull);
	const bombs = useGameStore((s) => s.bombs);
	const score = useGameStore((s) => s.score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1.5",
				"aria-label": `${hull} hull`,
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block size-2.5 rotate-45 border ${i < hull ? "border-danger bg-danger" : "border-muted/40 bg-transparent"}` }, i))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl leading-none tabular-nums text-fg",
				children: score.toLocaleString()
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[0.7rem] uppercase tracking-[0.16em] text-muted",
					children: "Bombs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl leading-none tabular-nums text-fg",
					children: bombs
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-ui": true,
				variant: "secondary",
				size: "icon",
				className: "pointer-events-auto bg-bg/70",
				"aria-label": "Pause",
				onClick: () => bridge.send("pause"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
			})]
		})]
	});
}
function PauseScreen() {
	const muted = useGameStore((s) => s.muted);
	const score = useGameStore((s) => s.score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-ui": true,
		className: "absolute inset-0 z-30 flex items-center justify-center bg-bg/55 px-6",
		role: "dialog",
		"aria-labelledby": "pause-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "pause-title",
					className: "font-display text-4xl tracking-tight text-fg",
					children: "Paused"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-sans text-sm tabular-nums text-muted",
					children: ["Score ", score.toLocaleString()]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: () => bridge.send("resume"),
							children: "Resume"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => {
								useGameStore.getState().setMuted(!muted);
								audio.applyMute();
							},
							children: muted ? "Sound off" : "Sound on"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => bridge.send("title"),
							children: "Title"
						})
					]
				})
			]
		})
	});
}
function TitleScreen() {
	const ready = useGameStore((s) => s.ready);
	const highScore = useGameStore((s) => s.highScore);
	const play = () => {
		audio.unlock();
		if (input.touchMode) input.touchFire = true;
		useGameStore.getState().resetRun();
		useGameStore.getState().setPhase("playing");
		bridge.send("play");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,35,48,0.18)_0%,rgba(26,35,48,0.42)_70%,rgba(26,35,48,0.55)_100%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex max-w-xl flex-col items-center gap-5 pt-[env(safe-area-inset-top)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm tracking-[0.28em] text-accent uppercase",
					children: "Arcade flyer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-6xl leading-[0.9] tracking-tight text-fg sm:text-7xl md:text-8xl",
					children: "Fight and Flight"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-md font-sans text-lg italic text-muted sm:text-xl",
					children: "Fight or flight? I choose both."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-px w-24 bg-accent/70" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					className: "mt-4 min-h-14 min-w-48 font-display text-2xl tracking-wide",
					onClick: play,
					disabled: !ready,
					children: "Play"
				}),
				highScore > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-sans text-sm tabular-nums text-muted",
					children: ["Best ", highScore.toLocaleString()]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 hidden max-w-sm text-xs leading-relaxed text-muted sm:block",
					children: "WASD or arrows to fly. Space or click to fire. Shift, F, or right-click to bomb. Stay off the dirt."
				})
			]
		})]
	});
}
function TouchControls() {
	const baseRef = (0, import_react.useRef)(null);
	const [stick, setStick] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const pid = (0, import_react.useRef)(null);
	const updateFrom = (0, import_react.useCallback)((clientX, clientY) => {
		const el = baseRef.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const cx = r.left + r.width / 2;
		const cy = r.top + r.height / 2;
		const nx = (clientX - cx) / (r.width * .42);
		const ny = (clientY - cy) / (r.height * .42);
		const mag = Math.hypot(nx, ny);
		const x = mag > 1 ? nx / mag : nx;
		const y = mag > 1 ? ny / mag : ny;
		setStick({
			x,
			y
		});
		input.setStick(x, y);
	}, []);
	const end = (0, import_react.useCallback)(() => {
		pid.current = null;
		setStick({
			x: 0,
			y: 0
		});
		input.setStick(0, 0);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-ui": true,
		className: "pointer-events-none absolute inset-0 z-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: baseRef,
				className: "pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] size-32 rounded-full border border-border bg-bg/35",
				onPointerDown: (e) => {
					e.preventDefault();
					e.currentTarget.setPointerCapture(e.pointerId);
					pid.current = e.pointerId;
					input.touchMode = true;
					input.touchFire = true;
					updateFrom(e.clientX, e.clientY);
				},
				onPointerMove: (e) => {
					if (pid.current !== e.pointerId) return;
					updateFrom(e.clientX, e.clientY);
				},
				onPointerUp: end,
				onPointerCancel: end,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/80",
					style: { transform: `translate(calc(-50% + ${stick.x * 36}px), calc(-50% + ${stick.y * 36}px))` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Drop bomb",
				className: "pointer-events-auto absolute bottom-[max(1.4rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] size-[4.5rem] rounded-full border border-border bg-bg/70 font-display text-lg tracking-wide text-fg",
				onPointerDown: (e) => {
					e.preventDefault();
					input.touchMode = true;
					input.queueBomb();
				},
				children: "Bomb"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "sr-only",
				onClick: () => bridge.send("pause"),
				children: "Pause"
			})
		]
	});
}
function useCoarseInput() {
	const touch = useGameStore((s) => s.touch);
	const [coarse, setCoarse] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(pointer: coarse), (max-width: 800px)");
		const apply = () => setCoarse(mq.matches);
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, []);
	return touch || coarse;
}
function GameApp() {
	const hostRef = (0, import_react.useRef)(null);
	const phase = useGameStore((s) => s.phase);
	const setTouch = useGameStore((s) => s.setTouch);
	const showTouch = useCoarseInput();
	(0, import_react.useEffect)(() => {
		let game;
		let dead = false;
		if (!hostRef.current) return;
		import("./createGame-Dux8zLyW.mjs").then(({ createGame }) => {
			if (dead || !hostRef.current) return;
			game = createGame(hostRef.current);
			if (dead) {
				game.destroy(true);
				game = void 0;
			}
		});
		const onTouch = () => {
			setTouch(true);
			input.touchMode = true;
		};
		window.addEventListener("touchstart", onTouch, {
			once: true,
			passive: true
		});
		return () => {
			dead = true;
			game?.destroy(true);
			window.removeEventListener("touchstart", onTouch);
		};
	}, [setTouch]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.code !== "Escape") return;
			const p = useGameStore.getState().phase;
			if (p === "playing") bridge.send("pause");
			else if (p === "paused") bridge.send("resume");
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		if (phase === "playing" && showTouch) {
			input.touchMode = true;
			input.touchFire = true;
		}
		if (phase === "title" || phase === "gameover") input.touchFire = false;
	}, [phase, showTouch]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "game-shell",
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: hostRef,
				id: "game-root",
				className: "game-root"
			}),
			phase === "booting" || phase === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {}) : null,
			phase === "playing" || phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}) : null,
			phase === "playing" && showTouch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {}) : null,
			phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseScreen, {}) : null,
			phase === "gameover" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverScreen, {}) : null
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { useGameStore as a, GAME_WIDTH as c, INVULN_TIME as d, PLAYER_X_MAX as f, audio as i, bridge as n, input as r, BOMB_COOLDOWN as s, routes_exports as t, GUN_COOLDOWN as u };
