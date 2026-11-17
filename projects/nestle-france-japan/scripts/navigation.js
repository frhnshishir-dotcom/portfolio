/* =========================================================================
   Navigation state machine (id-based).
   - The order comes from NFJ.deckConfig.sequence; slides never assume who
     their neighbours are, so analytical slides can be interleaved later.
   - One transition at a time. A press during a transition is ignored, which
     prevents accidental double navigation (a quick double tap of → moves one
     slide, not two).
   - The incoming slide's entrance runs on its own clock. Moving on before it
     finishes completes it instantly, so nothing is left half-animated.
   - Every arrival calls reset() first, so returning to a slide replays it
     from a clean initial state. R replays the current slide.
   ========================================================================= */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;

  // Resolve the sequence against the slides that actually exist.
  const order = (NFJ.deckConfig.sequence || []).filter((id) => {
    const ok = NFJ.slideModules[id] && $(`[data-slide-id="${id}"]`);
    if (!ok) console.warn(`[deck] "${id}" is in the sequence but has no section/module — skipped.`);
    return ok;
  });
  const total = order.length;
  const mod = (i) => NFJ.slideModules[order[i]];

  const state = { index: -1, busy: false, master: null, enterTl: null, lastInput: 0 };
  NFJ.state = state;

  const CLEAR = "transform,opacity,visibility,filter,clipPath,x,y,scale,rotate,rotationX,rotationY,xPercent,yPercent";

  // Label every slide with its live position ("Slide 3 of 6: …").
  order.forEach((id, i) => {
    const el = mod(i).el;
    const name = el.dataset.title || id;
    el.setAttribute("aria-label", `Slide ${i + 1} of ${total}: ${name}`);
    el.setAttribute("aria-roledescription", "slide");
  });

  function updateChrome(i) {
    $("#count").innerHTML = `${i + 1} <span>/ ${total}</span>`;
    $$("#progress .chrome__dot").forEach((d, n) => {
      d.classList.toggle("is-current", n === i);
      d.classList.toggle("is-done", n < i);
      d.setAttribute("aria-current", n === i ? "step" : "false");
    });
    $("#prev").disabled = i === 0;
    $("#next").disabled = i === total - 1;
    document.title = `${i + 1}/${total} · ${NFJ.deckConfig.title}`;
    try { history.replaceState(null, "", `#${order[i]}`); } catch (e) { /* file:// may refuse */ }
  }

  function finishEnter() {
    if (state.enterTl) { state.enterTl.progress(1).kill(); state.enterTl = null; }
  }

  function cleanLeaving(from) {
    from.el.classList.remove("is-leaving", "is-active", "is-entering");
    gsap.set(from.el, { clearProps: CLEAR });
    gsap.set($$("*", from.el), { clearProps: CLEAR });
  }

  function go(target, opts) {
    const o = opts || {};
    target = Math.max(0, Math.min(total - 1, target));
    if (state.busy) return;                       // no double navigation
    if (target === state.index && !o.replay) return;

    const fromIdx = state.index;
    const replay = target === fromIdx;
    const to = mod(target);
    const from = fromIdx >= 0 && !replay ? mod(fromIdx) : null;
    const dir = target > fromIdx ? 1 : -1;

    state.busy = true;
    finishEnter();
    if (fromIdx >= 0) mod(fromIdx).stop();

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
      if (from) cleanLeaving(from);
      NFJ.transitions.resetFx();
      to.el.classList.remove("is-entering");
      to.el.classList.add("is-active");
      state.index = target;
      state.master = null;
      state.busy = false;
      const startIdle = () => { if (state.index === target && !M.reduced) to.idle(); };
      if (enterTl.progress() >= 1) startIdle();
      else enterTl.eventCallback("onComplete", startIdle);
    };

    if (!from || o.instant) {
      swap();
      settle();
      return;
    }

    const pick = NFJ.transitions.pick(order[fromIdx], order[target], dir);
    const tl = pick(from, to, { swap, dir });
    tl.eventCallback("onComplete", () => { swap(); settle(); });
    state.master = tl;
  }

  NFJ.nav = {
    go,
    goId(id) { const i = order.indexOf(id); if (i >= 0) go(i); },
    next() { go(state.index + 1); },
    prev() { go(state.index - 1); },
    replay() { if (state.index >= 0) go(state.index, { replay: true }); },
    get index() { return state.index; },
    get currentId() { return order[state.index]; },
    order,
    total
  };
})();
