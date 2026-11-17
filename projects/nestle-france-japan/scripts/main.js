/* =========================================================================
   Boot: scale the stage, preload every image (nothing pops in during a
   transition), fit headlines, then start on the slide named in the URL
   (#nescafe, or a number such as #4).
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const stage = $("#stage");

  function scaleStage() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty("--stage-scale", s.toFixed(5));
  }
  window.addEventListener("resize", scaleStage);
  scaleStage();

  // Progress dots follow the configured sequence.
  const progress = $("#progress");
  NFJ.nav.order.forEach((id, i) => {
    const b = document.createElement("button");
    b.className = "chrome__dot";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => NFJ.nav.go(i));
    progress.appendChild(b);
  });

  const imgs = $$("img", stage);
  const bar = $(".loader__bar i");
  let done = 0;
  const tick = () => { done++; bar.style.width = Math.round((done / imgs.length) * 100) + "%"; };
  const decode = (img) =>
    (img.complete && img.naturalWidth ? Promise.resolve() : new Promise((res) => { img.addEventListener("load", res, { once: true }); img.addEventListener("error", res, { once: true }); }))
      .then(() => (img.decode ? img.decode().catch(() => {}) : null))
      .then(tick);

  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise((res) => setTimeout(res, 8000));

  Promise.race([Promise.all([fonts, ...imgs.map(decode)]), timeout]).then(() => {
    NFJ.fitText(stage);
    // Every slide starts from its initial (hidden) state.
    NFJ.nav.order.forEach((id) => NFJ.slideModules[id].reset());
    $("#loader").classList.add("is-done");
    const h = decodeURIComponent((location.hash || "").replace("#", ""));
    const n = parseInt(h, 10);
    const byId = NFJ.nav.order.indexOf(h);
    const start = byId >= 0 ? byId : n >= 1 && n <= NFJ.nav.total ? n - 1 : 0;
    NFJ.nav.go(start);
    document.body.classList.add("chrome-awake");
    setTimeout(() => document.body.classList.remove("chrome-awake"), 3500);
    document.documentElement.dataset.ready = "1";
  });
})();
