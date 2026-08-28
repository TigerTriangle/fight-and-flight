import { create } from "zustand";
import { HIGH_SCORE_KEY } from "./config";
import { DEFAULT_PLANE, planeById, type PlaneId } from "./planes";

export type Phase = "booting" | "title" | "hangar" | "playing" | "paused" | "gameover";

function readHighScore() {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(HIGH_SCORE_KEY) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

type GameStore = {
  phase: Phase;
  ready: boolean;
  hull: number;
  hullMax: number;
  bombs: number;
  score: number;
  gunHeat: number;
  gunHot: boolean;
  highScore: number;
  muted: boolean;
  touch: boolean;
  planeId: PlaneId;
  setReady: () => void;
  setTouch: (v: boolean) => void;
  setPlane: (id: PlaneId) => void;
  setHud: (p: {
    hull?: number;
    hullMax?: number;
    bombs?: number;
    score?: number;
    gunHeat?: number;
    gunHot?: boolean;
  }) => void;
  setPhase: (phase: Phase) => void;
  setMuted: (v: boolean) => void;
  recordScore: (score: number) => void;
  resetRun: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "booting",
  ready: false,
  hull: planeById(DEFAULT_PLANE).hull,
  hullMax: planeById(DEFAULT_PLANE).hull,
  bombs: planeById(DEFAULT_PLANE).bombs,
  score: 0,
  gunHeat: 0,
  gunHot: false,
  highScore: 0,
  muted: false,
  touch: false,
  planeId: DEFAULT_PLANE,
  setReady: () => {
    set({
      ready: true,
      phase: get().phase === "booting" ? "title" : get().phase,
      highScore: readHighScore(),
    });
  },
  setTouch: (touch) => set({ touch }),
  setPlane: (planeId) => {
    const p = planeById(planeId);
    set({ planeId, hull: p.hull, hullMax: p.hull, bombs: p.bombs });
  },
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
  resetRun: () => {
    const p = planeById(get().planeId);
    set({
      hull: p.hull,
      hullMax: p.hull,
      bombs: p.bombs,
      score: 0,
      gunHeat: 0,
      gunHot: false,
    });
  },
}));
