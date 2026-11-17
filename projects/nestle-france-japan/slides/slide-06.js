/* Slide 6 — Think globally. Adapt locally.
   The three brands arrive separately, gather on one table between Paris and
   Tokyo, the statement lands in two beats, and the camera pulls back. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide="6"]');
  const idle = NFJ.idleBag();

  const world = $(".s6-world", el), sky = $(".s6-sky", el), shade = $(".s6-shade", el), surface = $(".s6-surface", el);
  const paris = $(".s6-paris", el), tokyo = $(".s6-tokyo", el);
  const mug = $(".s6-mug", el), bottle = $(".s6-bottle", el), kk = $(".s6-kk", el), matcha = $(".s6-matcha", el);
  const shadows = $$(".s6-sh", el);
  const plate = $(".s6-plate", el), title = $(".s6-title", el), lines = $$(".s6-title .line", el);
  const sub = $(".s6-sub", el), logo = $(".s6-logo", el);

  NFJ.registerSlide(5, {
    el,
    reset() {
      idle.kill();
      gsap.set(world, { scale: 1, y: 0 });
      gsap.set([sky, shade, surface, plate, sub, logo].concat(shadows), { autoAlpha: 0 });
      gsap.set([paris, tokyo], { x: 0 });
      [mug, bottle, kk, matcha].forEach((p) => gsap.set(p, { autoAlpha: 0, x: 0, y: 0 }));
      gsap.set(title, { autoAlpha: 1 });
      gsap.set(lines, { autoAlpha: 0 });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      // The world starts close and slightly high; it will pull back at the end.
      tl.set(world, { scale: 1.14, y: -30 }, 0)
        .to(sky, { autoAlpha: 1, duration: 1.4 }, 0)
        .fromTo(paris, { x: -120 }, { x: 0, duration: 3, ease: M.out }, 0)
        .fromTo(tokyo, { x: 120 }, { x: 0, duration: 3, ease: M.out }, 0)
        .to([shade, surface], { autoAlpha: 1, duration: 1.2 }, 0.2)
        // Each brand arrives separately, from its own direction …
        .fromTo(mug, { autoAlpha: 0, x: -420, y: -40, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out", clearProps: "filter" }, 0.5)
        .fromTo(bottle, { autoAlpha: 0, x: 420, y: -40, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out", clearProps: "filter" }, 0.85)
        .fromTo(kk, { autoAlpha: 0, y: 220, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out", clearProps: "filter" }, 1.2)
        .fromTo(matcha, { autoAlpha: 0, x: 260, y: 120, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", clearProps: "filter" }, 1.45)
        .fromTo(shadows, { autoAlpha: 0, scaleX: 0.5 }, { autoAlpha: 1, scaleX: 1, duration: 1.2, stagger: 0.15 }, 0.9)
        // … one glass surface, then the statement in two beats.
        .add(NFJ.glassIn(plate, { from: "center", duration: 1.1 }), 2.0)
        .add(NFJ.wordsIn(lines[0], { stagger: 0.1, duration: 1.0, track: ["0.12em", "0.03em"] }), 2.35)
        .add(NFJ.wordsIn(lines[1], { stagger: 0.1, duration: 1.0, track: ["0.12em", "0.03em"] }), 3.0)
        .add(NFJ.textIn(sub, { duration: 0.8 }), 3.7)
        // Slow, camera-like pull-back to the final frame; logo signs off.
        .to(world, { scale: 1, y: 0, duration: 4.6, ease: "power2.inOut" }, 1.0)
        .fromTo(logo, { autoAlpha: 0, y: 10, filter: "blur(8px)" }, { autoAlpha: 0.95, y: 0, filter: "blur(0px)", duration: 1.1, clearProps: "filter" }, 4.4);
      return tl;
    },
    idle() {
      idle.add(
        NFJ.drift(sky, { x: 0, y: -8, scale: 1.03, duration: 12 }),
        NFJ.glassAmbient([plate], { every: 7 })
      );
    },
    stop() { idle.kill(); },
    parts: { world, plate, mug, bottle, kk, matcha }
  });
})();
