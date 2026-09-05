export type PlaneId =
  | "sparrow"
  | "hornet"
  | "thunderhog"
  | "ghost"
  | "leviathan"
  | "wisp";

export type PlaneSpecial = {
  id: "flares" | "missile";
  name: string;
  short: string;
  max: number;
  start: number;
  scorePer: number;
};

export type PlaneDef = {
  id: PlaneId;
  name: string;
  role: string;
  speed: number;
  hull: number;
  bombs: number;
  gunCd: number;
  heatPerShot: number;
  gunDamage: number;
  twin: boolean;
  homing: number;
  weave: number;
  bulletScale: number;
  bulletTint: number;
  blast: number;
  bombTrauma: number;
  scale: number;
  bodyW: number;
  bodyH: number;
  bodyOx: number;
  bodyOy: number;
  muzzle: number;
  trim: number;
  portrait: string;
  bars: { speed: number; armor: number; guns: number; bombs: number };
  special?: PlaneSpecial;
};

export const PLANES: PlaneDef[] = [
  {
    id: "sparrow",
    name: "Sparrow",
    role: "Interceptor — outrun, outgun, don't get hit.",
    speed: 392,
    hull: 2,
    bombs: 2,
    gunCd: 0.07,
    heatPerShot: 1 / 20,
    gunDamage: 1,
    twin: false,
    homing: 0,
    weave: 0,
    bulletScale: 0.28,
    bulletTint: 0xfff4c2,
    blast: 92,
    bombTrauma: 0.72,
    scale: 0.55,
    bodyW: 132,
    bodyH: 34,
    bodyOx: 58,
    bodyOy: 112,
    muzzle: 58,
    trim: 0.11,
    portrait: "/hangar/sparrow.png",
    bars: { speed: 5, armor: 2, guns: 5, bombs: 2 },
    special: { id: "flares", name: "Nose Flares", short: "Flare", max: 2, start: 1, scorePer: 1000 },
  },
  {
    id: "hornet",
    name: "Hornet",
    role: "Balanced default — the Heartland workhorse.",
    speed: 305,
    hull: 3,
    bombs: 4,
    gunCd: 0.12,
    heatPerShot: 1 / 15,
    gunDamage: 1,
    twin: false,
    homing: 0,
    weave: 0,
    bulletScale: 0.34,
    bulletTint: 0xffffff,
    blast: 92,
    bombTrauma: 0.72,
    scale: 0.7,
    bodyW: 168,
    bodyH: 52,
    bodyOx: 44,
    bodyOy: 104,
    muzzle: 70,
    trim: 0,
    portrait: "/hangar/hornet.png",
    bars: { speed: 3, armor: 3, guns: 3, bombs: 3 },
    special: { id: "missile", name: "Heat-Seeker", short: "Lock", max: 2, start: 1, scorePer: 1200 },
  },
  {
    id: "thunderhog",
    name: "Thunderhog",
    role: "Strike — slow, ugly, and it hits like a barn.",
    speed: 208,
    hull: 5,
    bombs: 8,
    gunCd: 0.2,
    heatPerShot: 1 / 10,
    gunDamage: 2,
    twin: false,
    homing: 0,
    weave: 0,
    bulletScale: 0.48,
    bulletTint: 0xffd080,
    blast: 108,
    bombTrauma: 0.82,
    scale: 0.84,
    bodyW: 196,
    bodyH: 72,
    bodyOx: 28,
    bodyOy: 94,
    muzzle: 78,
    trim: 0.11,
    portrait: "/hangar/thunderhog.png",
    bars: { speed: 1, armor: 5, guns: 4, bombs: 5 },
  },
  {
    id: "ghost",
    name: "Ghost",
    role: "Agile — a small target with a precise stream.",
    speed: 348,
    hull: 2,
    bombs: 3,
    gunCd: 0.1,
    heatPerShot: 1 / 16,
    gunDamage: 1,
    twin: false,
    homing: 0,
    weave: 0,
    bulletScale: 0.26,
    bulletTint: 0xc8e4ff,
    blast: 88,
    bombTrauma: 0.68,
    scale: 0.5,
    bodyW: 108,
    bodyH: 30,
    bodyOx: 72,
    bodyOy: 114,
    muzzle: 52,
    trim: 0.11,
    portrait: "/hangar/ghost.png",
    bars: { speed: 4, armor: 1, guns: 4, bombs: 3 },
  },
  {
    id: "leviathan",
    name: "Leviathan",
    role: "Heavy — wide body, twin cannons, six in the bay.",
    speed: 232,
    hull: 4,
    bombs: 6,
    gunCd: 0.15,
    heatPerShot: 1 / 12,
    gunDamage: 1,
    twin: true,
    homing: 0,
    weave: 0,
    bulletScale: 0.32,
    bulletTint: 0xe8dcc0,
    blast: 110,
    bombTrauma: 0.8,
    scale: 0.9,
    bodyW: 214,
    bodyH: 78,
    bodyOx: 18,
    bodyOy: 90,
    muzzle: 82,
    trim: 0.11,
    portrait: "/hangar/leviathan.png",
    bars: { speed: 2, armor: 4, guns: 4, bombs: 4 },
  },
  {
    id: "wisp",
    name: "Wisp",
    role: "Oddball — weaving darts and one mean bomb.",
    speed: 328,
    hull: 2,
    bombs: 1,
    gunCd: 0.13,
    heatPerShot: 1 / 14,
    gunDamage: 1,
    twin: false,
    homing: 3.2,
    weave: 160,
    bulletScale: 0.3,
    bulletTint: 0x7cf0d0,
    blast: 168,
    bombTrauma: 1,
    scale: 0.62,
    bodyW: 148,
    bodyH: 36,
    bodyOx: 50,
    bodyOy: 110,
    muzzle: 64,
    trim: 0.11,
    portrait: "/hangar/wisp.png",
    bars: { speed: 4, armor: 2, guns: 4, bombs: 1 },
  },
];

export const DEFAULT_PLANE: PlaneId = "hornet";

export function planeById(id: string | undefined | null): PlaneDef {
  return PLANES.find((p) => p.id === id) ?? PLANES[1];
}
