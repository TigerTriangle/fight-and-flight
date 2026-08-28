import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { useGameStore } from "@/game/store";

export function TitleScreen() {
  const ready = useGameStore((s) => s.ready);
  const highScore = useGameStore((s) => s.highScore);

  const play = () => {
    audio.unlock();
    useGameStore.getState().setPhase("hangar");
  };

  return (
    <div
      data-ui
      className="absolute inset-0 z-20 flex flex-col justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8"
    >
      <h1 className="sr-only">Fight and Flight</h1>
      <picture className="pointer-events-none absolute inset-0">
        <source media="(orientation: portrait)" srcSet="/title-mobile.jpg" />
        <img
          src="/title-desktop.jpg"
          alt=""
          className="size-full object-cover object-center"
          decoding="async"
        />
      </picture>
      <div className="relative mx-auto flex w-fit max-w-md flex-col items-center gap-3 rounded-[var(--radius-md)] border border-border/50 bg-bg/50 px-6 py-4 text-center">
        <Button
          size="lg"
          className="min-h-14 min-w-48 font-display text-2xl tracking-wide"
          onClick={play}
          disabled={!ready}
        >
          Play
        </Button>
        {highScore > 0 ? (
          <p className="font-sans text-sm tabular-nums text-fg">
            Best {highScore.toLocaleString()}
          </p>
        ) : null}
        <p className="hidden max-w-xs text-xs leading-relaxed text-fg/80 sm:block">
          WASD or arrows. Space to burst the guns — hold and they cook. Shift or F
          to bomb.
        </p>
      </div>
    </div>
  );
}
