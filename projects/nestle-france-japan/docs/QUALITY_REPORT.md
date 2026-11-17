# Quality report

## 1. What the original deck contained

`source/NESTLE-FRANCE-JAPAN_original.pptx` was a Gamma export: six slides, a dark navy theme and a "Made with Gamma" badge on every slide.
I inspected it by rendering every slide and pulling every media file.

| Slide | Problems found |
|---|---|
| 1 | The Paris/Tokyo background was an AI-generated composite, with a large AI-generated chocolate wrapper in the foreground that covered the title area. |
| 2 | Three small identical thumbnails (936×531). All three were AI-generated with **fake packaging** (a KitKat bar beside a coffee pot, and a "Maggi" pouch with an invented design). |
| 3 | Both images were AI-generated near-identical scenes (cup + coffee pot + bar). Neither showed real French or Japanese KitKat products. |
| 4 | The headline was clipped ("ONE COFFE…"). The images were AI-generated with **misspelled packaging** ("NESFFEE"). |
| 5 | The images were AI-generated with **coffee pots and chocolate on a Maggi slide** and no real Maggi product. |
| 6 | The headline was clipped ("ADAPT LOCALL…"). The image was AI-generated with fabricated packs ("Klagii", "KitKet"). |

None of the original imagery was authentic, so **none of it was kept**. The text, six-slide structure, headlines and dark direction were preserved.

## 2. What replaced it

All photographs are real photographs from Wikimedia Commons, with author, licence and source recorded in `docs/ASSET_REGISTER.md`.
They are graded in CSS to one dark, warm cinematic look. Product photos were cut out with rembg and layered over the scenes with contact shadows.

| Slide | New visual story |
|---|---|
| 1 | Paris at blue hour (Eiffel Tower, Pont des Invalides) and Tokyo at blue hour (Tokyo Tower), joined by a diagonal sheet of glass. The two towers rhyme across the seam. A dark glass title plate carries the Nestlé wordmark and title. |
| 2 | An exhibition of three tall brand worlds. Each has a brand photograph, a cut-out hero product, the real logo and a glass label. Click or tap one to open its France / Japan comparison. |
| 3 | France: a Paris café terrace with the classic four-finger bar, plus a wafer close-up in the foreground. Japan: the KitKat Chocolatory in Shibuya, with the **Uji Matcha gift box**, a **matcha bar** (Otona no Amasa) and **Sakura Matcha**, all genuine Japanese products. |
| 4 | France: a Paris terrace, café au lait in a Nescafé cup with CSS steam, and Dolce Gusto capsules. Japan: Shinjuku at night, a **Dolce Gusto Genio in a Japanese home**, and a **Nescafé vending machine in Japan**. |
| 5 | France: pot-au-feu ingredients, with the **Maggi France "Bouillon gras"** and **Bouillon Kub** tins. Japan: a Japanese home-style potofu and consommé pot-au-feu, with a glass identifier "マギー ブイヨン · Maggi Bouillon". |
| 6 | Paris and Tokyo meet behind one table: a Nescafé mug, a Maggi bottle, a classic KitKat and a Japanese matcha KitKat. The two-beat statement sits on a single glass surface, then the camera pulls back to the Nestlé wordmark. |

## 3. Accuracy notes (read before presenting)

- **Maggi in Japan is real but not pictured.** Nestlé Japan press releases (2019 price change, 2023 allergen note, 2025 "Chef Magic" launch) confirm
  that **Maggi Bouillon** is sold in Japan, and that Maggi was introduced there in 1927 for hotel chefs. No licensable photo of the current Japanese pack
  could be verified, so the slide shows Japanese potofu instead and says so in a footnote.
- **The French Maggi packs are historic tins**, and the caption says so. No licensable photo of current French Maggi or Kub packaging was found.
- **The French KitKat is the product, not French packaging.** The classic four-finger bar is shown unwrapped (photographed in the US).
  Its form is the same as the classic bar sold in France, and no claim is made about the pack.
- **The Dolce Gusto capsules on slide 4** were photographed in Spain. The caption describes the French habit and does not claim a French photo.
- **The Maggi bottle** (slides 2 and 6) carries a German "Würze" label. It is used as a global brand icon only.
- **Nescafé Japan**: Gold Blend is confirmed on Japanese retail listings. The Genio photo and the vending machine are from Japan.
- **Not done**: official Nestlé, KitKat, Nescafé and Maggi websites were unreachable from the build environment, so no official packshots were used.
  If you have access, swapping in official French and Japanese packshots for Maggi and the French KitKat would strengthen slides 3 and 5.
- No AI-generated imagery or invented packaging is used anywhere.

## 4. Glass system

