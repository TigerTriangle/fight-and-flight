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
    placeholder: true,
    briefing:
      "The coast is on the board, but the charts are still wet. You fly the Heartland sky under a sea-lane callsign until Tidefront comes online. Sink what you can.",
  },
  {
    id: "canyon",
    index: 3,
    name: "Red Canyon",
    tag: "desert rock",
    open: true,
    placeholder: true,
    briefing:
      "Red walls aren't painted yet. Sortie on the Heartland chart as if silos were canyon rim. Clear the air, then the ground.",
  },
  {
    id: "peaks",
    index: 4,
    name: "High Peaks",
    tag: "alpine",
    open: false,
    placeholder: true,
    briefing: "",
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
