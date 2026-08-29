export type WorldId =
  | "heartland"
  | "tidefront"
  | "canyon"
  | "peaks"
  | "canopy"
  | "underdark"
  | "orbit"
  | "mare"
  | "vermillion"
  | "lumenfall";

export type WorldDef = {
  id: WorldId;
  index: number;
  name: string;
  tag: string;
  open: boolean;
  placeholder: boolean;
  briefing: string;
};

export type DecorProp = { key: string; scale: number; plant: number; depth?: number };

export type StageKit = {
  sky: string;
  far: string;
  mid: string;
  near: string;
  ground: string;
  fg: string;
  ceiling?: string;
  heightmap: string;
  ceilingmap?: string;
  enemy: string;
  enemyAnim: string;
  truck: string;
  tank: string;
  aa: string;
  truckAnim: string;
  tankAnim: string;
  aaAnim: string;
  radar: boolean;
  decor: DecorProp[];
  decorEvery?: number;
  groundDrawH: number;
  yMin: number;
  startY: number;
  airMin: number;
  airMax: number;
  scroll?: number;
  airSpeed?: number;
  enemyBoss?: string;
  enemyBossAnim?: string;
  hp?: {
    truck: number;
    aa: number;
    tank: number;
    trainer: number;
    fighter: number;
    heavy: number;
    boss: number;
  };
};

export const WORLDS: WorldDef[] = [
  {
    id: "heartland",
    index: 1,
    name: "Heartland",
    tag: "wheat country",
    open: true,
    placeholder: false,
    briefing:
      "Barn roofs and county roads, then the guns. Cut the fighters first, then the trucks on the ground. Bring the paint home.",
  },
  {
    id: "tidefront",
    index: 2,
    name: "Tidefront",
    tag: "coast / sea",
    open: true,
    placeholder: false,
    briefing:
      "Bright water and cliff walls. Sink the patrol boats and the bigger hulls — bombs earn their keep here. Air stays thin except the fighter sweeps. Clip those sweeps if you want your racks refilled.",
  },
  {
    id: "canyon",
    index: 3,
    name: "Red Canyon",
    tag: "desert rock",
    open: true,
    placeholder: false,
    briefing:
      "Slot canyon. Mesas pinch the sky. Fly the gap, gun the interceptors in the slot, and bomb the ledge guns on the rim. Do not kiss the rock.",
  },
  {
    id: "peaks",
    index: 4,
    name: "High Peaks",
    tag: "alpine",
    open: false,
    placeholder: false,
    briefing:
      "Thin air over the snow line. Interceptors come in fast. Snowcats and flak hold the valley. Break the ridge bomber at the end — do not waste the burst.",
  },
  {
    id: "canopy",
    index: 5,
    name: "Canopy",
    tag: "jungle",
    open: false,
    placeholder: true,
    briefing: "",
  },
  {
    id: "underdark",
    index: 6,
    name: "Underdark",
    tag: "tunnel",
    open: false,
    placeholder: true,
    briefing: "",
  },
  {
    id: "orbit",
    index: 7,
    name: "Black Orbit",
    tag: "space",
    open: false,
    placeholder: true,
    briefing: "",
  },
  {
    id: "mare",
    index: 8,
    name: "Pale Mare",
    tag: "moon",
    open: false,
    placeholder: true,
    briefing: "",
  },
  {
    id: "vermillion",
    index: 9,
    name: "Vermillion",
    tag: "alien world",
    open: false,
    placeholder: true,
    briefing: "",
  },
  {
    id: "lumenfall",
    index: 10,
    name: "Lumenfall",
    tag: "fantasy",
    open: false,
    placeholder: true,
    briefing: "",
  },
];

export const DEFAULT_WORLD: WorldId = "heartland";

export function worldById(id: string | undefined | null): WorldDef {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}

export function isWorldOpen(id: WorldId, cleared: WorldId[]): boolean {
  const w = worldById(id);
  if (w.index <= 3) return true;
  if (w.id === "peaks") return cleared.includes("canyon");
  if (w.id === "canopy") return cleared.includes("peaks");
  return false;
}

