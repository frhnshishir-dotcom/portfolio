/* Portfolio — an interactive product exhibition.
   Three products share one showroom: a central hero and two supporting
   products set back on the left and right. Selecting a brand (product or tab)
   trades places with the current hero through one coordinated move; the
   room's light, the tab highlight and the caption follow. KitKat is the hero
   on every arrival, so the slide also works with no interaction at all. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide-id="portfolio"]');
  const idle = NFJ.idleBag();

  const title = $(".s2-title", el), sub = $(".s2-sub", el);
  const wall = $(".s2-wall", el), floor = $(".s2-floor", el);
  const tabsBox = $(".s2-tabs", el), tabGlow = $(".s2-tab-glow", el), caption = $(".s2-caption", el);
  const items = {}, lights = {}, tabs = {}, caps = {};
  $$(".s2-item", el).forEach((n) => (items[n.dataset.brand] = n));
  $$(".s2-tab", el).forEach((n) => (tabs[n.dataset.brand] = n));
  $$(".s2-cap", el).forEach((n) => (caps[n.dataset.brand] = n));
  ["kitkat", "nescafe", "maggi"].forEach((b) => (lights[b] = $(`.s2-light--${b}`, el)));

  // Slot geometry: x = centre line, y = floor contact line.
  const SLOTS = {
    center: { x: 960, y: 842, scale: 1, rotationY: 0, bright: 1, z: 30 },
    left: { x: 505, y: 770, scale: 0.6, rotationY: 16, bright: 0.5, z: 10 },
    right: { x: 1415, y: 770, scale: 0.6, rotationY: -16, bright: 0.5, z: 10 }
  };
  const DEFAULT = { kitkat: "center", nescafe: "left", maggi: "right" };
  let slots = Object.assign({}, DEFAULT);
  let moving = false;

  const hero = () => Object.keys(slots).find((b) => slots[b] === "center");
  const place = (b, slotName) => {
    const s = SLOTS[slotName], n = items[b];
    return { x: s.x - n.offsetWidth / 2, y: s.y - n.offsetHeight, scale: s.scale, rotationY: s.rotationY, zIndex: s.z,
      filter: `brightness(${s.bright}) saturate(${0.75 + s.bright * 0.25})` };
  };

  function moveTabGlow(b, d) {
    const t = tabs[b];
    gsap.to(tabGlow, { x: t.offsetLeft - 6, width: t.offsetWidth, duration: d, ease: "power3.inOut" });
    Object.keys(tabs).forEach((k) => tabs[k].setAttribute("aria-selected", k === b ? "true" : "false"));
    Object.keys(items).forEach((k) => items[k].setAttribute("aria-pressed", k === b ? "true" : "false"));
  }
  function showCaption(b, d) {
    Object.keys(caps).forEach((k) => {
      if (k === b) gsap.fromTo(caps[k], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: d, delay: d * 0.35, ease: M.out, overwrite: true });
      else gsap.to(caps[k], { autoAlpha: 0, y: -6, duration: d * 0.4, ease: "power2.in", overwrite: true });
    });
  }
  function light(b, d) {
    Object.keys(lights).forEach((k) => gsap.to(lights[k], { autoAlpha: k === b ? 1 : 0, duration: d, ease: "sine.inOut", overwrite: true }));
  }

  /** Bring a brand to the hero position. Returns a timeline (or null if nothing to do). */
  function select(b, opts) {
    const o = opts || {};
    const current = hero();
    if (b === current || moving) return null;
    const from = slots[b];
    slots[current] = from;
    slots[b] = "center";
    const d = o.instant || M.reduced ? 0 : (o.duration || 0.95);
    moving = d > 0;
    const tl = gsap.timeline({ onComplete: () => (moving = false) });
    // The incoming hero arcs forward; the outgoing hero steps back to the side.
    const p1 = place(b, "center"), p0 = place(current, from);
    tl.to(items[b], Object.assign({}, p1, { duration: d, ease: "power3.inOut" }), 0)
      .to(items[current], Object.assign({}, p0, { duration: d, ease: "power3.inOut" }), 0);
    if (d) tl.to(items[b], { y: p1.y - 26, duration: d / 2, ease: "sine.out", yoyo: true, repeat: 1 }, 0);
    tl.set(items[b], { zIndex: 30 }, d * 0.4).set(items[current], { zIndex: 10 }, d * 0.4);
    light(b, d || 0.01);
    moveTabGlow(b, d || 0.01);
    showCaption(b, d || 0.01);
    if (!d) tl.progress(1);
    return tl;
  }

  // Pointer, touch and keyboard all go through the same buttons.
  Object.keys(items).forEach((b) => {
    items[b].addEventListener("click", (e) => { e.stopPropagation(); if (NFJ.nav.currentId === "portfolio" && !NFJ.state.busy) select(b); });
    tabs[b].addEventListener("click", (e) => { e.stopPropagation(); if (NFJ.nav.currentId === "portfolio" && !NFJ.state.busy) select(b); });
  });

  NFJ.registerSlide("portfolio", {
    el,
    reset() {
      idle.kill();
      moving = false;
      slots = Object.assign({}, DEFAULT);
      gsap.set([title, sub, tabsBox, caption], { autoAlpha: 0 });
      gsap.set([wall, floor], { autoAlpha: 0 });
      Object.values(lights).forEach((l) => gsap.set(l, { autoAlpha: 0 }));
      Object.values(caps).forEach((c) => gsap.set(c, { autoAlpha: 0, y: 0 }));
      Object.keys(items).forEach((b) => gsap.set(items[b], Object.assign(place(b, slots[b]), { autoAlpha: 0 })));
      moveTabGlow("kitkat", 0);
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      tl.to(wall, { autoAlpha: 1, duration: 0.9 }, 0)
        .to(floor, { autoAlpha: 1, duration: 1.1 }, 0.2);
      // Products appear deep in the room, close together …
      const deep = { kitkat: { x: 0, s: 0.34 }, nescafe: { x: -170, s: 0.24 }, maggi: { x: 170, s: 0.24 } };
      Object.keys(items).forEach((b, i) => {
        const end = place(b, slots[b]);
        const n = items[b];
        const startX = 960 + deep[b].x - n.offsetWidth / 2;
        tl.fromTo(n,
          { autoAlpha: 0, x: startX, y: 640 - n.offsetHeight, scale: deep[b].s, rotationY: b === "kitkat" ? 22 : 0, filter: "brightness(0.05) saturate(0.6)" },
          { autoAlpha: 1, duration: 0.6, ease: "none" }, 0.3 + i * 0.08)
        // … then the hero advances towards the viewer while the others take their places.
          .to(n, Object.assign({}, end, { duration: b === "kitkat" ? 1.5 : 1.25, ease: b === "kitkat" ? "expo.out" : "power3.inOut" }), b === "kitkat" ? 0.95 : 0.7);
      });
      tl.to(lights.kitkat, { autoAlpha: 1, duration: 1.2, ease: "sine.inOut" }, 1.1)
        .add(NFJ.wordsIn(title, { stagger: 0.06, duration: 0.9, track: ["0.08em", "0.02em"] }), 0.9)
        .add(NFJ.textIn(sub, { duration: 0.6 }), 1.4)
        // Labels only once the products are in place.
        .add(NFJ.glassIn(tabsBox, { from: "right", duration: 0.7 }), 2.0)
        .add(NFJ.glassIn(caption, { from: "bottom", duration: 0.8 }), 2.2)
        .fromTo(caps.kitkat, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 2.5);
      return tl;
    },
    idle() {
      // A breath of light on the hero only.
      idle.add(NFJ.glassAmbient([caption], { every: 10 }));
    },
    stop() { idle.kill(); },
    select,
    parts: { items, lights, wall, floor, title, sub, tabsBox, caption, hero }
  });
})();
