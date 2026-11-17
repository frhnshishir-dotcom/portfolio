"""Composite the rendered card into the Lagos photograph.

    python tools/build_hero.py [--preview]

Inputs (tools/out): plate.png and the passes written by render_hero.py.
Outputs: tools/out/hero_composite.png, and with --write the web assets
src/assets/lagos-hero.webp (4096 x 2640) and lagos-hero-2048.webp.

Nothing here moves the card: it is placed exactly where the render put it, so
the corners measured afterwards are the corners of the published image.
"""
from __future__ import annotations

import argparse
import json
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
ASSETS = os.path.join(HERE, "..", "src", "assets")
W, H = 4096, 2640
RNG = np.random.default_rng(20481)


def load(name, mode):
    im = Image.open(os.path.join(OUT, name))
    if im.mode in ("I;16", "I"):
        arr = np.asarray(im, dtype=np.float32) / 65535.0
        return arr
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    arr = np.asarray(im.convert(mode))
    return arr.astype(np.float32) / (65535.0 if arr.dtype == np.uint16 else 255.0)


def load_rgba16(name):
    """16-bit RGBA PNG -> float array at full size (PIL keeps 8 bits; that is enough here)."""
    im = Image.open(os.path.join(OUT, name)).convert("RGBA")
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0


def blur(arr, radius):
    """Gaussian blur of a float HxW or HxWxC array in [0, 1]."""
    if radius <= 0:
        return arr
    if arr.ndim == 2:
        im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
        return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255.0
    return np.stack([blur(arr[..., c], radius) for c in range(arr.shape[2])], axis=2)


