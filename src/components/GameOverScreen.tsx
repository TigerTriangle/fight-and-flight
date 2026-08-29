import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { worldById } from "@/game/worlds";
import { useGameStore } from "@/game/store";
import {
  type EndCause,
  type Medal,
  missionFor,
} from "@/game/mission";

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

const CAUSE_COPY: Record<EndCause, string> = {
  air: "Shot down",
  aa: "Cut down by flak",
  ground: "Went into the dirt",
  ram: "Mid-air collision",
  obstacle: "Flew too low",
  clear: "Home without a medal",
};

function resultArt(medal: Medal, cause: EndCause) {
  if (medal === "gold") return "/results/medal-gold.jpg";
  if (medal === "silver") return "/results/medal-silver.jpg";
  if (medal === "bronze") return "/results/medal-bronze.jpg";
  return `/results/end-${cause}.jpg`;
}

export function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const isWorldBest = useGameStore((s) => s.isWorldBest);
  const worldId = useGameStore((s) => s.worldId);
  const worldBest = useGameStore((s) => s.best[s.worldId]?.score ?? 0);
  const cleared = useGameStore((s) => s.cleared);
  const medal = useGameStore((s) => s.medal);
  const endCause = useGameStore((s) => s.endCause);
  const airKills = useGameStore((s) => s.airKills);
  const groundKills = useGameStore((s) => s.groundKills);
  const world = worldById(worldId);
  const medals = missionFor(worldId).medals;
  const isBest = score > 0 && isWorldBest;
  const caption = medal === "none" ? CAUSE_COPY[endCause] : MEDAL_COPY[medal];
  const art = resultArt(medal, endCause);

  return (
    <div
      data-ui
      className="absolute inset-0 z-30 flex items-center justify-center bg-bg/60 px-6"
      role="dialog"
      aria-labelledby="over-title"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <img
          src={art}
          alt={caption}
          className="h-40 w-full object-cover object-center sm:h-48"
        />
        <div className="p-6">
          <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
            Results
          </p>
          <h2
            id="over-title"
            className="mt-1 font-display text-4xl tracking-tight text-fg"
          >
            {cleared ? `${world.name} Clear` : "Downed"}
          </h2>
          <p className="mt-2 font-display text-2xl leading-none tracking-wide text-fg">
            {caption}
          </p>
          <p className="mt-3 font-display text-5xl tabular-nums leading-none text-fg">
            {score.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-muted">
            {isBest
              ? `New best over ${world.name}.`
              : `${world.name} · Best ${(worldBest || highScore).toLocaleString()}`}
          </p>
          <p className="mt-3 text-sm text-muted">
            Air {airKills} · Ground {groundKills}
          </p>
          <p className="mt-1 text-xs text-muted">
            Gold {medals.gold.toLocaleString()} · Silver {medals.silver.toLocaleString()}{" "}
            · Bronze {medals.bronze.toLocaleString()}
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
    </div>
  );
}
