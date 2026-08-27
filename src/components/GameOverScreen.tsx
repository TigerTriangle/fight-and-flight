import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { useGameStore } from "@/game/store";

export function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const isBest = score > 0 && score >= highScore;

  return (
    <div
      data-ui
      className="absolute inset-0 z-30 flex items-center justify-center bg-bg/60 px-6"
      role="dialog"
      aria-labelledby="over-title"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <h2
          id="over-title"
          className="font-display text-4xl tracking-tight text-fg"
        >
          Downed
        </h2>
        <p className="mt-3 font-display text-5xl tabular-nums leading-none text-fg">
          {score.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-muted">
          {isBest ? "New best over Heartland." : `Best ${highScore.toLocaleString()}`}
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
          <Button variant="secondary" onClick={() => bridge.send("title")}>
            Title
          </Button>
        </div>
      </div>
    </div>
  );
}
