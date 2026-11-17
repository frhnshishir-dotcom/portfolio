#!/usr/bin/env python3
"""Rebuild the Noto Serif JP block of styles/fonts.css from the Japanese text in index.html.

Fontsource ships Noto Serif JP as ~120 unicode-range shards. The deck only
loads the shards that contain characters it actually shows, and each rule's
unicode-range is narrowed to those characters, so nothing else downloads.

usage: python3 tools/subset_jp_fonts.py <path to @fontsource/noto-serif-jp package dir>
       (npm pack @fontsource/noto-serif-jp@5.1.0 && tar xf the .tgz -> ./package)
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PKG = Path(sys.argv[1])
WEIGHT = 500

def ranges(spec):
    out = []
    for part in spec.split(","):
        part = part.strip().upper().replace("U+", "")
        if "-" in part:
            a, b = part.split("-")
            out.append((int(a, 16), int(b, 16)))
        else:
            out.append((int(part, 16), int(part, 16)))
    return out

# 1. Japanese characters used anywhere in the page or its scripts (kana, CJK, punctuation, full-width).
sources = [ROOT / "index.html"] + sorted((ROOT / "slides").glob("*.js")) + sorted((ROOT / "scripts").glob("*.js"))
text_all = "".join(f.read_text(encoding="utf-8") for f in sources)
chars = sorted({ord(c) for c in text_all if 0x3000 <= ord(c) <= 0x9FFF or 0xFF00 <= ord(c) <= 0xFFEF})

# 2. Map each character to its Fontsource shard.
css = (PKG / f"{WEIGHT}.css").read_text(encoding="utf-8")
shards = []
for block in re.findall(r"@font-face\s*{[^}]*}", css):
    m = re.search(r"noto-serif-jp-(\d+)-%d-normal\.woff2" % WEIGHT, block)
    u = re.search(r"unicode-range:\s*([^;]+);", block)
    if m and u:
        shards.append((m.group(1), ranges(u.group(1))))

used = {}
missing = []
for cp in chars:
    hit = next((sid for sid, rs in shards if any(a <= cp <= b for a, b in rs)), None)
    if hit is None:
        missing.append(chr(cp))
    else:
        used.setdefault(hit, []).append(cp)
if missing:
    print("not in Noto Serif JP (left to the system font):", "".join(missing))

# 3. Copy the shard files and write narrowed @font-face rules.
rules = []
for sid in sorted(used, key=int):
    name = f"noto-serif-jp-{sid}-{WEIGHT}-normal.woff2"
    shutil.copyfile(PKG / "files" / name, ROOT / "assets" / "fonts" / name)
    rng = ",".join(f"U+{cp:04X}" for cp in used[sid])
    rules.append('@font-face{font-family:"Noto Serif JP";font-style:normal;font-display:swap;'
                 f'font-weight:{WEIGHT};src:url("../assets/fonts/{name}") format("woff2");unicode-range:{rng};}}')

fonts = ROOT / "styles" / "fonts.css"
text = fonts.read_text(encoding="utf-8")
head = "/* Noto Serif JP: only the subsets holding the Japanese words used in the deck. */"
assert head in text
text = text[: text.index(head) + len(head)] + "\n" + "\n".join(rules) + "\n"
fonts.write_text(text, encoding="utf-8")

# 4. Remove shard files no longer referenced.
keep = {f"noto-serif-jp-{sid}-{WEIGHT}-normal.woff2" for sid in used}
for f in (ROOT / "assets" / "fonts").glob("noto-serif-jp-*-normal.woff2"):
    if f.name not in keep:
        print("unused shard (left in place, delete if wanted):", f.name)
print(f"{len(chars)} characters in {len(used)} shards: {''.join(chr(c) for c in chars)}")