def smooth_noise(shape, scale_y, scale_x):
    """Band-limited noise in [-1, 1] with the given feature sizes in pixels."""
    h, w = shape
    small = RNG.standard_normal((max(2, h // scale_y + 2), max(2, w // scale_x + 2))).astype(np.float32)
    im = Image.fromarray(small, mode="F").resize((w, h), Image.BICUBIC)
    out = np.asarray(im, dtype=np.float32)
    return out / (np.abs(out).max() + 1e-6)


def over(dst, src_rgb, alpha):
    a = alpha[..., None]
    return dst * (1 - a) + src_rgb * a


def grade_plate(plate):
    """A light finishing grade: the photograph already has the light we want."""
    x = plate.copy()
    # calm the sensor grain a touch (it is re-grained uniformly at the end)
    soft = blur(x, 1.1)
    detail = x - soft
    x = soft + detail * 0.72
    # gentle filmic contrast around mid grey, slightly richer warm highlights
    x = np.clip(x, 0, 1)
    x = x + 0.055 * np.sin((x - 0.5) * np.pi) * (1 - np.abs(x - 0.5) * 1.2).clip(0, 1)
    lum = x.mean(axis=2, keepdims=True)
    warm = np.array([1.035, 1.0, 0.955], dtype=np.float32)
    cool = np.array([0.965, 0.995, 1.045], dtype=np.float32)
    x = x * (cool + (warm - cool) * np.clip(lum * 1.6, 0, 1))
    # the lower water goes a little deeper so the copy sits on it comfortably
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    x = x * (1 - 0.16 * np.clip((yy - 0.74) / 0.26, 0, 1) ** 1.4)
    return np.clip(x, 0, 1)


def water_reflection(plate, refl, base_y):
    """The card's reflection, broken up by the water the way the bridge's is.

    Chop like this never holds a mirror image: it holds a dark, torn column
    under the object, flecked with whatever is bright on it.
    """
    rgb, a = refl[..., :3], refl[..., 3]
    rows = np.arange(H, dtype=np.float32)
    below = np.clip((rows - base_y) / (H - base_y), 0, 1)           # 0 where the card meets the water

    # 1. ripples: every wave band drags its strip of reflection sideways,
    #    further the nearer the water is to the camera
    amp = 20.0 + 62.0 * below ** 0.7
    band = (
        smooth_noise((H, 1), 5, 1)[:, 0] * 0.55
        + smooth_noise((H, 1), 16, 1)[:, 0] * 0.6
        + smooth_noise((H, 1), 2, 1)[:, 0] * 0.3
    )
    shift = (band * amp).astype(np.int32)
    out_rgb = np.zeros_like(rgb)
    out_a = np.zeros_like(a)
    y0 = max(int(base_y) - 6, 0)
    for y in range(y0, H):
        s = int(shift[y])
        out_rgb[y] = np.roll(rgb[y], s, axis=0)
        out_a[y] = np.roll(a[y], s, axis=0)

    # 2. smear along the line of sight; nothing printed on the card survives
    def stretch(arr, radius):
        im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
        return np.asarray(im.filter(ImageFilter.BoxBlur((1, radius))), dtype=np.float32) / 255.0

    out_a = stretch(out_a, 5)
    # the column has no ruled sides: soften them and let them wander
    out_a = np.asarray(
        Image.fromarray(np.clip(out_a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur((9, 0))),
        dtype=np.float32,
    ) / 255.0
    out_a = np.clip(out_a * (0.78 + 0.5 * smooth_noise((H, W), 7, 60)), 0, 1)
    out_rgb = np.stack([stretch(out_rgb[..., c], 22) for c in range(3)], axis=2)
    out_rgb = blur(out_rgb, 5)

    # 3. the water's own facets: bright ones are showing sky, not card
    lum = plate.mean(axis=2)
    facets = np.clip((lum - blur(lum, 12)) / 0.035, -1, 1)
    breakup = np.clip(1.0 - 0.8 * np.clip(facets, 0, 1) + 0.2 * np.clip(-facets, 0, 1), 0, 1.15)
    streak = 0.72 + 0.28 * smooth_noise((H, W), 5, 140)

    # 4. it dies away from the object
    fade = (1.0 * (1 - below) ** 1.4 + 0.03)[:, None]
    alpha = np.clip(out_a * fade * breakup * streak, 0, 1)
    alpha[:y0] = 0

    # water is a poor mirror: the reflection is darker and takes the water's colour
    colour = out_rgb * 0.32 + plate * 0.18
    return over(plate, colour, alpha), alpha


def contact(img, card_alpha, base_y):
    """Where the card enters the water: a soft dark seam and a broken bright edge."""
    foot = np.zeros((H, W), np.float32)
    y = int(base_y)
    cols = np.where(card_alpha[y - 12] > 0.5)[0]
    if len(cols) == 0:
        return img
    x0, x1 = cols.min(), cols.max()
    foot[y - 6:y + 26, x0 - 30:x1 + 30] = 1.0
    foot = blur(foot, 16) * 0.42
    return img * (1 - foot[..., None])


def finish(img):
    # one shared grain so the card and the photograph are the same piece of film
    lum = img.mean(axis=2, keepdims=True)
    grain = RNG.standard_normal((H, W, 1)).astype(np.float32)
    grain = grain * 0.6 + blur(grain[..., 0], 0.8)[..., None] * 1.4
    img = img + grain * 0.016 * (1 - lum * 0.6)
    # vignette
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.hypot((xx - W / 2) / (W / 2), (yy - H * 0.52) / (H / 2))
    img = img * (1 - 0.20 * np.clip(r - 0.55, 0, 1) ** 2)[..., None]
    return np.clip(img, 0, 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="also write the web assets")
    args = ap.parse_args()

    meta = json.load(open(os.path.join(OUT, "hero_camera.json")))
    corners = np.array(meta["analytic_corners"], dtype=np.float32)
    base_y = float(corners[2:, 1].mean())

    plate = grade_plate(load("plate.png", "RGB"))
    card = load_rgba16("hero_card.png")
    refl = load_rgba16("hero_reflection.png")
    rim = load("hero_rim.png", "L")

    img, _ = water_reflection(plate, refl, base_y)
    img = contact(img, card[..., 3], base_y)

    # --- the card itself, seated in the photograph's atmosphere
    rgb, alpha = card[..., :3], card[..., 3]
    shadow_sample = plate[1700:1830, 600:1500].reshape(-1, 3)
    black = np.percentile(shadow_sample, 2, axis=0)                 # the plate's own black level
    rgb = black * 0.35 + rgb * (1 - black.mean() * 0.35)
    # match the photograph's sharpness: a hair of softness on colour and edge
    rgb = blur(rgb * alpha[..., None], 0.7) / np.maximum(blur(alpha, 0.7)[..., None], 1e-4)
    alpha_soft = blur(alpha, 0.7)
    # small waves lap over the foot of the card, so it stands in the water, not on it
    xs = np.arange(W, dtype=np.float32)
    foot_y = np.interp(xs, [corners[3, 0], corners[2, 0]], [corners[3, 1], corners[2, 1]])
    lap = 2.0 + 5.5 * (0.5 + 0.5 * smooth_noise((1, W), 1, 26)[0]) + 2.0 * smooth_noise((1, W), 1, 7)[0]
    yy = np.arange(H, dtype=np.float32)[:, None]
    waterline = np.clip((foot_y - lap)[None, :] - yy + 0.5, 0, 1)   # 1 above the water
    alpha_soft = alpha_soft * blur(waterline, 0.8)
    img = over(img, rgb, alpha_soft)

    # --- bloom from the light inlay: tight core, wide veil
    blue = np.array([0.20, 0.50, 1.0], dtype=np.float32)
    weight = np.clip((corners[:, 1].max() - np.arange(H, dtype=np.float32)) / 900.0, 0, 1)[:, None] ** 0.8
    xw = np.clip((np.arange(W, dtype=np.float32) - corners[0, 0]) / (corners[1, 0] - corners[0, 0]), 0, 1)[None, :]
    rim_w = rim * np.maximum(weight * (0.25 + 0.75 * xw), 0.06)
    glow = blur(rim_w, 2.5) * 0.6 + blur(rim_w, 10) * 0.7 + blur(rim_w, 40) * 0.85
    img = 1 - (1 - img) * (1 - np.clip(glow[..., None] * blue, 0, 1))

    img = finish(img)
    out = Image.fromarray((img * 255 + 0.5).astype(np.uint8))
    out.save(os.path.join(OUT, "hero_composite.png"))
    out.resize((1365, 880), Image.LANCZOS).save(os.path.join(OUT, "hero_composite_preview.png"))
    x0, y0 = int(corners[:, 0].min()) - 420, int(corners[:, 1].min()) - 220
    out.crop((x0, y0, x0 + 1460, y0 + 1900)).save(os.path.join(OUT, "hero_composite_card.png"))
    print("wrote hero_composite.png")

    if args.write:
        out.save(os.path.join(ASSETS, "lagos-hero.webp"), "WEBP", quality=80, method=6)
        out.resize((2048, 1320), Image.LANCZOS).save(
            os.path.join(ASSETS, "lagos-hero-2048.webp"), "WEBP", quality=80, method=6
        )
        for name in ("lagos-hero.webp", "lagos-hero-2048.webp"):
            print(name, os.path.getsize(os.path.join(ASSETS, name)) // 1024, "KB")


if __name__ == "__main__":
    main()
