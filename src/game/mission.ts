import type { WorldId } from "./worlds";

export type Beat = "intro" | "trainers" | "county" | "battery" | "clear";

export type AirKind = "trainer" | "fighter" | "heavy" | "boss";
export type GroundKind = "truck" | "tank" | "aa";

export type Pack = {
  t: number;
  air?: { kind: AirKind; y: number; dx?: number; speed?: number }[];
  ground?: { kind: GroundKind; dx?: number; ledge?: number }[];
};

export type MissionDef = {
  introEnd: number;
  trainersEnd: number;
  countyEnd: number;
  batteryEnd: number;
  end: number;
  holdForBoss?: boolean;
  packs: Pack[];
  medals: { bronze: number; silver: number; gold: number };
  beats: Record<Beat, string>;
};

const HEARTLAND_PACKS: Pack[] = [
  { t: 6, air: [{ kind: "trainer", y: 180 }, { kind: "trainer", y: 260, dx: 80 }] },
  { t: 11, air: [{ kind: "trainer", y: 210 }] },
  { t: 16, air: [{ kind: "trainer", y: 140 }, { kind: "trainer", y: 300, dx: 90 }] },

  { t: 22, air: [{ kind: "fighter", y: 200 }] },
  { t: 26, ground: [{ kind: "truck" }] },
  { t: 30, air: [{ kind: "fighter", y: 150 }, { kind: "fighter", y: 250, dx: 90 }] },
  { t: 36, ground: [{ kind: "truck" }] },
  { t: 40, air: [{ kind: "fighter", y: 190 }] },
  { t: 44, ground: [{ kind: "tank" }] },
  {
    t: 48,
    air: [
      { kind: "fighter", y: 130 },
      { kind: "fighter", y: 210, dx: 70 },
      { kind: "fighter", y: 300, dx: 140 },
    ],
  },
  { t: 56, ground: [{ kind: "truck" }] },
  { t: 60, air: [{ kind: "heavy", y: 200 }, { kind: "fighter", y: 140, dx: 100 }] },
  { t: 66, ground: [{ kind: "aa" }] },
  { t: 70, air: [{ kind: "fighter", y: 240 }] },
  { t: 74, ground: [{ kind: "truck" }] },
  { t: 78, air: [{ kind: "fighter", y: 160 }, { kind: "fighter", y: 280, dx: 80 }] },
  { t: 84, ground: [{ kind: "tank" }] },
  { t: 88, air: [{ kind: "fighter", y: 180 }] },
  { t: 92, ground: [{ kind: "aa" }] },
  {
    t: 96,
    air: [
      { kind: "fighter", y: 120, speed: -230 },
      { kind: "fighter", y: 220, dx: 60 },
      { kind: "fighter", y: 320, dx: 40, speed: -150 },
    ],
  },
  { t: 104, ground: [{ kind: "truck" }] },
  { t: 108, air: [{ kind: "heavy", y: 190 }] },
  { t: 112, air: [{ kind: "fighter", y: 150 }, { kind: "fighter", y: 270, dx: 90 }] },
  { t: 118, ground: [{ kind: "tank" }] },
  { t: 122, air: [{ kind: "fighter", y: 210 }] },
  { t: 126, ground: [{ kind: "truck" }] },
  { t: 130, air: [{ kind: "fighter", y: 140 }, { kind: "fighter", y: 300, dx: 70 }] },
  { t: 136, ground: [{ kind: "aa" }] },

  { t: 142, air: [{ kind: "fighter", y: 200 }] },
  { t: 146, ground: [{ kind: "tank" }] },
  { t: 150, air: [{ kind: "heavy", y: 170 }, { kind: "fighter", y: 260, dx: 90 }] },
  { t: 154, ground: [{ kind: "aa" }] },
  { t: 158, air: [{ kind: "fighter", y: 230 }] },
  { t: 162, ground: [{ kind: "truck" }] },
  { t: 166, ground: [{ kind: "aa" }] },
];

