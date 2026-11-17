"""Prepare the team-supplied pack images for the simple PowerPoint.

Originals are copied unchanged to assets/packs/original/. Cut-outs (transparent PNG,
trimmed) go to assets/packs/. White studio backgrounds are removed by a flood fill
from the image border only, so white areas inside a pack are never touched; the
Gold Blend jar sits on a decorative swoosh and is cut out with rembg (isnet).

    python3 tools/prepare_packs.py <uploads dir>
"""
import os
import shutil
import sys
from collections import deque
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UP = sys.argv[1]
OUT = os.path.join(ROOT, "assets", "packs")
ORIG = os.path.join(OUT, "original")
os.makedirs(ORIG, exist_ok=True)

# upload file -> (output name, crop box or None, method)
PACKS = {
    "d7388a3b-image.jpg": ("kitkat_fr_4finger", None, "flood"),
    "c2d5f0f5-image.png": ("kitkat_jp_matcha", None, "flood"),
    "99722802-image.png": ("nescafe_fr_special-filtre", None, "alpha"),
    "a172e9f3-image.jpg": ("nescafe_jp_gold-blend", None, "rembg"),   # cut out on the full image, then keep the jar area only
    "079f1b6a-image.jpg": ("maggi_fr_kub-or", None, "flood"),
    "dcd30fda-image.webp": ("maggi_jp_bouillon", (0, 0, 590, 795), "flood"),   # left pack only (Maggi Bouillon)
}


def flood_transparent(im, thr=244):
    """Make near-white pixels connected to the border transparent."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if a < 10 or (r >= thr and g >= thr and b >= thr):
            mp[x, y] = 0
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                    q.append((nx, ny))
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))   # no white fringe
    im.putalpha(mask)
    return im


for src, (name, crop, method) in PACKS.items():
    path = os.path.join(UP, src)
    ext = os.path.splitext(src)[1]
    shutil.copyfile(path, os.path.join(ORIG, name + ext))
    im = Image.open(path)
    if crop:
        im = im.crop(crop)
    if method == "alpha":
        im = im.convert("RGBA")
    elif method == "flood":
        im = flood_transparent(im)
    else:
        from rembg import remove, new_session
        im = remove(im.convert("RGB"), session=new_session("isnet-general-use"))
        keep = Image.new("L", im.size, 0)
        keep.paste(255, (236, 70, 556, 734))                      # the jar; drops the swoosh edge and logo badge
        im.putalpha(Image.composite(im.getchannel("A"), keep, keep))
    bbox = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
    im = im.crop(bbox)
    im.save(os.path.join(OUT, name + ".png"), optimize=True)
    print(f"{name}: {im.size}")
