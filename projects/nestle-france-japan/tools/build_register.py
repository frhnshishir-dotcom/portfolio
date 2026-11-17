"""Build docs/ASSET_REGISTER.md and scripts/credits.js from tools/commons_register.json.

Run from the project folder:  python3 tools/build_register.py
The Commons metadata (title, author, licence, page) was captured when the files
were downloaded; the notes below add how each image is used and how far its
market relevance was verified.
"""
import json, html, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
reg = json.load(open(os.path.join(HERE, "commons_register.json"), encoding="utf-8"))

# id -> (slide(s), market relevance, verification status / note, project file(s))
NOTES = {
 "paris_bluehour": ("1", "France", "Verified location: Pont des Invalides, Paris.", "images/paris_bluehour.webp"),
 "tokyo_bluehour": ("1", "Japan", "Verified location: Minato City, Tokyo (Tokyo Tower).", "images/tokyo_bluehour.webp"),
 "kk_red_wrapper": ("2, 6", "Global (UK pack)", "Genuine KitKat four-finger bar in the red wrapper, photographed in the UK (2008 'only 107 calories' pack). It is used only as a global brand icon on slides 2 and 6 and is never labelled as French.", "images/cut/kk_red_wrapper.webp (cut-out; enclosed holes in the foil mask filled with the photo's own pixels)"),
 "kk_split": ("3", "France (product form)", "Genuine classic four-finger KitKat, unwrapped and photographed in the US. The classic bar is the core of the French range. French packaging is not pictured.", "images/cut/kk_split.webp (cut-out)"),
 "kk_opened": ("3", "France (product form)", "Genuine KitKat wafer cross-section, photographed in the US. Used as a chocolate close-up.", "images/cut/kk_opened.webp (cut-out)"),
 "kkjp_ujimatcha_box": ("3", "Japan", "Genuine Japanese pack: KitKat Uji Matcha box (日本土産 = 'Japan souvenir').", "images/cut/kkjp_ujimatcha_box.webp (cut-out)"),
 "kkjp_matcha_wrap": ("3", "Japan", "Genuine Japanese matcha KitKat (Otona no Amasa line) with wrapper.", "images/cut/kkjp_matcha_wrap.webp (cut-out)"),
 "kkjp_sakura_split": ("3", "Japan", "Genuine KitKat Sakura Matcha, a Japanese seasonal flavour.", "images/cut/kkjp_sakura_split.webp (cut-out)"),
 "kkjp_chocolatory": ("3", "Japan", "Verified location: KitKat Chocolatory boutique, Shibuya, Tokyo.", "images/kkjp_chocolatory.webp"),
 "fr_cafe_tournesol": ("3", "France", "Verified location: Café Le Tournesol, rue de la Gaîté, Paris.", "images/fr_cafe_tournesol.webp"),
 "fr_cafe_standre": ("4", "France", "Verified location: place Saint-André-des-Arts, Paris.", "images/fr_cafe_standre.webp"),
 "nes_red_mug": ("2, 4, 6", "Global", "Genuine Nescafé red mug: the logo is printed on the cup, so it has the cup's real curvature and light. On slide 4 it is the hero cup the coffee is poured into.", "images/cut/nes_red_mug.webp (cut-out)"),
 "pour_moka": ("4", "Brand-neutral", "Real photograph of coffee poured from a moka pot. Split into pot and stream layers and composited so the stream falls into the Nescafé mug. The pot is unbranded.", "images/cut/pour_pot.webp + images/cut/pour_stream.webp (cut-outs, composite)"),
 "nes_cafe_au_lait": ("4", "France (habit)", "Genuine Nescafé-branded cup with café au lait. The country where it was taken is not stated, so it illustrates the habit only.", "images/nes_cafe_au_lait.webp"),
 "nes_dg_capsules": ("4", "France (product)", "Genuine Nescafé Dolce Gusto capsules, photographed in Spain. Dolce Gusto is sold in France.", "images/cut/nes_dg_capsules.webp (cut-out)"),
 "nesjp_genio_home": ("4", "Japan", "Genuine Nescafé Dolce Gusto Genio, photographed in a home in Japan (Japanese uploader and caption).", "images/nesjp_genio_home.webp"),
 "nesjp_vending": ("4", "Japan", "Genuine Nescafé vending machine in Japan (Commons category 'Nescafé vending machines in Japan'). Only the 330 px preview could be downloaded, so it is shown small.", "images/nesjp_vending_330.webp"),
 "jp_shinjuku": ("4", "Japan", "Verified location: Shinjuku Station South, Tokyo.", "images/jp_shinjuku.webp"),
 "maggi_fr_tin": ("5", "France", "Genuine Maggi France 'Bouillon gras' tin (historic). It is the hero product of slide 5.", "images/cut/maggi_fr_tin.webp (cut-out)"),
 "maggi_fr_kub": ("5", "France", "Genuine historic Bouillon Kub tin, made by SISA, the Maggi company's French successor.", "images/cut/maggi_fr_kub.webp (cut-out)"),
 "maggi_bottle": ("2, 6", "Global", "Genuine Maggi seasoning bottle (German 'Würze' label, 2023). Used as a global brand icon only, with no market claim.", "images/cut/maggi_bottle.webp (cut-out)"),
 "food_fr_potaufeu_ingr": ("5", "France (dish)", "Pot-au-feu ingredients. Brand-neutral food context.", "images/food_fr_potaufeu_ingr.webp"),
 "food_jp_potofu": ("5", "Japan", "Japanese home-style potofu (Japanese uploader: 'ソーセージ入りポトフ'). Brand-neutral food context.", "images/food_jp_potofu.webp"),
 "food_jp_consomme": ("5", "Japan", "Pot-au-feu made with consommé (Japanese uploader). Brand-neutral food context.", "images/food_jp_consomme.webp"),
 "ing_carrot": ("5", "Ingredient", "Real photograph of carrots (Evan-Amos), cropped and cut out.", "images/cut/ing_carrot.webp"),
 "ing_onion": ("5", "Ingredient", "Real photograph of an onion.", "images/cut/ing_onion.webp"),
 "ing_bay": ("5", "Ingredient", "Real photograph of bay leaves; one leaf cropped.", "images/cut/ing_bay.webp"),
 "ing_bouquet": ("5", "Ingredient", "Real photograph of a bouquet garni, the classic pot-au-feu herb bundle.", "images/cut/ing_bouquet.webp"),
 "ing_leek_real": ("5", "Ingredient", "Real photograph of a leek; the stalk and lower leaves are cropped. It replaced an AI-generated leek that was caught in review.", "images/cut/ing_leek.webp"),
 "ing_garlic": ("5", "Ingredient", "Real photograph of a garlic bulb and clove.", "images/cut/ing_garlic.webp"),
 "logo_nestle": ("1, 6", "Global", "Nestlé wordmark (public-domain text logo), recoloured to soft white.", "logos/logo_nestle_white.svg"),
 "logo_kitkat": ("2", "Global", "KitKat logo.", "logos/logo_kitkat.svg"),
 "logo_nescafe": ("2", "Global", "Nescafé logo (2014), recoloured to soft white.", "logos/logo_nescafe_white.svg"),
 "logo_maggi": ("2", "Global", "Maggi logo.", "logos/logo_maggi.png"),
}

