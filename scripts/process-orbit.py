#!/usr/bin/env python3
"""Build Black Orbit parallax plates, heightmaps, and sprites."""
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
    "sky": "f5c96fcd-25f0-4a5a-b813-935f4baa32e4.jpg",
    "far": "0ab68875-af3f-486a-9848-b21ea53915e0.jpg",
    "mid": "dd278ddb-e2b4-4d45-98bf-ff5cb9fb5ee8.jpg",
    "near": "3495dbf2-ca35-482a-92f3-288a7ee3e8a7.jpg",
    "ground": "0f7319e1-31d7-4616-a49b-11679b8c1771.jpg",
    "fg": "7551d8a1-0def-468e-81bd-d4bba0723489.jpg",
}

SHEETS = {
    "orbit-needle": ("716599ca-0962-4e36-a239-b7caf782bfa1.jpg", "creature", "hover", "center"),
    "orbit-ring": ("eb121c7b-64b9-48c8-99fc-1fbe5fc4012f.jpg", "creature", "hover", "center"),
    "cargo-hulk": ("84b39d1a-dc0c-4cb0-adf0-c26cb709bbb2.jpg", "asset", "idle", "feet"),
    "barge-hulk": ("3b12bba7-3b55-413f-b3d6-2612c4cffb05.jpg", "asset", "idle", "feet"),
    "gun-sat": ("54501bfd-760c-4be2-a07e-ff09fb07c739.jpg", "asset", "idle", "feet"),
}

PROPS = {
    "rocklet": "d7b454e7-a286-45e5-aad7-b132c83349a2.jpg",
    "solar-spar": "51b5504e-2c61-42c1-b44e-748605c5ea3d.jpg",
    "nav-buoy": "83c82d2d-f355-4184-9eb6-bec59dffdd8b.jpg",
}


def chroma(im: Image.Image) -> Image.Image:
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
    y0 = int(h * 0.52)
    crop = rgb.crop((0, y0, w, h))
    nw = int(crop.width * (height / crop.height))
    return crop.resize((max(nw, 960), height), Image.Resampling.LANCZOS)


def synth_heightmap(width: int, height: int, draw_h: int, base: int, amp: int, seed: int) -> dict:
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 8 * np.pi, width)
    wave = np.sin(x) * amp * 0.35 + np.sin(x * 1.7 + 0.6) * amp * 0.22
    noise = rng.normal(0, amp * 0.08, width)
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
    save(sky, "orbit-sky.png")
    shutil.copy(ART / LAYERS["sky"], MAP / "orbit-sky-raw.jpg")

    for layer in ("far", "mid", "near"):
        raw = resize(Image.open(ART / LAYERS[layer]).convert("RGB")).convert("RGBA")
        save(raw, f"orbit-{layer}.png")
        shutil.copy(ART / LAYERS[layer], MAP / f"orbit-{layer}-raw.jpg")

    fg = short_lip(resize(Image.open(ART / LAYERS["fg"]).convert("RGB")))
    save(fg, "orbit-fg.png")
    shutil.copy(ART / LAYERS["fg"], MAP / "orbit-fg-raw.jpg")

    gh = 180
    g = ground_strip(Image.open(ART / LAYERS["ground"]), gh)
    save(g, "orbit-ground.png")
    shutil.copy(ART / LAYERS["ground"], MAP / "orbit-ground-raw.jpg")
    hm = synth_heightmap(g.width, g.height, gh, base=8, amp=6, seed=77)
    (OUT / "orbit-heightmap.json").write_text(json.dumps(hm))
    print("  orbit-heightmap.json")

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
        packed = pack_sheet(dest)
        save(packed, f"{name}.png")

    for name, src in PROPS.items():
        dest = SPR / name
        dest.mkdir(parents=True, exist_ok=True)
        raw = Image.open(ART / src).convert("RGB")
        raw.save(dest / "raw.png")
        clean = crop_opaque(chroma(raw), pad=6)
        clean.save(dest / "clean.png")
        save(clean, f"{name}.png")

    print("wrote orbit")


if __name__ == "__main__":
    main()
