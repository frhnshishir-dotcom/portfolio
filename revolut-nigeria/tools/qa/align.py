"""Compare the on-screen portal plane with the card in the photograph.

    python tools/qa/align.py <dir written by align.mjs>

Expected silhouette: the card's front-face render matte (tools/out/hero_front_matte.png,
same camera as the published hero image), mapped through the page's own stage
transform. Observed silhouette: pixels that turned magenta when the plane was shown.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
d = sys.argv[1]
stage = json.load(open(os.path.join(d, "stage.json")))
matte = Image.open(os.path.join(HERE, "..", "out", "hero_front_matte.png")).convert("L")
lin = np.asarray(matte, dtype=np.float32) / 255.0
lin = np.where(lin <= 0.04045, lin / 12.92, ((lin + 0.055) / 1.055) ** 2.4)  # coverage
matte_lin = Image.fromarray((lin * 255).astype(np.uint8))

ok = True
for size, t in stage.items():
    a = np.asarray(Image.open(os.path.join(d, f"{size}_a.png")).convert("RGB"), dtype=np.float32)
    b = np.asarray(Image.open(os.path.join(d, f"{size}_b.png")).convert("RGB"), dtype=np.float32)
    h, w, _ = a.shape
    # observed coverage: how far each pixel moved towards magenta
    magenta = np.array([255, 0, 255], np.float32)
    denom = np.maximum(np.linalg.norm(magenta - a, axis=2), 1e-3)
    observed = np.clip(np.linalg.norm(b - a, axis=2) / denom, 0, 1)
    # expected coverage: screen = image * scale + t  ->  image = (screen - t) / scale
    s, tx, ty = t["scale"], t["tx"], t["ty"]
    inv = (1 / s, 0, -tx / s, 0, 1 / s, -ty / s)
    # Integrate the matte over each screen pixel by supersampling 4x. Pillow
    # samples at pixel centres on both sides, so the plain affine is exact.
    big = matte_lin.transform((w * 4, h * 4), Image.AFFINE,
                              (inv[0] / 4, 0, inv[2], 0, inv[4] / 4, inv[5]),
                              resample=Image.BILINEAR)
    expected = np.asarray(big.resize((w, h), Image.BOX), dtype=np.float32) / 255.0
    inter = np.minimum(observed, expected).sum()
    union = np.maximum(observed, expected).sum()
    iou = inter / union
    err = np.abs(observed - expected)
    # signed offset of each edge: compare the centroids of coverage per row/col
    ys, xs = np.mgrid[0:h, 0:w]
    cx_o, cy_o = (observed * xs).sum() / observed.sum(), (observed * ys).sum() / observed.sum()
    cx_e, cy_e = (expected * xs).sum() / expected.sum(), (expected * ys).sum() / expected.sum()
    area_ratio = observed.sum() / expected.sum()
    bad = (err > 0.5).sum()
    print(f"{size:>10}  scale {s:.4f}  IoU {iou:.4f}  area {area_ratio:.4f}  "
          f"centroid shift ({cx_o - cx_e:+.2f}, {cy_o - cy_e:+.2f}) px  pixels off by >50%: {bad}")
    Image.fromarray((np.stack([expected, observed, np.zeros_like(observed)], 2) * 255).astype(np.uint8)).save(
        os.path.join(d, f"{size}_overlay.png"))
    shift = max(abs(cx_o - cx_e), abs(cy_o - cy_e))
    ok &= iou > 0.985 and abs(area_ratio - 1) < 0.01 and shift < 0.5
print("PASS" if ok else "CHECK")
