#!/usr/bin/env python3
"""Chroma-key Heartland parallax plates and wide props, emit heightmap."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

STAGE = (1536, 864)
OUT = Path("/workspace/public/game")
MAP = Path("/workspace/assets/map")
SPR = Path("/workspace/assets/sprites")
OUT.mkdir(parents=True, exist_ok=True)

# Generator plates used hot-pink (~#E50888 / #EF008D), not true #FF00FF.
CHROMA_KEYS = np.array(
    [
        [255, 0, 255],
        [230, 4, 136],
        [239, 0, 141],
        [230, 35, 150],
        [250, 5, 181],
        [229, 29, 138],
    ],
    dtype=np.int16,
)


def chroma_magenta(im: Image.Image, dist_thresh: float = 95.0) -> Image.Image:
    im = im.convert("RGBA")
    arr = np.asarray(im).astype(np.int16)
    r, g, b = arr[:, :, 0].astype(np.float32), arr[:, :, 1].astype(np.float32), arr[:, :, 2].astype(np.float32)
    mag_score = (r + b) / 2 - g

    dist_min = np.full(r.shape, 999.0, dtype=np.float32)
    for key in CHROMA_KEYS:
        d = np.sqrt(
            (r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2,
            dtype=np.float32,
        )
        dist_min = np.minimum(dist_min, d)

    hot = (r > 165) & (g < 95) & (b > 85) & (r > g + 80) & (mag_score > 75)
    classic = dist_min < max(dist_thresh, 58)
    veg = (g > 72) & (g + 12 >= r) & (g > b)
    kill = (hot | classic) & ~veg

    out = np.asarray(im.convert("RGBA")).copy()
    out[:, :, 3] = np.where(kill, 0, out[:, :, 3])

    # Punch leftover chroma in the sky band (upper ~46%).
    h = out.shape[0]
    ycut = int(h * 0.46)
    leftover = (
        (out[:ycut, :, 0] > 150)
        & (out[:ycut, :, 1] < 110)
        & (out[:ycut, :, 2] > 70)
        & (out[:ycut, :, 0] > out[:ycut, :, 1] + 40)
    )
    out[:ycut, :, 3] = np.where(leftover, 0, out[:ycut, :, 3])

    # Despill remaining magenta fringe on kept pixels.
    a = out[:, :, 3] > 0
    spill = a & (mag_score > 36) & (g < 170) & (r > 130)
    out[:, :, 1] = np.where(spill, np.clip(out[:, :, 1] + 28, 0, 255), out[:, :, 1])
    out[:, :, 0] = np.where(spill, np.clip(out[:, :, 0] - 10, 0, 255), out[:, :, 0])
    return Image.fromarray(out)


def sky_only(im: Image.Image, cut_frac: float = 0.60) -> Image.Image:
    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w = rgb.shape[:2]
    cut = int(h * cut_frac)
    haze = rgb[max(0, cut - 12) : cut].mean(axis=(0, 1))
    out = rgb.copy()
    for y in range(cut, h):
        t = (y - cut) / max(1, h - cut)
        out[y, :] = haze * (1.0 - 0.04 * t) + np.array([8, 18, 4]) * t
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def resize_fit(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return im.resize(size, Image.Resampling.LANCZOS)


def crop_opaque(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.asarray(im)
    a = arr[:, :, 3]
    ys, xs = np.where(a > 18)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, xs.min() - pad), min(arr.shape[1], xs.max() + pad + 1)
    y0, y1 = max(0, ys.min() - pad), min(arr.shape[0], ys.max() + pad + 1)
    return im.crop((x0, y0, x1, y1))


def make_heightmap(ground: Image.Image, screen_h: int = 720, draw_h: int = 210) -> dict:
    arr = np.asarray(ground)
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3]
    tops: list[int] = []
    for x in range(w):
        col = alpha[:, x]
        nz = np.flatnonzero(col > 40)
        tops.append(int(nz[0]) if len(nz) else h)
    return {
        "width": w,
        "height": h,
        "screenH": screen_h,
        "drawH": draw_h,
        "tops": tops,
    }


def compose_preview() -> None:
    sky = Image.open(OUT / "sky.png").convert("RGBA")
    out = sky
    for name in ("far", "mid", "near", "foreground"):
        layer = Image.open(OUT / f"{name}.png").convert("RGBA")
        out = Image.alpha_composite(out, layer)
    out.convert("RGB").save(MAP / "heartland-layered-preview.png", quality=92)
    out.convert("RGB").save("/workspace/screenshots/sky-fix-preview.png", quality=92)


def main() -> None:
    sky_raw = Image.open(MAP / "heartland-sky-raw.jpg")
    sky = resize_fit(sky_only(sky_raw), STAGE)
    sky.save(OUT / "sky.png", optimize=True)
    sky.save(MAP / "heartland-sky.png")

    for name, src, thresh in [
        ("far", "heartland-far-bg-raw.jpg", 100),
        ("mid", "heartland-mid-bg-raw.jpg", 100),
        ("near", "heartland-near-bg-raw.jpg", 100),
        ("foreground", "heartland-foreground-raw.jpg", 100),
    ]:
        keyed = chroma_magenta(Image.open(MAP / src), dist_thresh=thresh)
        keyed = resize_fit(keyed, STAGE)
        keyed.save(OUT / f"{name}.png")
        keyed.save(MAP / f"heartland-{name}.png")

    fence = crop_opaque(chroma_magenta(Image.open(SPR / "fence" / "raw-sheet.png"), 90), pad=4)
    fh = 96
    fw = int(fence.width * (fh / fence.height))
    fence = fence.resize((fw, fh), Image.Resampling.LANCZOS)
    fence.save(OUT / "fence.png")

    ground = chroma_magenta(Image.open(SPR / "ground" / "raw-sheet.png"), 90)
    ground = crop_opaque(ground, pad=2)
    gh = 220
    gw = int(ground.width * (gh / max(1, ground.height)))
    ground = ground.resize((gw, gh), Image.Resampling.LANCZOS)
    ground.save(OUT / "ground.png")
    hm = make_heightmap(ground, 720, gh)
    (OUT / "ground-heightmap.json").write_text(json.dumps(hm))
    (MAP / "heartland-ground-heightmap.json").write_text(json.dumps(hm))

    copies = {
        "hornet": SPR / "hornet" / "sheet-transparent.png",
        "enemy": SPR / "enemy" / "sheet-transparent.png",
        "truck": SPR / "truck" / "sheet-transparent.png",
        "bullet": SPR / "bullet" / "sheet-transparent.png",
        "bomb": SPR / "bomb" / "sheet-transparent.png",
        "hit": SPR / "hit" / "sheet-transparent.png",
        "blast": SPR / "blast" / "sheet-transparent.png",
        "barn": SPR / "barn" / "sheet-transparent.png",
        "silo": SPR / "silo" / "sheet-transparent.png",
        "hay": SPR / "hay" / "sheet-transparent.png",
        "crate": SPR / "crate" / "sheet-transparent.png",
    }
    manifest = {"stage": {"width": STAGE[0], "height": STAGE[1]}, "sprites": {}}
    for key, path in copies.items():
        im = Image.open(path).convert("RGBA")
        dest = OUT / f"{key}.png"
        im.save(dest)
        cells = 1 if key in {"barn", "silo", "hay"} else 4
        cols = 1 if cells == 1 else 2
        rows = 1 if cells == 1 else 2
        fw, fh = im.size[0] // cols, im.size[1] // rows
        manifest["sprites"][key] = {
            "file": f"{key}.png",
            "width": im.size[0],
            "height": im.size[1],
            "frameWidth": fw,
            "frameHeight": fh,
            "cols": cols,
            "rows": rows,
        }
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
    compose_preview()
    print("wrote", OUT)
    for p in sorted(OUT.iterdir()):
        if p.suffix in {".png", ".json"}:
            if p.suffix == ".png":
                im = Image.open(p)
                print(f"  {p.name:18} {im.size} {im.mode}")
            else:
                print(f"  {p.name}")


if __name__ == "__main__":
    main()
