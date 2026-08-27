import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { useGameStore } from "@/game/store";

export function PauseScreen() {
  const muted = useGameStore((s) => s.muted);
  const score = useGameStore((s) => s.score);

  return (
    <div
      data-ui
      className="absolute inset-0 z-30 flex items-center justify-center bg-bg/55 px-6"
      role="dialog"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <h2
          id="pause-title"
          className="font-display text-4xl tracking-tight text-fg"
        >
          Paused
        </h2>
        <p className="mt-1 font-sans text-sm tabular-nums text-muted">
          Score {score.toLocaleString()}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" onClick={() => bridge.send("resume")}>
            Resume
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              useGameStore.getState().setMuted(!muted);
              audio.applyMute();
            }}
          >
            {muted ? "Sound off" : "Sound on"}
          </Button>
          <Button variant="ghost" onClick={() => bridge.send("title")}>
            Title
          </Button>
        </div>
      </div>
    </div>
  );
}
