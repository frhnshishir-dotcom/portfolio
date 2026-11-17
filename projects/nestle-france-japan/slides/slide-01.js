/* Slide 1 — Cinematic opening: Paris and Tokyo at blue hour, joined by glass. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide="1"]');
  const idle = NFJ.idleBag();

  const paris = $(".s1-paris", el), tokyo = $(".s1-tokyo", el);
  const parisImg = $(".s1-paris .s1-img", el), tokyoImg = $(".s1-tokyo .s1-img", el);
  const seam = $(".s1-seam", el), glow = $(".s1-glow", el), shade = $(".s1-shade", el);
  const plate = $(".s1-plate", el), logo = $(".s1-logo", el), title = $(".s1-title", el);
  const sub = $(".s1-sub", el), meta = $(".s1-meta", el);
  const tags = $$(".s1-tag", el);
  // The diagonal seam: both cities are revealed by growing their own polygon.
  const P_START = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
  const P_END = "polygon(0% 0%, 57.5% 0%, 47.5% 100%, 0% 100%)";
  const T_START = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
  const T_END = "polygon(57.5% 0%, 100% 0%, 100% 100%, 47.5% 100%)";

  NFJ.registerSlide(0, {
    el,
    reset() {
      idle.kill();
      gsap.set(paris, { clipPath: P_START, autoAlpha: 0, x: 0, scale: 1, filter: "none" });
      gsap.set(tokyo, { clipPath: T_START, autoAlpha: 0, x: 0, scale: 1, filter: "none" });
      gsap.set([parisImg, tokyoImg], { x: 0, y: 0, scale: 1.12, filter: "" });
      gsap.set([seam, plate, logo, sub, meta, glow, shade].concat(tags), { autoAlpha: 0 });
      gsap.set(seam, { yPercent: -110 });
      gsap.set(title, { autoAlpha: 0 });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      // From black: Paris arrives from the left, Tokyo from the right.
      tl.set([paris, tokyo], { autoAlpha: 1 })
        .fromTo(paris, { x: -260, clipPath: P_START }, { x: 0, clipPath: P_END, duration: 1.8, ease: "power3.inOut" }, 0.2)
        .fromTo(parisImg, { scale: 1.22, filter: "brightness(0.3)" }, { scale: 1.06, filter: "brightness(1)", duration: 3.2, ease: M.out }, 0.2)
        .fromTo(tokyo, { x: 260, clipPath: T_START }, { x: 0, clipPath: T_END, duration: 1.8, ease: "power3.inOut" }, 0.75)
        .fromTo(tokyoImg, { scale: 1.22, filter: "brightness(0.3)" }, { scale: 1.06, filter: "brightness(1)", duration: 3.2, ease: M.out }, 0.75)
        .to(shade, { autoAlpha: 1, duration: 1.6 }, 0.9)
        // A sheet of glass drops into the seam between the two cities.
        .set(seam, { autoAlpha: 1 }, 1.4)
        .to(seam, { yPercent: 0, duration: 1.4, ease: "expo.out" }, 1.4)
        .fromTo(seam, { "--sheen-y": "-40%" }, { "--sheen-y": "120%", duration: 2.2, ease: M.soft }, 1.8)
        .to(glow, { autoAlpha: 1, duration: 2 }, 1.8)
        .add(NFJ.glassIn(tags[0], { from: "left", duration: 0.8 }), 2.0)
        .add(NFJ.glassIn(tags[1], { from: "right", duration: 0.8 }), 2.15)
        // Title plate materialises, then logo and title in stages.
        .add(NFJ.glassIn(plate, { from: "bottom", duration: 1.2 }), 2.3)
        .fromTo(logo, { autoAlpha: 0, y: 12, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, clearProps: "filter" }, 2.75)
        .add(NFJ.wordsIn(title, { stagger: 0.12, duration: 1.1, track: ["0.12em", "0.03em"] }), 3.0)
        .add(NFJ.textIn(sub, { duration: 0.8 }), 3.75)
        .add(NFJ.textIn(meta, { duration: 0.7, y: 10 }), 4.05);
      return tl;
    },
    idle() {
      // Opposed drift = parallax between the two cities; glass edges catch light occasionally.
      idle.add(
        NFJ.drift(parisImg, { x: 26, y: -6, scale: 1.09, duration: 9 }),
        NFJ.drift(tokyoImg, { x: -26, y: 6, scale: 1.09, duration: 9 }),
        NFJ.glassAmbient([plate, seam], { every: 6 }),
        gsap.to(glow, { opacity: 0.6, duration: 4, ease: M.soft, repeat: -1, yoyo: true })
      );
    },
    stop() { idle.kill(); },
    // Exposed for the 1 → 2 transition (logo bridge)
    parts: { paris, tokyo, plate, logo, seam, tags, title, sub, meta, shade, glow }
  });
})();
