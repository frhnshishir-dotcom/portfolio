# Nestlé: France × Japan, animated presentation

A cinematic, six-slide, full-screen presentation comparing how Nestlé adapts **KitKat**, **Nescafé** and **Maggi** to France and Japan.
It enhances `source/NESTLE-FRANCE-JAPAN_original.pptx`, which is kept unchanged and read-only.
It is ready for six analytical slides to be inserted later (`docs/ADDING_SLIDES.md`).

![Opening slide](docs/screenshots/slide-1.jpg)

## Launch

Everything is local: images, fonts and GSAP. No internet is needed in the classroom.

- **Windows:** double-click **`Start Presentation.bat`**, or open `index.html` in Chrome or Edge.
- **macOS / Linux:** run `./start-presentation.sh`. It serves the folder on `http://localhost:8000` and opens it.
- **Any OS:** opening `index.html` directly also works.
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

- A second press during a transition is ignored, so a double tap never skips a slide.
- Pressing → while a slide is still animating completes it and moves on.
- The control bar (bottom right) appears when you move the mouse. It has progress, previous/next, replay, **Reduce motion**, image credits and full screen.
- Link to a slide by name or number: `index.html#nescafe` or `index.html#4`.

## The six slides

| # | id | Direction | What happens |
|---|---|---|---|
| 1 | `opening` | Cinematic opening | Darkness, then Paris and Tokyo arrive from opposite sides, a light sweeps down the glass seam, a smoked-glass title plate comes from the foreground, and the title appears in stages. **Exit:** the plate expands toward the camera. |
| 2 | `portfolio` | Interactive product exhibition | A dark showroom with a central hero (KitKat) and two supporting products. Selecting a brand swaps positions, lighting and caption. **Exit:** KitKat rushes forward into a red bloom. |
| 3 | `kitkat` | 3D-style product battle | French and Japanese KitKat silhouettes advance from opposite sides, catch red and matcha light, face off, then the camera pulls back to the café and the Chocolatory. |
| 4 | `nescafe` | Cinematic coffee experience | A real coffee pour into a genuine Nescafé mug (logo printed on the cup), with steam and a push-in on the logo. The camera then pulls back to the comparison, and the mug stays as the anchor. |
| 5 | `maggi` | Product showcase | The Maggi France tin emerges into gold light, and real ingredients arc around it and settle beside the French tins. On the Japan side, potofu and Maggi Bouillon. |
| 6 | `finale` | Premium minimalist finale | Charcoal and one spotlight. Three brands lit one at a time, the statement in two beats with a single light sweep, the Nestlé logo, then a slow pull-back that stops. |

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
scripts/credits.js          generated image credits
slides/slide-0N.js          one module per slide: reset() · enter() → timeline · idle() · stop()
slides/split-kit.js         reusable France × Japan comparison choreography (for future analytical slides)
styles/global.css           tokens, scaled stage, FX layer, control bar
styles/glass.css            smoked-glass system (chip, caption, divider, plate; animated edge light)
styles/slides.css           shared typography and the France × Japan split layout
styles/scenes.css           the cinematic layers of each slide
assets/                     WebP photos and cut-outs, logos, fonts (all local)
docs/                       screenshots, walkthrough.mp4, QUALITY_REPORT.md, ASSET_REGISTER.md, ADDING_SLIDES.md
NESTLE-FRANCE-JAPAN_redesign_static.pptx   static fallback (final frames + speaker notes)
source/                     original PowerPoint, unmodified
tools/                      rebuild scripts for the asset register / credits and the static PowerPoint
```

## Rebuilding generated files

```
python3 tools/build_register.py   # docs/ASSET_REGISTER.md + scripts/credits.js
python3 tools/build_pptx.py       # static PowerPoint from docs/screenshots (needs python-pptx)
```

## The static PowerPoint

`NESTLE-FRANCE-JAPAN_redesign_static.pptx` holds the six final frames, with speaker notes and alt text.
It is a fallback for a room with no browser. **None of the HTML animation, transitions or interaction carries over to PowerPoint**,
and its slides are images, not editable text.

## Credits and licences

- Photographs: Wikimedia Commons, listed with authors and licences in `docs/ASSET_REGISTER.md` and in the deck's credits panel.
  Cut-outs and the slide-4 pour composite are adaptations, and CC BY-SA adaptations are shared under the same licence.
- Logos are trademarks of Société des Produits Nestlé S.A., used for academic analysis.
- Fonts: Bodoni Moda, Manrope and Noto Serif JP, under the SIL Open Font License (`assets/fonts/OFL-*.txt`).
- Animation: [GSAP](https://gsap.com) 3.12.5, under GreenSock's standard no-charge licence.
