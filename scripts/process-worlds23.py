#!/usr/bin/env python3
"""Build Tidefront + Red Canyon parallax plates, heightmaps, and copy sprites."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

STAGE = (1536, 864)
ART = Path("/workspace/artifacts/imagine_images")
MAP = Path("/workspace/assets/map")
SPR = Path("/workspace/assets/sprites")
OUT = Path("/workspace/public/game")
MAP.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

CHROMA = np.array(
    [
        [255, 0, 255],
        [230, 4, 136],
        [239, 0, 141],
        [250, 5, 181],
        [229, 29, 138],
    ],
    dtype=np.int16,
)

LAYERS = {
    "tide": {
        "sky": "d1dd3355-55f5-4a05-a694-cc1bf6a1d89a.jpg",
        "far": "8eab9aea-d44a-4f91-872f-b6316bbcceda.jpg",
        "mid": "500cd558-fdfc-4a45-b5a6-29b58351b586.jpg",
        "near": "75bbba72-64a1-4d03-b50f-1af5dda60683.jpg",
        "fg": "47ffce87-cb7e-4b80-9327-ffda40a1d383.jpg",
        "ground": "0c52432b-7216-49e7-9fc0-b2c27e57f438.jpg",
    },
    "cyn": {
        "sky": "06f7cb72-ad02-4291-929f-80f901b66a27.jpg",
        "far": "82863e56-bb3a-4d01-af7f-a66f6a0eda9c.jpg",
        "mid": "c5d36f2a-91e9-471c-9ef2-e8c92903ef02.jpg",
        "near": "557c4355-3463-4f94-892c-0999bdfcc4a6.jpg",
        "fg": "eef8f527-1ff0-4c14-9050-f1a2b02fdec5.jpg",
        "ground": "e00d0867-bba5-4807-b0e7-886dedb5c382.jpg",
        "ceiling": "641d083d-e9fa-4659-82ef-5e03b47dcfef.jpg",
    },
}


def chroma(im: Image.Image, thresh: float = 88.0) -> Image.Image:
    arr = np.asarray(im.convert("RGBA")).copy()
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mag = (r + b) / 2 - g
    dist = np.full(r.shape, 999.0, dtype=np.float32)
    for key in CHROMA:
        d = np.sqrt((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2)
        dist = np.minimum(dist, d)
    hot = (r > 160) & (g < 100) & (b > 80) & (r > g + 70) & (mag > 70)
    kill = (hot | (dist < thresh))
    arr[:, :, 3] = np.where(kill, 0, arr[:, :, 3])
    return Image.fromarray(arr)


def punch_like(overlay: Image.Image, ref: Image.Image, tol: float = 46.0, upper: float = 0.55) -> Image.Image:
    """Keep terrain solid. Punch magenta and sky-like pixels; never keep generator pink."""
    from PIL import ImageFilter

    ov = np.array(overlay.convert("RGBA"), copy=True)
    rgb = ov[:, :, :3].astype(np.float32)
    h, w = rgb.shape[:2]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    mag_score = (r + b) / 2 - g
    dist_m = np.full(r.shape, 999.0, dtype=np.float32)
    for key in CHROMA:
        d = np.sqrt((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2)
        dist_m = np.minimum(dist_m, d)
    magenta = ((r > 150) & (g < 120) & (b > 70) & (r > g + 50) & (mag_score > 50)) | (dist_m < 92)

    sky = rgb[: max(8, int(h * 0.12))].mean(axis=(0, 1))
    lum = rgb.mean(axis=2)
    sky_lum = float(sky.mean())
    dist = np.sqrt(((rgb - sky) ** 2).sum(axis=2))
    cyan = (b > r + 10) & (g > r - 8)
    grey = (np.abs(r - g) < 30) & (np.abs(g - b) < 34) & (np.abs(r - b) < 40)
    darker = lum < (sky_lum - 16)
    yy = np.arange(h, dtype=np.int32)[:, None]
    below = yy >= int(h * upper)
    is_sky = (dist < tol) & cyan & ~grey & ~darker
    alpha = np.where(magenta, 0, np.where(below | ~is_sky, 255, 0)).astype(np.uint8)
    a_img = Image.fromarray(alpha).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    alpha = np.array(a_img, dtype=np.uint8, copy=True)
    alpha = np.where(magenta, 0, alpha)
    alpha = np.where(below & ~magenta, 255, alpha).astype(np.uint8)
    ov[:, :, 3] = alpha
    return Image.fromarray(ov)


def punch_ceiling(im: Image.Image) -> Image.Image:
    arr = np.asarray(im.convert("RGBA")).copy()
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    # keep rock (redder / darker); punch bright sky
    skyish = (r > 150) & (g > 90) & (b < 120) & (g > r * 0.42) & (r + g > 280)
    magenta = (r > 170) & (g < 90) & (b > 140)
    h = arr.shape[0]
    lower = np.zeros(arr.shape[:2], dtype=bool)
    lower[int(h * 0.34) :] = True
    arr[:, :, 3] = np.where(skyish | magenta | lower, 0, arr[:, :, 3])
    return Image.fromarray(arr)


def resize(im: Image.Image, size=STAGE) -> Image.Image:
    return im.resize(size, Image.Resampling.LANCZOS)


def ground_strip(im: Image.Image, height: int) -> Image.Image:
    rgb = im.convert("RGBA")
    w, h = rgb.size
    y0 = int(h * 0.42)
    crop = rgb.crop((0, y0, w, h))
    nw = int(crop.width * (height / crop.height))
    return crop.resize((max(nw, 960), height), Image.Resampling.LANCZOS)


def synth_heightmap(width: int, height: int, draw_h: int, base: int, amp: int, seed: int) -> dict:
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 8 * np.pi, width)
    wave = np.sin(x) * amp * 0.45 + np.sin(x * 2.3 + 0.6) * amp * 0.3
    noise = rng.normal(0, amp * 0.12, width)
    tops = np.clip(base + wave + noise, 1, height - 8).astype(int).tolist()
    return {"width": width, "height": height, "screenH": 720, "drawH": draw_h, "tops": tops}


def ceiling_map(im: Image.Image, draw_h: int) -> dict:
    arr = np.asarray(im)
    h, w = arr.shape[:2]
    a = arr[:, :, 3]
    bottoms: list[int] = []
    for x in range(w):
        nz = np.flatnonzero(a[:, x] > 40)
        bottoms.append(int(nz[-1]) if len(nz) else 8)
    return {"width": w, "height": h, "screenH": 720, "drawH": draw_h, "tops": bottoms}


def save(im: Image.Image, name: str) -> None:
    dest = OUT / name
    im.save(dest, optimize=True)
    print(" ", name, im.size, im.mode)


def main() -> None:
    for world, files in LAYERS.items():
        sky = resize(Image.open(ART / files["sky"]).convert("RGB")).convert("RGBA")
        save(sky, f"{world}-sky.png")
        shutil.copy(ART / files["sky"], MAP / f"{world}-sky-raw.jpg")

        for layer in ("far", "mid", "near", "fg"):
            raw = resize(Image.open(ART / files[layer]).convert("RGB"))
            keyed = chroma(raw)
            keyed = punch_like(keyed, sky, tol=52 if world == "tide" else 58, upper=0.52)
            save(keyed, f"{world}-{layer}.png")
            shutil.copy(ART / files[layer], MAP / f"{world}-{layer}-raw.jpg")

        gh = 200 if world == "tide" else 260
        g = ground_strip(Image.open(ART / files["ground"]), gh)
        save(g, f"{world}-ground.png")
        hm = synth_heightmap(g.width, g.height, gh, base=10 if world == "tide" else 16, amp=7 if world == "tide" else 28, seed=21 if world == "tide" else 77)
        (OUT / f"{world}-heightmap.json").write_text(json.dumps(hm))
        print(" ", f"{world}-heightmap.json")

        if "ceiling" in files:
            raw = resize(Image.open(ART / files["ceiling"]).convert("RGB"))
            ceil = punch_ceiling(chroma(raw))
            save(ceil, f"{world}-ceiling.png")
            cm = ceiling_map(ceil, 180)
            (OUT / f"{world}-ceilingmap.json").write_text(json.dumps(cm))
            print(" ", f"{world}-ceilingmap.json")

    copies = {
        "tide-enemy": SPR / "tide-enemy" / "sheet-transparent.png",
        "cyn-enemy": SPR / "cyn-enemy" / "sheet-transparent.png",
        "boat": SPR / "boat" / "sheet-transparent.png",
        "ship": SPR / "ship" / "sheet-transparent.png",
        "naval-aa": SPR / "naval-aa" / "sheet-transparent.png",
        "jeep": SPR / "jeep" / "sheet-transparent.png",
        "crawler": SPR / "crawler" / "sheet-transparent.png",
        "ledge-aa": SPR / "ledge-aa" / "sheet-transparent.png",
        "buoy": SPR / "buoy" / "clean.png",
        "lighthouse": SPR / "lighthouse" / "clean.png",
        "seastack": SPR / "seastack" / "clean.png",
        "cactus": SPR / "cactus" / "clean.png",
        "spire": SPR / "spire" / "clean.png",
        "mesa": SPR / "mesa" / "clean.png",
    }
    for key, path in copies.items():
        im = Image.open(path).convert("RGBA")
        save(im, f"{key}.png")
    print("wrote worlds 2+3")


if __name__ == "__main__":
    main()