const TIDEFRONT_PACKS: Pack[] = [
  { t: 6, air: [{ kind: "trainer", y: 200 }, { kind: "trainer", y: 280, dx: 70 }] },
  { t: 12, air: [{ kind: "trainer", y: 230 }] },
  { t: 18, air: [{ kind: "trainer", y: 160 }, { kind: "trainer", y: 300, dx: 80 }] },

  { t: 22, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 190 }] },
  { t: 26, ground: [{ kind: "truck", dx: 80 }] },
  { t: 30, ground: [{ kind: "tank" }], air: [{ kind: "fighter", y: 150 }, { kind: "fighter", y: 270, dx: 80 }] },
  { t: 34, ground: [{ kind: "truck" }] },
  { t: 38, air: [{ kind: "fighter", y: 150 }, { kind: "fighter", y: 250, dx: 90 }, { kind: "fighter", y: 330, dx: 40 }] },
  { t: 44, ground: [{ kind: "aa" }], air: [{ kind: "fighter", y: 210 }] },
  { t: 48, ground: [{ kind: "truck" }] },
  { t: 52, ground: [{ kind: "truck", dx: 70 }], air: [{ kind: "fighter", y: 170 }, { kind: "fighter", y: 300, dx: 70 }] },
  { t: 56, ground: [{ kind: "tank" }] },
  { t: 62, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 230 }] },
  { t: 66, ground: [{ kind: "aa" }] },
  { t: 70, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 160 }, { kind: "fighter", y: 280, dx: 90 }] },
  { t: 74, air: [{ kind: "heavy", y: 210 }, { kind: "fighter", y: 140, dx: 100 }] },
  { t: 80, ground: [{ kind: "tank" }] },
  { t: 84, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 200 }] },
  { t: 88, ground: [{ kind: "aa" }] },
  { t: 92, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 140 }, { kind: "fighter", y: 260, dx: 80 }] },
  { t: 96, ground: [{ kind: "tank" }] },
  { t: 102, air: [{ kind: "fighter", y: 130 }, { kind: "fighter", y: 220, dx: 60 }, { kind: "fighter", y: 310, dx: 110 }] },
  { t: 108, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 240 }] },
  { t: 112, ground: [{ kind: "aa" }] },
  { t: 116, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 180 }, { kind: "fighter", y: 300, dx: 70 }] },
  { t: 120, ground: [{ kind: "tank" }] },
  { t: 126, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 210 }] },
  { t: 130, ground: [{ kind: "truck", dx: 90 }] },
  { t: 134, ground: [{ kind: "aa" }] },
  { t: 140, air: [{ kind: "fighter", y: 180 }, { kind: "fighter", y: 280, dx: 70 }] },
  { t: 146, ground: [{ kind: "tank" }], air: [{ kind: "fighter", y: 150 }] },
  { t: 150, ground: [{ kind: "aa" }] },
  { t: 154, ground: [{ kind: "truck" }], air: [{ kind: "fighter", y: 250 }, { kind: "fighter", y: 330, dx: 60 }] },
  { t: 158, ground: [{ kind: "tank" }] },
  { t: 162, ground: [{ kind: "aa" }], air: [{ kind: "fighter", y: 200 }] },
  { t: 166, ground: [{ kind: "truck" }] },
];

const CANYON_PACKS: Pack[] = [
  { t: 6, air: [{ kind: "trainer", y: 300 }, { kind: "trainer", y: 360, dx: 70 }] },
  { t: 12, air: [{ kind: "trainer", y: 320 }] },
  { t: 18, air: [{ kind: "trainer", y: 280 }, { kind: "trainer", y: 370, dx: 80 }] },

  { t: 22, air: [{ kind: "fighter", y: 310 }] },
  { t: 26, ground: [{ kind: "truck" }] },
  { t: 30, air: [{ kind: "fighter", y: 290 }, { kind: "fighter", y: 360, dx: 80 }] },
  { t: 36, ground: [{ kind: "aa" }] },
  { t: 40, air: [{ kind: "fighter", y: 310 }] },
  { t: 44, ground: [{ kind: "tank" }] },
  { t: 48, air: [{ kind: "fighter", y: 280 }, { kind: "fighter", y: 330, dx: 60 }, { kind: "fighter", y: 380, dx: 120 }] },
  { t: 56, ground: [{ kind: "truck" }] },
  { t: 60, air: [{ kind: "heavy", y: 320 }, { kind: "fighter", y: 280, dx: 90 }] },
  { t: 66, ground: [{ kind: "aa" }] },
  { t: 70, air: [{ kind: "fighter", y: 340 }] },
  { t: 74, ground: [{ kind: "truck" }] },
  { t: 78, air: [{ kind: "fighter", y: 290 }, { kind: "fighter", y: 370, dx: 70 }] },
  { t: 84, ground: [{ kind: "tank" }] },
  { t: 88, air: [{ kind: "fighter", y: 310 }] },
  { t: 92, ground: [{ kind: "aa" }] },
  { t: 96, air: [{ kind: "fighter", y: 280, speed: -210 }, { kind: "fighter", y: 330, dx: 50 }, { kind: "fighter", y: 380, dx: 30 }] },
  { t: 104, ground: [{ kind: "truck" }] },
  { t: 108, air: [{ kind: "heavy", y: 310 }] },
  { t: 112, air: [{ kind: "fighter", y: 290 }, { kind: "fighter", y: 360, dx: 80 }] },
  { t: 118, ground: [{ kind: "aa" }] },
  { t: 122, air: [{ kind: "fighter", y: 320 }] },
  { t: 126, ground: [{ kind: "truck" }] },
  { t: 130, air: [{ kind: "fighter", y: 280 }, { kind: "fighter", y: 350, dx: 70 }] },
  { t: 136, ground: [{ kind: "aa" }] },
  { t: 142, air: [{ kind: "fighter", y: 310 }] },
  { t: 146, ground: [{ kind: "tank" }] },
  { t: 150, air: [{ kind: "heavy", y: 300 }, { kind: "fighter", y: 360, dx: 80 }] },
  { t: 154, ground: [{ kind: "aa" }] },
  { t: 158, air: [{ kind: "fighter", y: 330 }] },
  { t: 162, ground: [{ kind: "truck" }] },
  { t: 166, ground: [{ kind: "aa" }] },
];

