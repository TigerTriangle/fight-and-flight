import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { PLANES, planeById, type PlaneId } from "@/game/planes";
import { useGameStore } from "@/game/store";

function StatPips({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 w-3 rounded-full ${
                i < value ? "bg-accent" : "bg-muted/30"
              }`}
            />
          ))}
        </div>
        {suffix ? (
          <p className="w-6 text-right font-display text-lg leading-none tabular-nums text-fg">
            {suffix}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function HangarScreen() {
  const planeId = useGameStore((s) => s.planeId);
  const plane = planeById(planeId);
  const idx = Math.max(0, PLANES.findIndex((p) => p.id === planeId));

  const select = (id: PlaneId) => useGameStore.getState().setPlane(id);

  const cycle = (dir: number) => {
    const next = PLANES[(idx + dir + PLANES.length) % PLANES.length];
    select(next.id);
  };

  const takeoff = () => {
    audio.unlock();
    useGameStore.getState().resetRun();
    useGameStore.getState().setPhase("playing");
    bridge.send("play");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") cycle(-1);
      if (e.code === "ArrowRight" || e.code === "KeyD") cycle(1);
      if (e.code === "Enter") {
        e.preventDefault();
        takeoff();
      }
      if (e.code === "Escape") {
        useGameStore.getState().setPhase("title");
        bridge.send("title");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx]);

  return (
    <div
      data-ui
      className="absolute inset-0 z-20 flex flex-col bg-bg/60 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
          Hangar
        </p>
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            useGameStore.getState().setPhase("title");
            bridge.send("title");
          }}
        >
          Title
        </Button>
      </div>

      <div className="mx-auto mt-2 flex min-h-0 w-full max-w-lg flex-1 flex-col items-center">
        <div className="relative flex min-h-36 w-full flex-1 items-center justify-center sm:min-h-48">
          <img
            key={plane.id}
            src={plane.portrait}
            alt={plane.name}
            className="max-h-44 w-auto object-contain sm:max-h-56"
            style={plane.trim ? { transform: `rotate(${plane.trim}rad)` } : undefined}
            draggable={false}
          />
        </div>

        <div className="mt-2 w-full rounded-[var(--radius-xl)] border border-border bg-surface/90 p-4 sm:p-5">
          <h2 className="font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
            {plane.name}
          </h2>
          <p className="mt-2 font-sans text-sm text-muted sm:text-base">{plane.role}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            <StatPips label="Speed" value={plane.bars.speed} />
            <StatPips label="Armor" value={plane.bars.armor} suffix={String(plane.hull)} />
            <StatPips label="Guns" value={plane.bars.guns} />
            <StatPips label="Bombs" value={plane.bars.bombs} suffix={String(plane.bombs)} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-lg items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="size-14 shrink-0"
          aria-label="Previous plane"
          onClick={() => cycle(-1)}
        >
          <ChevronLeft className="size-7" />
        </Button>
        <Button
          size="lg"
          className="min-h-14 flex-1 font-display text-2xl tracking-wide"
          onClick={takeoff}
        >
          Takeoff
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="size-14 shrink-0"
          aria-label="Next plane"
          onClick={() => cycle(1)}
        >
          <ChevronRight className="size-7" />
        </Button>
      </div>
      <div className="mx-auto mt-3 flex gap-1.5">
        {PLANES.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={p.name}
            aria-current={p.id === plane.id}
            className={`size-2 rounded-full ${
              p.id === plane.id ? "bg-accent" : "bg-muted/40"
            }`}
            onClick={() => select(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
