import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { worldById } from "@/game/worlds";
import { useGameStore } from "@/game/store";
import { MEDAL_BRONZE, MEDAL_GOLD, MEDAL_SILVER, type Medal } from "@/game/mission";

function toMenu(phase: "hangar" | "worlds") {
  bridge.send("title");
  useGameStore.getState().setPhase(phase);
}

const MEDAL_COPY: Record<Medal, string> = {
  none: "No medal",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const worldId = useGameStore((s) => s.worldId);
  const cleared = useGameStore((s) => s.cleared);
  const medal = useGameStore((s) => s.medal);
  const airKills = useGameStore((s) => s.airKills);
  const groundKills = useGameStore((s) => s.groundKills);
  const world = worldById(worldId);
  const isBest = score > 0 && score >= highScore;

  return (
    <div
      data-ui
      className="absolute inset-0 z-30 flex items-center justify-center bg-bg/60 px-6"
      role="dialog"
      aria-labelledby="over-title"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
          Results
        </p>
        <h2
          id="over-title"
          className="mt-1 font-display text-4xl tracking-tight text-fg"
        >
          {cleared ? `${world.name} Clear` : "Downed"}
        </h2>
        <div className="mt-4 flex items-center gap-2">
          <Award
            className={`size-7 ${
              medal === "gold"
                ? "text-primary"
                : medal === "silver"
                  ? "text-accent"
                  : medal === "bronze"
                    ? "text-muted"
                    : "text-border"
            }`}
          />
          <p className="font-display text-3xl leading-none tracking-wide text-fg">
            {MEDAL_COPY[medal]}
          </p>
        </div>
        <p className="mt-3 font-display text-5xl tabular-nums leading-none text-fg">
          {score.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-muted">
          {isBest
            ? `New best over ${world.name}.`
            : `${world.name} · Best ${highScore.toLocaleString()}`}
        </p>
        <p className="mt-3 text-sm text-muted">
          Air {airKills} · Ground {groundKills}
        </p>
        <p className="mt-1 text-xs text-muted">
          Gold {MEDAL_GOLD.toLocaleString()} · Silver {MEDAL_SILVER.toLocaleString()} · Bronze{" "}
          {MEDAL_BRONZE.toLocaleString()}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => {
              audio.unlock();
              useGameStore.getState().resetRun();
              useGameStore.getState().setPhase("playing");
              bridge.send("retry");
            }}
          >
            Retry
          </Button>
          <Button variant="secondary" onClick={() => toMenu("hangar")}>
            Hangar
          </Button>
          <Button variant="ghost" onClick={() => toMenu("worlds")}>
            World Select
          </Button>
        </div>
      </div>
    </div>
  );
}
