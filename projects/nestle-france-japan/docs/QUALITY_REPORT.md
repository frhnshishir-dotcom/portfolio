# Quality report (v2: cinematic enhancement)

## 1. Starting point

**The original PowerPoint** (`source/`, unchanged, SHA-256 `5ebcfe1c…a122ac0cd`) was a Gamma export with six slides.

- Every image in it was AI-generated, with invented packaging ("Klagii", "KitKet", "NESFFEE") and coffee pots on the Maggi slide.
- Two headlines were clipped: "ONE COFFE…" on slide 4 and "ADAPT LOCALL…" on slide 6.
- Its text, structure and dark direction are the authoritative content and are preserved.
- Its imagery is not used, because the brief forbids invented packaging and inaccurate AI designs.

**v1** (commit `b3242d9`) replaced all imagery with authentic Wikimedia Commons photographs and built the HTML deck. v2 keeps those assets and compositions and adds:

- the locked cinematic directions for each slide;
- connected transitions;
- an id-based architecture ready for 12 slides.

## 2. What changed in v2

| Slide | Locked direction | Implementation |
|---|---|---|
| 1 | Dynamic, premium glass, dramatic | The timeline follows the brief: darkness and silhouettes (0–0.8 s); the cities arrive from opposite sides on separate camera moves (0.8–2.0 s); a light sweeps the glass seam (1.5–2.6 s); the smoked-glass plate arrives from the foreground, from perspective depth Z = 520 px with a slight tilt (2.2–3.5 s); masked title stages (3.0–4.5 s). Stable state: only faint motes and very slow drift. |
| 2 | Product exhibition, central hero, 3D-style movement | A dark showroom with perspective, a floor, reflections and brand-coloured light. The hero is centred at full size; supporting products sit at 60% scale, rotated ±16°, dimmed and set back. Selecting a brand (product, tab or keyboard) moves it to centre while the previous hero takes the vacated slot, in one 0.95 s arc. Lighting, tab highlight and caption follow. KitKat is hero on every arrival. |
| 3 | 3D product battle | A dark stage with silhouettes. France enters from the left and Japan from the right, then red and matcha rim light catch them and they briefly face off near the centre. The camera pulls back to reveal the original café and Chocolatory comparison. The products are flat photographic layers, never distorted. |
| 4 | Cinematic coffee | A real moka-pot pour (CC0 photo, split into pot and stream layers) pours into the **genuine Nescafé mug**, whose logo is printed on the cup itself. The stream is revealed top to bottom and disappears behind the rim. Then steam, a push-in toward the logo, and a pull-back where the mug becomes the centre anchor between Paris and Tokyo. |
| 5 | Product showcase | The Maggi France tin emerges from darkness into warm gold light. Real ingredient photographs (carrot, leek, onion, garlic, bay, bouquet garni) travel in coordinated elliptical arcs, with depth scaling, around it. All settle around the French tins; Japan shows potofu and the Maggi Bouillon identifier. |
| 6 | Premium minimalist finale | Charcoal and a spotlight. Silhouettes are lit one at a time; then two-beat statement, one light sweep, Nestlé logo, and a 6 s pull-back that then **stops** (no idle loops). |

**Transitions** run 0.9–1.5 s and are keyed by slide-id pairs:
- the plate grows toward the camera and becomes the showroom;
- KitKat comes forward inside a soft red bloom;
- chocolate red warms into coffee;
- coffee vapour rises into gold;
- the Maggi set recedes into darkness;
- any other pair, including back and jump navigation, uses a frosted-glass sheet.

**Architecture**:
- Slide order lives only in `scripts/deck.config.js`, and slides register by id.
- The counter, progress bar, ARIA labels and URL hashes follow the sequence.
- A second press during a transition is ignored, so there is no double navigation.
- Every arrival resets its slide, and **R** replays it.

## 3. Asset accuracy

- **Removed during QA:** a leek image whose Commons author is "Craiyon algorithm" (AI-generated). It was replaced with a real photograph, and every register entry was then screened for AI-generation markers (none left).
  The walkthrough video was re-recorded after the swap.
- **Nescafé cup:** the brief's mandatory logo-on-cup is met with a photograph of a real Nescafé mug. There is no overlaid or warped logo.
- **Pour:** a composite of two real photographs. The pot is unbranded, and no fluid was simulated.
- **Red KitKat pack** (slides 2 and 6): genuine, but a UK pack (2008). It is used only as a global brand icon and never labelled as French.
- **Maggi Japan:** confirmed by Nestlé Japan press releases (Maggi Bouillon sold in Japan; introduced in 1927 for hotel chefs). No Japanese pack photo could be verified, so none is shown, and the slide says so.
- Full source, licence and verification notes for every image are in `docs/ASSET_REGISTER.md`.

## 4. Verification (headless Chromium, Playwright)

- **Every slide** was captured initial → mid-animation → settled → exit → return.
  Exact intermediate states were checked by pausing the GSAP timelines and seeking to precise times.
