/* =========================================================================
   Motion system — shared tokens and reusable GSAP building blocks.
   Every slide composes its timeline from these so the deck keeps one
   motion language: slow cinematic easing, masked type, glass that
   materialises (blur 0 → 18px) and light that travels along glass edges.
   Plain scripts (no modules) so index.html also runs from file://.
   ========================================================================= */
(function () {
  "use strict";

  const NFJ = (window.NFJ = window.NFJ || {});
  NFJ.slideModules = NFJ.slideModules || {};

  const M = (NFJ.motion = {
    // Durations (seconds) — match the brief's recommended ranges
    text: 0.65,
    product: 1.05,
    image: 1.4,
    ambient: 7,
    transition: 0.9,
    // Easing
    out: "power3.out",
    inOut: "power2.inOut",
    expo: "expo.out",
    soft: "sine.inOut",
    reduced: false
  });

  /** Register a slide module by id: { el, reset(), enter() -> timeline, idle(), stop(), parts? }.
      Order is decided by scripts/deck.config.js, never by the module. */
  NFJ.registerSlide = function (id, mod) {
    if (NFJ.slideModules[id]) console.warn(`[deck] slide "${id}" registered twice`);
    NFJ.slideModules[id] = mod;
  };

  const $ = (NFJ.$ = (sel, root) => (root || document).querySelector(sel));
  const $$ = (NFJ.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel)));

  /* ---------- Typography ---------- */

  /** Wrap each word in a mask (.w) with an inner span (.wi) — idempotent. */
  NFJ.splitWords = function (el) {
    if (!el || el.dataset.split) return el ? $$(".wi", el) : [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement("span");
            w.className = "w";
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = p;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("visually-hidden") && !child.classList.contains("w")) {
          walk(child);
        }
      });
    };
    walk(el);
    el.dataset.split = "1";
    return $$(".wi", el);
  };

  /** Masked, staggered word reveal. */
  NFJ.wordsIn = function (el, opts) {
    const o = Object.assign({ stagger: 0.07, duration: M.text + 0.25, y: "108%", ease: M.expo }, opts);
    const words = NFJ.splitWords(el);
    const tl = gsap.timeline();
    tl.set(el, { autoAlpha: 1 });
    tl.fromTo(words, { yPercent: 0, y: o.y, rotate: 2 }, { y: 0, rotate: 0, duration: o.duration, ease: o.ease, stagger: o.stagger });
    if (o.track) tl.fromTo(el, { letterSpacing: o.track[0] }, { letterSpacing: o.track[1], duration: o.duration + 0.8, ease: M.out }, 0);
    return tl;
  };

  /** Simple supporting-text entrance: soft rise and focus. */
  NFJ.textIn = function (el, opts) {
    const o = Object.assign({ y: 18, duration: M.text, blur: 6 }, opts);
    return gsap.fromTo(el, { autoAlpha: 0, y: o.y, filter: `blur(${o.blur}px)` },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: o.duration, ease: M.out, clearProps: "filter" });
  };

  /* ---------- Glass ---------- */

  /** Glass materialises: blur rises from 0, surface fades in, edge light travels once. */
  NFJ.glassIn = function (el, opts) {
    const o = Object.assign({ duration: 0.9, blur: null, from: "bottom", scale: 0.985 }, opts);
    const targetBlur = o.blur || getComputedStyle(el).getPropertyValue("--blur").trim() || "18px";
    const clip = {
      bottom: "inset(100% 0% 0% 0% round 24px)",
      left: "inset(0% 100% 0% 0% round 24px)",
      right: "inset(0% 0% 0% 100% round 24px)",
      center: "inset(50% 50% 50% 50% round 24px)",
      none: "inset(0% 0% 0% 0% round 0px)"
    }[o.from];
    const tl = gsap.timeline();
    tl.fromTo(el,
      { autoAlpha: 0, "--blur": "0px", "--edge-x": "-30%", "--sheen-x": "-60%", scale: o.scale, clipPath: clip },
      { autoAlpha: 1, "--blur": targetBlur, scale: 1, clipPath: "inset(0% 0% 0% 0% round 0px)", duration: o.duration, ease: M.out, clearProps: "clipPath" });
    tl.to(el, { "--edge-x": "130%", duration: 1.6, ease: M.soft }, 0.2);
    tl.to(el, { "--sheen-x": "140%", duration: 1.8, ease: M.soft }, 0.25);
    return tl;
  };

  /** Light travelling along glass borders — gentle, infrequent loop. */
  NFJ.glassAmbient = function (els, opts) {
    const o = Object.assign({ every: 7 }, opts);
    const list = [].concat(els).filter(Boolean);
    return list.map((el, i) =>
      gsap.timeline({ repeat: -1, repeatDelay: o.every, delay: 1.5 + i * 0.9 })
        .fromTo(el, { "--edge-x": "-30%" }, { "--edge-x": "130%", duration: 2.4, ease: M.soft })
        .fromTo(el, { "--sheen-x": "-60%" }, { "--sheen-x": "140%", duration: 2.8, ease: M.soft }, 0.1)
    );
  };

  /* ---------- Images & products ---------- */

  /** Image reveal through a mask with a slow settle (camera-like). */
  NFJ.imageIn = function (el, opts) {
    const o = Object.assign({ from: "left", scale: 1.14, duration: M.image }, opts);
    const clip = {
      left: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
      right: ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"],
      up: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
      down: ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]
    }[o.from];
    const tl = gsap.timeline();
    tl.fromTo(el, { clipPath: clip[0] }, { clipPath: clip[1], duration: o.duration, ease: M.inOut, clearProps: "clipPath" });
    if (o.inner) tl.fromTo(o.inner, { scale: o.scale }, { scale: 1, duration: o.duration + 1.4, ease: M.out }, 0);
    return tl;
  };

  /** Product entrance: rises into place with a short settle, shadow grows with it. */
  NFJ.productIn = function (el, opts) {
    const o = Object.assign({ y: 70, rotate: 0, scale: 0.94, duration: M.product, shadow: null, blur: 8, ease: M.expo }, opts);
    const tl = gsap.timeline();
    const target = el.querySelector("img") || el;
    // Opacity and focus resolve quickly; position settles with the slide's own ease.
    tl.fromTo(target, { autoAlpha: 0, filter: `blur(${o.blur}px)` },
      { autoAlpha: 1, filter: "blur(0px)", duration: o.duration * 0.6, ease: M.out, clearProps: "filter" }, 0);
    tl.fromTo(target, { y: o.y, scale: o.scale, rotate: o.rotate },
      { y: 0, scale: 1, rotate: 0, duration: o.duration, ease: o.ease }, 0);
    if (o.shadow) tl.fromTo(o.shadow, { autoAlpha: 0, scaleX: 0.6 }, { autoAlpha: 1, scaleX: 1, duration: o.duration, ease: M.out }, 0.1);
    return tl;
  };

  /** Ken Burns style drift for backgrounds (idle). */
  NFJ.drift = function (el, opts) {
    const o = Object.assign({ x: 18, y: 8, scale: 1.04, duration: M.ambient }, opts);
    return gsap.to(el, { x: o.x, y: o.y, scale: o.scale, duration: o.duration, ease: M.soft, repeat: -1, yoyo: true });
  };

  /** Floating "breath" for products — a few pixels only. */
  NFJ.breathe = function (el, opts) {
    const o = Object.assign({ y: -6, duration: 4.2, delay: 0 }, opts);
    return gsap.to(el, { y: o.y, duration: o.duration, ease: M.soft, repeat: -1, yoyo: true, delay: o.delay });
  };

  /** A slide's idle loops are collected so they can be killed on exit. */
  NFJ.idleBag = function () {
    const items = [];
    return {
      add(...t) { t.flat().forEach((x) => x && items.push(x)); },
      kill() { items.splice(0).forEach((t) => t.kill()); }
    };
  };

  /** Shrink any [data-fit] element until it fits its box (guards against clipping). */
  NFJ.fitText = function (root) {
    $$("[data-fit]", root).forEach((el) => {
      el.style.fontSize = "";
      let size = parseFloat(getComputedStyle(el).fontSize);
      let guard = 0;
      // Elements are block-level or carry a max-width, so overflow shows as scrollWidth > clientWidth.
      while (el.scrollWidth > el.clientWidth + 1 && guard++ < 60) {
        size -= 1;
        el.style.fontSize = size + "px";
      }
    });
  };
})();
