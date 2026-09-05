import { Bomb, Crosshair, Flame, Pause, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bridge } from "@/game/bridge";
import { worldById } from "@/game/worlds";
import { useGameStore } from "@/game/store";

export function Hud() {
  const hull = useGameStore((s) => s.hull);
  const hullMax = useGameStore((s) => s.hullMax);
  const bombs = useGameStore((s) => s.bombs);
  const bombsMax = useGameStore((s) => s.bombsMax);
  const special = useGameStore((s) => s.special);
  const specialMax = useGameStore((s) => s.specialMax);
  const specialName = useGameStore((s) => s.specialName);
  const score = useGameStore((s) => s.score);
  const gunHeat = useGameStore((s) => s.gunHeat);
  const gunHot = useGameStore((s) => s.gunHot);
  const worldId = useGameStore((s) => s.worldId);
  const worldName = worldById(worldId).name;
  const beat = useGameStore((s) => s.beat);
  const burst = worldId === "mare";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2">
        <div className="flex items-center gap-1.5" aria-label={`${hull} hull`}>
          {Array.from({ length: hullMax }).map((_, i) => (
            <span
              key={i}
              className={`block size-2.5 rotate-45 border ${
                i < hull
                  ? "border-danger bg-danger"
                  : "border-muted/40 bg-transparent"
              }`}
            />
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{worldName}</p>
        <p className="text-xs text-muted">{beat}</p>
        <p className="font-display text-2xl leading-none tabular-nums text-fg">
          {score.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted">
            {gunHot ? "Hot" : "Guns"}
          </p>
          <div
            className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-muted/30"
            aria-label={gunHot ? "Guns overheated" : "Gun heat"}
          >
            <div
              className={`h-full w-full origin-left rounded-full ${
                gunHot || gunHeat > 0.7 ? "bg-danger" : "bg-accent"
              }`}
              style={{ transform: `scaleX(${gunHeat})` }}
            />
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted">
            {burst ? "Burst" : "Bombs"}
          </p>
          <div
            className="mt-1 flex max-w-20 flex-wrap gap-1"
            aria-label={`${bombs} of ${bombsMax} ${burst ? "bursts" : "bombs"}`}
          >
            {Array.from({ length: bombsMax }).map((_, i) => {
              const Icon = burst ? Zap : Bomb;
              return (
                <Icon
                  key={i}
                  className={`size-4 ${i < bombs ? "text-accent" : "text-muted/30"}`}
                  strokeWidth={2.25}
                  aria-hidden
                />
              );
            })}
          </div>
        </div>
        {specialMax > 0 ? (
          <div className="rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2">
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted">
              {specialName || "Special"}
            </p>
            <div
              className="mt-1 flex max-w-20 flex-wrap gap-1"
              aria-label={`${special} of ${specialMax} ${specialName || "special"}`}
            >
              {Array.from({ length: specialMax }).map((_, i) => {
                const Icon = specialName === "Lock" ? Crosshair : Flame;
                return (
                  <Icon
                    key={i}
                    className={`size-4 ${i < special ? "text-accent" : "text-muted/30"}`}
                    strokeWidth={2.25}
                    aria-hidden
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        <Button
          data-ui
          variant="secondary"
          size="icon"
          className="pointer-events-auto bg-bg/70"
          aria-label="Pause"
          onClick={() => bridge.send("pause")}
        >
          <Pause className="size-5" />
        </Button>
      </div>
    </div>
  );
}
