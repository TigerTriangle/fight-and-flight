#!/usr/bin/env python3
"""Build Canopy parallax plates, heightmap, and copy sprites."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

STAGE = (1536, 864)
ART = Path("/workspace/artifacts/imagine_images")
MAP = Path("/workspace/assets/map")
SPR = Path("/workspace/assets/sprites")
OUT = Path("/workspace/public/game")
PROC = Path("/workspace/.grok/skills/generate2dsprite/scripts/generate2dsprite.py")
MAP.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

LAYERS = {
    "sky": "ed2df234-fb35-4c0c-97d7-58a63f458307.jpg",
    "far": "0b5f4328-e557-4b58-9978-90da3c886f28.jpg",
    "mid": "fd7025c8-d278-483c-ad87-798169aa3701.jpg",
    "near": "5efadbbc-51f7-4dc8-9c28-5d516fe00b9a.jpg",
    "ground": "ce1cb333-fab4-4daf-b995-27671a299600.jpg",
    "fg": "d924ca6d-29cc-4bda-beaa-2b29a5ece24e.jpg",
}

SHEETS = {
    "canopy-enemy": ("77babade-043d-424c-9ebf-280ed1a66bd6.jpg", "creature", "hover", "center"),
    "canopy-boss": ("9346985a-eaba-463b-a5ee-afb4561806b3.jpg", "creature", "hover", "center"),
    "sampan": ("b7d1bd5f-aa6a-4d69-8e60-5406eb32fc21.jpg", "asset", "idle", "feet"),
    "jungle-halftrack": ("eeec2a8e-9c3a-4ad5-b944-25b553b6f2d3.jpg", "asset", "idle", "feet"),
    "jungle-aa": ("b00637a9-8463-4ce2-8244-450c96a51621.jpg", "asset", "idle", "feet"),
}

PROPS = {
    "palm": "d04d7707-2ab1-402b-aabe-5b7f43a6361f.jpg",
    "stilt-hut": "bee0baf9-d63e-4662-b7f1-cf30af335429.jpg",
    "stupa": "b3991216-35ac-42ac-94ff-ff65178c01f8.jpg",
}


def chroma(im: Image.Image, thresh: float = 88.0) -> Image.Image:
    arr = np.asarray(im.convert("RGBA")).copy()
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mag = (r + b) / 2 - g
    hot = (r > 170) & (g < 80) & (b > 100) & (r > g + 70) & (mag > 70)
    arr[:, :, 3] = np.where(hot, 0, arr[:, :, 3])
    return Image.fromarray(arr)


def short_lip(im: Image.Image, keep=0.12) -> Image.Image:
    keyed = chroma(im)
    arr = np.asarray(keyed).copy()
    h = arr.shape[0]
    cut = int(h * (1.0 - keep))
    arr[:cut, :, 3] = 0
    a = Image.fromarray(arr[:, :, 3]).filter(ImageFilter.MinFilter(3))
    arr[:, :, 3] = np.array(a)
    return Image.fromarray(arr)


def resize(im: Image.Image, size=STAGE) -> Image.Image:
    return im.resize(size, Image.Resampling.LANCZOS)


def ground_strip(im: Image.Image, height: int) -> Image.Image:
    rgb = im.convert("RGBA")
    w, h = rgb.size
    y0 = int(h * 0.48)
    crop = rgb.crop((0, y0, w, h))
    nw = int(crop.width * (height / crop.height))
    return crop.resize((max(nw, 960), height), Image.Resampling.LANCZOS)


def synth_heightmap(width: int, height: int, draw_h: int, base: int, amp: int, seed: int) -> dict:
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 8 * np.pi, width)
    wave = np.sin(x) * amp * 0.4 + np.sin(x * 2.1 + 0.4) * amp * 0.28
    noise = rng.normal(0, amp * 0.1, width)
    tops = np.clip(base + wave + noise, 1, height - 8).astype(int).tolist()
    return {"width": width, "height": height, "screenH": 720, "drawH": draw_h, "tops": tops}


def save(im: Image.Image, name: str) -> None:
    dest = OUT / name
    im.save(dest, optimize=True)
    print(" ", name, im.size, im.mode)


def crop_opaque(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.asarray(im)
    a = arr[:, :, 3]
    ys, xs = np.where(a > 12)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, xs.min() - pad), min(arr.shape[1], xs.max() + pad + 1)
    y0, y1 = max(0, ys.min() - pad), min(arr.shape[0], ys.max() + pad + 1)
    return Image.fromarray(arr[y0:y1, x0:x1])


def pack_sheet(dest: Path) -> Image.Image:
    frames = []
    for prefix in ("hover", "idle"):
        if (dest / f"{prefix}-1.png").exists():
            for i in range(1, 5):
                im = Image.open(dest / f"{prefix}-{i}.png").convert("RGBA")
                frames.append(im.resize((256, 256), Image.Resampling.LANCZOS))
            break
    if len(frames) != 4:
        raise SystemExit(f"missing frames in {dest}")
    sheet = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, ((i % 2) * 256, (i // 2) * 256), fr)
    sheet.save(dest / "sheet-transparent.png")
    return sheet


def main() -> None:
    sky = resize(Image.open(ART / LAYERS["sky"]).convert("RGB")).convert("RGBA")
    save(sky, "canopy-sky.png")
    shutil.copy(ART / LAYERS["sky"], MAP / "canopy-sky-raw.jpg")

    for layer in ("far", "mid", "near"):
        raw = resize(Image.open(ART / LAYERS[layer]).convert("RGB")).convert("RGBA")
        save(raw, f"canopy-{layer}.png")
        shutil.copy(ART / LAYERS[layer], MAP / f"canopy-{layer}-raw.jpg")

    fg = short_lip(resize(Image.open(ART / LAYERS["fg"]).convert("RGB")))
    save(fg, "canopy-fg.png")
    shutil.copy(ART / LAYERS["fg"], MAP / "canopy-fg-raw.jpg")

    gh = 200
    g = ground_strip(Image.open(ART / LAYERS["ground"]), gh)
    save(g, "canopy-ground.png")
    shutil.copy(ART / LAYERS["ground"], MAP / "canopy-ground-raw.jpg")
    hm = synth_heightmap(g.width, g.height, gh, base=8, amp=6, seed=51)
    (OUT / "canopy-heightmap.json").write_text(json.dumps(hm))
    print("  canopy-heightmap.json")

    for name, (src, target, mode, align) in SHEETS.items():
        dest = SPR / name
        dest.mkdir(parents=True, exist_ok=True)
        raw = Image.open(ART / src).convert("RGB")
        raw.save(dest / "raw-sheet.png")
        shutil.copy(ART / src, dest / "raw.jpg")
        subprocess.check_call(
            [
                "python3",
                str(PROC),
                "process",
                "--input",
                str(dest / "raw-sheet.png"),
                "--target",
                target,
                "--mode",
                mode,
                "--output-dir",
                str(dest),
                "--shared-scale",
                "--align",
                align,
            ]
        )
        sheet = dest / "sheet-transparent.png"
        packed = pack_sheet(dest)
        out_name = {"canopy-enemy": "canopy-kite", "canopy-boss": "canopy-howler"}.get(name, name)
        save(packed, f"{out_name}.png")

    for name, src in PROPS.items():
        dest = SPR / name
        dest.mkdir(parents=True, exist_ok=True)
        raw = Image.open(ART / src).convert("RGB")
        raw.save(dest / "raw.png")
        clean = crop_opaque(chroma(raw), pad=6)
        clean.save(dest / "clean.png")
        save(clean, f"{name}.png")

    print("wrote canopy")


if __name__ == "__main__":
    main()
