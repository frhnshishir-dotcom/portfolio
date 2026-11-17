/* =========================================================================
   Scene-to-scene transitions. The six slides are six scenes of one film:
   every forward step has its own reason, and the shared FX layer (#fx)
   carries the bridge between them.

     1 → 2  logo bridge     cities recede, the Nestlé logo carries us into the portfolio
     2 → 3  brand takeover  the KitKat card's red expands into its own campaign
     3 → 4  chocolate→coffee a cocoa iris closes, a light sweep reveals the coffee world
     4 → 5  steam           warm vapour rises from the coffee and clears onto the kitchen
     5 → 6  convergence     three brand bars rise, then gather to the centre
     else   glass sheet     a pane of frosted glass sweeps across (back / jump)

   Each function returns a GSAP timeline and calls ctx.swap() once, at the
   moment the incoming slide must take over.
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const stage = $("#stage");
  const fx = $("#fx");
  const veil = $(".fx-veil", fx), bars = $$(".fx-bars span", fx), barsWrap = $(".fx-bars", fx);
  const sheet = $(".fx-sheet", fx), band = $(".fx-band", fx), fxLogo = $(".fx-logo", fx);

  /** Rect of an element in stage (1920×1080) coordinates. */
  function stageRect(el) {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = s.width / 1920;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  }

  function resetFx() {
    gsap.set([veil, barsWrap, sheet, band, fxLogo], { clearProps: "all" });
    gsap.set(bars, { clearProps: "all" });
  }

  const T = {};

  /* 1 → 2 · Cities to portfolio, bridged by the Nestlé logo */
  T["0>1"] = function (from, to, ctx) {
    const p = from.parts;
    const r = stageRect(p.logo);
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(fxLogo, { autoAlpha: 1, x: r.x, y: r.y, width: r.w })
      .set(p.logo, { autoAlpha: 0 })
      .to([p.title, p.sub, p.meta], { autoAlpha: 0, y: -14, filter: "blur(6px)", duration: 0.5, stagger: 0.05, ease: "power2.in" }, 0)
      .to(p.plate, { autoAlpha: 0, "--blur": "0px", scale: 0.97, duration: 0.7, ease: "power2.in" }, 0.15)
      .to(p.tags, { autoAlpha: 0, duration: 0.4 }, 0)
      .to(p.seam, { yPercent: 110, duration: 0.9, ease: "power3.in" }, 0.1)
      // The two cities recede into depth, away from each other.
      .to(p.paris, { x: -180, scale: 0.9, filter: "brightness(0.25) blur(6px)", duration: 1.1, ease: "power3.inOut", transformOrigin: "30% 50%" }, 0.15)
      .to(p.tokyo, { x: 180, scale: 0.9, filter: "brightness(0.25) blur(6px)", duration: 1.1, ease: "power3.inOut", transformOrigin: "70% 50%" }, 0.15)
      // The logo rises to the centre of the frame, then hands over to the brands.
      .to(fxLogo, { x: 960 - r.w * 0.5, y: 470, scale: 1.55, filter: "drop-shadow(0 0 24px rgba(255,255,255,0.35))", duration: 1.0, ease: "power3.inOut" }, 0.2)
      .add(ctx.swap, 0.95)
      .set(from.el, { autoAlpha: 0 }, 1.2)
      .to(fxLogo, { scale: 0.7, y: 380, autoAlpha: 0, filter: "drop-shadow(0 0 0 rgba(255,255,255,0)) blur(6px)", duration: 0.9, ease: "power2.in" }, 1.25);
    return tl;
  };

  /* 2 → 3 · The KitKat card becomes the KitKat campaign */
  T["1>2"] = function (from, to, ctx) {
    const cards = from.parts.cards;
    const kk = cards[0].card;
    const r = stageRect(kk);
    const R = 1920, B = 1080;
    const inset = (x, y, w, h, rad) => `inset(${y}px ${R - x - w}px ${B - y - h}px ${x}px round ${rad}px)`;
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(veil, {
      autoAlpha: 1,
      background: "radial-gradient(60% 70% at 50% 60%, #c3112b 0%, #7d0617 55%, #2a0308 100%)",
      clipPath: inset(r.x, r.y, r.w, r.h, 30)
    })
      .set(veil, { autoAlpha: 0 })
      .to([from.parts.title, from.parts.sub, from.parts.hint], { autoAlpha: 0, y: -12, duration: 0.45, ease: "power2.in" }, 0)
      .to([cards[1].card, cards[2].card], { autoAlpha: 0, scale: 0.94, y: 30, duration: 0.55, stagger: 0.06, ease: "power2.in" }, 0)
      .to(kk, { scale: 1.03, duration: 0.5, ease: "power2.out" }, 0)
      .to(veil, { autoAlpha: 1, duration: 0.35, ease: "none" }, 0.25)
      .to(veil, { clipPath: inset(0, 0, R, B, 0), duration: 0.95, ease: "expo.inOut" }, 0.35)
      .add(ctx.swap, 1.25)
      .set(from.el, { autoAlpha: 0 }, 1.26)
      .to(veil, { autoAlpha: 0, duration: 1.1, ease: "power2.out" }, 1.35);
    return tl;
  };

  /* 3 → 4 · Chocolate closes into coffee; a light sweep reveals the new scene */
  T["2>3"] = function (from, to, ctx) {
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(veil, {
      autoAlpha: 1,
      background: "radial-gradient(circle at 49% 58%, #6a3a1e 0%, #3a1f10 38%, #1a0d06 70%, #0c0603 100%)",
      clipPath: "circle(0% at 49% 58%)"
    })
      .to(from.el, { scale: 1.05, duration: 1.0, ease: "power2.in" }, 0)
      .to(veil, { clipPath: "circle(120% at 49% 58%)", duration: 1.0, ease: "power3.in" }, 0.05)
      .add(ctx.swap, 1.05)
      .set(from.el, { autoAlpha: 0 }, 1.06)
      .set(band, { autoAlpha: 1, x: -700 }, 1.05)
      .to(veil, { autoAlpha: 0, duration: 1.2, ease: "power2.out" }, 1.15)
      .to(band, { x: 2300, duration: 1.5, ease: "power2.inOut" }, 1.05)
      .to(band, { autoAlpha: 0, duration: 0.3 }, 2.3);
    return tl;
  };

  /* 4 → 5 · Steam rises out of the coffee and clears onto the kitchen */
  T["3>4"] = function (from, to, ctx) {
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(veil, {
      autoAlpha: 1,
      top: "-35%", bottom: "-35%",
      background: "linear-gradient(0deg, #3a200d 0%, #7a4c1d 30%, #b98a2a 55%, #d9b44a 75%, #7a5a1a 100%)",
      WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
      maskImage: "linear-gradient(0deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
      yPercent: 100
    })
      .to(from.el, { y: -40, duration: 1.0, ease: "power2.in" }, 0)
      .to(veil, { yPercent: 0, duration: 1.0, ease: "power2.in" }, 0)
      .add(ctx.swap, 1.0)
      .set(from.el, { autoAlpha: 0 }, 1.01)
      .to(veil, { yPercent: -100, duration: 1.3, ease: "power2.out" }, 1.0);
    return tl;
  };

  /* 5 → 6 · Three brand colours rise, then converge to one point */
  T["4>5"] = function (from, to, ctx) {
    const colors = ["#a5122a", "#3a1f10", "#d9a400"];
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(barsWrap, { autoAlpha: 1 });
    bars.forEach((b, i) => gsap.set(b, { background: `linear-gradient(180deg, ${colors[i]}, ${gsap.utils.interpolate(colors[i], "#05090f", 0.55)})`, scaleY: 0, transformOrigin: "50% 100%" }));
    tl.to(from.el, { scale: 0.96, duration: 0.9, ease: "power2.in" }, 0)
      .to(bars, { scaleY: 1, duration: 0.8, stagger: 0.12, ease: "power3.inOut" }, 0)
      .add(ctx.swap, 1.05)
      .set(from.el, { autoAlpha: 0 }, 1.06)
      .set(bars[0], { transformOrigin: "100% 50%" }, 1.05)
      .set(bars[1], { transformOrigin: "50% 50%" }, 1.05)
      .set(bars[2], { transformOrigin: "0% 50%" }, 1.05)
      .to(bars, { scaleX: 0, duration: 1.05, ease: "expo.inOut" }, 1.1)
      .to(bars, { autoAlpha: 0, duration: 0.3 }, 1.9);
    return tl;
  };

  /* Default · a pane of frosted glass sweeps across (backwards or jumps) */
  T.sheet = function (from, to, ctx) {
    const dir = ctx.dir;
    const startX = dir > 0 ? -900 : 2100, endX = dir > 0 ? 2100 : -900;
    const tl = gsap.timeline({ defaults: { ease: M.inOut } });
    tl.set(sheet, { autoAlpha: 1, x: startX })
      .set(band, { autoAlpha: 0.9, x: startX - dir * 200 })
      .to(sheet, { x: endX, duration: 1.3, ease: "power2.inOut" }, 0)
      .to(band, { x: endX - dir * 200, duration: 1.3, ease: "power2.inOut" }, 0)
      .to(from.el, { autoAlpha: 0, duration: 0.45, ease: "none" }, 0.35)
      .add(ctx.swap, 0.6)
      .to([sheet, band], { autoAlpha: 0, duration: 0.25 }, 1.15);
    return tl;
  };

  /* Reduced motion · a short cross-dissolve */
  T.reduced = function (from, to, ctx) {
    return gsap.timeline()
      .add(ctx.swap, 0)
      .fromTo(to.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none", clearProps: "opacity,visibility" }, 0);
  };

  NFJ.transitions = {
    pick(fromIdx, toIdx) {
      if (M.reduced) return T.reduced;
      return T[`${fromIdx}>${toIdx}`] || T.sheet;
    },
    resetFx
  };
})();
