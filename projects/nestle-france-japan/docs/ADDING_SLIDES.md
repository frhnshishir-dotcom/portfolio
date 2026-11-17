# Adding slides

The engine is id-based. Slide order lives in a single list, so slides can be interleaved anywhere without changing the others.

**Status.** The deck now has 13 slides.
- The six analytical slides (`context`, `packaging`, `pricing`, `distribution`, `advertising`, `findings`) and the video slide (`ads`) are in place, all using `slides/analysis-kit.js`.
- The general steps below still apply to any new slide.

## The quick way: an analytical page

Give a section the classes `slide an` and a `data-slide-id`. Mark each element with its entrance type and start time. `slides/analysis-kit.js` registers the module by itself, so you need no JS:

```html
<section class="slide an" data-slide-id="sources" data-title="Sources">
  <header class="an-head">
    <p class="an-label" data-a="label" data-t="0.1">Appendix</p>
    <h2 class="an-title" data-fit data-a="title" data-t="0.2"><span class="line">Sources.</span></h2>
  </header>
  <div class="an-body" style="top: 300px" data-a="rise" data-t="0.8">…</div>
  <p class="an-source" data-a="fade" data-t="1.6">…</p>
</section>
```

- **Types:** `label`, `title`, `rise`, `pop`, `glass` (with optional `data-from="right"`), `line`, `fade`, and `stagger` (with `data-sel`, the children that pop in).
- **Video:** a `.vd` card with `data-yt="<YouTube id>"` becomes a click-to-play player. See `docs/VIDEOS.md` and the `ads` slide.
- **Order:** add the id to `scripts/deck.config.js`.
- **Transitions:** pairs without a dedicated transition use the glass sheet.

## 1. Add the section to `index.html`

Place it anywhere inside `#stage`. Position in the HTML does not matter, because the sequence decides the order.

```html
<section class="slide sx-packaging" data-slide-id="packaging" data-title="Packaging comparison">
  <!-- content -->
</section>
```

## 2. Add a module in `slides/`, and a `<script>` tag before `scripts/transitions.js`

```js
(function () {
  const el = document.querySelector('[data-slide-id="packaging"]');
  NFJ.registerSlide("packaging", {
    el,
    reset() { /* set the initial (hidden) state of everything this slide animates */ },
    enter() { return gsap.timeline(); /* the entrance; it must end in a stable state */ },
    idle() {},   // optional, very subtle ambient motion; leave empty for analytical slides
    stop() {}    // kill anything idle() started
  });
})();
```

For a France / Japan comparison layout, `NFJ.splitSlide("packaging", { character, items })` (in `slides/split-kit.js`) builds the standard structure:
France first, then Japan, with the glass divider, chips and captions. Use the `split__*` classes from `styles/slides.css`.

The reusable motion helpers are in `scripts/animations.js`:
`NFJ.wordsIn`, `NFJ.textIn`, `NFJ.glassIn`, `NFJ.imageIn`, `NFJ.productIn`, `NFJ.drift` and `NFJ.idleBag`.

## 3. Add the id to `scripts/deck.config.js`

```js
sequence: ["opening", "context", "portfolio", "kitkat", "packaging", "nescafe", "pricing",
           "maggi", "distribution", "advertising", "findings", "finale"]
```

The counter, progress bar, `Slide n of N` labels, URL hashes (`#packaging`) and Home/End keys all follow automatically.

## 4. Transitions

Any pair without a dedicated transition uses the neutral frosted-glass sheet. The bespoke ones are keyed by id pairs in `scripts/transitions.js`.
Once slides are interleaved, pairs such as `kitkat>nescafe` are no longer adjacent, so those transitions simply stop being used.
The sheet then takes over. Nothing breaks.

To give a new pair its own transition:

```js
NFJ.transitions.define("kitkat", "packaging", function (from, to, ctx) {
  return gsap.timeline().add(ctx.swap, 0.5);  // call ctx.swap() exactly once
});
```

## 5. Check

Run the deck. Every id in the sequence that has no section or module is skipped with a console warning.
