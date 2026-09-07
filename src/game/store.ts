import { create } from "zustand";
import { medalFor, type EndCause, type Medal } from "./mission";
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

export type WorldBest = { score: number; medal: Medal };

type GameStore = {
  phase: Phase;
  ready: boolean;
  hull: number;
  hullMax: number;
  bombs: number;
  bombsMax: number;
  special: number;
  specialMax: number;
  specialName: string;
  score: number;
  gunHeat: number;
  gunHot: boolean;
  beat: string;
  highScore: number;
  muted: boolean;
  volume: number;
  autoFire: boolean;
  touch: boolean;
  planeId: PlaneId;
  worldId: WorldId;
  best: Partial<Record<WorldId, WorldBest>>;
  cleared: boolean;
  medal: Medal;
  endCause: EndCause;
  airKills: number;
  groundKills: number;
  isWorldBest: boolean;
  setReady: () => void;
  setTouch: (v: boolean) => void;
  setPlane: (id: PlaneId) => void;
  setWorld: (id: WorldId) => void;
  setHud: (p: {
    hull?: number;
    hullMax?: number;
    bombs?: number;
    bombsMax?: number;
    special?: number;
    specialMax?: number;
    specialName?: string;
    score?: number;
    gunHeat?: number;
    gunHot?: boolean;
    beat?: string;
  }) => void;
  setPhase: (phase: Phase) => void;
  setMuted: (v: boolean) => void;
  setVolume: (v: number) => void;
  setAutoFire: (v: boolean) => void;
  recordScore: (
    score: number,
    extra?: {
      cleared?: boolean;
      medal?: Medal;
      airKills?: number;
      groundKills?: number;
      endCause?: EndCause;
    },
  ) => void;
  resetRun: () => void;
};

function medalRank(medal: Medal | undefined) {
  if (medal === "gold") return 3;
  if (medal === "silver") return 2;
  if (medal === "bronze") return 1;
  return 0;
}

function globalBest(best: Partial<Record<WorldId, WorldBest>>) {
  return Math.max(0, ...Object.values(best).map((b) => b?.score ?? 0));
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "booting",
  ready: false,
  hull: planeById(DEFAULT_PLANE).hull,
  hullMax: planeById(DEFAULT_PLANE).hull,
  bombs: planeById(DEFAULT_PLANE).bombs,
  bombsMax: planeById(DEFAULT_PLANE).bombs,
  special: planeById(DEFAULT_PLANE).special?.start ?? 0,
  specialMax: planeById(DEFAULT_PLANE).special?.max ?? 0,
  specialName: planeById(DEFAULT_PLANE).special?.short ?? "",
  score: 0,
  gunHeat: 0,
  gunHot: false,
  beat: "Takeoff",
  highScore: 0,
  muted: false,
  volume: 0.8,
  autoFire: false,
  touch: false,
  planeId: DEFAULT_PLANE,
  worldId: DEFAULT_WORLD,
  best: {},
  cleared: false,
  medal: "none",
  endCause: "air",
  airKills: 0,
  groundKills: 0,
  isWorldBest: false,
  setReady: () =>
    set({
      ready: true,
      phase: get().phase === "booting" ? "title" : get().phase,
    }),
  setTouch: (touch) => set({ touch }),
  setPlane: (planeId) => {
    const p = planeById(planeId);
    set({ planeId, hull: p.hull, hullMax: p.hull, bombs: p.bombs, bombsMax: p.bombs });
  },
  setWorld: (worldId) => set({ worldId }),
  setHud: (p) => set(p),
  setPhase: (phase) => set({ phase }),
  setMuted: (muted) => set({ muted }),
  setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),
  setAutoFire: (autoFire) => set({ autoFire }),
  recordScore: (score, extra) => {
    const id = get().worldId;
    const medal = extra?.medal ?? medalFor(score, id);
    const prev = get().best[id];
    const isWorldBest = score > (prev?.score ?? 0);
    let best = get().best;
    if (isWorldBest || (score === (prev?.score ?? 0) && medalRank(medal) > medalRank(prev?.medal))) {
      best = { ...best, [id]: { score, medal } };
    }
    set({
      score,
      highScore: Math.max(get().highScore, globalBest(best), score),
      best,
      phase: "results",
      cleared: extra?.cleared ?? false,
      medal,
      endCause: extra?.endCause ?? "air",
      airKills: extra?.airKills ?? 0,
      groundKills: extra?.groundKills ?? 0,
      isWorldBest,
    });
  },
  resetRun: () => {
    const p = planeById(get().planeId);
    set({
      hull: p.hull,
      hullMax: p.hull,
      bombs: p.bombs,
      bombsMax: p.bombs,
      special: p.special?.start ?? 0,
      specialMax: p.special?.max ?? 0,
      specialName: p.special?.short ?? "",
      score: 0,
      gunHeat: 0,
      gunHot: false,
      beat: "Takeoff",
      cleared: false,
      medal: "none",
      endCause: "air",
      airKills: 0,
      groundKills: 0,
      isWorldBest: false,
    });
  },
}));
