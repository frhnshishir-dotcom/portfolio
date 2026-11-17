/* Slide 4 — Nescafé: breakfast & capsules (France) vs. home machines & on the go (Japan).
   Character: slow pour. Long, soft eases and gentle zooms; steam rises from the cup. */
(function () {
  "use strict";
  NFJ.splitSlide(3, {
    character: { zoom: 1.2, image: 1.7, jpAt: 1.25, product: { ease: "power3.out", duration: 1.4 } },
    items: [
      { sel: ".s4-frame-cup", type: "frame", at: 0.8, from: "up" },
      { sel: ".s4-capsules", type: "product", at: 1.25, motion: { y: 60, rotate: -6 } },
      { sel: ".s4-cap-fr", type: "glass", at: 1.55, from: "left" },
      { sel: ".s4-frame-genio", type: "frame", at: 1.9, from: "up" },
      { sel: ".s4-frame-vending", type: "frame", at: 2.25, from: "up" },
      { sel: ".s4-cap-jp", type: "glass", at: 2.6, from: "left" }
    ],
    idle(bag, el) {
      // Slow product-focused push-in on both photographs.
      bag.add(
        gsap.to(el.querySelector(".s4-frame-cup img"), { scale: 1.08, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true }),
        gsap.to(el.querySelector(".s4-frame-genio img"), { scale: 1.07, duration: 10, ease: "sine.inOut", repeat: -1, yoyo: true })
      );
    }
  });
})();
