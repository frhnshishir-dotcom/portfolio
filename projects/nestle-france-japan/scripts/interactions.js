/* =========================================================================
   Global interactions: keyboard, full screen, reduced motion, replay,
   credits, touch swipe and the self-hiding control bar.
   (Slide-specific interaction lives with its slide, e.g. the product
   exhibition in slides/slide-02.js.)
   ========================================================================= */
(function () {
  "use strict";
  const { $ } = NFJ;
  const M = NFJ.motion;

  /* ---------- Full screen ---------- */
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function toggleFullscreen() {
    const d = document;
    if (!isFs()) {
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
    const id = NFJ.nav.currentId;
    const cur = id && NFJ.slideModules[id];
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
  document.addEventListener("click", (e) => {
    if (credits.classList.contains("is-open") && !e.target.closest("#credits")) toggleCredits(false);
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
    const k = e.key;
    const onButton = e.target.closest && e.target.closest("button");
    if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Spacebar") {
      // Space on a focused button presses the button instead (e.g. a brand tab).
      if ((k === " " || k === "Spacebar") && onButton && !onButton.closest("#chrome")) return;
      e.preventDefault();
      NFJ.nav.next();
    } else if (k === "ArrowLeft" || k === "PageUp") {
      e.preventDefault();
      NFJ.nav.prev();
    } else if (k === "Home") {
      e.preventDefault(); NFJ.nav.go(0);
    } else if (k === "End") {
      e.preventDefault(); NFJ.nav.go(NFJ.nav.total - 1);
    } else if (k === "Escape") {
      // Close an open interaction first; otherwise leave full screen.
      if (credits.classList.contains("is-open")) toggleCredits(false);
      else if (isFs()) toggleFullscreen();
    } else if (k === "f" || k === "F") {
      e.preventDefault(); toggleFullscreen();
    } else if (k === "r" || k === "R") {
      e.preventDefault(); NFJ.nav.replay();
    }
  });

  /* ---------- Control bar ---------- */
  $("#prev").addEventListener("click", () => NFJ.nav.prev());
  $("#next").addEventListener("click", () => NFJ.nav.next());
  $("#replay").addEventListener("click", () => NFJ.nav.replay());
  $("#fs").addEventListener("click", toggleFullscreen);

  /* ---------- Touch swipe between slides ---------- */
  let sx = 0, sy = 0, st = 0;
  const vp = $("#viewport");
  vp.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  vp.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? NFJ.nav.next() : NFJ.nav.prev();
    }
  }, { passive: true });

  /* ---------- The control bar wakes on pointer movement ---------- */
  let wakeTimer = null;
  document.addEventListener("pointermove", () => {
    document.body.classList.add("chrome-awake");
    clearTimeout(wakeTimer);
    wakeTimer = setTimeout(() => document.body.classList.remove("chrome-awake"), 2200);
  });
})();
