/* =========================================================================
   Boot: scale the stage, preload every image (so nothing pops in during a
   transition), fit headlines, then start on the slide in the URL hash.
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

  // Progress dots
  const progress = $("#progress");
  for (let i = 0; i < NFJ.nav.total; i++) {
    const b = document.createElement("button");
    b.className = "chrome__dot";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => NFJ.nav.go(i));
    progress.appendChild(b);
  }

  // Hide every slide's content until its entrance runs.
  NFJ.slides.forEach((s) => s.reset());

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
    $("#loader").classList.add("is-done");
    const fromHash = parseInt((location.hash || "").replace("#", ""), 10);
    const start = fromHash >= 1 && fromHash <= NFJ.nav.total ? fromHash - 1 : 0;
    NFJ.nav.go(start);
    // Show the controls briefly so the presenter knows where they are.
    document.body.classList.add("chrome-awake");
    setTimeout(() => document.body.classList.remove("chrome-awake"), 3500);
    document.documentElement.dataset.ready = "1";
  });
})();
