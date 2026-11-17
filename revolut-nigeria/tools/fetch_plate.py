"""Download the background photograph and crop it to the hero frame.

    python tools/fetch_plate.py

Source: "Lekki-ikoyi link bridge" by Ayorinde Ogundele, CC BY-SA 4.0,
https://commons.wikimedia.org/wiki/File:Lekki-ikoyi_link_bridge.jpg
(the 3840-pixel rendition). The frame keeps the full width and the bottom
of the picture, at the 4096 x 2640 hero aspect. Writes tools/out/plate.png.
"""
import os
import subprocess
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
URL = (
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/"
    "Lekki-ikoyi_link_bridge.jpg/3840px-Lekki-ikoyi_link_bridge.jpg"
)
W, H = 4096, 2640


def main():
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "source.jpg")
        subprocess.run(
            ["curl", "-sSfL", "--retry", "5", "--retry-delay", "20",
             "-A", "asset-fetch-script/1.0 (generic client)", "-o", src, URL],
            check=True,
        )
        im = Image.open(src).convert("RGB")
        w, h = im.size
        crop_h = round(w * H / W)
        plate = im.crop((0, h - crop_h, w, h)).resize((W, H), Image.LANCZOS)
        out = os.path.join(HERE, "out", "plate.png")
        plate.save(out)
        print("wrote", out, "from", im.size)


if __name__ == "__main__":
    main()
