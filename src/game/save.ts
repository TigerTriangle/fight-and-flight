import { CLEARED_KEY, HIGH_SCORE_KEY } from "./config";
import { medalFor, type Medal } from "./mission";
import { PLANES, planeById, type PlaneId } from "./planes";
import { DEFAULT_WORLD, WORLDS, isWorldOpen, worldById, type WorldId } from "./worlds";

export const SAVE_KEY = "fnf-save-v1";
export const SAVE_VERSION = 1;
export const PILOT_SALT = "fight-and-flight-pilot";

const ABC = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export type WorldBest = { score: number; medal: Medal };

export type SaveData = {
  v: number;
  game: "fight-and-flight";
  planeId: PlaneId;
  worldId: WorldId;
  cleared: WorldId[];
  best: Partial<Record<WorldId, WorldBest>>;
  settings: {
    autoFire: boolean;
    volume: number;
    muted: boolean;
  };
};

const WORLD_IDS = new Set(WORLDS.map((w) => w.id));
const PLANE_IDS = new Set(PLANES.map((p) => p.id));
const MEDALS: Medal[] = ["none", "bronze", "silver", "gold"];

export function emptySave(): SaveData {
  return {
    v: SAVE_VERSION,
    game: "fight-and-flight",
    planeId: "hornet",
    worldId: DEFAULT_WORLD,
    cleared: [],
    best: {},
    settings: { autoFire: false, volume: 0.8, muted: false },
  };
}

function isWorldId(id: unknown): id is WorldId {
  return typeof id === "string" && WORLD_IDS.has(id as WorldId);
}

function isPlaneId(id: unknown): id is PlaneId {
  return typeof id === "string" && PLANE_IDS.has(id as PlaneId);
}

function isMedal(v: unknown): v is Medal {
  return typeof v === "string" && MEDALS.includes(v as Medal);
}

export function medalRank(medal: Medal | undefined): number {
  if (medal === "gold") return 3;
  if (medal === "silver") return 2;
  if (medal === "bronze") return 1;
  return 0;
}

export function medalTotal(best: Partial<Record<WorldId, WorldBest>>): number {
  let n = 0;
  for (const w of WORLDS) n += medalRank(best[w.id]?.medal);
  return n;
}

export function highestUnlocked(cleared: WorldId[]): number {
  let max = 1;
  for (const w of WORLDS) {
    if (isWorldOpen(w.id, cleared)) max = Math.max(max, w.index);
  }
  return max;
}

export function unlockThrough(highest: number, existing: WorldId[] = []): WorldId[] {
  const next = new Set(existing.filter(isWorldId));
  for (const w of WORLDS) {
    if (w.index < highest) next.add(w.id);
  }
  return [...next];
}

function parseBest(raw: unknown): Partial<Record<WorldId, WorldBest>> {
  const best: Partial<Record<WorldId, WorldBest>> = {};
  if (!raw || typeof raw !== "object") return best;
  const rec = raw as Record<string, unknown>;
  for (const [id, val] of Object.entries(rec)) {
    if (!isWorldId(id) || !val || typeof val !== "object") continue;
    const row = val as { score?: unknown; medal?: unknown };
    const score = Number(row.score);
    if (!Number.isFinite(score) || score < 0) continue;
    const medal = isMedal(row.medal) ? row.medal : medalFor(score, id);
    best[id] = { score: Math.floor(score), medal };
  }
  return best;
}

export function parseSave(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const settingsRaw = o.settings && typeof o.settings === "object" ? (o.settings as Record<string, unknown>) : {};
  const volume = Number(settingsRaw.volume);
  const cleared = Array.isArray(o.cleared) ? o.cleared.filter(isWorldId) : [];
  const planeId = isPlaneId(o.planeId) ? o.planeId : emptySave().planeId;
  const worldId = isWorldId(o.worldId) ? o.worldId : DEFAULT_WORLD;
  try {
    planeById(planeId);
    worldById(worldId);
  } catch {
    return null;
  }
  return {
    v: SAVE_VERSION,
    game: "fight-and-flight",
    planeId,
    worldId,
    cleared,
    best: parseBest(o.best),
    settings: {
      autoFire: settingsRaw.autoFire === true,
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.8,
      muted: settingsRaw.muted === true,
    },
  };
}

