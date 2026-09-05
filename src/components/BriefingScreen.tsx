import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { ART_REV } from "@/game/config";
import { planeById } from "@/game/planes";
import { isWorldOpen, worldById } from "@/game/worlds";
import { useGameStore } from "@/game/store";

export function BriefingScreen() {
  const worldId = useGameStore((s) => s.worldId);
  const planeId = useGameStore((s) => s.planeId);
  const clearedWorlds = useGameStore((s) => s.clearedWorlds);
  const world = worldById(worldId);
  const plane = planeById(planeId);
  const open = isWorldOpen(world.id, clearedWorlds);
  const locked = !open || world.placeholder;

  const fly = () => {
    if (locked) return;
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
      className="absolute inset-0 z-20 flex flex-col bg-bg/80 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
        <p className="shrink-0 text-center font-display text-xs uppercase tracking-[0.28em] text-accent sm:text-sm">
          Theater {world.index} · {world.name}
        </p>
        <figure className="relative mx-auto mt-2 min-h-0 w-full max-w-[22rem] flex-1 sm:max-w-sm">
          <img
            src={`/game/${world.poster}.jpg?v=${ART_REV}`}
            alt={`${world.name} recruitment poster. ${world.slogan}`}
            className="mx-auto h-full max-h-[min(58vh,620px)] w-auto rounded-sm object-contain shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:max-h-[min(64vh,680px)]"
            decoding="async"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1c1610] via-[#1c1610]/92 to-transparent px-3 pb-3 pt-10 text-center sm:px-4 sm:pb-4">
            <p className="whitespace-pre-line font-display text-lg leading-tight tracking-wide text-[#f3e6c8] sm:text-xl">
              {world.slogan}
            </p>
          </figcaption>
        </figure>
        <p className="mt-3 text-center text-sm text-muted">
          {plane.name}
          {world.placeholder ? " · Charts unfinished" : ""}
        </p>
        <p className="mx-auto mt-1 max-w-md text-center font-sans text-sm leading-relaxed text-fg/90">
          {world.briefing || "This theater is still being painted."}
        </p>
        <div className="mt-4 flex shrink-0 flex-col gap-2 sm:mt-5 sm:gap-3">
          <Button
            size="lg"
            className="font-display text-2xl tracking-wide"
            disabled={locked}
            onClick={fly}
          >
            {locked ? "Coming online" : "Fly"}
          </Button>
          <Button variant="secondary" onClick={back}>
            Theaters
          </Button>
        </div>
      </div>
    </div>
  );
}
