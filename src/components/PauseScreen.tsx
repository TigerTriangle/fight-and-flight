import { Button } from "@/components/ui/button";
import { SavePanel } from "@/components/SavePanel";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { useGameStore } from "@/game/store";

export function PauseScreen() {
  const muted = useGameStore((s) => s.muted);
  const volume = useGameStore((s) => s.volume);
  const autoFire = useGameStore((s) => s.autoFire);
  const score = useGameStore((s) => s.score);

  return (
    <div
      data-ui
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-bg/55 px-6 py-6"
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
        <div className="mt-5 flex flex-col gap-3">
          <Button size="lg" onClick={() => bridge.send("resume")}>
            Resume
          </Button>
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border px-3">
            <span className="text-sm text-fg">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              aria-label="Volume"
              className="w-32 accent-accent"
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                useGameStore.getState().setVolume(v);
                if (v > 0 && muted) useGameStore.getState().setMuted(false);
                audio.unlock();
                audio.applyMute();
              }}
            />
          </label>
          <Button
            variant="secondary"
            onClick={() => {
              useGameStore.getState().setMuted(!muted);
              audio.applyMute();
            }}
          >
            {muted ? "Sound off" : "Sound on"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => useGameStore.getState().setAutoFire(!autoFire)}
          >
            {autoFire ? "Auto-fire on" : "Auto-fire off"}
          </Button>
          <SavePanel compact />
          <Button variant="ghost" onClick={() => bridge.send("title")}>
            Title
          </Button>
        </div>
      </div>
    </div>
  );
}
