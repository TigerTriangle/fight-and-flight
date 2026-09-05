import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/Hint";
import { SavePanel } from "@/components/SavePanel";
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
  const [logbook, setLogbook] = useState(false);

  const select = (id: PlaneId) => useGameStore.getState().setPlane(id);

  const cycle = (dir: number) => {
    const next = PLANES[(idx + dir + PLANES.length) % PLANES.length];
    select(next.id);
  };

  const takeoff = () => {
    audio.unlock();
    useGameStore.getState().setPhase("worlds");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
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
      className="absolute inset-0 z-20 flex flex-col overflow-y-auto bg-bg/60 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2">
        <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
          Hangar
        </p>
        <div className="flex items-center gap-1">
          <Hint text="Saves, backup file, and your Pilot code.">
            <Button variant="ghost" className="min-h-11" onClick={() => setLogbook((v) => !v)}>
              Logbook
            </Button>
          </Hint>
          <Hint text="Back to the title card.">
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
          </Hint>
        </div>
      </div>

      <div className="mx-auto mt-2 flex min-h-0 w-full max-w-lg flex-1 flex-col items-center">
        <div className="flex w-full items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="size-14 shrink-0"
            aria-label="Previous plane"
            onClick={() => cycle(-1)}
          >
            <ChevronLeft className="size-7" />
          </Button>
          <div className="relative flex min-h-20 min-w-0 flex-1 items-center justify-center sm:min-h-32">
            <img
              key={plane.id}
              src={plane.portrait}
              alt={plane.name}
              className="max-h-24 w-auto object-contain sm:max-h-40"
              style={plane.trim ? { transform: `rotate(${plane.trim}rad)` } : undefined}
              draggable={false}
            />
          </div>
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
        <div className="mt-3 flex gap-1.5">
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

        <div className="mt-3 w-full rounded-[var(--radius-xl)] border border-border bg-surface/90 p-3 sm:p-5">
          <h2 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-5xl">
            {plane.name}
          </h2>
          <p className="mt-2 font-sans text-sm text-muted sm:text-base">{plane.role}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            <StatPips label="Speed" value={plane.bars.speed} />
            <StatPips label="Armor" value={plane.bars.armor} suffix={String(plane.hull)} />
            <StatPips label="Guns" value={plane.bars.guns} />
            <StatPips label="Bombs" value={plane.bars.bombs} suffix={String(plane.bombs)} />
            {plane.special ? (
              <p className="pt-1 text-xs uppercase tracking-[0.14em] text-accent">
                Special · {plane.special.name}
                <span className="ml-2 font-sans font-normal normal-case tracking-normal text-muted">
                  E / {plane.special.short} · {plane.special.start}/{plane.special.max} · +1 per {plane.special.scorePer} pts
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 w-full max-w-lg">
        <Button
          size="lg"
          className="min-h-14 w-full font-display text-2xl tracking-wide"
          onClick={takeoff}
        >
          Theaters
        </Button>
      </div>
      {logbook ? (
        <div className="mx-auto mt-3 w-full max-w-lg rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <SavePanel />
        </div>
      ) : null}
    </div>
  );
}
