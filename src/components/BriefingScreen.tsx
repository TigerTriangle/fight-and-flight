import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { planeById } from "@/game/planes";
import { worldById } from "@/game/worlds";
import { useGameStore } from "@/game/store";

export function BriefingScreen() {
  const worldId = useGameStore((s) => s.worldId);
  const planeId = useGameStore((s) => s.planeId);
  const world = worldById(worldId);
  const plane = planeById(planeId);

  const fly = () => {
    if (!world.open) return;
    audio.unlock();
    useGameStore.getState().resetRun();
    useGameStore.getState().setPhase("playing");
    bridge.send("play");
  };

  const back = () => useGameStore.getState().setPhase("worlds");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        e.preventDefault();
        fly();
      }
      if (e.code === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [worldId]);

  return (
    <div
      data-ui
      className="absolute inset-0 z-20 flex items-end justify-center bg-bg/65 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-8"
    >
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface/95 p-5 sm:p-6">
        <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
          Briefing
        </p>
        <h2 className="mt-2 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
          {world.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {plane.name}
          {world.placeholder ? " · Heartland chart" : ""}
        </p>
        <p className="mt-4 font-sans text-base leading-relaxed text-fg">{world.briefing}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="font-display text-2xl tracking-wide" onClick={fly}>
            Fly
          </Button>
          <Button variant="secondary" onClick={back}>
            Theaters
          </Button>
        </div>
      </div>
    </div>
  );
}
