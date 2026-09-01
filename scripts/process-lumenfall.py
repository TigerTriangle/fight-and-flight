#!/usr/bin/env python3
"""Build Lumenfall parallax plates, heightmaps, and sprites."""
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
    "sky": "c82d9aa2-d41d-4c24-9639-ba9cfa2f3dab.jpg",
    "far": "74b18539-aec3-4e83-b4c4-fac73b016558.jpg",
    "mid": "a4921b7c-dc4b-4dbb-925d-ce429f490da7.jpg",
    "near": "1e54f1dd-a49a-4102-8ce4-419e5d3fe5d6.jpg",
    "ground": "d5646f5a-2362-451b-8b3c-96383e2b32ed.jpg",
    "fg": "308628c7-db1b-4778-9f21-cc710172491d.jpg",
}

SHEETS = {
    "lum-wyvern": ("b3e25c45-7497-4d2d-97c1-5e24bc2c22c0.jpg", "creature", "hover", "center"),
    "lum-seraph": ("32825bf1-9a9b-4240-9824-29731c8c4506.jpg", "creature", "hover", "center"),
    "rune-golem": ("3c294d4f-538f-48fd-8f30-e77eaade8cd0.jpg", "asset", "idle", "feet"),
    "isle-behemoth": ("5d1f9466-6846-4760-b799-4d046a0efc11.jpg", "asset", "idle", "feet"),
    "lumen-spire": ("f3a890c3-8242-4555-ac92-2f03879fe732.jpg", "asset", "idle", "feet"),
}

PROPS = {
    "rune-obelisk": "a665223f-5d32-4763-bb7f-4dc2348a2541.jpg",
    "lumen-lantern": "6d7d0705-8320-409d-8f6d-8724005830a8.jpg",
    "crystal-tree": "a228b91b-c0af-4aaa-b2be-2675bf2707d7.jpg",
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


def short_lip(im: Image.Image, keep=0.14) -> Image.Image:
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
    y0 = int(h * 0.5)
    crop = rgb.crop((0, y0, w, h))
    nw = int(crop.width * (height / crop.height))
    return crop.resize((max(nw, 960), height), Image.Resampling.LANCZOS)


def synth_heightmap(width: int, height: int, draw_h: int, base: int, amp: int, seed: int) -> dict:
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 8 * np.pi, width)
    wave = np.sin(x) * amp * 0.4 + np.sin(x * 1.6 + 0.5) * amp * 0.25
    noise = rng.normal(0, amp * 0.09, width)
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
    save(sky, "lum-sky.png")
    shutil.copy(ART / LAYERS["sky"], MAP / "lum-sky-raw.jpg")

    for layer in ("far", "mid", "near"):
        raw = resize(Image.open(ART / LAYERS[layer]).convert("RGB")).convert("RGBA")
        save(raw, f"lum-{layer}.png")
        shutil.copy(ART / LAYERS[layer], MAP / f"lum-{layer}-raw.jpg")

    fg = short_lip(resize(Image.open(ART / LAYERS["fg"]).convert("RGB")))
    save(fg, "lum-fg.png")
    shutil.copy(ART / LAYERS["fg"], MAP / "lum-fg-raw.jpg")

    gh = 180
    g = ground_strip(Image.open(ART / LAYERS["ground"]), gh)
    save(g, "lum-ground.png")
    shutil.copy(ART / LAYERS["ground"], MAP / "lum-ground-raw.jpg")
    hm = synth_heightmap(g.width, g.height, gh, base=8, amp=7, seed=110)
    (OUT / "lum-heightmap.json").write_text(json.dumps(hm))
    print("  lum-heightmap.json")

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

    print("wrote lumenfall")


if __name__ == "__main__":
    main()
