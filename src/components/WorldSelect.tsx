import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/Hint";
import { WORLDS, worldById, type WorldId } from "@/game/worlds";
import { useGameStore } from "@/game/store";
import { cn } from "@/lib/utils";

export function WorldSelect() {
  const worldId = useGameStore((s) => s.worldId);
  const best = useGameStore((s) => s.best);
  const selected = worldById(worldId);

  const pick = (id: WorldId) => {
    useGameStore.getState().setWorld(id);
    useGameStore.getState().setPhase("briefing");
  };

  const back = () => useGameStore.getState().setPhase("hangar");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = Math.max(0, WORLDS.findIndex((w) => w.id === worldId));
      if (e.code === "ArrowUp" || e.code === "ArrowLeft" || e.code === "KeyW" || e.code === "KeyA") {
        const prev = WORLDS[(idx - 1 + WORLDS.length) % WORLDS.length];
        useGameStore.getState().setWorld(prev.id);
      }
      if (e.code === "ArrowDown" || e.code === "ArrowRight" || e.code === "KeyS" || e.code === "KeyD") {
        const next = WORLDS[(idx + 1) % WORLDS.length];
        useGameStore.getState().setWorld(next.id);
      }
      if (e.code === "Enter") {
        e.preventDefault();
        pick(useGameStore.getState().worldId);
      }
      if (e.code === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [worldId]);

  return (
    <div
      data-ui
      className="absolute inset-0 z-20 flex flex-col bg-bg/70 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
          Theaters
        </p>
        <Hint text="Pick a different aircraft.">
          <Button variant="ghost" className="min-h-11" onClick={back}>
            Hangar
          </Button>
        </Hint>
      </div>

      <div className="mx-auto mt-3 grid min-h-0 w-full max-w-2xl flex-1 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {WORLDS.map((w) => {
          const active = w.id === selected.id;
          return (
            <button
              key={w.id}
              type="button"
              aria-current={active}
              onClick={() => pick(w.id)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-left",
                active
                  ? "border-accent bg-surface"
                  : "border-border bg-surface/80 hover:bg-surface",
              )}
            >
              <span className="w-8 shrink-0 font-display text-2xl leading-none tabular-nums text-fg">
                {String(w.index).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl leading-none tracking-tight text-fg">
                  {w.name}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {best[w.id]?.medal && best[w.id]?.medal !== "none"
                    ? `${w.tag} · ${best[w.id]!.medal}`
                    : w.tag}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
