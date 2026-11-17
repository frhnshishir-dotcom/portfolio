"""Build the static PowerPoint backup from the final slide screenshots.

    python3 tools/build_pptx.py

Each slide is the final composition of the interactive deck (docs/screenshots/slide-N.jpg),
placed full-bleed on a 16:9 slide, with the slide text as alt text and speaker notes.
On the ad slide the two video posters are clickable links to the official YouTube videos
(in slide show, one click opens the ad; PowerPoint can also embed them with
Insert > Video > Online Video and the same URLs).
The original PowerPoint in source/ is never touched; this writes a new file.
"""
import os
from pptx import Presentation
from pptx.util import Emu
from pptx.enum.shapes import MSO_SHAPE

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
    ("Market context, France vs Japan. Two markets. Different routes to relevance.",
     "France (observed): Nestlé is established across chocolate, coffee and culinary; KitKat centres on the classic bar; Nescafé sells soluble coffee and Dolce Gusto capsules; Maggi's range includes KUB stock cubes and Arôme Maggi.\n"
     "Japan (observed): regional and seasonal KitKat flavours since 2000 and exam-season gifting ('kitto katsu'); workplace coffee through the Nescafé Ambassador programme (since 2012); Maggi Bouillon for dishes such as potofu.\n"
     "Interpretation: KitKat adapts through local flavours, provenance and gifting; Nescafé through routines, formats and services; Maggi through familiar culinary uses and local recipes.\n"
     "Insight: the right adaptation depends on the category and consumption occasion, not on national stereotypes.\n"
     "Sources: Nestlé Japan; Nestlé Japan press releases on Maggi (2019, 2025); French retail listings for Maggi KUB and Arôme Maggi."),
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
    ("Packaging. One brand identity. Locally relevant packaging.",
     "Standardise (recommendation): brand logo, core colours, brand recognition, quality cues.\n"
     "Localise: language, product information, pack format, flavour communication, occasion and presentation.\n"
     "France (observed): French-language product information is required (Regulation (EU) No 1169/2011, art. 15; Consumer Code R412-7). The panel is a neutral label-anatomy schematic, not a pack design.\n"
     "Japan (observed): Japanese labelling is required (Food Labeling Act, Act No. 70 of 2013; Food Labeling Standards, 2015). Real pack: KitKat Uji Matcha box with 宇治抹茶 (Uji matcha), 日本土産 ('Japan souvenir') and 3枚入 (3 pieces).\n"
     "KitKat is the clearest case: one brand code, many regional and gift-ready packs."),
    ("Pricing: comparing value, not just shelf price. 01 Match the SKU. 02 Normalise the price. 03 Map the price ladder. 04 Read the context.",
     "No prices are shown: equivalent, dated shelf prices for both markets have not been collected. This is the method for collecting them.\n"
     "01 Same variant, format and pack size. 02 Price per 100 g, 100 ml or serving; convert currencies at the same date. 03 Entry, core, premium; keep limited and gift editions apart. 04 Promotions, retailer type, taxes, production and machine-system costs.\n"
     "KitKat: everyday bars vs everyday bars; regional and gift editions are a separate tier. Nescafé: cost per cup including the machine and capsules or refills. Maggi: pack size and cost per preparation."),
    ("Distribution. Reaching consumers in the right place. Distribution should follow the consumption occasion.",
     "Qualitative channel map (no shares or dominance implied).\n"
     "KitKat: supermarkets and convenience (FR, JP); regional and travel retail (JP).\n"
     "Nescafé: supermarkets (FR, JP); convenience and vending (JP); online grocery (FR); workplace and machine services (FR, JP; Nescafé Ambassador in Japan).\n"
     "Maggi: supermarkets (FR, JP); online grocery (FR); recipe and cooking content (recommended role)."),
    ("Advertising and communication. Translate the meaning, not just the slogan.",
     "Observed: KitKat Japan (exam-season encouragement on packs, 'kitto katsu', regional souvenir storytelling); Nescafé Japan (coffee experience, workplace coffee culture, Nescafé Ambassador since 2012); Maggi France (culinary familiarity, everyday cooking, KUB and Arôme Maggi).\n"
     "Creative rules (recommendations, not past campaigns). France: product use and taste, convenience, everyday relevance. Japan: context-rich storytelling, local provenance, occasion-based relevance where evidence supports it. Both: test with local consumers, avoid stereotypes, preserve the core promise."),
    ("Two official KitKat ads. Same brand. Two cultural codes. France: Better Breaks (KITKAT France, 0:21). Japan: Kitto, sakura saku yo (Nestlé Japan, 0:30).",
     "VIDEOS (click a poster in slide show to open it on YouTube; in the HTML deck they play in place):\n"
     "France: KITKAT France, 'PUB KITKAT® BETTER BREAKS' — https://www.youtube.com/watch?v=HCBP72vABBk\n"
     "Japan: Nestlé Japan official channel, 'キットカット キット、サクラサクよ 受験生応援 メッセージ桜 30秒版' — https://www.youtube.com/watch?v=hvyWq_mOpIo\n\n"
     "France. Target market: French adults, the everyday break at work or study. Behaviour and context: the work break amid information overload; on screen, '*break = pause' (a French rendering of the English word) and the mandatory 'Pour votre santé' health banner. Versus Japan: humour and individual relief; the product and the 'break' idea stay centre stage. What it shows: the global 'Have a break' platform travels; language and legal mentions are localised.\n"
     "Japan. Target market: students facing university entrance exams, and the people who support them. Behaviour and context: exam-season encouragement shown as cherry blossoms (messages from across Japan, Harajuku JING, January 2024); 'sakura saku' was the old telegram for 'passed'. Versus France: emotional and collective; the brand carries other people's encouragement. What it shows: Nestlé localises the meaning; name, season and ritual make KitKat a good-luck gift.\n"
     "Rules cited: French health message (law of 9 August 2004, decree of 27 February 2007); Loi Toubon (1994)."),
    ("Key findings. Global platform. Local execution. 01 Protect global brand codes. 02 Adapt the local value proposition. 03 Validate before scaling.",
     "01 Keep the brand name, logo, core colours, product promise and quality cues identical.\n"
     "02 KitKat: flavour, provenance, gifting. Nescafé: routines, formats, services. Maggi: local recipes, culinary uses.\n"
     "03 Test packaging comprehension, price acceptance, channel performance and campaign response with local consumers; segment by age, lifestyle, region and occasion, not nationality alone.\n"
     "Standardise what creates recognition. Localise what creates relevance. Measure what creates growth."),
    ("Think globally. Adapt locally. Global brand strength comes from understanding local consumers.",
     "Closing. KitKat, Nescafé and Maggi under one spotlight, with the Nestlé logo."),
]

