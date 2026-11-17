/* =========================================================================
   Analytical slides (context, packaging, pricing, distribution, advertising,
   ads, findings) — one declarative module per <section class="slide an">.

   Markup drives the motion, so the copy can change without touching JS:
     data-a="label|title|rise|pop|glass|line|fade|stagger"   entrance type
     data-t="1.2"                                             start (s)
     data-from="right"           glass only: direction of the materialise
     data-sel=".a, .b"           stagger only: children that pop in

   Motion is deliberately restrained (rises, fades, one hairline) so the
   analytical slides read as calm editorial pages next to the cinematic
   brand scenes. Reduced motion jumps every entrance to its end state.

   NFJ.video — click-to-play YouTube embeds for the ad slide:
     · nothing loads or plays until the presenter clicks the poster;
     · the player uses the privacy-enhanced youtube-nocookie.com domain;
     · leaving or replaying the slide unloads the player (sound stops);
     · after a click inside the player, keyboard focus returns to the deck,
       so ← → and Space keep navigating;
     · link mode (file:// pages, or hosts that forbid embedded frames) turns
       each poster into a plain link that opens YouTube in a new tab.
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;

  /* ---------------------------------------------------------------- video */
  NFJ.video = (function () {
    // YouTube needs the page's origin (HTTP Referer) to start its player, and
    // a page opened straight from disk (file://) has none — so link mode there.
    const mode = window.NFJ_VIDEO_MODE || (location.protocol === "file:" ? "link" : "embed");
    const params = "autoplay=1&rel=0&playsinline=1&modestbranding=1";

    function setup(root) {
      $$(".vd", root).forEach((vd) => {
        const a = $(".vd-poster", vd);
        if (!a) return;
        if (mode === "link") {
          vd.classList.add("vd--link");
          const m = $(".vd-mode", vd);
          if (m) m.textContent = "on YouTube ↗";
          a.setAttribute("aria-label", a.getAttribute("aria-label").replace(", YouTube)", ", opens YouTube in a new tab)"));
          return;
        }
        a.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          load(vd);
        });
      });
    }

    function load(vd) {
      if ($("iframe", vd)) return;
      unload(document, vd);                       // one player at a time
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vd.dataset.yt)}?${params}`;
      f.title = `${vd.dataset.name} (YouTube video)`;
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.setAttribute("allowfullscreen", "");
      f.referrerPolicy = "strict-origin-when-cross-origin";
      vd.appendChild(f);
      vd.classList.add("is-playing");
      const a = $(".vd-poster", vd);
      if (a) a.setAttribute("tabindex", "-1");
    }

    function unload(root, except) {
      $$(".vd", root || document).forEach((vd) => {
        if (vd === except) return;
        const f = $("iframe", vd);
        if (f) { f.src = "about:blank"; f.remove(); }
        vd.classList.remove("is-playing");
        const a = $(".vd-poster", vd);
        if (a) a.removeAttribute("tabindex");
      });
    }

    // A click inside the player moves keyboard focus into the frame, where the
    // deck cannot hear ← →. Hand focus straight back; the mouse still controls
    // the player (play, pause, seek, volume, full screen).
    window.addEventListener("blur", () => {
      setTimeout(() => {
        const el = document.activeElement;
        if (el && el.tagName === "IFRAME" && el.closest(".vd")) {
          el.blur();
          window.focus();
        }
      }, 0);
    });

    return { mode, setup, load, unload };
  })();

  /* -------------------------------------------------------------- modules */
  function itemsOf(el) { return $$("[data-a]", el); }

  function hide(n) {
    const a = n.dataset.a;
    gsap.killTweensOf(n);
    if (a === "line") gsap.set(n, { scaleX: 0, autoAlpha: 1 });
    else if (a === "stagger") { gsap.set(n, { autoAlpha: 1 }); gsap.set($$(n.dataset.sel, n), { autoAlpha: 0, scale: 0.8 }); }
    else gsap.set(n, { autoAlpha: 0 });
  }

  function build(n) {
    const a = n.dataset.a;
    switch (a) {
      case "label": return NFJ.textIn(n, { y: 10, duration: 0.6, blur: 4 });
      case "title": return NFJ.wordsIn(n, { stagger: 0.045, duration: 0.85 });
      case "rise": return gsap.fromTo(n, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: M.out });
      case "pop": return gsap.fromTo(n, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: M.out });
      case "glass": return NFJ.glassIn(n, { from: n.dataset.from || "bottom", duration: 0.85 });
      case "line": return gsap.fromTo(n, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: M.inOut });
      case "fade": return gsap.fromTo(n, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "none" });
      case "stagger": return gsap.fromTo($$(n.dataset.sel, n), { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)", stagger: { each: 0.035, from: "start" } });
      default: return null;
    }
  }

  $$("section.slide.an").forEach((el) => {
    const id = el.dataset.slideId;
    const items = itemsOf(el);
    NFJ.video.setup(el);

    NFJ.registerSlide(id, {
      el,
      parts: { el, items },
      reset() {
        NFJ.video.unload(el);
        items.forEach(hide);
      },
      enter() {
        const tl = gsap.timeline();
        items.forEach((n) => {
          const tw = build(n);
          if (tw) tl.add(tw, parseFloat(n.dataset.t) || 0);
        });
        return tl;
      },
      idle() {},
      stop() { NFJ.video.unload(el); }
    });
  });
})();