const HEARTLAND_KIT: StageKit = {
  sky: "sky",
  far: "far",
  mid: "mid",
  near: "near",
  ground: "ground",
  fg: "foreground",
  heightmap: "heightmap",
  enemy: "enemy",
  enemyAnim: "enemy-fly",
  truck: "truck",
  tank: "truck",
  aa: "aa",
  truckAnim: "truck-idle",
  tankAnim: "truck-idle",
  aaAnim: "aa-idle",
  radar: true,
  decor: [
    { key: "barn", scale: 0.72, plant: 44 },
    { key: "silo", scale: 0.7, plant: 22 },
    { key: "hay", scale: 0.55, plant: 8 },
    { key: "fence", scale: 1, plant: 8, depth: 35 },
    { key: "fence", scale: 1, plant: 8, depth: 35 },
  ],
  groundDrawH: 168,
  yMin: 48,
  startY: 260,
  airMin: 110,
  airMax: 360,
};

const TIDE_KIT: StageKit = {
  sky: "tide-sky",
  far: "tide-far",
  mid: "tide-mid",
  near: "tide-near",
  ground: "tide-ground",
  fg: "tide-fg",
  heightmap: "tide-heightmap",
  enemy: "tide-enemy",
  enemyAnim: "tide-enemy-fly",
  truck: "boat",
  tank: "ship",
  aa: "naval-aa",
  truckAnim: "boat-idle",
  tankAnim: "ship-idle",
  aaAnim: "naval-aa-idle",
  radar: false,
  decor: [
    { key: "seastack", scale: 0.7, plant: 12 },
    { key: "seastack", scale: 0.58, plant: 10 },
    { key: "buoy", scale: 0.5, plant: 16 },
    { key: "lighthouse", scale: 0.88, plant: 10 },
  ],
  decorEvery: 6.2,
  groundDrawH: 168,
  yMin: 48,
  startY: 250,
  airMin: 110,
  airMax: 360,
};

const CANYON_KIT: StageKit = {
  sky: "cyn-sky",
  far: "cyn-far",
  mid: "cyn-mid",
  near: "cyn-near",
  ground: "cyn-ground",
  fg: "cyn-fg",
  ceiling: "cyn-ceiling",
  heightmap: "cyn-heightmap",
  ceilingmap: "cyn-ceilingmap",
  enemy: "cyn-enemy",
  enemyAnim: "cyn-enemy-fly",
  truck: "jeep",
  tank: "crawler",
  aa: "ledge-aa",
  truckAnim: "jeep-idle",
  tankAnim: "crawler-idle",
  aaAnim: "ledge-aa-idle",
  radar: false,
  decor: [
    { key: "cactus", scale: 0.32, plant: 6 },
    { key: "spire", scale: 0.62, plant: 10 },
    { key: "mesa", scale: 0.55, plant: 14 },
    { key: "cactus", scale: 0.26, plant: 6 },
  ],
  groundDrawH: 250,
  yMin: 260,
  startY: 340,
  airMin: 290,
  airMax: 390,
};

const PEAKS_KIT: StageKit = {
  sky: "peaks-sky",
  far: "peaks-far",
  mid: "peaks-mid",
  near: "peaks-near",
  ground: "peaks-ground",
  fg: "peaks-fg",
  heightmap: "peaks-heightmap",
  enemy: "peaks-enemy",
  enemyAnim: "peaks-enemy-fly",
  enemyBoss: "peaks-boss",
  enemyBossAnim: "peaks-boss-fly",
  truck: "snowcat",
  tank: "snow-halftrack",
  aa: "alpine-aa",
  truckAnim: "snowcat-idle",
  tankAnim: "snow-halftrack-idle",
  aaAnim: "alpine-aa-idle",
  radar: false,
  decor: [
    { key: "pine", scale: 0.18, plant: 4 },
    { key: "pine", scale: 0.14, plant: 4 },
    { key: "cairn", scale: 0.16, plant: 6 },
    { key: "hut", scale: 0.2, plant: 8 },
  ],
  decorEvery: 5.4,
  groundDrawH: 168,
  yMin: 48,
  startY: 220,
  airMin: 90,
  airMax: 360,
  scroll: 248,
  airSpeed: 1.34,
  hp: { truck: 5, aa: 8, tank: 11, trainer: 1, fighter: 3, heavy: 5, boss: 18 },
};

export function stageKit(id: string | undefined | null): StageKit {
  if (id === "tidefront") return TIDE_KIT;
  if (id === "canyon") return CANYON_KIT;
  if (id === "peaks") return PEAKS_KIT;
  return HEARTLAND_KIT;
}
