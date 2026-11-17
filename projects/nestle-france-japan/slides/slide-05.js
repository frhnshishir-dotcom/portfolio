/* Slide 5 — Maggi: stock for slow classics (France) vs. a Western stock on a Japanese table.
   Character: simmer. Warm light builds, products settle like steam clearing. */
(function () {
  "use strict";
  NFJ.splitSlide(4, {
    character: { zoom: 1.18, image: 1.5, jpAt: 1.1, product: { ease: "expo.out", duration: 1.2 } },
    items: [
      { sel: ".s5-tin", type: "product", shadow: ".s5-shadow-tin", at: 0.8, motion: { y: 70, rotate: -6, blur: 12 } },
      { sel: ".s5-kub", type: "product", at: 1.1, motion: { y: 90, rotate: 8, blur: 12 } },
      { sel: ".s5-cap-fr", type: "glass", at: 1.45, from: "left" },
      { sel: ".s5-frame-soup", type: "frame", at: 1.8, from: "up" },
      { sel: ".s5-ident", type: "glass", at: 2.15, from: "left" },
      { sel: ".s5-cap-jp", type: "glass", at: 2.4, from: "left" }
    ],
    idle(bag, el) {
      const light = el.querySelector(".s5-light");
      bag.add(gsap.to(light, { opacity: 0.7, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true }));
    }
  });
})();