- **Settled frames at 1920×1080:** a rendered-text-bounds check found no clipped text on any slide and no horizontal overflow.
  The only flag is the decorative sweep element inside the slide 6 headline, which is masked by the headline box.
- **Slide 2 interaction:** product click and tab click both swap correctly; ARIA states update; leaving with Maggi as hero first brings KitKat forward.
- **Navigation:**
  - a double press of → moved exactly one slide;
  - returning to slides 5, 4, 3 and 2 rebuilt them cleanly, with KitKat restored as hero;
  - **R** replays the current slide.
- **Interleaving test:** a dummy analytical slide injected between KitKat and Nescafé:
  - the deck became 7 slides ("4 / 7", `#packaging`, "Slide 4 of 7");
  - the glass-sheet fallback was used in both directions;
  - a missing id was skipped with a console warning.
- **Other checks:**
  - reduced motion (OS setting) gives instant stable compositions and 0.4 s dissolves;
  - 1366×768, 2560×1440 and 1280×1024 letterbox with no scroll;
  - `file://` loads all fonts, including the Japanese glyphs;
  - no console or page errors in any run.
- **Bugs found and fixed during QA:**
  - the 3D stage layer was blocking clicks on the brand tabs;
  - the KitKat face-off overlapped and its silhouettes were unreadable;
  - the red iris had a hard edge (now a soft radial mask);
  - the leek overlapped a caption;
  - the finale products were undersized;
  - the AI-generated leek (see above).
- **Deliverables checked:**
  - `docs/walkthrough.mp4`: 44.6 s, 1280×720, H.264, full decode (1,339 frames) with no errors.
  - Static PowerPoint: 6 slides, renders in LibreOffice.

## 5. Needs manual review

1. **Official packshots.** Official Nestlé, KitKat, Nescafé and Maggi sites were unreachable from the build environment. Swapping in official packshots would raise sharpness and market accuracy, especially:
   - the French KitKat pack (currently an unwrapped classic bar);
   - current French Maggi / Kub packaging (currently historic tins);
   - a current Japanese Maggi Bouillon pack (currently not shown).
2. **UK KitKat wrapper** on slides 2 and 6. It is authentic but from 2008 ("only 107 calories"). A current KitKat pack photo would be preferable if you have one you're allowed to use.
3. **Maggi bottle** on slides 2 and 6 has a German "Würze" label. It is fine as a global icon; replace it if your tutor expects French-market packaging.
4. **Nescafé vending machine** is only a 330 px preview (the original was rate-limited), so it is shown small.
5. **Facts to confirm with your own sources before presenting:**
   - "Kitto Katsu" good-luck gifting;
   - Dolce Gusto's popularity in France;
   - Gold Blend and home machines in Japan;
   - Maggi in Japanese hotel kitchens since 1927 (from Nestlé Japan's 2025 press release).
6. **Performance:** backdrop blur and large images are GPU work. On an older laptop, rehearse once in the actual room's browser; if a transition stutters, turn on **Reduce motion**.
7. **The six analytical slides** are not created (by design). See `docs/ADDING_SLIDES.md`.

## 6. Asset upgrade: approved test-batch candidates A2, B1 and C2

**What changed.** Only image sources were changed. The animation system, timing and layouts are untouched (no JS change).

- **Hero packshots** now load 4× Real-ESRGAN upscales from `assets/images/hd/`. Each keeps its original aspect ratio within 0.15%, so every layout and animation coordinate is unchanged.

  | Product | Used on slides |
  |---|---|
  | KitKat red wrapper | 2, 6 |
  | KitKat classic bar | 3 |
  | Nescafé mug | 2, 4, 6 |
  | Maggi bottle | 2, 6 |
  | Maggi France tin | 5 |

- **Opening stage layers** now hold the approved studio sets as full-bleed plates:

  | Layer | Slide | Plate |
  |---|---|---|
  | `.s3-dark` | KitKat face-off | A2 chocolate set with red bokeh |
  | `.s4-warm` | coffee pour | B1 roasted beans in amber light |
  | `.s5-dark` | Maggi showcase | C2 red-to-gold set with bokeh |

  The plates are inline `<img>` elements, so the existing preloader decodes them before any transition.

**Packaging fidelity.** As placed, the packshots match their sources at SSIM 0.90–0.98. Nothing on the packaging was generated.

**Checks after the swap:**
- settled screenshots of all six slides: no clipped text;
- the three openings at exact times;
- no console errors;
- a before/after crop at 2× pixel density showing cleaner edges and labels.

**Still open:**
- In the Maggi showcase, the orbiting onion passes in front of the tin's "Bouillon gras" label for about a second. This existed before the swap and was left alone because the animation was frozen for this phase. Shifting the onion's orbit would fix it.
- The 2008 KitKat wrapper photo is the remaining quality ceiling. A sharp, evenly lit packshot of a current pack would lift slides 2 and 6 the most.
