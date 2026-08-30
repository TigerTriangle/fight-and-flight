#!/usr/bin/env python3
"""Build Underdark parallax plates, ceiling, heightmaps, and sprites."""
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
    "sky": "24b69f1c-4589-4d0a-afe9-ec4467d458b2.jpg",
    "far": "fcf84fc9-797e-4bcc-b875-e4aa1b3a1bbb.jpg",
    "mid": "9df10b1c-af3e-4c4a-b84b-de92f5e7be43.jpg",
    "near": "762ee275-2512-4a1f-b4ba-623fee929494.jpg",
    "ground": "9ea99904-e389-4198-b459-0532a51ccd45.jpg",
    "fg": "519aad57-5252-4d94-a789-2b892e8c8d11.jpg",
    "ceiling": "ac73e55b-70fc-439d-8711-7cbf063be29c.jpg",
}

SHEETS = {
    "cave-drone": ("27286493-0a2e-4baf-bd17-540634defe19.jpg", "creature", "hover", "center"),
    "borer-boss": ("543f3150-1536-4eb4-a49a-0a88b682fa36.jpg", "creature", "hover", "center"),
    "minecart": ("207f3e8f-9723-4911-b2eb-10ab9ee48f22.jpg", "asset", "idle", "feet"),
    "drill-tank": ("4d26e51e-a55c-485d-8700-adb813568c83.jpg", "asset", "idle", "feet"),
    "cave-aa": ("e7bc79ff-fb16-47b0-a868-ef64c3b7a9bf.jpg", "asset", "idle", "feet"),
}

PROPS = {
    "stalagmite": "4aa11614-66b8-4d09-8651-65041a7f5bc0.jpg",
    "crystal": "4da11b8a-6ef9-4d81-8654-7733a6fd216e.jpg",
    "lantern-post": "87c17378-5afd-4c74-9ad4-9c6ce542b621.jpg",
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


def punch_ceiling(im: Image.Image) -> Image.Image:
    keyed = chroma(im)
    arr = np.asarray(keyed).copy()
    h = arr.shape[0]
    # keep only the top band; force lower 62% clear
    arr[int(h * 0.38) :, :, 3] = 0
    a = Image.fromarray(arr[:, :, 3]).filter(ImageFilter.MinFilter(3))
    arr[:, :, 3] = np.array(a)
    return Image.fromarray(arr)


def ceiling_map(im: Image.Image, draw_h: int) -> dict:
    arr = np.asarray(im)
    h, w = arr.shape[:2]
    a = arr[:, :, 3]
    bottoms: list[int] = []
    for x in range(w):
        nz = np.flatnonzero(a[:, x] > 40)
        bottoms.append(int(nz[-1]) if len(nz) else 8)
    return {"width": w, "height": h, "screenH": 720, "drawH": draw_h, "tops": bottoms}


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
    save(sky, "dark-sky.png")
    shutil.copy(ART / LAYERS["sky"], MAP / "dark-sky-raw.jpg")

    for layer in ("far", "mid", "near"):
        raw = resize(Image.open(ART / LAYERS[layer]).convert("RGB")).convert("RGBA")
        save(raw, f"dark-{layer}.png")
        shutil.copy(ART / LAYERS[layer], MAP / f"dark-{layer}-raw.jpg")

    fg = short_lip(resize(Image.open(ART / LAYERS["fg"]).convert("RGB")))
    save(fg, "dark-fg.png")
    shutil.copy(ART / LAYERS["fg"], MAP / "dark-fg-raw.jpg")

    ceil = punch_ceiling(resize(Image.open(ART / LAYERS["ceiling"]).convert("RGB")))
    save(ceil, "dark-ceiling.png")
    shutil.copy(ART / LAYERS["ceiling"], MAP / "dark-ceiling-raw.jpg")
    cm = ceiling_map(ceil, 180)
    (OUT / "dark-ceilingmap.json").write_text(json.dumps(cm))
    print("  dark-ceilingmap.json")

    gh = 220
    g = ground_strip(Image.open(ART / LAYERS["ground"]), gh)
    save(g, "dark-ground.png")
    shutil.copy(ART / LAYERS["ground"], MAP / "dark-ground-raw.jpg")
    hm = synth_heightmap(g.width, g.height, gh, base=10, amp=8, seed=66)
    (OUT / "dark-heightmap.json").write_text(json.dumps(hm))
    print("  dark-heightmap.json")

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

    print("wrote underdark")


if __name__ == "__main__":
    main()
