# Adding the six analytical slides

The engine is id-based. Slide order lives in a single list, so the analytical slides can be interleaved anywhere without changing the existing six.

The planned sections are market context, packaging, pricing, distribution, advertising and communication, and key findings.
Their content has not been written; this guide only explains how to plug them in.

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
