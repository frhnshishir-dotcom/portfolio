/* =========================================================================
   Interactions — slide 2 brand focus (pointer + touch + keyboard),
   keyboard controls, full screen, reduced motion and credits.
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;

  /* ---------- Slide 2: hover emphasis and click focus ---------- */
  const cards = $$(".s2-card");
  let focused = null;

  function layout(animate) {
    const d = animate && !M.reduced ? 0.8 : 0;
    cards.forEach((c) => {
      const isFocus = focused === c;
      const isHover = c.classList.contains("is-hover") && !focused;
      const grow = focused ? (isFocus ? 2.6 : 0.62) : isHover ? 1.22 : 1;
      const dim = focused && !isFocus ? 0.45 : !focused && cards.some((x) => x.classList.contains("is-hover")) && !isHover ? 0.75 : 1;
      gsap.to(c, { "--grow": grow, duration: d, ease: "expo.out", overwrite: "auto" });
      gsap.to($(".s2-media", c), { opacity: dim, duration: d * 0.8, ease: "power2.out", overwrite: "auto" });
      gsap.to($(".s2-photo", c), { scale: isFocus ? 1.02 : isHover ? 1.1 : 1.06, duration: d * 1.4, ease: "power3.out", overwrite: "auto" });
      gsap.to($(".s2-product", c), { y: isFocus ? -24 : isHover ? -14 : 0, scale: isFocus ? 1.12 : 1, duration: d, ease: "expo.out", overwrite: "auto" });
      gsap.to($(".s2-label", c), { y: isHover || isFocus ? -6 : 0, "--tint": isFocus ? 0.62 : 0.5, duration: d * 0.7, ease: "power3.out", overwrite: "auto" });
      c.classList.toggle("is-compact", !!focused && !isFocus);
      const detail = $(".s2-detail", c);
      const hit = $(".s2-hit", c);
      hit.setAttribute("aria-expanded", isFocus ? "true" : "false");
      if (isFocus) {
        gsap.killTweensOf(detail);
        const tl = NFJ.glassIn(detail, { from: "right", duration: 0.8 });
        if (!d) tl.progress(1);
      } else if (gsap.getProperty(detail, "opacity") > 0) {
        gsap.to(detail, { autoAlpha: 0, x: 20, duration: d * 0.5, ease: "power2.in", overwrite: true, onComplete: () => gsap.set(detail, { x: 0 }) });
      }
    });
  }

  const onActiveSlide2 = () => NFJ.state.index === 1 && !NFJ.state.busy;

  cards.forEach((c) => {
    const hit = $(".s2-hit", c);
    c.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || !onActiveSlide2()) return;
      c.classList.add("is-hover");
      layout(true);
    });
    c.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      c.classList.remove("is-hover");
      if (onActiveSlide2()) layout(true);
    });
    hit.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!onActiveSlide2()) return;
      focused = focused === c ? null : c;
      layout(true);
    });
  });

  NFJ.brandFocus = {
    close(instant) {
      if (!focused && !cards.some((c) => c.classList.contains("is-hover"))) return false;
      focused = null;
      cards.forEach((c) => c.classList.remove("is-hover"));
      layout(!instant);
      return true;
    },
    get open() { return !!focused; }
  };

  /* ---------- Full screen ---------- */
  function toggleFullscreen() {
    const d = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const r = d.documentElement;
      (r.requestFullscreen || r.webkitRequestFullscreen || function () {}).call(r);
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
    }
  }
  NFJ.toggleFullscreen = toggleFullscreen;

  /* ---------- Reduced motion ---------- */
  const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let stored = null;
  try { stored = localStorage.getItem("nfj-reduce-motion"); } catch (e) { /* storage blocked */ }
  function setReduced(on, persist) {
    M.reduced = !!on;
    document.body.classList.toggle("reduce-motion", M.reduced);
    $("#motion").setAttribute("aria-pressed", M.reduced ? "true" : "false");
    if (persist) { try { localStorage.setItem("nfj-reduce-motion", M.reduced ? "1" : "0"); } catch (e) { /* ignore */ } }
    const cur = NFJ.slides[NFJ.state.index];
    if (cur) {
      cur.stop();
      if (!M.reduced) cur.idle();
    }
  }
  setReduced(stored !== null ? stored === "1" : mq && mq.matches, false);
  $("#motion").addEventListener("click", () => setReduced(!M.reduced, true));

  /* ---------- Credits ---------- */
  const credits = $("#credits"), creditsBtn = $("#credits-btn");
  function toggleCredits(force) {
    const open = force !== undefined ? force : !credits.classList.contains("is-open");
    credits.classList.toggle("is-open", open);
    creditsBtn.setAttribute("aria-expanded", open ? "true" : "false");
    return open;
  }
  creditsBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleCredits(); });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Spacebar") {
      // Space on a focused button should still press the button
      if ((k === " " || k === "Spacebar") && e.target.closest && e.target.closest("button")) return;
      e.preventDefault();
      NFJ.brandFocus.close();
      NFJ.nav.next();
    } else if (k === "ArrowLeft" || k === "PageUp") {
      e.preventDefault();
      NFJ.brandFocus.close();
      NFJ.nav.prev();
    } else if (k === "Home") {
      e.preventDefault(); NFJ.nav.go(0);
    } else if (k === "End") {
      e.preventDefault(); NFJ.nav.go(NFJ.nav.total - 1);
    } else if (k === "Escape") {
      // Close an open interaction first; otherwise leave full screen.
      if (credits.classList.contains("is-open")) toggleCredits(false);
      else if (!NFJ.brandFocus.close() && (document.fullscreenElement || document.webkitFullscreenElement)) toggleFullscreen();
    } else if (k === "f" || k === "F") {
      e.preventDefault(); toggleFullscreen();
    } else if (/^[1-6]$/.test(k)) {
      NFJ.nav.go(Number(k) - 1);
    }
  });

  /* ---------- Chrome buttons + clicking the stage ---------- */
  $("#prev").addEventListener("click", () => NFJ.nav.prev());
  $("#next").addEventListener("click", () => NFJ.nav.next());
  $("#fs").addEventListener("click", toggleFullscreen);
  document.addEventListener("click", (e) => {
    if (credits.classList.contains("is-open") && !e.target.closest("#credits")) toggleCredits(false);
  });
  // Clicking an empty area of slide 2 releases the brand focus.
  $('[data-slide="2"]').addEventListener("click", (e) => {
    if (!e.target.closest(".s2-card")) NFJ.brandFocus.close();
  });

  /* ---------- Touch swipe between slides ---------- */
  let sx = 0, sy = 0, st = 0;
  const vp = $("#viewport");
  vp.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  vp.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      NFJ.brandFocus.close();
      dx < 0 ? NFJ.nav.next() : NFJ.nav.prev();
    }
  }, { passive: true });

  /* ---------- Chrome wakes on pointer movement ---------- */
  let wakeTimer = null;
  document.addEventListener("pointermove", () => {
    document.body.classList.add("chrome-awake");
    clearTimeout(wakeTimer);
    wakeTimer = setTimeout(() => document.body.classList.remove("chrome-awake"), 2200);
  });
})();
