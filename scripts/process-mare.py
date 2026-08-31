#!/usr/bin/env python3
"""Build Pale Mare parallax plates, heightmaps, and sprites."""
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
    "sky": "c17c5da8-9afd-450f-b5b1-a13fcb92394e.jpg",
    "far": "195ad814-dc87-46e2-bc75-773bcc5f5964.jpg",
    "mid": "39101388-655f-47aa-a2a0-55ca751b8395.jpg",
    "near": "de20f01c-e5af-4b8f-8294-bf1e638bde6e.jpg",
    "ground": "9ce98cbc-b5b7-4c2c-b56a-15f5f5589c74.jpg",
    "fg": "96a075d2-0733-4ad5-9881-0f06d5280a57.jpg",
}

SHEETS = {
    "mare-hopper": ("47939cbe-44c4-46c8-a76d-2577a08614d0.jpg", "creature", "hover", "center"),
    "mare-walker": ("96b10c31-3c86-498a-93b7-0f6fa841ab84.jpg", "creature", "hover", "center"),
    "lunar-rover": ("9dd013f0-037c-4064-be1e-a0344a89fe99.jpg", "asset", "idle", "feet"),
    "lunar-crawler": ("5ee19007-2772-42dd-aa33-dc0efd65516c.jpg", "asset", "idle", "feet"),
    "lunar-aa": ("916b9f32-9d6a-44bb-b0b6-1495eb46ee78.jpg", "asset", "idle", "feet"),
}

PROPS = {
    "moon-rock": "fa50fb2a-3bbe-424f-b324-97f53d6502df.jpg",
    "moon-antenna": "eca4d520-1c5b-4b45-ac86-4fce278aa3d2.jpg",
    "moon-lander": "ee7e6c4c-f760-4d67-95d1-b38f08f92e9b.jpg",
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
    save(sky, "mare-sky.png")
    shutil.copy(ART / LAYERS["sky"], MAP / "mare-sky-raw.jpg")

    for layer in ("far", "mid", "near"):
        raw = resize(Image.open(ART / LAYERS[layer]).convert("RGB")).convert("RGBA")
        save(raw, f"mare-{layer}.png")
        shutil.copy(ART / LAYERS[layer], MAP / f"mare-{layer}-raw.jpg")

    fg = short_lip(resize(Image.open(ART / LAYERS["fg"]).convert("RGB")))
    save(fg, "mare-fg.png")
    shutil.copy(ART / LAYERS["fg"], MAP / "mare-fg-raw.jpg")

    gh = 180
    g = ground_strip(Image.open(ART / LAYERS["ground"]), gh)
    save(g, "mare-ground.png")
    shutil.copy(ART / LAYERS["ground"], MAP / "mare-ground-raw.jpg")
    hm = synth_heightmap(g.width, g.height, gh, base=8, amp=7, seed=88)
    (OUT / "mare-heightmap.json").write_text(json.dumps(hm))
    print("  mare-heightmap.json")

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

    print("wrote mare")


if __name__ == "__main__":
    main()
