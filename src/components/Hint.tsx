import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Hint({
  text,
  align = "end",
  children,
}: {
  text: string;
  align?: "start" | "end";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const hoverT = useRef(0);
  const holdT = useRef(0);
  const held = useRef(false);

  const clear = () => {
    window.clearTimeout(hoverT.current);
    window.clearTimeout(holdT.current);
  };

  const hide = () => {
    clear();
    held.current = false;
    setOpen(false);
  };

  useEffect(() => {
    const onDoc = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex"
      onMouseEnter={() => {
        clear();
        hoverT.current = window.setTimeout(() => setOpen(true), 280);
      }}
      onMouseLeave={hide}
      onPointerDown={(e) => {
        if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
        held.current = false;
        clear();
        holdT.current = window.setTimeout(() => {
          held.current = true;
          setOpen(true);
        }, 480);
      }}
      onPointerUp={clear}
      onPointerCancel={hide}
      onClickCapture={(e) => {
        if (!held.current) return;
        e.preventDefault();
        e.stopPropagation();
        held.current = false;
      }}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute top-full z-40 mt-1.5 w-max max-w-56 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-1.5 text-left font-sans text-xs leading-snug text-fg shadow-[0_10px_24px_rgba(0,0,0,0.35)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