const PEAKS_PACKS: Pack[] = [
  { t: 5, air: [{ kind: "trainer", y: 160 }, { kind: "trainer", y: 250, dx: 60 }] },
  { t: 10, air: [{ kind: "trainer", y: 200 }] },
  { t: 15, air: [{ kind: "trainer", y: 140 }, { kind: "trainer", y: 300, dx: 80 }] },

  { t: 20, air: [{ kind: "fighter", y: 150, speed: -250 }, { kind: "fighter", y: 240, dx: 70, speed: -250 }] },
  { t: 24, ground: [{ kind: "truck" }] },
  { t: 27, air: [{ kind: "fighter", y: 180, speed: -260 }] },
  { t: 31, air: [{ kind: "fighter", y: 120, speed: -270 }, { kind: "fighter", y: 210, dx: 50 }, { kind: "fighter", y: 310, dx: 110, speed: -240 }] },
  { t: 35, ground: [{ kind: "aa" }] },
  { t: 38, air: [{ kind: "fighter", y: 200, speed: -255 }], ground: [{ kind: "truck" }] },
  { t: 42, ground: [{ kind: "tank" }] },
  { t: 45, air: [{ kind: "fighter", y: 140, speed: -280 }, { kind: "fighter", y: 260, dx: 80, speed: -260 }] },
  { t: 49, ground: [{ kind: "truck" }] },
  { t: 52, air: [{ kind: "heavy", y: 190 }, { kind: "fighter", y: 130, dx: 90, speed: -270 }] },
  { t: 56, ground: [{ kind: "aa" }], air: [{ kind: "fighter", y: 230, speed: -250 }] },
  { t: 60, air: [{ kind: "fighter", y: 110, speed: -280 }, { kind: "fighter", y: 200, dx: 40 }, { kind: "fighter", y: 300, dx: 90 }] },
  { t: 64, ground: [{ kind: "truck" }] },
  { t: 67, air: [{ kind: "fighter", y: 170, speed: -265 }] },
  { t: 71, ground: [{ kind: "tank" }], air: [{ kind: "fighter", y: 250, speed: -255 }] },
  { t: 75, air: [{ kind: "fighter", y: 130, speed: -275 }, { kind: "fighter", y: 220, dx: 70 }] },
  { t: 79, ground: [{ kind: "aa" }] },
  { t: 82, air: [{ kind: "heavy", y: 180 }, { kind: "fighter", y: 120, dx: 80, speed: -270 }, { kind: "fighter", y: 290, dx: 140 }] },
  { t: 86, ground: [{ kind: "truck" }] },
  { t: 90, air: [{ kind: "fighter", y: 150, speed: -280 }, { kind: "fighter", y: 250, dx: 60, speed: -260 }] },
  { t: 94, ground: [{ kind: "aa" }] },
  { t: 97, air: [{ kind: "fighter", y: 190, speed: -255 }], ground: [{ kind: "tank" }] },
  { t: 101, air: [{ kind: "fighter", y: 120, speed: -285 }, { kind: "fighter", y: 210, dx: 50 }, { kind: "fighter", y: 320, dx: 100 }] },
  { t: 105, ground: [{ kind: "truck" }] },
  { t: 108, air: [{ kind: "heavy", y: 200 }, { kind: "fighter", y: 140, dx: 90, speed: -270 }] },
  { t: 112, ground: [{ kind: "aa" }], air: [{ kind: "fighter", y: 240, speed: -250 }] },
  { t: 116, air: [{ kind: "fighter", y: 160, speed: -275 }, { kind: "fighter", y: 280, dx: 70 }] },
  { t: 120, ground: [{ kind: "truck" }] },
  { t: 124, air: [{ kind: "fighter", y: 130, speed: -280 }, { kind: "fighter", y: 220, dx: 55 }, { kind: "fighter", y: 310, dx: 120 }] },
  { t: 128, ground: [{ kind: "tank" }] },
  { t: 132, air: [{ kind: "fighter", y: 180, speed: -260 }], ground: [{ kind: "aa" }] },
  { t: 136, air: [{ kind: "heavy", y: 170 }, { kind: "fighter", y: 250, dx: 80, speed: -270 }] },
  { t: 140, ground: [{ kind: "truck" }] },
  { t: 144, air: [{ kind: "fighter", y: 140, speed: -285 }, { kind: "fighter", y: 230, dx: 60 }] },

  { t: 148, air: [{ kind: "boss", y: 200, speed: -95 }], ground: [{ kind: "aa" }] },
  { t: 154, ground: [{ kind: "aa" }] },
  { t: 158, air: [{ kind: "fighter", y: 150, speed: -270 }, { kind: "fighter", y: 280, dx: 80 }] },
  { t: 164, ground: [{ kind: "truck" }] },
  { t: 170, ground: [{ kind: "aa" }] },
];

