import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { bridge } from "@/game/bridge";
import { useGameStore } from "@/game/store";

export function TitleScreen() {
  const ready = useGameStore((s) => s.ready);
  const highScore = useGameStore((s) => s.highScore);

  const play = () => {
    audio.unlock();
    useGameStore.getState().resetRun();
    useGameStore.getState().setPhase("playing");
    bridge.send("play");
  };

  return (
    <div
      data-ui
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,35,48,0.18)_0%,rgba(26,35,48,0.42)_70%,rgba(26,35,48,0.55)_100%)]" />
      <div className="relative flex max-w-xl flex-col items-center gap-5 pt-[env(safe-area-inset-top)]">
        <p className="font-display text-sm tracking-[0.28em] text-accent uppercase">
          Arcade flyer
        </p>
        <h1 className="font-display text-6xl leading-[0.9] tracking-tight text-fg sm:text-7xl md:text-8xl">
          Fight and Flight
        </h1>
        <p className="max-w-md font-sans text-lg italic text-muted sm:text-xl">
          Fight or flight? I choose both.
        </p>
        <div className="mt-2 h-px w-24 bg-accent/70" />
        <Button
          size="lg"
          className="mt-4 min-h-14 min-w-48 font-display text-2xl tracking-wide"
          onClick={play}
          disabled={!ready}
        >
          Play
        </Button>
        {highScore > 0 ? (
          <p className="font-sans text-sm tabular-nums text-muted">
            Best {highScore.toLocaleString()}
          </p>
        ) : null}
        <p className="mt-6 hidden max-w-sm text-xs leading-relaxed text-muted sm:block">
          WASD or arrows to fly. Space or click to fire. Shift, F, or right-click
          to bomb. When bombs run low, snag the parachute crate marked BOMB.
          Stay off the dirt.
        </p>
      </div>
    </div>
  );
}
