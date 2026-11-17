"""Build the static PowerPoint backup from the final slide screenshots.

    python3 tools/build_pptx.py

Each slide is the final composition of the interactive deck (docs/screenshots/slide-N.jpg),
placed full-bleed on a 16:9 slide, with the slide text as alt text and speaker notes.
The original PowerPoint in source/ is never touched; this writes a new file.
"""
import os
from pptx import Presentation
from pptx.util import Emu

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "NESTLE-FRANCE-JAPAN_redesign_static.pptx")

SLIDES = [
    ("Nestlé: France × Japan. Two Markets. One Global Group. International Marketing Strategy | 2026.",
     "Opening. Paris (Eiffel Tower, Pont des Invalides) and Tokyo (Tokyo Tower, Minato) at blue hour, joined by a sheet of glass. Two markets, one global group."),
    ("Three brands. Two markets. A closer look at how global brands connect with local consumers. KitKat, Nescafé, Maggi.",
     "(Interactive in the HTML version: select KitKat, Nescafé or Maggi to bring it to the hero position.)\n"
     "KitKat. France: the classic four-finger bar sits at the heart of the range. Japan: regional and seasonal flavours, and a good-luck gift ('Kitto Katsu').\n"
     "Nescafé. France: coffee with milk at breakfast, capsule machines at home. Japan: Gold Blend, home coffee machines and coffee on the go.\n"
     "Maggi. France: stock cubes for soups and slow-cooked classics. Japan: Maggi Bouillon, a Western-style stock for home cooking."),
    ("KitKat: beyond the classic break. France: the classic break. Japan: flavours made to gift.",
     "France: four milk-chocolate wafer fingers, the bar at the heart of the French range.\n"
     "Japan: Uji Matcha, Sakura Matcha and regional editions. Students receive KitKat for luck: 'Kitto Katsu', you will surely win."),
    ("Nescafé: different habits. One coffee brand. France: breakfast, then the machine. Japan: at home and on the go. A Nescafé mug anchors the centre.",
     "(In the HTML version the slide opens with coffee poured into the Nescafé mug.)\n"
     "France: coffee with milk to start the day, and Dolce Gusto capsules for the home.\n"
     "Japan: Gold Blend instant and home machines, plus ready-to-drink coffee from vending machines."),
    ("Maggi: local taste. Global brand. France: stock for slow classics. Japan: a Western stock, a Japanese table.",
     "France: cubes such as Kub have flavoured French soups and pot-au-feu for generations (pictured: historic Maggi France tins).\n"
     "Japan: Nestlé Japan sells Maggi Bouillon (マギー ブイヨン) for dishes like potofu. Maggi reached Japanese hotel kitchens in 1927.\n"
     "No verified photo of the Japanese pack was available, so none is shown."),
    ("Think globally. Adapt locally. Global brand strength comes from understanding local consumers.",
     "Closing. KitKat, Nescafé and Maggi under one spotlight, with the Nestlé logo."),
]

prs = Presentation()
prs.slide_width = Emu(12192000)   # 13.333 in
prs.slide_height = Emu(6858000)   # 7.5 in
blank = prs.slide_layouts[6]
for i, (alt, notes) in enumerate(SLIDES, 1):
    s = prs.slides.add_slide(blank)
    img = os.path.join(ROOT, "docs", "screenshots", f"slide-{i}.jpg")
    pic = s.shapes.add_picture(img, 0, 0, width=prs.slide_width, height=prs.slide_height)
    pic.name = f"Slide {i} composition"
    pic._element.nvPicPr.cNvPr.set("descr", alt)
    s.notes_slide.notes_text_frame.text = notes + "\n\nImage credits: see docs/ASSET_REGISTER.md."
prs.core_properties.title = "Nestlé: France × Japan (static backup of the animated deck, v2)"
prs.save(OUT)
print("wrote", OUT)