export const MISSIONS: Record<"heartland" | "tidefront" | "canyon" | "peaks", MissionDef> = {
  heartland: {
    introEnd: 5,
    trainersEnd: 20,
    countyEnd: 140,
    batteryEnd: 168,
    end: 172,
    packs: HEARTLAND_PACKS,
    medals: { bronze: 2800, silver: 5600, gold: 8800 },
    beats: {
      intro: "Takeoff",
      trainers: "Air trainers",
      county: "County",
      battery: "Battery",
      clear: "Clear",
    },
  },
  tidefront: {
    introEnd: 5,
    trainersEnd: 20,
    countyEnd: 138,
    batteryEnd: 168,
    end: 172,
    packs: TIDEFRONT_PACKS,
    medals: { bronze: 3400, silver: 6800, gold: 10200 },
    beats: {
      intro: "Launch",
      trainers: "Coast trainers",
      county: "Sea lanes",
      battery: "Harbor guns",
      clear: "Clear",
    },
  },
  canyon: {
    introEnd: 5,
    trainersEnd: 20,
    countyEnd: 140,
    batteryEnd: 168,
    end: 172,
    packs: CANYON_PACKS,
    medals: { bronze: 2600, silver: 5200, gold: 8400 },
    beats: {
      intro: "Drop in",
      trainers: "Slot trainers",
      county: "The Narrows",
      battery: "Rim battery",
      clear: "Clear",
    },
  },
  peaks: {
    introEnd: 4,
    trainersEnd: 18,
    countyEnd: 146,
    batteryEnd: 178,
    end: 186,
    holdForBoss: true,
    packs: PEAKS_PACKS,
    medals: { bronze: 3800, silver: 7600, gold: 11800 },
    beats: {
      intro: "Climb",
      trainers: "Ridge trainers",
      county: "Snow line",
      battery: "Ridge bomber",
      clear: "Clear",
    },
  },
};

export const MISSION = MISSIONS.heartland;
export const PACKS = HEARTLAND_PACKS;

export const SCORE_AIR = 150;
export const SCORE_LOW_CLIP = 80;
export const SCORE_HEAVY = 280;
export const SCORE_GROUND = 220;
export const SCORE_GROUND_BOMB = 380;
export const SCORE_TANK_BOMB = 620;
export const SCORE_AA_BOMB = 540;
export const SCORE_SURVIVE_HULL = 450;
export const SCORE_CLEAR = 700;
export const SCORE_BOSS = 1200;

export const HP_TRUCK = 4;
export const HP_AA = 6;
export const HP_TANK = 8;

export const MEDAL_BRONZE = 2800;
export const MEDAL_SILVER = 5600;
export const MEDAL_GOLD = 8800;

export type Medal = "none" | "bronze" | "silver" | "gold";
export type EndCause = "air" | "aa" | "ground" | "ram" | "obstacle" | "clear";

export function missionFor(id: string | undefined | null): MissionDef {
  if (id === "tidefront" || id === "canyon" || id === "peaks") return MISSIONS[id];
  return MISSIONS.heartland;
}

export function medalFor(score: number, worldId?: WorldId | string): Medal {
  const m = missionFor(worldId).medals;
  if (score >= m.gold) return "gold";
  if (score >= m.silver) return "silver";
  if (score >= m.bronze) return "bronze";
  return "none";
}

export function beatAt(t: number, mission: MissionDef = MISSIONS.heartland): Beat {
  if (t < mission.introEnd) return "intro";
  if (t < mission.trainersEnd) return "trainers";
  if (t < mission.countyEnd) return "county";
  return "battery";
}

export const BEAT_LABEL: Record<Beat, string> = MISSIONS.heartland.beats;
