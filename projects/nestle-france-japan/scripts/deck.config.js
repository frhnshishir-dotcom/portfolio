/* =========================================================================
   Deck sequence — the ONLY place that decides slide order.

   Each entry is the id of a <section class="slide" data-slide-id="…"> in
   index.html whose module registered itself with NFJ.registerSlide(id, …).
   To build the 12-slide academic version, add the six analytical sections
   and list their ids here in any order, e.g.

     sequence: ["opening", "context", "portfolio", "kitkat", "packaging", …]

   Pairs without a dedicated transition in scripts/transitions.js use the
   neutral glass-sheet transition automatically. Ids listed here but missing
   from the page are skipped with a console warning, so a draft never breaks.
   See docs/ADDING_SLIDES.md.
   ========================================================================= */
window.NFJ = window.NFJ || {};
window.NFJ.deckConfig = {
  title: "Nestlé: France × Japan",
  sequence: ["opening", "portfolio", "kitkat", "nescafe", "maggi", "finale"]
};