Glass is reserved for the functional layer: city and market labels, product captions, the Maggi identifier, the title plates, the seam and the dividers, and the controls.
Photographs and products are never placed inside glass.

- The deep tint (`--tint` 0.55–0.6) is used where text is read. The near-clear tint is used only for framing.
- Each surface has an 18 px backdrop blur with 150% saturation, a fine 1 px border ring, an inner top highlight and a soft drop shadow.
- **Motion**: glass materialises (blur 0 → 18 px, a clip reveal and a slight scale). Light then travels once along the border (`--edge-x`) and a reflection drifts across the surface (`--sheen-x`).
  While a slide is idle, this light passes again only every 6–9 s.
- There is no glass on glass, and no neon. Text on glass is always full-strength paper white.

## 5. Motion system

| Scene → scene | Transition | Why |
|---|---|---|
| 1 → 2 | The cities recede in depth, and the Nestlé logo lifts to the centre and hands over to the brands | From the corporate group to its consumer brands |
| 2 → 3 | The KitKat card's red expands from the card's exact shape to full frame | From the portfolio into a dedicated campaign |
| 3 → 4 | A cocoa-brown iris closes over the chocolate, then a light sweep reveals the coffee world | A sensory change of category |
| 4 → 5 | A warm amber-to-gold vapour rises out of the coffee scene and clears onto the kitchen | Coffee warmth becomes Maggi's palette |
| 5 → 6 | KitKat red, Nescafé coffee and Maggi yellow rise as three bars, then converge to the centre | Three brands return as one portfolio |
| back / jump | A pane of frosted glass sweeps across | Predictable and neutral |

- **Within scenes**: masked word reveals with a letter-spacing settle; the cities reveal along polygon seams; split scenes show France first, then Japan, with the glass divider drawing down.
- **Brand character**: each brand has its own product motion. KitKat snaps into place (back-out ease), Nescafé pours slowly (long ease, 1.7 s image reveals), and Maggi simmers (expo settle, a pulsing warm light).
- **Durations**: text 0.6–1.1 s, products 0.9–1.4 s, images 1.3–1.8 s, transitions about 1.3–2.3 s, ambient loops 7–12 s, and a 4.6 s closing pull-back.
- **Reduced motion**: transitions become a 0.4 s dissolve, entrances resolve instantly and loops are off. This follows the OS setting or the toggle.

## 6. Testing done (headless Chromium via Playwright)

- **Screenshots**: every slide at 1920×1080 after its entrance (`docs/screenshots/`), plus 1366×768, 2560×1440, 1280×1024 and a 390×844 phone.
  The phone is letterboxed and shows a rotate hint.
- **Text clipping**: a check of every headline, caption and label's rendered text bounds against its own box and the canvas found **no clipping on any slide**.
  The Nescafé and closing headlines are set on two controlled lines, and an automatic fit guard shrinks any headline that would overflow.
- **Transitions**: frames were captured at 150, 450, 800, 1150, 1600 and 2400 ms for all five forward transitions.
  Two defects were found and fixed:
  - Applying a CSS filter to a whole slide produced a black frame at the start of a transition.
  - The outgoing slide showed through the incoming slide's unrevealed half.
- **Rapid input**: 8 key presses in 400 ms, then mixed left/right presses, ended on the expected slide every time. There was exactly one active slide, no stuck state, no overlapping slides, and the counter and URL hash were correct.
  This found and fixed a bug where presses during a transition counted from the old slide.
- **Interaction**: tested hover, click, touch tap (tablet emulation), Escape to close, and the `aria-expanded` state on slide 2. Narrowed cards hide their category text so labels never clip.
- **Other checks**: reduced motion (OS emulation); opening from `file://` (all fonts and images load, no errors); no console or page errors in any run.
- **Walkthrough**: `docs/walkthrough.mp4` (42 s, 1280×720, H.264, silent) records the whole deck, including the slide 2 focus interaction.
- **PowerPoint backup**: it renders correctly in LibreOffice. The original PowerPoint's SHA-256 is unchanged
  (`5ebcfe1c…a122ac0cd`).

## 7. Known limitations

- Most product photographs are amateur Commons photos, not studio packshots. They are cut out, graded and lit to sit together, but official packshots would look sharper.
- The Japanese vending-machine photo exists only as a 330 px preview (the original was rate-limited), so it is shown small.
- Backdrop blur is GPU work. On very old integrated graphics, turn on Reduce motion if transitions stutter.
- No video was used: no licensable, authentic coffee-pouring clip was found, so the steam is a light CSS effect.
- The static PowerPoint is a backup of the final compositions. Its slides are images (with alt text and speaker notes), not editable text boxes.
