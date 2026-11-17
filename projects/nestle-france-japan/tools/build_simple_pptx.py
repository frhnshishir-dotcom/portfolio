"""Simple, editable PowerPoint version of the deck.

    python3 tools/build_simple_pptx.py   ->  NESTLE-FRANCE-JAPAN_simple.pptx

Light, clean layout: real text boxes and tables (editable, imports into Canva),
one picture per slide, a plain fade between slides and no animations.
Pictures are the deck's authentic photos (see docs/ASSET_REGISTER.md).
"""
import ast
import os
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt, Emu
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "NESTLE-FRANCE-JAPAN_simple.pptx")
TMP = os.path.join(ROOT, "tools", ".simple_img")
os.makedirs(TMP, exist_ok=True)

# Palette and type
BG = RGBColor(0xFA, 0xF8, 0xF5)
INK = RGBColor(0x1C, 0x24, 0x30)
MUTED = RGBColor(0x5E, 0x67, 0x73)
LINE = RGBColor(0xE4, 0xDF, 0xD8)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
NAVY = RGBColor(0x0E, 0x1B, 0x2C)
RED = RGBColor(0xD8, 0x15, 0x2F)
AMBER = RGBColor(0xC9, 0x8A, 0x3D)
YELLOW = RGBColor(0xE8, 0xB4, 0x00)
GREEN = RGBColor(0x3E, 0x8E, 0x5A)
HEAD = "Aptos Display"
BODY = "Aptos"
JP = "Yu Gothic"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height
BLANK = prs.slide_layouts[6]

# Speaker notes come from the static build (same content, already sourced).
src = open(os.path.join(HERE, "build_pptx.py"), encoding="utf-8").read()
NOTES = [n for _, n in ast.literal_eval(next(
    node.value for node in ast.parse(src).body
    if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "") == "SLIDES"))]

A = lambda p: os.path.join(ROOT, "assets", p)
PK = lambda n: os.path.join(ROOT, "assets", "packs", n + ".png")   # team-supplied pack images (tools/prepare_packs.py)
PACK_SRC = "Pack images: official Nestlé and retailer product images, supplied by the team."


def img(path, ratio=None, max_w=1800):
    """Convert to PNG/JPEG (python-pptx has no WebP), optionally centre-cropped to w/h ratio."""
    im = Image.open(path)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    if ratio:
        w, h = im.size
        if w / h > ratio:
            nw = int(h * ratio); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = int(w / ratio); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    if has_alpha:
        bbox = im.getbbox()
        if bbox: im = im.crop(bbox)
    name = os.path.splitext(os.path.basename(path))[0] + (f"_{ratio:.2f}" if ratio else "")
    out = os.path.join(TMP, name + (".png" if has_alpha else ".jpg"))
    im.save(out, **({} if has_alpha else {"quality": 88}))
    return out


def fade(slide):
    """A plain fade transition (no animations anywhere)."""
    x = etree.fromstring('<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:fade/></p:transition>')
    slide._element.append(x)


