import { create } from "zustand";
import { HULL_MAX, BOMB_MAX, HIGH_SCORE_KEY } from "./config";

export type Phase = "booting" | "title" | "playing" | "paused" | "gameover";

function readHighScore() {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(HIGH_SCORE_KEY) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

type GameStore = {
  phase: Phase;
  ready: boolean;
  hull: number;
  bombs: number;
  score: number;
  highScore: number;
  muted: boolean;
  touch: boolean;
  setReady: () => void;
  setTouch: (v: boolean) => void;
  setHud: (p: { hull?: number; bombs?: number; score?: number }) => void;
  setPhase: (phase: Phase) => void;
  setMuted: (v: boolean) => void;
  recordScore: (score: number) => void;
  resetRun: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "booting",
  ready: false,
  hull: HULL_MAX,
  bombs: BOMB_MAX,
  score: 0,
  highScore: 0,
  muted: false,
  touch: false,
  setReady: () => {
    set({
      ready: true,
      phase: get().phase === "booting" ? "title" : get().phase,
      highScore: readHighScore(),
    });
  },
  setTouch: (touch) => set({ touch }),
  setHud: (p) => set(p),
  setPhase: (phase) => set({ phase }),
  setMuted: (muted) => set({ muted }),
  recordScore: (score) => {
    const highScore = Math.max(get().highScore, score);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
    set({ score, highScore, phase: "gameover" });
  },
  resetRun: () =>
    set({
      hull: HULL_MAX,
      bombs: BOMB_MAX,
      score: 0,
    }),
}));
