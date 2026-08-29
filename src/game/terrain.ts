import { GAME_HEIGHT, GROUND_DRAW_H } from "./config";

export type Heightmap = {
  width: number;
  height: number;
  tops: number[];
  drawH: number;
};

let cached: Heightmap | null = null;

export async function loadHeightmap(): Promise<Heightmap> {
  if (cached) return cached;
  const res = await fetch("/game/ground-heightmap.json");
  const raw = (await res.json()) as Heightmap;
  cached = raw;
  return raw;
}

export function groundY(worldX: number, hm: Heightmap, drawH = GROUND_DRAW_H): number {
  const w = hm.width;
  const local = ((worldX % w) + w) % w;
  const i = Math.min(w - 1, Math.floor(local));
  const top = hm.tops[i] ?? 8;
  const imageTop = GAME_HEIGHT - drawH;
  return imageTop + (top / hm.height) * drawH;
}

export function ceilingY(worldX: number, hm: Heightmap): number {
  const w = hm.width;
  const local = ((worldX % w) + w) % w;
  const i = Math.min(w - 1, Math.floor(local));
  const bottom = hm.tops[i] ?? 40;
  return (bottom / hm.height) * GAME_HEIGHT;
}
