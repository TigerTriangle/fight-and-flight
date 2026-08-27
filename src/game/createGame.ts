import Phaser from "phaser";
import "./controlsTest";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { audio } from "./audio";
import { input } from "./input";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { PreloadScene } from "./scenes/PreloadScene";

export function createGame(parent: HTMLElement) {
  input.attach();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#6aa7d1",
    antialias: true,
    roundPixels: false,
    autoFocus: false,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
        fps: 60,
        fixedStep: true,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    input: { activePointers: 3 },
    scene: [BootScene, PreloadScene, GameScene],
    fps: { target: 60, forceSetTimeOut: true, smoothStep: false },
    audio: { disableWebAudio: false },
  });
  game.events.once(Phaser.Core.Events.DESTROY, () => {
    input.detach();
    audio.stopEngine();
  });
  // Keep the sim ticking in background tabs (QA + tab-away). Phaser's default
  // HIDDEN handler only records pause time; Chrome still throttles rAF.
  game.events.on(Phaser.Core.Events.HIDDEN, () => {
    game.loop.resume();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) audio.unlock();
  });
  return game;
}
