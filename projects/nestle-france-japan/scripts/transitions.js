/* =========================================================================
   Scene-to-scene transitions, keyed by slide ids ("from>to").
   Every forward step between the six visual slides is motivated by the
   story; any other pair (going back, jumping, or — later — moving to and
   from the analytical slides) uses the neutral glass-sheet transition.

     opening>portfolio  the smoked-glass title plate expands towards the camera
                        and becomes the dark showroom
     portfolio>kitkat   KitKat takes the hero spot and rushes forward; its red
                        becomes the bridge into the face-off
     kitkat>nescafe     chocolate red warms into coffee darkness
     nescafe>maggi      coffee vapour rises and turns gold
     maggi>finale       product and ingredients recede into darkness

   Each returns a timeline and calls ctx.swap() exactly once, at the moment
   the incoming slide takes over. Kept to ~0.9–1.5 s for live delivery.
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const fx = $("#fx");
  const veil = $(".fx-veil", fx), sheet = $(".fx-sheet", fx), band = $(".fx-band", fx);

  function resetFx() {
    gsap.set([veil, sheet, band], { clearProps: "all" });
  }

  /** A soft-edged iris: the veil is revealed through a radial mask whose radius (--r) grows. */
  function iris(at) {
    const m = `radial-gradient(circle at ${at}, #000 var(--r), transparent calc(var(--r) + 22%))`;
    return { "--r": "0%", WebkitMaskImage: m, maskImage: m };
  }

  const T = {};

  /* The title plate comes towards the camera and fills the frame. */
  T["opening>portfolio"] = function (from, to, ctx) {
    const p = from.parts;
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.to([p.logo, p.title, p.sub, p.meta], { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" }, 0)
      .to(p.tags, { autoAlpha: 0, duration: 0.25 }, 0)
      .to(p.seam, { autoAlpha: 0, duration: 0.3 }, 0)
      .to(p.motes, { autoAlpha: 0, duration: 0.3 }, 0)
      .to(p.plate, { scale: 3.6, y: -250, "--tint": 0.97, "--blur": "34px", duration: 0.9, ease: "power3.in" }, 0.05)
      .add(ctx.swap, 0.92)
      .set(from.el, { autoAlpha: 0 }, 0.93);
    return tl;
  };

  /* KitKat to the front, then into a red iris. */
  T["portfolio>kitkat"] = function (from, to, ctx) {
    const p = from.parts;
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    let t = 0;
    if (p.hero() !== "kitkat") {
      tl.add(from.select("kitkat", { duration: 0.55 }) || gsap.timeline(), 0);
      t = 0.55;
    }
    const kk = p.items.kitkat;
    tl.to([p.title, p.sub, p.tabsBox, p.caption], { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, t)
      .to([p.items.nescafe, p.items.maggi], { autoAlpha: 0, scale: 0.45, duration: 0.45, ease: "power2.in" }, t)
      .to(kk, { scale: 2.3, y: "-=180", duration: 0.85, ease: "power3.in" }, t + 0.05)
      .set(veil, {
        autoAlpha: 1,
        background: "radial-gradient(circle at 50% 56%, #d0122d 0%, #8c0a1c 38%, #2a0408 75%, #030406 100%)",
        ...iris("50% 56%")
      }, t + 0.25)
      .to(veil, { "--r": "130%", duration: 0.67, ease: "power2.in" }, t + 0.25)
      .add(ctx.swap, t + 0.92)
      .set(from.el, { autoAlpha: 0 }, t + 0.93)
      .to(veil, { autoAlpha: 0, duration: 0.55, ease: "power2.out" }, t + 0.95);
    return tl;
  };

  /* Chocolate red warms into coffee darkness. */
  T["kitkat>nescafe"] = function (from, to, ctx) {
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(veil, {
      autoAlpha: 1,
      background: "radial-gradient(circle at 50% 60%, #7a2a18 0%, #3c1a0d 40%, #1a0f08 75%, #0b0604 100%)",
      ...iris("50% 62%")
    })
      .to(from.el, { scale: 1.04, duration: 0.8, ease: "power2.in" }, 0)
      .to(veil, { "--r": "140%", duration: 0.8, ease: "power3.in" }, 0.05)
      .add(ctx.swap, 0.86)
      .set(from.el, { autoAlpha: 0 }, 0.87)
      .to(veil, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.9);
    return tl;
  };

  /* Coffee vapour rises and turns gold. */
  T["nescafe>maggi"] = function (from, to, ctx) {
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(veil, {
      autoAlpha: 1,
      top: "-40%", bottom: "-40%",
      background: "linear-gradient(0deg, #1a0f08 0%, #4a2a10 30%, #8a5c16 52%, #5a3a0c 72%, #050302 100%)",
      WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
      maskImage: "linear-gradient(0deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
      yPercent: 100
    })
      .to(from.el, { y: -30, duration: 0.75, ease: "power2.in" }, 0)
      .to(veil, { yPercent: 0, duration: 0.75, ease: "power2.in" }, 0)
      .add(ctx.swap, 0.76)
      .set(from.el, { autoAlpha: 0 }, 0.77)
      .to(veil, { yPercent: -100, duration: 0.7, ease: "power2.out" }, 0.78);
    return tl;
  };

  /* The Maggi set recedes into darkness; the finale begins from charcoal. */
  T["maggi>finale"] = function (from, to, ctx) {
    const p = from.parts;
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.to(p.ings, { scale: 0.6, autoAlpha: 0, y: "+=40", duration: 0.6, stagger: 0.04, ease: "power2.in" }, 0)
      .to([p.tin, p.kub], { scale: 0.85, autoAlpha: 0, y: "+=30", duration: 0.7, ease: "power2.in" }, 0.1)
      .set(veil, { autoAlpha: 0, background: "#08090b" }, 0)
      .to(veil, { autoAlpha: 1, duration: 0.55, ease: "power1.in" }, 0.35)
      .add(ctx.swap, 0.92)
      .set(from.el, { autoAlpha: 0 }, 0.93)
      .to(veil, { autoAlpha: 0, duration: 0.45, ease: "none" }, 0.95);
    return tl;
  };

  /* Neutral · a pane of frosted glass sweeps across (back, jumps, analytical slides). */
  T.sheet = function (from, to, ctx) {
    const dir = ctx.dir;
    const startX = dir > 0 ? -900 : 2100, endX = dir > 0 ? 2100 : -900;
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(sheet, { autoAlpha: 1, x: startX })
      .set(band, { autoAlpha: 0.9, x: startX - dir * 200 })
      .to(sheet, { x: endX, duration: 1.0, ease: "power2.inOut" }, 0)
      .to(band, { x: endX - dir * 200, duration: 1.0, ease: "power2.inOut" }, 0)
      .to(from.el, { autoAlpha: 0, duration: 0.35, ease: "none" }, 0.25)
      .add(ctx.swap, 0.45)
      .to([sheet, band], { autoAlpha: 0, duration: 0.2 }, 0.85);
    return tl;
  };

  /* Reduced motion · a short cross-dissolve. */
  T.reduced = function (from, to, ctx) {
    return gsap.timeline()
      .add(ctx.swap, 0)
      .fromTo(to.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none", clearProps: "opacity,visibility" }, 0);
  };

  NFJ.transitions = {
    pick(fromId, toId, dir) {
      if (M.reduced) return T.reduced;
      return (dir > 0 && T[`${fromId}>${toId}`]) || T.sheet;
    },
    /** Register a custom transition for a pair of slide ids (for future slides). */
    define(fromId, toId, fn) { T[`${fromId}>${toId}`] = fn; },
    resetFx
  };
})();