def text(slide, x, y, w, h, runs, size=16, color=INK, font=BODY, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, spacing=1.1, after=6):
    """runs: str, or list of paragraphs; a paragraph is str or list of (text, {opts})."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.02)
    tf.margin_top = tf.margin_bottom = Inches(0.02)
    paras = runs if isinstance(runs, list) else [runs]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        p.space_after = Pt(after)
        for t, o in ([(para, {})] if isinstance(para, str) else para):
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = o.get("font", font)
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", False)
            f.color.rgb = o.get("color", color)
    return tb


def box(slide, x, y, w, h, fill=CARD, line=LINE, radius=0.06):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    s.adjustments[0] = radius
    s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None: s.line.fill.background()
    else: s.line.color.rgb = line; s.line.width = Pt(0.75)
    s.shadow.inherit = False
    s.text_frame.text = ""
    return s


def rect(slide, x, y, w, h, fill):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    s.fill.solid(); s.fill.fore_color.rgb = fill
    s.line.fill.background(); s.shadow.inherit = False
    return s


def new_slide(n, label, title, accent=RED, title_w=None):
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = BG
    rect(s, 0, 0, Inches(0.14), SH, accent)                       # brand strip
    text(s, Inches(0.65), Inches(0.45), Inches(9), Inches(0.35), label.upper(), size=12, color=accent, bold=True)
    text(s, Inches(0.65), Inches(0.78), title_w or Inches(12), Inches(1.0), title, size=32, font=HEAD)
    text(s, Inches(12.2), Inches(7.0), Inches(0.6), Inches(0.3), str(n), size=10, color=MUTED, align=PP_ALIGN.RIGHT)
    s.notes_slide.notes_text_frame.text = NOTES[n - 1]
    fade(s)
    return s


def source(s, t):
    text(s, Inches(0.65), Inches(6.98), Inches(11.4), Inches(0.35), t, size=9, color=MUTED)


def picture(s, path, x, y, w, h, caption=None):
    p = s.shapes.add_picture(img(path, ratio=w / h), x, y, w, h)
    if caption:
        text(s, x, y + h + Inches(0.06), w, Inches(0.3), caption, size=10, color=MUTED)
    return p


def pack(s, path, x, y, w, h, middle=False):
    """Fit a transparent pack image inside the box (x, y, w, h), centred; standing on its bottom edge unless middle."""
    pic = img(path)
    im = Image.open(pic)
    ph = h; pw = int(ph * im.width / im.height)
    if pw > w: pw = w; ph = int(pw * im.height / im.width)
    return s.shapes.add_picture(pic, x + (w - pw) // 2, y + ((h - ph) // 2 if middle else h - ph), pw, ph)


def bullets(items, size=15, head=None, color=INK):
    paras = []
    if head:
        paras.append([(head, {"bold": True, "size": size + 1})])
    for it in items:
        paras.append([("•  ", {"color": MUTED, "size": size}), (it, {"size": size, "color": color})])
    return paras


def product_row(s, y, h, dark=False):
    files = [A("images/hd/kk_red_wrapper_hd.webp"), A("images/hd/nes_red_mug_hd.webp"), A("images/hd/maggi_bottle_hd.webp")]
    return files


# 1 · Title ---------------------------------------------------------------------
s = prs.slides.add_slide(BLANK)
s.background.fill.solid(); s.background.fill.fore_color.rgb = NAVY
picture(s, A("images/paris_bluehour.webp"), Inches(6.4), 0, Inches(6.933), Inches(3.75))
picture(s, A("images/tokyo_bluehour.webp"), Inches(6.4), Inches(3.75), Inches(6.933), Inches(3.75))
rect(s, Inches(0.8), Inches(2.45), Inches(0.9), Inches(0.07), RED)
text(s, Inches(0.8), Inches(1.75), Inches(5.3), Inches(0.5), "NESTLÉ", size=16, color=RGBColor(0xC9, 0xCE, 0xD4), bold=True)
text(s, Inches(0.8), Inches(2.7), Inches(5.5), Inches(1.0), "France × Japan", size=42, font=HEAD, color=RGBColor(0xFF, 0xFF, 0xFF))
text(s, Inches(0.8), Inches(3.7), Inches(5.3), Inches(0.6), "Two markets. One global group.", size=22, font=HEAD, color=RGBColor(0xF5, 0xF3, 0xEF))
text(s, Inches(0.8), Inches(5.9), Inches(5.3), Inches(0.4), "International Marketing Strategy  |  2026", size=13, color=RGBColor(0xC9, 0xCE, 0xD4))
text(s, Inches(6.55), Inches(3.35), Inches(2), Inches(0.3), "Paris", size=11, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True)
text(s, Inches(6.55), Inches(7.1), Inches(2), Inches(0.3), "Tokyo", size=11, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True)
s.notes_slide.notes_text_frame.text = NOTES[0]
fade(s)

# 2 · Three brands --------------------------------------------------------------
s = new_slide(2, "Portfolio", "Three brands. Two markets.")
text(s, Inches(0.65), Inches(1.45), Inches(11), Inches(0.4), "A closer look at how global brands connect with local consumers.", size=16, color=MUTED)
cols = [("KitKat", RED, PK("kitkat_fr_4finger"), "The classic four-finger bar is the heart of the range.", "Regional and seasonal flavours, and a good-luck gift (“Kitto Katsu”)."),
        ("Nescafé", AMBER, PK("nescafe_fr_special-filtre"), "Coffee with milk at breakfast; capsule machines at home.", "Gold Blend, home machines and coffee on the go."),
        ("Maggi", YELLOW, PK("maggi_fr_kub-or"), "Stock cubes for soups and slow-cooked classics.", "Maggi Bouillon, a Western-style stock for home cooking.")]
for i, (name, col, path, fr, jp) in enumerate(cols):
    x = Inches(0.65 + i * 4.1)
    box(s, x, Inches(2.1), Inches(3.8), Inches(4.65))
    pack(s, path, x + Inches(0.4), Inches(2.25), Inches(3.0), Inches(1.95), middle=True)
    rect(s, x + Inches(0.3), Inches(4.3), Inches(0.5), Inches(0.05), col)
    text(s, x + Inches(0.3), Inches(4.4), Inches(3.3), Inches(0.45), name, size=22, font=HEAD)
    text(s, x + Inches(0.3), Inches(4.95), Inches(3.3), Inches(1.7),
         [[("France  ", {"bold": True, "size": 13}), (fr, {"size": 13})], [("Japan  ", {"bold": True, "size": 13}), (jp, {"size": 13})]], after=8)
source(s, PACK_SRC + " Packs shown: the French range.")

# 3 · Market context --------------------------------------------------------------
s = new_slide(3, "Market context · France vs Japan", "Two markets. Different routes to relevance.")
rows = [("", "France (observed)", "Japan (observed)", "Where adaptation happens"),
        ("KitKat", "Nestlé is established across chocolate, coffee and culinary; KitKat centres on the classic bar.", "Regional and seasonal flavours since 2000; exam-season gifting tied to “kitto katsu”.", "Local flavours, provenance and gifting"),
        ("Nescafé", "Soluble coffee and Dolce Gusto capsule formats.", "Workplace coffee through the Nescafé Ambassador programme (since 2012).", "Routines, formats and services"),
        ("Maggi", "KUB stock cubes and Arôme Maggi liquid seasoning.", "Maggi Bouillon, a Western-style stock for dishes such as potofu.", "Familiar culinary uses and local recipes")]
tbl = s.shapes.add_table(4, 4, Inches(0.65), Inches(1.75), Inches(12.0), Inches(3.9)).table
for c, wdt in enumerate([1.6, 3.8, 3.8, 2.8]): tbl.columns[c].width = Inches(wdt)
brand_col = {"KitKat": RED, "Nescafé": AMBER, "Maggi": YELLOW}
for r, row in enumerate(rows):
    tbl.rows[r].height = Inches(0.55 if r == 0 else 1.1)
    for c, val in enumerate(row):
        cell = tbl.cell(r, c)
        cell.fill.solid(); cell.fill.fore_color.rgb = NAVY if r == 0 else (CARD if r % 2 else RGBColor(0xF3, 0xF0, 0xEB))
        cell.margin_left = cell.margin_right = Inches(0.15); cell.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = cell.text_frame.paragraphs[0]; p.text = ""
        run = p.add_run(); run.text = val
        run.font.name = HEAD if (c == 0 and r) else BODY
        run.font.size = Pt(13 if r == 0 else (17 if c == 0 else 13))
        run.font.bold = r == 0 or c == 0 or c == 3
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) if r == 0 else (brand_col.get(row[0], INK) if c == 0 else (RGBColor(0x9A, 0x63, 0x1E) if c == 3 else INK))
b = box(s, Inches(0.65), Inches(5.9), Inches(12.0), Inches(0.85), fill=NAVY, line=None)
text(s, Inches(0.9), Inches(5.9), Inches(11.5), Inches(0.85), "The right adaptation depends on the category and consumption occasion, not on national stereotypes.",
     size=17, font=HEAD, color=RGBColor(0xFF, 0xFF, 0xFF), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
source(s, "Sources: Nestlé Japan (KitKat regional range; exam-season packs; Nescafé Ambassador, 2012); Nestlé Japan press releases on Maggi (2019, 2025); French retail listings for Maggi KUB and Arôme Maggi.")

# 4–6 · Brand slides: text left, one picture right -----------------------------------
def brand_slide(n, label, title, accent, fr, jp, packs, src_note=PACK_SRC):
    s = new_slide(n, label, title, accent, title_w=Inches(6.4))
    text(s, Inches(0.65), Inches(2.35), Inches(5.9), Inches(2.0), bullets(fr, head="France"), after=7)
    text(s, Inches(0.65), Inches(4.4), Inches(5.9), Inches(2.4), bullets(jp, head="Japan"), after=7)
    box(s, Inches(7.0), Inches(0.75), Inches(5.75), Inches(5.95))
    s.shapes.add_connector(1, Inches(9.875), Inches(1.2), Inches(9.875), Inches(6.25)).line.color.rgb = LINE
    for i, (market, path, cap) in enumerate(packs):
        x = Inches(7.0 + i * 2.875)
        pack(s, path, x + Inches(0.3), Inches(1.2), Inches(2.275), Inches(3.9), middle=True)
        rect(s, x + Inches(0.3), Inches(5.35), Inches(0.35), Inches(0.05), accent)
        text(s, x + Inches(0.3), Inches(5.45), Inches(2.3), Inches(1.1),
             [[(market, {"bold": True, "size": 14})], [(cap, {"size": 11.5, "color": MUTED})]], after=2)
    if src_note: source(s, src_note)
    return s

brand_slide(4, "KitKat", "Beyond the classic break.", RED,
            ["Four milk-chocolate wafer fingers: the classic bar is the heart of the range.", "The global “Have a break, have a KitKat” idea."],
            ["Regional and seasonal flavours such as Uji Matcha and Sakura Matcha.", "A good-luck gift for exams: “Kitto Katsu”, you will surely win.", "KitKat Chocolatory boutiques for premium gifts."],
            [("France", PK("kitkat_fr_4finger"), "KitKat, classic 4-finger bar"), ("Japan", PK("kitkat_jp_matcha"), "KitKat Mini Matcha, 10 pieces")])
brand_slide(5, "Nescafé", "Different habits. One coffee brand.", AMBER,
            ["Coffee with milk to start the day.", "Dolce Gusto capsules for the home."],
            ["Gold Blend instant and home coffee machines.", "Workplace coffee through the Nescafé Ambassador programme (since 2012).", "Ready-to-drink coffee from vending machines."],
            [("France", PK("nescafe_fr_special-filtre"), "Nescafé Spécial Filtre, L’Original"), ("Japan", PK("nescafe_jp_gold-blend"), "Nescafé Gold Blend, 80 g")])
brand_slide(6, "Maggi", "Local taste. Global brand.", YELLOW,
            ["KUB stock cubes and Arôme Maggi seasoning.", "Soups and slow-cooked classics such as pot-au-feu."],
            ["Maggi Bouillon: a Western-style stock for the Japanese table.", "Used for home dishes such as potofu, Japan's take on pot-au-feu.", "Maggi reached Japanese hotel kitchens in 1927."],
            [("France", PK("maggi_fr_kub-or"), "Maggi KUB Or, Classique"), ("Japan", PK("maggi_jp_bouillon"), "Maggi Bouillon, 20 cubes")])

# 7 · Packaging ----------------------------------------------------------------------
s = new_slide(7, "Packaging · Global identity, local relevance", "One brand identity. Locally relevant packaging.")
box(s, Inches(0.65), Inches(1.85), Inches(2.95), Inches(3.9))
text(s, Inches(0.9), Inches(2.05), Inches(2.6), Inches(3.6), bullets(["Brand logo", "Core colours", "Brand recognition", "Quality cues"], size=14, head="Standardise"), after=8)
box(s, Inches(3.8), Inches(1.85), Inches(2.95), Inches(3.9))
text(s, Inches(4.05), Inches(2.05), Inches(2.6), Inches(3.6), bullets(["Language", "Product information", "Pack format", "Flavour communication", "Occasion and presentation"], size=14, head="Localise"), after=8)
box(s, Inches(6.95), Inches(1.85), Inches(5.7), Inches(3.9))
for i, (market, path, notes_) in enumerate([
        ("France · KitKat", PK("kitkat_fr_4finger"), [("French text: “Ouvrir ici”", {}), ("Nutri-Score label", {}), ("“Have a break” slogan", {})]),
        ("Japan · KitKat Matcha", PK("kitkat_jp_matcha"), [("濃い抹茶", {"font": JP}), ("  rich matcha", {}), ("\n", {}), ("宇治抹茶", {"font": JP}), ("  Uji matcha", {}), ("\n", {}), ("10枚入", {"font": JP}), ("  10 pieces", {})])]):
    x = Inches(6.95 + i * 2.85)
    pack(s, path, x + Inches(0.25), Inches(2.05), Inches(2.35), Inches(1.65))
    text(s, x + Inches(0.25), Inches(3.85), Inches(2.4), Inches(0.35), market, size=13, bold=True)
    paras, cur = [], []
    for t, o in notes_:
        if t == "\n": paras.append(cur); cur = []
        else: cur.append((t, o))
    if cur: paras.append(cur)
    if i == 0: paras = [[p_] for p_ in notes_]
    text(s, x + Inches(0.25), Inches(4.2), Inches(2.45), Inches(1.5), paras, size=11.5, color=MUTED, after=2)
text(s, Inches(0.65), Inches(5.95), Inches(12), Inches(0.8),
     [[("France: ", {"bold": True}), ("product information in French is required.   ", {}), ("Japan: ", {"bold": True}), ("Japanese labelling is required.   ", {}),
       ("KitKat is the clearest case: one brand code, many regional and gift-ready packs.", {"italic": True})]], size=14)
source(s, "Sources: Regulation (EU) No 1169/2011, art. 15; French Consumer Code R412-7; Japan Food Labeling Act (2013) and Standards (2015). " + PACK_SRC)

# 8 · Pricing ------------------------------------------------------------------------
s = new_slide(8, "Pricing · Comparing value across markets", "Comparing value, not just shelf price.")
steps = [("01", "Match the SKU", "Same variant, format and pack size in both markets."),
         ("02", "Normalise the price", "Per 100 g, 100 ml or serving; same-day currency conversion."),
         ("03", "Map the price ladder", "Entry, core, premium; keep gift editions apart."),
         ("04", "Read the context", "Promotions, retailer type, taxes, machine-system costs.")]
for i, (num, h, d) in enumerate(steps):
    x = Inches(0.65 + i * 3.05)
    box(s, x, Inches(1.85), Inches(2.85), Inches(2.3))
    text(s, x + Inches(0.25), Inches(2.0), Inches(2.4), Inches(0.6), num, size=26, font=HEAD, color=RED)
    text(s, x + Inches(0.25), Inches(2.6), Inches(2.4), Inches(0.4), h, size=15, bold=True)
    text(s, x + Inches(0.25), Inches(3.05), Inches(2.4), Inches(1.0), d, size=12.5, color=MUTED)
cats = [("KitKat", RED, "Everyday bars vs everyday bars; regional and gift editions are a separate tier."),
        ("Nescafé", AMBER, "Cost per cup, including the machine and its capsules or refills."),
        ("Maggi", YELLOW, "Pack size and cost per preparation, not price per pack.")]
for i, (n_, col, d) in enumerate(cats):
    x = Inches(0.65 + i * 4.05)
    rect(s, x, Inches(4.5), Inches(3.8), Inches(0.06), col)
    text(s, x, Inches(4.65), Inches(3.8), Inches(1.2), [[(n_ + "  ", {"bold": True, "size": 15}), (d, {"size": 13})]])
box(s, Inches(0.65), Inches(5.95), Inches(12.0), Inches(0.75), fill=RGBColor(0xF3, 0xF0, 0xEB), line=None)
text(s, Inches(0.9), Inches(5.95), Inches(11.5), Inches(0.75), "No prices are shown: equivalent, dated shelf prices for both markets have not been collected yet. This is the method for collecting them.",
     size=13, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)

# 9 · Distribution -------------------------------------------------------------------
s = new_slide(9, "Distribution · Channels by category", "Reaching consumers in the right place.")
chan = ["", "Supermarkets & hypermarkets", "Convenience & vending", "Online grocery", "Regional & travel retail", "Workplace & machine services", "Recipe & cooking content"]
data = [["KitKat", "FR · JP", "FR · JP", "—", "JP", "—", "—"],
        ["Nescafé", "FR · JP", "JP", "FR", "—", "FR · JP", "—"],
        ["Maggi", "FR · JP", "—", "FR", "—", "—", "Recommended"]]
tbl = s.shapes.add_table(4, 7, Inches(0.65), Inches(1.85), Inches(12.0), Inches(3.4)).table
tbl.columns[0].width = Inches(1.8)
for c in range(1, 7): tbl.columns[c].width = Inches(1.7)
for r, row in enumerate([chan] + data):
    tbl.rows[r].height = Inches(0.85)
    for c, val in enumerate(row):
        cell = tbl.cell(r, c)
        cell.fill.solid(); cell.fill.fore_color.rgb = NAVY if r == 0 else (CARD if r % 2 else RGBColor(0xF3, 0xF0, 0xEB))
        cell.vertical_anchor = MSO_ANCHOR.MIDDLE; cell.margin_left = cell.margin_right = Inches(0.1)
        p = cell.text_frame.paragraphs[0]; p.alignment = PP_ALIGN.LEFT if c == 0 else PP_ALIGN.CENTER
        run = p.add_run(); run.text = val
        run.font.name = HEAD if (c == 0 and r) else BODY
        run.font.size = Pt(12 if r == 0 else (17 if c == 0 else 14))
        run.font.bold = r == 0 or c == 0 or val not in ("—",)
        run.font.color.rgb = (RGBColor(0xFF, 0xFF, 0xFF) if r == 0 else brand_col[row[0]] if c == 0 else
                              MUTED if val == "—" else RGBColor(0xB0, 0x24, 0x3A) if val == "Recommended" else INK)
text(s, Inches(0.65), Inches(5.35), Inches(12), Inches(0.4), "FR / JP: channel used for the category in that market.   Recommended: a suggested role, not an observed channel.   —: no claim made.", size=11, color=MUTED)
box(s, Inches(2.65), Inches(5.9), Inches(8.0), Inches(0.8), fill=NAVY, line=None)
text(s, Inches(2.65), Inches(5.9), Inches(8.0), Inches(0.8), "Distribution should follow the consumption occasion.", size=18, font=HEAD, color=RGBColor(0xFF, 0xFF, 0xFF), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
source(s, "Qualitative mapping from this deck's evidence (Nestlé Japan; French retail listings). No channel shares or dominance are implied.")

# 10 · Advertising -------------------------------------------------------------------
s = new_slide(10, "Advertising & communication", "Translate the meaning, not just the slogan.")
ex = [("KitKat · Japan", RED, ["Exam-season encouragement on packs.", "“Kitto katsu”: you will surely win.", "Regional souvenir storytelling."]),
      ("Nescafé · Japan", AMBER, ["The coffee experience, at home and at work.", "Workplace coffee culture.", "Nescafé Ambassador (since 2012)."]),
      ("Maggi · France", YELLOW, ["Culinary familiarity.", "Everyday cooking.", "KUB and Arôme Maggi."])]
for i, (h, col, items) in enumerate(ex):
    x = Inches(0.65 + i * 4.05)
    box(s, x, Inches(1.85), Inches(3.8), Inches(2.45))
    rect(s, x, Inches(1.85), Inches(3.8), Inches(0.07), col)
    text(s, x + Inches(0.25), Inches(2.05), Inches(3.35), Inches(2.2), bullets(items, size=13.5, head=h), after=5)
rules = [("France", ["Product use and taste", "Convenience", "Everyday relevance"]),
         ("Japan", ["Context-rich storytelling", "Local provenance", "Occasion-based relevance"]),
         ("Both markets", ["Test with local consumers", "Avoid stereotypes", "Preserve the core promise"])]
box(s, Inches(0.65), Inches(4.55), Inches(12.0), Inches(2.2), fill=NAVY, line=None)
text(s, Inches(0.95), Inches(4.7), Inches(8), Inches(0.4), "Creative rules (recommendations)", size=13, bold=True, color=RGBColor(0xF0, 0x8A, 0x96))
for i, (h, items) in enumerate(rules):
    text(s, Inches(0.95 + i * 3.95), Inches(5.15), Inches(3.7), Inches(1.6), bullets(items, size=13.5, head=h, color=RGBColor(0xFF, 0xFF, 0xFF)), color=RGBColor(0xFF, 0xFF, 0xFF), after=3)
source(s, "Sources: Nestlé Japan (exam-season KitKat packs; Nescafé Ambassador, 2012); French retail listings for Maggi. Creative rules are recommendations, not past campaigns.")

# 11 · Two official ads ---------------------------------------------------------------
s = new_slide(11, "Advertising in practice · Two official KitKat ads", "Same brand. Two cultural codes.")
ads = [("France · “Better Breaks” (KITKAT France, 0:21)", "https://www.youtube.com/watch?v=HCBP72vABBk", A("video/kitkat-fr_better-breaks_poster.jpg"),
        ["Targets French adults and the everyday break at work.", "Humour and personal relief; on screen “*break = pause” and the health banner.", "Shows: the global “Have a break” idea travels; language and legal mentions are localised."]),
       ("Japan · キット、サクラサクよ (Nestlé Japan, 0:30)", "https://www.youtube.com/watch?v=hvyWq_mOpIo", A("video/kitkat-jp_sakura-saku_poster.jpg"),
        ["Targets students facing entrance exams, and the people who support them.", "Encouragement shown as cherry blossoms; “sakura saku” once meant “passed”.", "Shows: Nestlé localises the meaning; KitKat becomes a good-luck gift."])]
for i, (h, url, poster, items) in enumerate(ads):
    x = Inches(0.65 + i * 6.15)
    text(s, x, Inches(1.62), Inches(5.85), Inches(0.4), h, size=14, bold=True)
    pic = picture(s, poster, x, Inches(2.05), Inches(5.85), Inches(3.29))
    pic.click_action.hyperlink.address = url
    play = s.shapes.add_shape(MSO_SHAPE.ISOSCELES_TRIANGLE, x + Inches(2.67), Inches(3.4), Inches(0.6), Inches(0.6))
    play.rotation = 90; play.fill.solid(); play.fill.fore_color.rgb = RGBColor(0xFF, 0xFF, 0xFF); play.line.fill.background()
    play.click_action.hyperlink.address = url
    text(s, x, Inches(5.4), Inches(5.85), Inches(0.3), [[("▶ Click the picture to play on YouTube  ", {"bold": True, "color": RED}), (url.replace("https://www.", ""), {"color": MUTED})]], size=10.5)
    text(s, x, Inches(5.72), Inches(5.85), Inches(1.2), bullets(items, size=11.5), after=1)
source(s, "Official uploads by KITKAT France and Nestlé Japan on YouTube. To embed: Insert › Video › Online Video, then paste the link.")

# 12 · Key findings ---------------------------------------------------------------------
s = new_slide(12, "Key findings", "Global platform. Local execution.")
pill = [("01", "Protect global brand codes", "Keep the brand name, logo, core colours, product promise and quality cues identical."),
        ("02", "Adapt the local value proposition", "KitKat: flavour, provenance, gifting.\nNescafé: routines, formats, services.\nMaggi: local recipes, culinary uses."),
        ("03", "Validate before scaling", "Test packaging, price acceptance, channels and campaigns with local consumers. Segment by age, lifestyle, region and occasion, not nationality alone.")]
for i, (num, h, d) in enumerate(pill):
    x = Inches(0.65 + i * 4.05)
    box(s, x, Inches(1.85), Inches(3.8), Inches(3.7))
    text(s, x + Inches(0.3), Inches(2.0), Inches(3.2), Inches(0.8), num, size=36, font=HEAD, color=RED)
    text(s, x + Inches(0.3), Inches(2.85), Inches(3.2), Inches(0.7), h, size=16, bold=True)
    text(s, x + Inches(0.3), Inches(3.55), Inches(3.2), Inches(1.9), d.split("\n"), size=13, color=MUTED, after=4)
box(s, Inches(0.65), Inches(5.8), Inches(12.0), Inches(0.95), fill=NAVY, line=None)
text(s, Inches(0.9), Inches(5.8), Inches(11.5), Inches(0.95),
     [[("Standardise what creates ", {}), ("recognition", {"bold": True}), (". Localise what creates ", {}), ("relevance", {"bold": True}), (". Measure what creates ", {}), ("growth", {"bold": True}), (".", {})]],
     size=19, font=HEAD, color=RGBColor(0xFF, 0xFF, 0xFF), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# 13 · Conclusion -----------------------------------------------------------------------
s = prs.slides.add_slide(BLANK)
s.background.fill.solid(); s.background.fill.fore_color.rgb = NAVY
text(s, Inches(0.8), Inches(1.0), Inches(11.7), Inches(1.0), "Think globally. Adapt locally.", size=44, font=HEAD, color=RGBColor(0xFF, 0xFF, 0xFF), align=PP_ALIGN.CENTER)
text(s, Inches(0.8), Inches(2.05), Inches(11.7), Inches(0.5), "Global brand strength comes from understanding local consumers.", size=18, color=RGBColor(0xC9, 0xCE, 0xD4), align=PP_ALIGN.CENTER)
six = ["kitkat_fr_4finger", "kitkat_jp_matcha", "nescafe_fr_special-filtre", "nescafe_jp_gold-blend", "maggi_fr_kub-or", "maggi_jp_bouillon"]
for i, n_ in enumerate(six):
    x = Inches(0.75 + i * 1.95 + (i // 2) * 0.12)
    pack(s, PK(n_), x, Inches(3.15), Inches(1.75), Inches(2.4))
    text(s, x, Inches(5.65), Inches(1.75), Inches(0.3), "France" if i % 2 == 0 else "Japan", size=11, color=RGBColor(0xC9, 0xCE, 0xD4), align=PP_ALIGN.CENTER)
text(s, Inches(0.8), Inches(6.35), Inches(11.7), Inches(0.5), "NESTLÉ", size=18, bold=True, color=RGBColor(0xF5, 0xF3, 0xEF), align=PP_ALIGN.CENTER)
s.notes_slide.notes_text_frame.text = NOTES[12]
fade(s)

prs.core_properties.title = "Nestlé: France × Japan"
prs.save(OUT)
print("wrote", OUT, len(prs.slides), "slides")
