/* =========================================================================
   Navigation state machine.
   - One transition at a time. Input during a transition is not dropped:
     the latest requested target is queued and the running transition is
     sped up, so rapid key presses never stack or overlap slide states.
   - The incoming slide's entrance timeline runs on its own clock; if the
     presenter moves on before it finishes, it is completed instantly.
   - Idle loops only run on the settled, active slide.
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const total = 6;

  const state = { index: -1, target: -1, busy: false, pending: null, master: null, enterTl: null };
  NFJ.state = state;

  const CLEAR = "transform,opacity,visibility,filter,clipPath,x,y,scale,rotate,xPercent,yPercent";

  function updateChrome(i) {
    $("#count").innerHTML = `${i + 1} <span>/ ${total}</span>`;
    $$("#progress .chrome__dot").forEach((d, n) => {
      d.classList.toggle("is-current", n === i);
      d.classList.toggle("is-done", n < i);
      d.setAttribute("aria-current", n === i ? "step" : "false");
    });
    $("#prev").disabled = i === 0;
    $("#next").disabled = i === total - 1;
    document.title = `${i + 1}/${total} · Nestlé: France × Japan`;
    try { history.replaceState(null, "", `#${i + 1}`); } catch (e) { /* file:// may refuse */ }
  }

  function finishEnter() {
    if (state.enterTl) { state.enterTl.progress(1).kill(); state.enterTl = null; }
  }

  function go(target, opts) {
    const o = opts || {};
    target = Math.max(0, Math.min(total - 1, target));
    if (state.busy) {
      // Queue the newest request and hurry the current transition along.
      state.pending = target;
      if (state.master) state.master.timeScale(3);
      return;
    }
    if (target === state.index) return;

    const fromIdx = state.index;
    const to = NFJ.slides[target];
    const from = fromIdx >= 0 ? NFJ.slides[fromIdx] : null;
    const dir = target > fromIdx ? 1 : -1;

    state.busy = true;
    state.target = target;
    finishEnter();
    if (from) from.stop();

    to.reset();
    gsap.set(to.el, { clearProps: "opacity,visibility,transform,filter" });
    const enterTl = to.enter().pause(0);
    state.enterTl = enterTl;

    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      to.el.classList.add("is-entering");
      if (from) { from.el.classList.remove("is-active"); from.el.classList.add("is-leaving"); }
      if (M.reduced || o.instant) enterTl.progress(1);
      else enterTl.play(0);
      updateChrome(target);
    };

    const settle = () => {
      if (from) {
        from.el.classList.remove("is-leaving", "is-active");
        gsap.set(from.el, { clearProps: CLEAR });
        gsap.set($$("*", from.el), { clearProps: CLEAR });
      }
      NFJ.transitions.resetFx();
      to.el.classList.remove("is-entering");
      to.el.classList.add("is-active");
      state.index = target;
      state.master = null;
      state.busy = false;
      // Idle loops start once the entrance has resolved.
      const startIdle = () => { if (state.index === target && !M.reduced) to.idle(); };
      if (enterTl.progress() >= 1) startIdle();
      else enterTl.eventCallback("onComplete", startIdle);

      if (state.pending !== null && state.pending !== state.index) {
        const next = state.pending;
        state.pending = null;
        go(next);
      } else {
        state.pending = null;
      }
    };

    if (!from || o.instant) {
      swap();
      settle();
      return;
    }

    const tl = NFJ.transitions.pick(fromIdx, target)(from, to, { swap, dir });
    tl.eventCallback("onComplete", () => { swap(); settle(); });
    state.master = tl;
  }

  NFJ.nav = {
    go,
    // While a transition runs, count from the newest requested slide, not the one on screen.
    next() { go((state.pending ?? (state.busy ? state.target : state.index)) + 1); },
    prev() { go((state.pending ?? (state.busy ? state.target : state.index)) - 1); },
    get index() { return state.index; },
    total
  };
})();
