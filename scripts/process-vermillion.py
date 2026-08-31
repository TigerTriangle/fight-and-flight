#!/usr/bin/env python3
"""Build Vermillion parallax plates, heightmaps, and sprites."""
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
    "sky": "f092708f-b498-4e36-9adb-3a9c06699de4.jpg",
    "far": "05ccc882-a451-4dc4-b0f8-3215ae7c1b38.jpg",
    "mid": "7817d294-d55e-4fe8-bfbc-4bd4bbf9d8cc.jpg",
    "near": "f9b85a4a-5bb8-4563-80c6-c5fc9e0d8730.jpg",
    "ground": "45149715-7b68-40c9-a1fe-66876af924cc.jpg",
    "fg": "6426c8ba-d33f-444f-ae8a-fecc0b1765ed.jpg",
}

SHEETS = {
    "verm-moth": ("67c8ac64-7258-4ddd-9d87-69bc9c1e51b3.jpg", "creature", "hover", "center"),
    "verm-bloom": ("074df785-6dfc-4966-a576-8d7e30c93cbf.jpg", "creature", "hover", "center"),
    "spore-beetle": ("6e07574a-08b8-4c3b-bbe7-0b9415142ba0.jpg", "asset", "idle", "feet"),
    "spore-carapace": ("48432a67-ece6-493e-b8ed-81ad4860d8fa.jpg", "asset", "idle", "feet"),
    "spore-turret": ("27d8ba08-436c-4b1d-b223-f063bde7c663.jpg", "asset", "idle", "feet"),
}

PROPS = {
    "spore-stack": "ac2342ab-4b48-43d1-8bef-b5b6161e8688.jpg",
    "mesa-spire": "aa3c8137-faec-455d-b89b-8848160a35de.jpg",
    "bone-arch": "26c9afb5-a4fe-498e-a767-566dd9573b9b.jpg",
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
    save(sky, "verm-sky.png")
    shutil.copy(ART / LAYERS["sky"], MAP / "verm-sky-raw.jpg")

    for layer in ("far", "mid", "near"):
        raw = resize(Image.open(ART / LAYERS[layer]).convert("RGB")).convert("RGBA")
        save(raw, f"verm-{layer}.png")
        shutil.copy(ART / LAYERS[layer], MAP / f"verm-{layer}-raw.jpg")

    fg = short_lip(resize(Image.open(ART / LAYERS["fg"]).convert("RGB")))
    save(fg, "verm-fg.png")
    shutil.copy(ART / LAYERS["fg"], MAP / "verm-fg-raw.jpg")

    gh = 180
    g = ground_strip(Image.open(ART / LAYERS["ground"]), gh)
    save(g, "verm-ground.png")
    shutil.copy(ART / LAYERS["ground"], MAP / "verm-ground-raw.jpg")
    hm = synth_heightmap(g.width, g.height, gh, base=8, amp=7, seed=99)
    (OUT / "verm-heightmap.json").write_text(json.dumps(hm))
    print("  verm-heightmap.json")

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

    print("wrote vermillion")


if __name__ == "__main__":
    main()
