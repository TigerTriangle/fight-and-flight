export type Beat = "intro" | "trainers" | "county" | "battery" | "clear";

export type AirKind = "trainer" | "fighter" | "heavy";
export type GroundKind = "truck" | "tank" | "aa";

export type Pack = {
  t: number;
  air?: { kind: AirKind; y: number; dx?: number; speed?: number }[];
  ground?: { kind: GroundKind; dx?: number }[];
};

export const MISSION = {
  introEnd: 5,
  trainersEnd: 20,
  countyEnd: 140,
  batteryEnd: 168,
  end: 172,
};

export const PACKS: Pack[] = [
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

export const SCORE_AIR = 150;
export const SCORE_LOW_CLIP = 80;
export const SCORE_HEAVY = 280;
export const SCORE_GROUND = 220;
export const SCORE_GROUND_BOMB = 380;
export const SCORE_TANK_BOMB = 620;
export const SCORE_AA_BOMB = 540;
export const SCORE_SURVIVE_HULL = 450;
export const SCORE_CLEAR = 700;

export const HP_TRUCK = 4;
export const HP_AA = 6;
export const HP_TANK = 8;

export const MEDAL_BRONZE = 2800;
export const MEDAL_SILVER = 5600;
export const MEDAL_GOLD = 8800;

export type Medal = "none" | "bronze" | "silver" | "gold";

export function medalFor(score: number): Medal {
  if (score >= MEDAL_GOLD) return "gold";
  if (score >= MEDAL_SILVER) return "silver";
  if (score >= MEDAL_BRONZE) return "bronze";
  return "none";
}

export function beatAt(t: number): Beat {
  if (t < MISSION.introEnd) return "intro";
  if (t < MISSION.trainersEnd) return "trainers";
  if (t < MISSION.countyEnd) return "county";
  return "battery";
}

export const BEAT_LABEL: Record<Beat, string> = {
  intro: "Takeoff",
  trainers: "Air trainers",
  county: "County",
  battery: "Battery",
  clear: "Clear",
};
