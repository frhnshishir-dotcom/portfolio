# Nestlé: France × Japan, animated presentation

A full-screen, 13-slide presentation comparing how Nestlé adapts **KitKat**, **Nescafé** and **Maggi** to France and Japan.
- **Six cinematic brand scenes**, each approved as is.
- **Six analytical slides:** market context, packaging, pricing, distribution, advertising and key findings.
- **A video slide** with two official KitKat ads, one from France and one from Japan (`docs/VIDEOS.md`).

It enhances `source/NESTLE-FRANCE-JAPAN_original.pptx`, which is kept unchanged and read-only.

![Opening slide](docs/screenshots/slide-1.jpg)

## Launch

Everything is local: images, fonts and GSAP. **The only exception is the two YouTube ads on slide 11, which need internet.**

- **Windows:** double-click **`Start Presentation.bat`**.
  - If Python is installed, it serves the deck on `http://localhost:8000`, so the ads play inside the slide.
  - Without Python, it opens `index.html` directly, and the ads open on YouTube in a new tab.
- **macOS / Linux:** run `./start-presentation.sh`. It serves the folder on `http://localhost:8000` and opens it.
- **Any OS:** opening `index.html` directly also works, but the ads then open on YouTube instead of playing in the slide.
  YouTube refuses players on pages opened from disk; see `docs/VIDEOS.md`.
- **Before presenting:** play each ad once on the presentation laptop, with sound.
- **iPad:** iPadOS cannot run a local `index.html` from the Files app, so open the deck from a web link (a hosted copy) in Safari.
  For true full screen, choose Share → **Add to Home Screen**, then launch it from the home-screen icon. On touch screens:
  - tap anywhere to advance, and tap the left edge to go back (swipes work too);
  - products and tabs keep their own tap behaviour;
  - the control bar stays faintly visible.

Press **F** for full screen. The deck is authored on a 1920×1080 canvas and scales to any 16:9 screen; other shapes are letterboxed, never clipped.
For the smoothest motion, use Chrome or Edge with hardware acceleration on.

| Key / input | Action |
|---|---|
| → · Space · Page Down | Next slide |
| ← · Page Up | Previous slide |
| Home · End | First · last slide |
| F | Toggle full screen |
| Esc | Close the credits panel; otherwise leave full screen |
| R | Replay the current slide's animation from the start |
| Swipe left / right | Next / previous (touch screens) |
| Slide 2: click a product or a brand tab | Bring that brand to the hero position (pointer, touch or keyboard) |
| Slide 11: click a video poster (or Tab to it, then Enter) | Play that ad. Nothing autoplays. Leaving the slide stops it. |

- A second press during a transition is ignored, so a double tap never skips a slide.
- Pressing → while a slide is still animating completes it and moves on.
- The control bar (bottom right) appears when you move the mouse. It has progress, previous/next, replay, **Reduce motion**, image credits and full screen.
- Link to a slide by name or number: `index.html#nescafe` or `index.html#5`.
- After clicking inside a video player, ← → still change slides. Pause the video with the mouse.

## The 13 slides

The order lives in `scripts/deck.config.js`.
- Slides 1, 2, 4, 5, 6 and 13 are the approved cinematic scenes, unchanged.
- Slides 3 and 7–12 are the analytical pages, including the video slide.

| # | id | Direction | What happens |
|---|---|---|---|
| 1 | `opening` | Cinematic opening | Darkness, then Paris and Tokyo arrive from opposite sides, a light sweeps down the glass seam, a smoked-glass title plate comes from the foreground, and the title appears in stages. **Exit:** the plate expands toward the camera. |
| 2 | `portfolio` | Interactive product exhibition | A dark showroom with a central hero (KitKat) and two supporting products. Selecting a brand swaps positions, lighting and caption. **Exit:** KitKat rushes forward into a red bloom. |
| 3 | `context` | Market context | “Two markets. Different routes to relevance.” KitKat, Nescafé and Maggi lanes: France facts, an interpretation node and Japan facts, with the insight that category and occasion matter, not stereotypes. **Exit:** the KitKat lane opens into a red iris. |
| 4 | `kitkat` | 3D-style product battle | French and Japanese KitKat silhouettes advance from opposite sides, catch red and matcha light, face off, then the camera pulls back to the café and the Chocolatory. |
| 5 | `nescafe` | Cinematic coffee experience | A real coffee pour into a genuine Nescafé mug (logo printed on the cup), with steam and a push-in on the logo. The camera then pulls back to the comparison, and the mug stays as the anchor. |
| 6 | `maggi` | Product showcase | The Maggi France tin emerges into gold light, and real ingredients arc around it and settle beside the French tins. On the Japan side, potofu and Maggi Bouillon. |
| 7 | `packaging` | Packaging | “One brand identity. Locally relevant packaging.” Two panels: a France label-anatomy schematic (EU and French language rules), and the real KitKat Uji Matcha box with its Japanese cues. In the middle, what to standardise and what to localise. |
| 8 | `pricing` | Pricing method | “Comparing value, not just shelf price.” Four steps on a hairline, plus what to compare per brand. **No prices are shown**: no comparable, dated data has been collected. |
| 9 | `distribution` | Channel map | “Reaching consumers in the right place.” A qualitative brand × channel matrix (FR / JP / recommended), with no shares implied. |
| 10 | `advertising` | Communication | “Translate the meaning, not just the slogan.” Observed examples for KitKat Japan, Nescafé Japan and Maggi France, plus creative rules (recommendations). |
| 11 | `ads` | **Two official ads (video)** | “Same brand. Two cultural codes.” KITKAT France “Better Breaks” and Nestlé Japan's “キット、サクラサクよ”, as click-to-play YouTube players. Each has its market, context, contrast and lesson. |
| 12 | `findings` | Key findings | “Global platform. Local execution.” Three numbered pillars, then the closing line: standardise recognition, localise relevance, measure growth. |
| 13 | `finale` | Premium minimalist finale | Charcoal and one spotlight. Three brands lit one at a time, the statement in two beats with a single light sweep, the Nestlé logo, then a slow pull-back that stops. |