function migrateLegacy(): SaveData {
  const save = emptySave();
  if (typeof window === "undefined") return save;
  try {
    const raw = window.localStorage.getItem(CLEARED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(parsed)) save.cleared = parsed.filter(isWorldId);
  } catch {
    /* start fresh */
  }
  try {
    const hs = Number(window.localStorage.getItem(HIGH_SCORE_KEY) ?? 0);
    if (Number.isFinite(hs) && hs > 0) {
      save.best.heartland = { score: Math.floor(hs), medal: medalFor(hs, "heartland") };
    }
  } catch {
    /* ignore */
  }
  return save;
}

export function loadSave(): SaveData {
  if (typeof window === "undefined") return emptySave();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = parseSave(JSON.parse(raw) as unknown);
      if (parsed) return parsed;
    }
  } catch {
    /* corrupt */
  }
  try {
    return migrateLegacy();
  } catch {
    return emptySave();
  }
}

export function writeSave(data: SaveData) {
  if (typeof window === "undefined") return;
  try {
    const safe = parseSave(data) ?? emptySave();
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(safe));
    window.localStorage.setItem(CLEARED_KEY, JSON.stringify(safe.cleared));
    window.localStorage.setItem(HIGH_SCORE_KEY, String(globalBest(safe.best)));
  } catch {
    /* quota / private mode */
  }
}

export function globalBest(best: Partial<Record<WorldId, WorldBest>>): number {
  let n = 0;
  for (const row of Object.values(best)) {
    if (row && row.score > n) n = row.score;
  }
  return n;
}

function to32(n: number, width: number) {
  let x = Math.abs(Math.floor(n));
  let out = "";
  for (let i = 0; i < width; i++) {
    out = ABC[x % 32] + out;
    x = Math.floor(x / 32);
  }
  return out;
}

function from32(s: string): number {
  let n = 0;
  for (const ch of s.toUpperCase()) {
    const i = ABC.indexOf(ch);
    if (i < 0) return NaN;
    n = n * 32 + i;
  }
  return n;
}

function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function worldToken(index: number) {
  return index >= 10 ? "A" : String(index);
}

function parseWorldToken(ch: string): number {
  if (ch === "A" || ch === "a") return 10;
  const n = Number(ch);
  return n >= 1 && n <= 9 ? n : NaN;
}

export function encodePilot(cleared: WorldId[], best: Partial<Record<WorldId, WorldBest>>): string {
  const highest = Math.min(10, Math.max(1, highestUnlocked(cleared)));
  const medals = Math.min(30, Math.max(0, medalTotal(best)));
  const mm = String(medals).padStart(2, "0");
  const chk = to32(fnv(`${SAVE_VERSION}|${highest}|${medals}|${PILOT_SALT}`) % 32768, 3);
  return `FN${SAVE_VERSION}${worldToken(highest)}-${mm}-${chk}`;
}

export function decodePilot(code: string): { highest: number; medals: number } | null {
  const raw = code.trim().toUpperCase().replace(/\s+/g, "");
  const m = /^FN([1-9])([1-9A])-(\d{2})-([0-9A-HJKMNP-TV-Z]{3})$/.exec(raw);
  if (!m) return null;
  const ver = Number(m[1]);
  if (ver !== SAVE_VERSION) return null;
  const highest = parseWorldToken(m[2]);
  const medals = Number(m[3]);
  if (!Number.isFinite(highest) || highest < 1 || highest > 10) return null;
  if (!Number.isFinite(medals) || medals < 0 || medals > 30) return null;
  const expect = to32(fnv(`${ver}|${highest}|${medals}|${PILOT_SALT}`) % 32768, 3);
  if (expect !== m[4]) return null;
  return { highest, medals };
}

export function downloadSave(data: SaveData) {
  if (typeof document === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fight-and-flight-save.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function readSaveFile(file: File): Promise<SaveData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        resolve(parseSave(JSON.parse(text) as unknown));
      } catch {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
}
