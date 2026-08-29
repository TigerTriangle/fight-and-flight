import { create } from "zustand";
import { medalFor, type EndCause, type Medal } from "./mission";
import { DEFAULT_PLANE, planeById, type PlaneId } from "./planes";
import { DEFAULT_WORLD, type WorldId } from "./worlds";
import {
  decodePilot,
  downloadSave,
  emptySave,
  encodePilot,
  globalBest,
  loadSave,
  medalRank,
  parseSave,
  unlockThrough,
  writeSave,
  type SaveData,
  type WorldBest,
} from "./save";

export type Phase =
  | "booting"
  | "title"
  | "hangar"
  | "worlds"
  | "briefing"
  | "playing"
  | "paused"
  | "results";

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
  volume: number;
  autoFire: boolean;
  touch: boolean;
  planeId: PlaneId;
  worldId: WorldId;
  clearedWorlds: WorldId[];
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
  persistNow: () => void;
  exportSave: () => void;
  applySave: (data: SaveData) => boolean;
  restorePilot: (code: string) => boolean;
  pilotCode: () => string;
};

function toSave(s: {
  planeId: PlaneId;
  worldId: WorldId;
  clearedWorlds: WorldId[];
  best: Partial<Record<WorldId, WorldBest>>;
  autoFire: boolean;
  volume: number;
  muted: boolean;
}): SaveData {
  return {
    v: 1,
    game: "fight-and-flight",
    planeId: s.planeId,
    worldId: s.worldId,
    cleared: s.clearedWorlds,
    best: s.best,
    settings: { autoFire: s.autoFire, volume: s.volume, muted: s.muted },
  };
}

function persist(get: () => GameStore) {
  writeSave(toSave(get()));
}

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
  volume: 0.8,
  autoFire: false,
  touch: false,
  planeId: DEFAULT_PLANE,
  worldId: DEFAULT_WORLD,
  clearedWorlds: [],
  best: {},
  cleared: false,
  medal: "none",
  endCause: "air",
  airKills: 0,
  groundKills: 0,
  isWorldBest: false,
  setReady: () => {
    const save = loadSave();
    const p = planeById(save.planeId);
    set({
      ready: true,
      phase: get().phase === "booting" ? "title" : get().phase,
      planeId: save.planeId,
      worldId: save.worldId,
      clearedWorlds: save.cleared,
      best: save.best,
      highScore: globalBest(save.best),
      autoFire: save.settings.autoFire,
      volume: save.settings.volume,
      muted: save.settings.muted,
      hull: p.hull,
      hullMax: p.hull,
      bombs: p.bombs,
      bombsMax: p.bombs,
    });
    persist(get);
  },
  setTouch: (touch) => set({ touch }),
  setPlane: (planeId) => {
    const p = planeById(planeId);
    set({ planeId, hull: p.hull, hullMax: p.hull, bombs: p.bombs, bombsMax: p.bombs });
    persist(get);
  },
  setWorld: (worldId) => {
    set({ worldId });
    persist(get);
  },
  setHud: (p) => set(p),
  setPhase: (phase) => set({ phase }),
  setMuted: (muted) => {
    set({ muted });
    persist(get);
  },
  setVolume: (v) => {
    set({ volume: Math.min(1, Math.max(0, v)) });
    persist(get);
  },
  setAutoFire: (autoFire) => {
    set({ autoFire });
    persist(get);
  },
  recordScore: (score, extra) => {
    const id = get().worldId;
    const medal = extra?.medal ?? medalFor(score, id);
    const prev = get().best[id];
    const isWorldBest = score > (prev?.score ?? 0);
    let best = get().best;
    if (isWorldBest || (score === (prev?.score ?? 0) && medalRank(medal) > medalRank(prev?.medal))) {
      best = { ...best, [id]: { score, medal } };
    }
    let clearedWorlds = get().clearedWorlds;
    if (extra?.cleared && !clearedWorlds.includes(id)) {
      clearedWorlds = [...clearedWorlds, id];
    }
    const highScore = Math.max(get().highScore, globalBest(best), score);
    set({
      score,
      highScore,
      best,
      phase: "results",
      cleared: extra?.cleared ?? false,
      medal,
      endCause: extra?.endCause ?? "air",
      airKills: extra?.airKills ?? 0,
      groundKills: extra?.groundKills ?? 0,
      clearedWorlds,
      isWorldBest,
    });
    persist(get);
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
      endCause: "air",
      airKills: 0,
      groundKills: 0,
      isWorldBest: false,
    });
  },
  persistNow: () => persist(get),
  exportSave: () => downloadSave(toSave(get())),
  applySave: (data) => {
    const parsed = parseSave(data);
    if (!parsed) return false;
    const p = planeById(parsed.planeId);
    set({
      planeId: parsed.planeId,
      worldId: parsed.worldId,
      clearedWorlds: parsed.cleared,
      best: parsed.best,
      highScore: globalBest(parsed.best),
      autoFire: parsed.settings.autoFire,
      volume: parsed.settings.volume,
      muted: parsed.settings.muted,
      hull: p.hull,
      hullMax: p.hull,
      bombs: p.bombs,
      bombsMax: p.bombs,
    });
    persist(get);
    return true;
  },
  restorePilot: (code) => {
    const decoded = decodePilot(code);
    if (!decoded) return false;
    const clearedWorlds = unlockThrough(decoded.highest, get().clearedWorlds);
    set({ clearedWorlds });
    persist(get);
    return true;
  },
  pilotCode: () => encodePilot(get().clearedWorlds, get().best),
}));
