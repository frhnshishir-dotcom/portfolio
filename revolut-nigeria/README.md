# Revolut × Nigeria: a cinematic two-screen intro

A scroll-driven product-launch intro for a **university presentation on Revolut's
hypothetical expansion into Nigeria**. A tall Revolut card stands in the Lagos Lagoon
at golden hour; as the visitor scrolls, the camera pushes in, the card turns to face
them, its edges light up, and it opens into a white portal that reveals the second
screen.

> Student concept. Not affiliated with or endorsed by Revolut Ltd. It does not suggest
> that a Nigerian Revolut card exists. The cardholder name and the masked number
> (`•••• •••• •••• 2048`) are fictional.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build in dist/ (relative paths, any sub-folder)
npm run preview    # serve dist/
npm test           # geometry unit tests (vitest)
```

Stack: Vite, React 19, TypeScript, GSAP 3.15 with ScrollTrigger and ScrollToPlugin,
CSS Modules, Geist and Geist Mono (Fontsource).

## The sequence

1. White preloader. The counter reports **real bytes** streamed for the photograph
   and the card, not files completed.
2. Lagos opens out of the white from the card's position while the camera settles.
3. The card's light switches on: logo, chip, details and the inlay line glow.
4. The headline, copy and navigation arrive. Scrolling is unlocked.
5. Scrolling drives a pinned, scrubbed timeline:
6. the camera pushes in until the card fills two thirds of the screen,
7. the card turns to face the visitor,
8. its edges light up in electric blue,
9. it grows past the edges of the screen as it fills with white light,
10. the white portal reveals the second screen,
11. where the card floats between "Money Without" and "Borders".
12. Scrolling back plays all of it in reverse. The navigation turns from white to ink
    at the moment the portal covers the screen.

With `prefers-reduced-motion`, nothing is pinned or scrubbed: the two screens are
ordinary consecutive sections with fades, and the custom cursor is off.

## How the portal stays on the card

The card in `lagos-hero.webp` is part of the photograph. Four card-sized layers ride
on it: `body`, `face`, `rim` and `fill` (`src/components/Portal`). Each layer is a
540 × 856 element (the card in 0.1 mm units). `src/lib/quad.ts` solves the homography
from that rectangle onto any four screen points and writes it as a CSS `matrix3d`. The
camera, the turn and the expansion only move those four points. The matrix is solved
again every frame (`src/motion/controller.ts`).

The corners come from the replacement image itself, not from the original photograph:

```ts
// src/lib/scene.ts  (image pixels, 4096 × 2640, TL TR BR BL)
export const CARD_CORNERS = [[1737.0, 947.3], [2358.1, 986.5], [2358.1, 2011.9], [1737.0, 2020.0]];
```

`tools/measure_corners.py` fits a line through each straight edge of the card's
front-face matte and intersects the lines (the corners are rounded, so no single
pixel marks a corner). The matte is rendered by the same camera as the composited card.
Fit residuals are under 0.1 px. The measured corners agree with the 3D camera's own
projection to within 0.5 px (`tools/measurements/`).

The card is the anchor of the layout. `src/lib/stage.ts` finds the smallest scale that
covers the viewport while placing the card's true centre (the crossing of its
diagonals) on a chosen point. On-screen alignment is checked in a real browser by
`tools/qa/align.mjs` and `align.py`. At 1440×900, 1920×1080, 2560×1080, 1024×768,
390×844, 360×640 and 844×390, the layer's silhouette matches the photographed card
with IoU ≥ 0.993, area within 0.4 % and centroid within 0.3 px
(`tools/measurements/alignment_report.txt`).

## Assets

| File | What it is | How it is made |
|---|---|---|
| `src/assets/lagos-hero.webp` | 4096 × 2640 hero: the Lekki–Ikoyi Link Bridge at golden hour, with the card standing in the lagoon | Real photograph + Cycles render of the card, composited (below) |
| `src/assets/lagos-hero-2048.webp` | The same frame at half size, used when it stays sharp at the deepest push-in | `tools/build_hero.py` |
| `src/assets/revolut-card.webp` | 1440 × 810 transparent studio render for the second screen | `tools/render_studio.py --webp` |
| `revolut-logo.svg`, `revolut-wordmark.svg`, `revolut-card-logo.svg` | The Revolut wordmark outline (white, ink, and the white printed on the card) | From Wikimedia Commons, `File:Revolut logo.svg` |
| `revolut-card-chip.svg` | Gold contact plate drawn for a portrait card | Hand-made SVG |
| `icon-account.svg`, `icon-plus.svg` | Interface icons | Hand-made SVG |

The card's artwork has a single source, `src/lib/cardFace.ts` with
`src/components/CardFace`. The layout is rasterised into the textures that Blender
puts on the 3D card, and the same component draws the glowing layers in the browser.
That is why the light lines up with the print.

### Rebuilding the images

Needs Node, Python 3 with Pillow and NumPy, and the `bpy` module (`pip install bpy==5.3.0`):

```bash
python tools/fetch_plate.py                    # the photograph -> tools/out/plate.png
npm run dev & node tools/render-face-textures.mjs   # card artwork -> tools/out/face_*.png
python tools/render_hero.py --samples 256      # card in the photograph's camera: beauty, reflection, matte, rim passes
python tools/build_hero.py --write             # composite -> src/assets/lagos-hero*.webp
python tools/measure_corners.py                # -> CARD_CORNERS for src/lib/scene.ts
python tools/render_studio.py --webp           # second-screen card -> src/assets/revolut-card.webp
```

`render_hero.py` rebuilds the photograph's camera: a level camera, the horizon at
row 1836 and a 5000 px focal length. The card therefore stands on the water in true
perspective. Its reflections come from a sky built from the photograph itself. If you
change the plate or the pose, run `measure_corners.py` again and update `scene.ts`.

## QA scripts

Run them against `npm run dev` or `npm run preview`:

```bash
node tools/qa/shoot.mjs http://localhost:5173/ tools/out/qa/desktop 1440 900   # screenshots through the journey
node tools/qa/align.mjs http://localhost:5173/ tools/out/qa/align 1440x900 390x844 && python tools/qa/align.py tools/out/qa/align
node tools/qa/behaviour.mjs http://localhost:4173/ tools/out/qa/behaviour       # buttons, reverse scroll, nav theme, cursor, reduced motion
node tools/qa/preloader.mjs http://localhost:4173/                              # byte progress under a throttled network
```

## Credits and licences

- **Photograph**: "Lekki-ikoyi link bridge" by Ayorinde Ogundele,
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via
  [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lekki-ikoyi_link_bridge.jpg).
  `lagos-hero.webp` and `lagos-hero-2048.webp` are adaptations (a rendered card
  composited in, cropped and graded), so **they are shared under CC BY-SA 4.0 too**.
  The page credits the photographer on the second screen.
- **Revolut wordmark**: from Wikimedia Commons (`File:Revolut logo.svg`), tagged public
  domain there as below the threshold of originality. Revolut is a trademark of
  Revolut Ltd, used here only to identify the subject of a non-commercial student
  concept.
- **Geist and Geist Mono**: SIL Open Font License 1.1.
- **GSAP**: GreenSock's standard no-charge licence.
- Everything else (code, card renders, chip and icons): made for this project.