**Analytical slides:**
- Each marks what is **observed** (green), **interpretation** (amber) and **recommendation** (pink).
- Each has a source note at the bottom.
- Their transitions are short and share one motif: a fine hairline (`scripts/transitions.js`).

## Project structure

```
index.html                  all slides (semantic HTML; text stays real text)
Start Presentation.bat      Windows launcher · start-presentation.sh  macOS/Linux launcher
scripts/deck.config.js      THE slide order (ids) — edit this to insert analytical slides
scripts/navigation.js       state machine: one transition at a time, resets on arrival, replay
scripts/transitions.js      id-pair transitions + neutral glass-sheet fallback + reduced-motion dissolve
scripts/animations.js       motion tokens and reusable GSAP blocks (word masks, glass materialise, product entrances)
scripts/interactions.js     keyboard, full screen, reduced motion, credits, swipe, control bar
scripts/main.js             boot: stage scaling, preloading, headline fitting, start slide from URL
scripts/credits.js          generated image and video credits
slides/slide-0N.js          one module per slide: reset() · enter() → timeline · idle() · stop()
slides/split-kit.js         reusable France × Japan comparison choreography
slides/analysis-kit.js      the analytical slides: declarative entrances (data-a / data-t) + NFJ.video, the click-to-play ad players
styles/global.css           tokens, scaled stage, FX layer, control bar
styles/glass.css            smoked-glass system (chip, caption, divider, plate; animated edge light)
styles/slides.css           shared typography and the France × Japan split layout
styles/scenes.css           the cinematic layers of each slide
styles/analysis.css         the analytical pages (grids, tags, source notes, video cards)
assets/                     WebP photos and cut-outs, logos, fonts, video posters (all local)
docs/                       screenshots, walkthrough.mp4, QUALITY_REPORT.md, ASSET_REGISTER.md, VIDEOS.md, ADDING_SLIDES.md
NESTLE-FRANCE-JAPAN_redesign_static.pptx   static fallback (final frames + speaker notes)
source/                     original PowerPoint, unmodified
tools/                      rebuild scripts: asset register / credits, static PowerPoint, Japanese font subsets
```

## Rebuilding generated files

```
python3 tools/build_register.py   # docs/ASSET_REGISTER.md + scripts/credits.js
python3 tools/build_pptx.py       # static PowerPoint from docs/screenshots (needs python-pptx)
python3 tools/subset_jp_fonts.py <fontsource noto-serif-jp package>   # after changing Japanese text
```

## The static PowerPoint

`NESTLE-FRANCE-JAPAN_redesign_static.pptx` holds the 13 final frames, with speaker notes and alt text.
On slide 11, clicking a video poster in Slide Show opens that ad on YouTube. The URLs are also in the notes.
It is a fallback for a room with no browser. **None of the HTML animation, transitions or interaction carries over to PowerPoint**,
and its slides are images, not editable text.

## Credits and licences

- Photographs: Wikimedia Commons, listed with authors and licences in `docs/ASSET_REGISTER.md` and in the deck's credits panel.
  Cut-outs and the slide-5 pour composite are adaptations, and CC BY-SA adaptations are shared under the same licence.
- Videos: official uploads by KITKAT France and Nestlé Japan on YouTube, played with YouTube's player after a click and never downloaded.
  The posters are the videos' own YouTube thumbnails (`docs/VIDEOS.md`).
- Logos are trademarks of Société des Produits Nestlé S.A., used for academic analysis.
- Fonts: Bodoni Moda, Manrope and Noto Serif JP, under the SIL Open Font License (`assets/fonts/OFL-*.txt`).
- Animation: [GSAP](https://gsap.com) 3.12.5, under GreenSock's standard no-charge licence.
