import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { encodePilot, readSaveFile } from "@/game/save";
import { useGameStore } from "@/game/store";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function SavePanel({ compact = false }: { compact?: boolean }) {
  const clearedWorlds = useGameStore((s) => s.clearedWorlds);
  const best = useGameStore((s) => s.best);
  const code = encodePilot(clearedWorlds, best);
  const fileRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(""), 2200);
  };

  const copyCode = async () => {
    const ok = await copyText(code);
    setCopied(ok);
    flash(ok ? "Pilot code copied." : "Could not copy.");
    if (ok) window.setTimeout(() => setCopied(false), 1600);
  };

  const applyCode = () => {
    const typed = (codeRef.current?.value || "").trim();
    const ok = useGameStore.getState().restorePilot(typed);
    flash(ok ? "Theaters restored." : "Code not recognized.");
    if (ok && codeRef.current) codeRef.current.value = "";
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const data = await readSaveFile(file);
    if (!data || !useGameStore.getState().applySave(data)) {
      flash("Save could not be read.");
      return;
    }
    audio.applyMute();
    flash("Save loaded.");
  };

  return (
    <div className={compact ? "mt-4" : "w-full"}>
      <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">Pilot</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="min-w-0 flex-1 font-display text-2xl tracking-wide text-fg">{code}</p>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label={copied ? "Pilot code copied" : "Copy pilot code"}
          onClick={() => void copyCode()}
        >
          {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
        </Button>
      </div>
      <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
        Plane, last theater, unlocks, and bests save on this device. No account needed.
      </p>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
        The Pilot code is a shorthand. Apply it to restore unlocked theaters — not
        high scores. Copy it and use it as your restore code later.
      </p>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
        Export downloads a full backup. Import that file to bring back scores,
        settings, and unlocks.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          ref={codeRef}
          aria-label="Restore pilot code"
          defaultValue=""
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              applyCode();
            }
          }}
          placeholder="Restore code"
          className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-border bg-bg px-3 font-display text-lg tracking-wide text-fg placeholder:text-muted"
          autoComplete="off"
          spellCheck={false}
        />
        <Button variant="secondary" className="min-h-11 shrink-0" onClick={applyCode}>
          Apply
        </Button>
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          variant="secondary"
          className="min-h-11 flex-1"
          onClick={() => {
            useGameStore.getState().exportSave();
            flash("Save downloaded.");
          }}
        >
          Export
        </Button>
        <Button variant="secondary" className="min-h-11 flex-1" onClick={() => fileRef.current?.click()}>
          Import
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void onImport(file);
          }}
        />
      </div>
      {note ? <p className="mt-2 text-xs text-muted">{note}</p> : null}
    </div>
  );
}