# Clickable video posters on the ad slide (stage pixels on the 1920×1080 composition).
PX = 12192000 / 1920
VIDEO_LINKS = {
    11: [("Play the KITKAT France ad on YouTube", "https://www.youtube.com/watch?v=HCBP72vABBk", (120, 258, 810, 456)),
         ("Play the Nestlé Japan KitKat ad on YouTube", "https://www.youtube.com/watch?v=hvyWq_mOpIo", (990, 258, 810, 456))],
}

prs = Presentation()
prs.slide_width = Emu(12192000)   # 13.333 in
prs.slide_height = Emu(6858000)   # 7.5 in
blank = prs.slide_layouts[6]
assert len(SLIDES) == 13, len(SLIDES)
for i, (alt, notes) in enumerate(SLIDES, 1):
    s = prs.slides.add_slide(blank)
    img = os.path.join(ROOT, "docs", "screenshots", f"slide-{i}.jpg")
    pic = s.shapes.add_picture(img, 0, 0, width=prs.slide_width, height=prs.slide_height)
    pic.name = f"Slide {i} composition"
    pic._element.nvPicPr.cNvPr.set("descr", alt)
    s.notes_slide.notes_text_frame.text = notes + "\n\nImage credits: see docs/ASSET_REGISTER.md."
    for name, url, box in VIDEO_LINKS.get(i, []):
        x, y, w, h = (round(v * PX) for v in box)
        hot = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
        hot.name = name
        hot.fill.background()
        hot.line.fill.background()
        hot.click_action.hyperlink.address = url
prs.core_properties.title = "Nestlé: France × Japan (static backup of the animated deck, 13 slides)"
prs.save(OUT)
print("wrote", OUT)
