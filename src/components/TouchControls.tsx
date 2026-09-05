import { useCallback, useEffect, useRef, useState } from "react";
import { input } from "@/game/input";
import { bridge } from "@/game/bridge";
import { planeById } from "@/game/planes";
import { useGameStore } from "@/game/store";
import { cn } from "@/lib/utils";

type Stick = { x: number; y: number };

export function TouchControls() {
  const baseRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState<Stick>({ x: 0, y: 0 });
  const [firing, setFiring] = useState(false);
  const gunHeat = useGameStore((s) => s.gunHeat);
  const gunHot = useGameStore((s) => s.gunHot);
  const autoFire = useGameStore((s) => s.autoFire);
  const planeId = useGameStore((s) => s.planeId);
  const special = planeById(planeId).special;
  const pid = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      input.touchFire = false;
    };
  }, []);

  const updateFrom = useCallback((clientX: number, clientY: number) => {
    const el = baseRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = (clientX - cx) / (r.width * 0.42);
    const ny = (clientY - cy) / (r.height * 0.42);
    const mag = Math.hypot(nx, ny);
    const x = mag > 1 ? nx / mag : nx;
    const y = mag > 1 ? ny / mag : ny;
    setStick({ x, y });
    input.setStick(x, y);
  }, []);

  const end = useCallback(() => {
    pid.current = null;
    setStick({ x: 0, y: 0 });
    input.setStick(0, 0);
  }, []);

  const setFire = (on: boolean) => {
    input.touchMode = true;
    input.touchFire = on;
    setFiring(on);
  };

  return (
    <div data-ui className="pointer-events-none absolute inset-0 z-20">
      <div
        ref={baseRef}
        className="pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] size-32 rounded-full border border-border bg-bg/35"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          pid.current = e.pointerId;
          input.touchMode = true;
          updateFrom(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pid.current !== e.pointerId) return;
          updateFrom(e.clientX, e.clientY);
        }}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div
          className="absolute size-14 rounded-full bg-fg/80"
          style={{
            left: `calc(50% - 1.75rem + ${stick.x * 36}px)`,
            top: `calc(50% - 1.75rem + ${stick.y * 36}px)`,
          }}
        />
      </div>
      <div className="pointer-events-auto absolute bottom-[max(1.4rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] flex flex-col-reverse items-center gap-3">
        <button
          type="button"
          aria-label="Drop bomb"
          className="size-[4.5rem] rounded-full border border-border bg-bg/70 font-display text-lg tracking-wide text-fg active:scale-95"
          onPointerDown={(e) => {
            e.preventDefault();
            input.touchMode = true;
            input.queueBomb();
          }}
        >
          Bomb
        </button>
        <button
          type="button"
          aria-label={gunHot ? "Guns overheated" : "Fire guns"}
          aria-pressed={firing}
          className={cn(
            "relative size-20 overflow-hidden rounded-full border font-display text-xl tracking-wide active:scale-95",
            gunHot
              ? "border-danger bg-danger/80 text-fg"
              : firing
                ? "border-primary bg-primary text-bg"
                : "border-border bg-bg/80 text-fg",
          )}
          onPointerDown={(e) => {
            e.preventDefault();
            setFire(true);
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* synthetic / non-capturable pointers */
            }
          }}
          onPointerUp={() => setFire(false)}
          onPointerCancel={() => setFire(false)}
        >
          <span
            className={cn(
              "pointer-events-none absolute inset-0 origin-bottom",
              gunHot || gunHeat > 0.7 ? "bg-danger/50" : "bg-accent/40",
            )}
            style={{ transform: `scaleY(${gunHeat})` }}
          />
          <span className="relative">{gunHot ? "HOT" : autoFire ? "AUTO" : "Gun"}</span>
        </button>
        {special ? (
          <button
            type="button"
            aria-label={special.name}
            className="size-[4.5rem] rounded-full border border-accent/70 bg-bg/70 font-display text-lg tracking-wide text-fg active:scale-95"
            onPointerDown={(e) => {
              e.preventDefault();
              input.touchMode = true;
              input.queueSpecial();
            }}
          >
            {special.short}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className="sr-only"
        onClick={() => bridge.send("pause")}
      >
        Pause
      </button>
    </div>
  );
}
