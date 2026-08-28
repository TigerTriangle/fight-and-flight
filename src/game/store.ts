import { create } from "zustand";
import { HIGH_SCORE_KEY } from "./config";
import { medalFor, type Medal } from "./mission";
import { DEFAULT_PLANE, planeById, type PlaneId } from "./planes";
import { DEFAULT_WORLD, type WorldId } from "./worlds";

export type Phase =
  | "booting"
  | "title"
  | "hangar"
  | "worlds"
  | "briefing"
  | "playing"
  | "paused"
  | "results";

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
  bombsMax: number;
  score: number;
  gunHeat: number;
  gunHot: boolean;
  beat: string;
  highScore: number;
  muted: boolean;
  touch: boolean;
  planeId: PlaneId;
  worldId: WorldId;
  cleared: boolean;
  medal: Medal;
  airKills: number;
  groundKills: number;
  setReady: () => void;
  setTouch: (v: boolean) => void;
  setPlane: (id: PlaneId) => void;
  setWorld: (id: WorldId) => void;
  setHud: (p: {
    hull?: number;
    hullMax?: number;
    bombs?: number;
    bombsMax?: number;
    score?: number;
    gunHeat?: number;
    gunHot?: boolean;
    beat?: string;
  }) => void;
  setPhase: (phase: Phase) => void;
  setMuted: (v: boolean) => void;
  recordScore: (
    score: number,
    extra?: {
      cleared?: boolean;
      medal?: Medal;
      airKills?: number;
      groundKills?: number;
    },
  ) => void;
  resetRun: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "booting",
  ready: false,
  hull: planeById(DEFAULT_PLANE).hull,
  hullMax: planeById(DEFAULT_PLANE).hull,
  bombs: planeById(DEFAULT_PLANE).bombs,
  bombsMax: planeById(DEFAULT_PLANE).bombs,
  score: 0,
  gunHeat: 0,
  gunHot: false,
  beat: "Takeoff",
  highScore: 0,
  muted: false,
  touch: false,
  planeId: DEFAULT_PLANE,
  worldId: DEFAULT_WORLD,
  cleared: false,
  medal: "none",
  airKills: 0,
  groundKills: 0,
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
    set({ planeId, hull: p.hull, hullMax: p.hull, bombs: p.bombs, bombsMax: p.bombs });
  },
  setWorld: (worldId) => set({ worldId }),
  setHud: (p) => set(p),
  setPhase: (phase) => set({ phase }),
  setMuted: (muted) => set({ muted }),
  recordScore: (score, extra) => {
    const highScore = Math.max(get().highScore, score);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
    set({
      score,
      highScore,
      phase: "results",
      cleared: extra?.cleared ?? false,
      medal: extra?.medal ?? medalFor(score),
      airKills: extra?.airKills ?? 0,
      groundKills: extra?.groundKills ?? 0,
    });
  },
  resetRun: () => {
    const p = planeById(get().planeId);
    set({
      hull: p.hull,
      hullMax: p.hull,
      bombs: p.bombs,
      bombsMax: p.bombs,
      score: 0,
      gunHeat: 0,
      gunHot: false,
      beat: "Takeoff",
      cleared: false,
      medal: "none",
      airKills: 0,
      groundKills: 0,
    });
  },
}));
