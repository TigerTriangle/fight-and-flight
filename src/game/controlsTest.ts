export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
  getY?: () => number;
  getEnemies?: () => number;
  getBullets?: () => number;
  getMode?: () => string;
  getScore?: () => number;
  getHull?: () => number;
  getBombs?: () => number;
  getFps?: () => number;
  getDead?: () => boolean;
  getPhase?: () => string;
  getBuild?: () => number;
  getCrates?: () => number;
  getAirKills?: () => number;
  spawnCrate?: () => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
    __fnfBuild?: number;
  }
}

export {};
