/* Shared choreography for the three France × Japan comparison slides.
   Each brand slide passes its own "character": KitKat snaps, Nescafé pours
   slowly, Maggi simmers — the structure stays the same so the audience
   always knows where France and Japan are. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;

  NFJ.splitSlide = function (index, cfg) {
    const el = $(`[data-slide="${index + 1}"]`);
    const idle = NFJ.idleBag();
    const q = (s) => $(s, el);
    const parts = {
      fr: q(".split__fr"), jp: q(".split__jp"),
      bgFr: q(".split__fr .split__bg"), bgJp: q(".split__jp .split__bg"),
      divider: q(".split__divider"), title: q(".split__title"), top: q(".split__top"),
      chipFr: q(".split__chip--fr"), chipJp: q(".split__chip--jp"),
      light: q(".layer[class*='-light']")
    };
    const animated = cfg.items.map((it) => it.el = q(it.sel)).concat(cfg.items.map((it) => it.shadow && (it.shadowEl = q(it.shadow))));

    NFJ.registerSlide(index, {
      el,
      reset() {
        idle.kill();
        gsap.set([parts.fr, parts.jp], { autoAlpha: 0, clipPath: "none", x: 0 });
        gsap.set([parts.bgFr, parts.bgJp], { x: 0, y: 0, scale: 1 });
        gsap.set([parts.divider, parts.title, parts.top, parts.chipFr, parts.chipJp, parts.light], { autoAlpha: 0 });
        gsap.set(parts.divider, { scaleY: 0, transformOrigin: "50% 0%" });
        cfg.items.forEach((it) => {
          gsap.set(it.el, { autoAlpha: 0 });
          const img = it.el && it.el.querySelector("img");
          if (img && it.type === "product") gsap.set(img, { autoAlpha: 1 });
          if (it.shadowEl) gsap.set(it.shadowEl, { autoAlpha: 0 });
        });
        cfg.reset && cfg.reset(el);
      },
      enter() {
        const c = cfg.character;
        const tl = gsap.timeline({ defaults: { ease: M.out } });
        // France arrives first …
        tl.set(parts.fr, { autoAlpha: 1 })
          .add(NFJ.imageIn(parts.fr, { from: "left", inner: parts.bgFr, scale: c.zoom, duration: c.image }), 0)
          .to(parts.top, { autoAlpha: 1, duration: 1 }, 0.2)
          .add(NFJ.wordsIn(parts.title, { stagger: 0.06, duration: 1, track: ["0.07em", "0.02em"] }), 0.25)
          // … then Japan, with the glass divider drawing down between them.
          .set(parts.jp, { autoAlpha: 1 }, c.jpAt)
          .add(NFJ.imageIn(parts.jp, { from: "right", inner: parts.bgJp, scale: c.zoom, duration: c.image }), c.jpAt)
          .to(parts.divider, { autoAlpha: 1, scaleY: 1, duration: 1.3, ease: "expo.inOut" }, c.jpAt + 0.2)
          .fromTo(parts.divider, { "--sheen-y": "-40%" }, { "--sheen-y": "120%", duration: 1.8, ease: M.soft }, c.jpAt + 0.7)
          .to(parts.light, { autoAlpha: 1, duration: 1.6 }, c.jpAt + 0.4)
          .add(NFJ.glassIn(parts.chipFr, { from: "left", duration: 0.7 }), 0.9)
          .add(NFJ.glassIn(parts.chipJp, { from: "left", duration: 0.7 }), c.jpAt + 0.6);

        cfg.items.forEach((it) => {
          const at = it.at;
          if (it.type === "product") {
            tl.set(it.el, { autoAlpha: 1 }, at);
            tl.add(NFJ.productIn(it.el, Object.assign({ shadow: it.shadowEl }, c.product, it.motion)), at);
          } else if (it.type === "frame") {
            tl.set(it.el, { autoAlpha: 1 }, at);
            tl.add(NFJ.imageIn(it.el, { from: it.from || "up", inner: it.el.querySelector("img"), scale: 1.18, duration: 1.2 }), at);
          } else if (it.type === "glass") {
            tl.add(NFJ.glassIn(it.el, { from: it.from || "bottom", duration: 0.9 }), at);
          }
        });
        cfg.enter && cfg.enter(tl, el);
        return tl;
      },
      idle() {
        idle.add(
          NFJ.drift(parts.bgFr, { x: 14, y: -6, scale: 1.05, duration: 9 }),
          NFJ.drift(parts.bgJp, { x: -14, y: 6, scale: 1.05, duration: 10 }),
          gsap.fromTo(parts.divider, { "--sheen-y": "-40%" }, { "--sheen-y": "120%", duration: 3.2, ease: M.soft, repeat: -1, repeatDelay: 5 }),
          NFJ.glassAmbient(cfg.items.filter((i) => i.type === "glass").map((i) => i.el), { every: 9 })
        );
        cfg.items.filter((i) => i.type === "product" && i.float !== false).forEach((it, n) => {
          idle.add(NFJ.breathe(it.el, { y: -5 - (n % 2) * 3, duration: 4 + n * 0.5, delay: n * 0.3 }));
        });
        cfg.idle && cfg.idle(idle, el);
      },
      stop() { idle.kill(); },
      parts
    });
  };
})();
