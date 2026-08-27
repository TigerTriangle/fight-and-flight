import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { GameOverScreen } from "@/components/GameOverScreen";
import { Hud } from "@/components/Hud";
import { PauseScreen } from "@/components/PauseScreen";
import { TitleScreen } from "@/components/TitleScreen";
import { TouchControls } from "@/components/TouchControls";
import { bridge } from "@/game/bridge";
import { input } from "@/game/input";
import { ART_REV } from "@/game/config";
import { useGameStore } from "@/game/store";

function useCoarseInput() {
  const touch = useGameStore((s) => s.touch);
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 800px)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return touch || coarse;
}

export function GameApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const phase = useGameStore((s) => s.phase);
  const setTouch = useGameStore((s) => s.setTouch);
  const showTouch = useCoarseInput();

  useEffect(() => {
    let game: Phaser.Game | undefined;
    let dead = false;
    const host = hostRef.current;
    if (!host) return;
    void import("@/game/createGame").then(({ createGame }) => {
      if (dead || !hostRef.current) return;
      game = createGame(hostRef.current);
      if (dead) {
        game.destroy(true);
        game = undefined;
      }
    });
    const onTouch = () => {
      setTouch(true);
      input.touchMode = true;
    };
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    return () => {
      dead = true;
      game?.destroy(true);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [setTouch, ART_REV]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Escape") return;
      const p = useGameStore.getState().phase;
      if (p === "playing") bridge.send("pause");
      else if (p === "paused") bridge.send("resume");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (phase === "playing" && showTouch) {
      input.touchMode = true;
    }
    if (phase !== "playing") {
      input.touchFire = false;
    }
  }, [phase, showTouch]);

  return (
    <div
      className="game-shell"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div ref={hostRef} id="game-root" className="game-root" />
      {phase === "booting" || phase === "title" ? <TitleScreen /> : null}
      {phase === "playing" || phase === "paused" ? <Hud /> : null}
      {phase === "playing" && showTouch ? <TouchControls /> : null}
      {phase === "paused" ? <PauseScreen /> : null}
      {phase === "gameover" ? <GameOverScreen /> : null}
    </div>
  );
}
