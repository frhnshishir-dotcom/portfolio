/* Slide 3 — KitKat: the classic break (France) vs. flavours made to gift (Japan).
   Character: crisp. Products "snap" into place with a short, decisive ease. */
(function () {
  "use strict";
  NFJ.splitSlide(2, {
    character: { zoom: 1.16, image: 1.3, jpAt: 1.0, product: { ease: "back.out(1.4)", duration: 0.9 } },
    items: [
      { sel: ".s3-kk-split", type: "product", shadow: ".s3-shadow-split", at: 0.75, motion: { y: 90, rotate: -10 } },
      { sel: ".s3-kk-opened", type: "product", at: 1.05, motion: { y: 120, rotate: 12, blur: 14 } },
      { sel: ".s3-cap-fr", type: "glass", at: 1.35, from: "left" },
      { sel: ".s3-kk-box", type: "product", shadow: ".s3-shadow-box", at: 1.75, motion: { y: 80, rotate: 4, scale: 0.9 } },
      { sel: ".s3-kk-matcha", type: "product", at: 2.0, motion: { y: 100, rotate: 10 } },
      { sel: ".s3-kk-sakura", type: "product", at: 2.2, motion: { y: 110, rotate: -14, blur: 12 } },
      { sel: ".s3-cap-jp", type: "glass", at: 2.45, from: "left" }
    ]
  });
})();
