"""Measure the four corners of the card's front face in the hero image.

    python tools/measure_corners.py

The card's corners are rounded, so there is no corner pixel to pick. Instead
each of the four straight edges is located to sub-pixel accuracy (where the
front-face matte crosses 50 %), a line is fitted through each, and the lines
are intersected. The result is what src/lib/scene.ts stores in CARD_CORNERS.

The matte is rendered by the same camera, in the same frame, as the card that
was composited into the photograph, so these are measurements of the published
image. The camera's own projection of the 3D corners is printed alongside as
an independent check.
"""
from __future__ import annotations

import json
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")


def crossings_along_rows(matte, rows, rising):
    """For each row, the x where the matte crosses 0.5 (first rising or last falling)."""
    pts = []
    for y in rows:
        line = matte[y]
        inside = np.where(line >= 0.5)[0]
        if len(inside) < 8:
            continue
        i = inside[0] if rising else inside[-1]
        j = i - 1 if rising else i + 1
        a, b = line[j], line[i]
        t = (0.5 - a) / (b - a) if b != a else 0.5
        x = j + t * (i - j)
        pts.append((x + 0.5, y + 0.5))          # pixel centres -> continuous image coordinates
    return np.array(pts)


def fit_line(points, vertical):
    """Least-squares line as (a, b, c) with a*x + b*y + c = 0."""
    x, y = points[:, 0], points[:, 1]
    if vertical:      # x = m*y + k
        m, k = np.polyfit(y, x, 1)
        resid = x - (m * y + k)
        return (1.0, -m, -k), float(np.abs(resid).max())
    m, k = np.polyfit(x, y, 1)                  # y = m*x + k
    resid = y - (m * x + k)
    return (-m, 1.0, -k), float(np.abs(resid).max())


def intersect(l1, l2):
    a1, b1, c1 = l1
    a2, b2, c2 = l2
    det = a1 * b2 - a2 * b1
    return ((b1 * c2 - b2 * c1) / det, (a2 * c1 - a1 * c2) / det)


def main():
    matte = np.asarray(Image.open(os.path.join(OUT, "hero_front_matte.png")).convert("L"), dtype=np.float32) / 255.0
    # the PNG is sRGB-encoded; decode it so that 0.5 means half of the pixel is covered
    matte = np.where(matte <= 0.04045, matte / 12.92, ((matte + 0.055) / 1.055) ** 2.4)
    h, w = matte.shape
    ys, xs = np.where(matte >= 0.5)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    span_y, span_x = y1 - y0, x1 - x0

    # the straight part of each side: the middle 64 %, clear of the rounded corners
    rows = np.arange(int(y0 + 0.18 * span_y), int(y1 - 0.18 * span_y))
    cols = np.arange(int(x0 + 0.18 * span_x), int(x1 - 0.18 * span_x))

    left, r_left = fit_line(crossings_along_rows(matte, rows, True), vertical=True)
    right, r_right = fit_line(crossings_along_rows(matte, rows, False), vertical=True)
    top_pts = crossings_along_rows(matte.T, cols, True)[:, ::-1]
    bottom_pts = crossings_along_rows(matte.T, cols, False)[:, ::-1]
    top, r_top = fit_line(top_pts, vertical=False)
    bottom, r_bottom = fit_line(bottom_pts, vertical=False)

    corners = [intersect(top, left), intersect(top, right), intersect(bottom, right), intersect(bottom, left)]
    corners = [[round(float(x), 1), round(float(y), 1)] for x, y in corners]

    meta = json.load(open(os.path.join(OUT, "hero_camera.json")))
    analytic = meta["analytic_corners"]
    delta = [round(float(np.hypot(c[0] - a[0], c[1] - a[1])), 2) for c, a in zip(corners, analytic)]

    result = {
        "image": [w, h],
        "corners_tl_tr_br_bl": corners,
        "edge_fit_max_residual_px": {"left": round(r_left, 3), "right": round(r_right, 3),
                                     "top": round(r_top, 3), "bottom": round(r_bottom, 3)},
        "camera_projection": analytic,
        "difference_from_projection_px": delta,
    }
    with open(os.path.join(OUT, "card_corners.json"), "w") as fh:
        json.dump(result, fh, indent=2)
    print(json.dumps(result, indent=2))
    ts = ",\n".join(f"  [{x}, {y}]" for x, y in corners)
    print(f"\nexport const CARD_CORNERS: Quad = [\n{ts},\n];")


if __name__ == "__main__":
    main()