# logos fetched directly (not in the downloader's register)
EXTRA = {
 "logo_nestle": {"title": "File:Nestlé textlogo.svg", "license": "Public domain", "author": "Nestlé (trademark)", "page": "https://commons.wikimedia.org/wiki/File:Nestl%C3%A9_textlogo.svg"},
 "logo_kitkat": {"title": "File:Logo of the KitKat.svg", "license": "Public domain", "author": "Nestlé (trademark)", "page": "https://commons.wikimedia.org/wiki/File:Logo_of_the_KitKat.svg"},
 "logo_nescafe": {"title": "File:Nescafé logo 2014.svg", "license": "Public domain", "author": "Nestlé (trademark)", "page": "https://commons.wikimedia.org/wiki/File:Nescaf%C3%A9_logo_2014.svg"},
 "nesjp_vending": {"title": "File:NESCAFE (96552190).jpg", "license": "CC BY 2.0", "author": "Bit Boy", "page": "https://commons.wikimedia.org/wiki/File:NESCAFE_(96552190).jpg"},
}
for k, v in EXTRA.items():
    reg.setdefault(k, {}).update({kk: vv for kk, vv in v.items() if kk not in reg.get(k, {})})

rows = []
for k, (slides, market, note, path) in NOTES.items():
    r = reg.get(k, {})
    rows.append(dict(id=k, slides=slides, market=market, note=note, path=path, title=r.get("title", "")[5:],
                     author=(r.get("author") or "").strip().replace("\n", " ")[:80], license=r.get("license", ""), page=r.get("page", "")))

md = ["# Asset register", "",
      "Every photograph comes from Wikimedia Commons, under the licence shown. None of the original deck's AI-generated images was kept, and every author line was screened for AI-generation markers (see the quality report).",
      "Official Nestlé, KitKat, Nescafé and Maggi websites could not be reached from the build environment, so no packshots were taken from them.",
      "", "Cut-outs were made with rembg (isnet-general-use). The slide-4 pour is a composite of two real photographs. CC BY-SA adaptations are shared under the same licence.", "",
      "| Asset | Slides | Market | Verification / note | Licence | Author | Source |", "|---|---|---|---|---|---|---|"]
for r in rows:
    md.append(f"| `{r['path']}` | {r['slides']} | {r['market']} | {r['note']} | {r['license']} | {r['author']} | [{r['title']}]({r['page']}) |")
open(os.path.join(ROOT, "docs", "ASSET_REGISTER.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")

used = [r for r in rows if r["slides"] != "—"]
js = "/* Generated by tools/build_register.py — image credits shown in the deck. */\n(function () {\n  const credits = " + json.dumps(
    [dict(t=r["title"], a=r["author"], l=r["license"], u=r["page"], s=r["slides"]) for r in used], ensure_ascii=False, indent=1) + """;
  document.addEventListener("DOMContentLoaded", function () {
    const ol = document.getElementById("credits-list");
    if (!ol) return;
    credits.forEach(function (c) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = c.u; a.target = "_blank"; a.rel = "noopener"; a.textContent = c.t;
      li.appendChild(a);
      li.appendChild(document.createTextNode(" — " + (c.a || "unknown") + " · " + c.l + " · slide " + c.s));
      ol.appendChild(li);
    });
  });
})();
"""
open(os.path.join(ROOT, "scripts", "credits.js"), "w", encoding="utf-8").write(js)
print(len(rows), "assets;", len(used), "credited")
