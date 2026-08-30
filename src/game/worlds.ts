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

export type DecorProp = { key: string; scale: number; plant: number; depth?: number; parallax?: number };

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
  aaShot?: number;
  groundSink?: number;
  bankSink?: number;
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
    placeholder: false,
    briefing:
      "Jungle river. They wait in the brush and pop from the trees. Clip the kites to keep bombs on the sampans. Break the Howler at the end.",
  },
  {
    id: "underdark",
    index: 6,
    name: "Underdark",
    tag: "tunnel",
    open: false,
    placeholder: false,
    briefing:
      "Black tunnel. The ceiling tries to kiss you. Drones own the slot; carts and drills hold the rails. Cut the Borer at the end — do not scrape the rock.",
  },
  {
    id: "orbit",
    index: 7,
    name: "Black Orbit",
    tag: "space",
    open: false,
    placeholder: false,
    briefing:
      "Open vacuum. Needles in the lane, hulks on the belt. Bombs still crack the wrecks. Break the Ring at the end.",
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
  const prev = WORLDS.find((x) => x.index === w.index - 1);
  return !!prev && cleared.includes(prev.id);
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

const CANOPY_KIT: StageKit = {
  sky: "canopy-sky",
  far: "canopy-far",
  mid: "canopy-mid",
  near: "canopy-near",
  ground: "canopy-ground",
  fg: "canopy-fg",
  heightmap: "canopy-heightmap",
  enemy: "canopy-kite",
  enemyAnim: "canopy-kite-fly",
  enemyBoss: "canopy-howler",
  enemyBossAnim: "canopy-howler-fly",
  truck: "sampan",
  tank: "jungle-halftrack",
  aa: "jungle-aa",
  truckAnim: "sampan-idle",
  tankAnim: "jungle-halftrack-idle",
  aaAnim: "jungle-aa-idle",
  radar: false,
  decor: [
    { key: "palm", scale: 0.11, plant: 8, depth: 6, parallax: 0.74 },
    { key: "stupa", scale: 0.11, plant: 10, depth: 6, parallax: 0.74 },
    { key: "palm", scale: 0.16, plant: 92, depth: 38, parallax: 1.18 },
    { key: "stilt-hut", scale: 0.14, plant: 94, depth: 38, parallax: 1.18 },
  ],
  decorEvery: 5.0,
  groundDrawH: 168,
  yMin: 48,
  startY: 230,
  airMin: 90,
  airMax: 360,
  scroll: 268,
  airSpeed: 1.42,
  groundSink: 24,
  bankSink: 90,
  hp: { truck: 6, aa: 9, tank: 12, trainer: 1, fighter: 4, heavy: 6, boss: 22 },
};

const DARK_KIT: StageKit = {
  sky: "dark-sky",
  far: "dark-far",
  mid: "dark-mid",
  near: "dark-near",
  ground: "dark-ground",
  fg: "dark-fg",
  ceiling: "dark-ceiling",
  heightmap: "dark-heightmap",
  ceilingmap: "dark-ceilingmap",
  enemy: "cave-drone",
  enemyAnim: "cave-drone-fly",
  enemyBoss: "borer-boss",
  enemyBossAnim: "borer-boss-fly",
  truck: "minecart",
  tank: "drill-tank",
  aa: "cave-aa",
  truckAnim: "minecart-idle",
  tankAnim: "drill-tank-idle",
  aaAnim: "cave-aa-idle",
  radar: false,
  decor: [
    { key: "stalagmite", scale: 0.14, plant: 6 },
    { key: "crystal", scale: 0.12, plant: 6 },
    { key: "lantern-post", scale: 0.16, plant: 8 },
    { key: "stalagmite", scale: 0.11, plant: 6 },
  ],
  decorEvery: 4.6,
  groundDrawH: 220,
  yMin: 230,
  startY: 330,
  airMin: 250,
  airMax: 385,
  scroll: 292,
  airSpeed: 1.52,
  aaShot: 440,
  hp: { truck: 7, aa: 10, tank: 14, trainer: 1, fighter: 5, heavy: 7, boss: 26 },
};

const ORBIT_KIT: StageKit = {
  sky: "orbit-sky",
  far: "orbit-far",
  mid: "orbit-mid",
  near: "orbit-near",
  ground: "orbit-ground",
  fg: "orbit-fg",
  heightmap: "orbit-heightmap",
  enemy: "orbit-needle",
  enemyAnim: "orbit-needle-fly",
  enemyBoss: "orbit-ring",
  enemyBossAnim: "orbit-ring-fly",
  truck: "cargo-hulk",
  tank: "barge-hulk",
  aa: "gun-sat",
  truckAnim: "cargo-hulk-idle",
  tankAnim: "barge-hulk-idle",
  aaAnim: "gun-sat-idle",
  radar: false,
  decor: [
    { key: "rocklet", scale: 0.12, plant: 4 },
    { key: "solar-spar", scale: 0.14, plant: 6 },
    { key: "nav-buoy", scale: 0.16, plant: 8 },
    { key: "rocklet", scale: 0.1, plant: 4 },
  ],
  decorEvery: 4.4,
  groundDrawH: 150,
  yMin: 48,
  startY: 210,
  airMin: 70,
  airMax: 400,
  scroll: 314,
  airSpeed: 1.62,
  aaShot: 470,
  hp: { truck: 8, aa: 11, tank: 16, trainer: 1, fighter: 6, heavy: 8, boss: 30 },
};

export function stageKit(id: string | undefined | null): StageKit {
  if (id === "tidefront") return TIDE_KIT;
  if (id === "canyon") return CANYON_KIT;
  if (id === "peaks") return PEAKS_KIT;
  if (id === "canopy") return CANOPY_KIT;
  if (id === "underdark") return DARK_KIT;
  if (id === "orbit") return ORBIT_KIT;
  return HEARTLAND_KIT;
}
