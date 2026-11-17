/* Slide 2 — Three brands, two markets: an exhibition of three brand worlds. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide="2"]');
  const idle = NFJ.idleBag();

  const title = $(".s2-title", el), sub = $(".s2-sub", el), hint = $(".s2-hint", el), bg = $(".s2-bg", el);
  const cards = $$(".s2-card", el);
  const parts = (c) => ({
    card: c,
    media: $(".s2-media", c),
    photo: $(".s2-photo", c),
    product: $(".s2-product", c),
    logo: $(".s2-logo", c),
    label: $(".s2-label", c),
    detail: $(".s2-detail", c)
  });
  const P = cards.map(parts);

  NFJ.registerSlide(1, {
    el,
    reset() {
      idle.kill();
      NFJ.brandFocus && NFJ.brandFocus.close(true);
      gsap.set([title, sub, hint], { autoAlpha: 0 });
      gsap.set(bg, { autoAlpha: 0 });
      P.forEach((p) => {
        gsap.set(p.card, { autoAlpha: 0, y: 0, scale: 1, clipPath: "none", "--grow": 1 });
        gsap.set([p.logo, p.label], { autoAlpha: 0 });
        gsap.set(p.product.querySelector("img"), { autoAlpha: 0 });
        gsap.set(p.photo, { scale: 1.06 });
      });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      tl.to(bg, { autoAlpha: 1, duration: 1.2 }, 0)
        .add(NFJ.wordsIn(title, { stagger: 0.06, track: ["0.08em", "0.02em"] }), 0.15)
        .add(NFJ.textIn(sub), 0.55);

      // Each brand enters with its own gesture, inside one shared motion language:
      // KitKat rises (a snap upward), Nescafé unveils from the top like a pour,
      // Maggi opens from the side like a page of a cookbook.
      const gestures = [
        { from: { y: 140, clipPath: "inset(100% 0% 0% 0% round 30px)" }, product: { y: 90, rotate: -6 } },
        { from: { y: 40, clipPath: "inset(0% 0% 100% 0% round 30px)" }, product: { y: -60, rotate: 0, scale: 0.9 } },
        { from: { x: 120, clipPath: "inset(0% 0% 0% 100% round 30px)" }, product: { y: 80, rotate: 4 } }
      ];
      P.forEach((p, i) => {
        const at = 0.55 + i * 0.32;
        tl.fromTo(p.card, Object.assign({ autoAlpha: 1, x: 0 }, gestures[i].from),
          { y: 0, x: 0, clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 1.25, ease: "expo.out", clearProps: "clipPath" }, at)
          .fromTo(p.photo, { scale: 1.25 }, { scale: 1.06, duration: 2.6, ease: M.out }, at)
          .add(NFJ.productIn(p.product, Object.assign({ duration: 1.1 }, gestures[i].product)), at + 0.45)
          .fromTo(p.logo, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.7 }, at + 0.7)
          .add(NFJ.glassIn(p.label, { from: "left", duration: 0.8 }), at + 0.75);
      });
      tl.add(NFJ.textIn(hint, { y: 8 }), 2.2);
      return tl;
    },
    idle() {
      P.forEach((p, i) => {
        idle.add(
          gsap.to(p.photo, { scale: 1.11, duration: 8 + i, ease: M.soft, repeat: -1, yoyo: true }),
          NFJ.breathe(p.product, { y: -7, duration: 4 + i * 0.6, delay: i * 0.4 })
        );
      });
      idle.add(NFJ.glassAmbient(P.map((p) => p.label), { every: 8 }));
    },
    stop() {
      idle.kill();
      NFJ.brandFocus && NFJ.brandFocus.close(true);
    },
    parts: { cards: P, title, sub, hint, bg }
  });
})();
