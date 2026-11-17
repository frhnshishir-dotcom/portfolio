/* Maggi — a food-commercial product showcase, then the comparison.
   The Maggi France "Bouillon gras" tin emerges from a warm, dark set; real
   photographed stock ingredients (carrot, leek, onion, garlic, bay, bouquet
   garni — the pot-au-feu / bouillon base) travel in coordinated arcs around
   it, then everything settles: the tin and the Kub tin on the France side,
   the Japanese potofu and the Maggi Bouillon identifier on the Japan side.
   No Japanese pack is shown because none could be verified. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide-id="maggi"]');
  const idle = NFJ.idleBag();
  const q = (s) => $(s, el);

  const fr = q(".split__fr"), jp = q(".split__jp"), bgFr = q(".s5-bg-fr"), bgJp = q(".s5-bg-jp");
  const top = q(".split__top"), light = q(".s5-light"), divider = q(".split__divider"), dark = q(".s5-dark");
  const title = q(".split__title"), chipFr = q(".split__chip--fr"), chipJp = q(".split__chip--jp");
  const capFr = q(".s5-cap-fr"), capJp = q(".s5-cap-jp"), frame = q(".s5-frame-soup"), ident = q(".s5-ident");
  const tin = q(".s5-tin"), kub = q(".s5-kub"), shadow = q(".s5-shadow-tin");
  const ings = $$(".s5-ing", el);

  const HERO = { cx: 960, cy: 540 };          // where the tin is presented
  const TIN_OPEN = { x: 640, y: -240, scale: 1.45 };
  const ORBIT = { rx: 560, ry: 250 };

  // Settled centres and rotations are read from the layout once.
  let meta = null;
  // Rotations come from the stylesheet, captured before GSAP touches the elements;
  // centres use offset* (unaffected by transforms) once the images have loaded.
  const rots = ings.map((n) => gsap.getProperty(n, "rotation") || 0);
  function measure() {
    meta = ings.map((n, i) => ({
      n,
      cx: n.offsetLeft + n.offsetWidth / 2,
      cy: n.offsetTop + n.offsetHeight / 2,
      rot: rots[i],
      a0: -Math.PI / 2 + i * ((Math.PI * 2) / ings.length)
    }));
  }
  function orbitPos(m, a) {
    const px = HERO.cx + ORBIT.rx * Math.cos(a), py = HERO.cy + ORBIT.ry * Math.sin(a);
    const depth = (Math.sin(a) + 1) / 2;       // 0 = far (top), 1 = near (bottom)
    return { x: px - m.cx, y: py - m.cy, scale: 0.62 + 0.42 * depth, filter: `brightness(${0.55 + 0.45 * depth})` };
  }

  NFJ.registerSlide("maggi", {
    el,
    reset() {
      idle.kill();
      measure();
      gsap.set([fr, jp], { autoAlpha: 0 });
      gsap.set([bgFr, bgJp], { x: 0, y: 0, scale: 1.12 });
      gsap.set([top, light, divider, title, chipFr, chipJp, capFr, capJp, frame, ident, kub, shadow], { autoAlpha: 0 });
      gsap.set(divider, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(dark, { autoAlpha: 1 });
      gsap.set(tin, { x: TIN_OPEN.x, y: TIN_OPEN.y, scale: 0.6, rotation: -9, filter: "brightness(0)", autoAlpha: 1 });
      meta.forEach((m) => gsap.set(m.n, Object.assign(orbitPos(m, m.a0), { autoAlpha: 0, rotation: m.rot - 40 })));
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      // The tin emerges from the dark towards the viewer, its label readable throughout.
      tl.to(tin, { scale: TIN_OPEN.scale, rotation: -3, filter: "brightness(1)", duration: 1.5, ease: "expo.out" }, 0.25);
      // Ingredients join in coordinated arcs around the product.
      meta.forEach((m, i) => {
        const p = { a: m.a0 };
        tl.to(m.n, { autoAlpha: 1, duration: 0.5 }, 0.7 + i * 0.07)
          .to(p, {
            a: m.a0 + Math.PI * 0.95, duration: 2.1, ease: "sine.inOut",
            onUpdate: () => gsap.set(m.n, orbitPos(m, p.a))
          }, 0.7 + i * 0.07)
          .to(m.n, { rotation: m.rot, duration: 2.1, ease: "sine.inOut" }, 0.7 + i * 0.07)
          // … and come to rest around the French tins.
          .to(m.n, { x: 0, y: 0, scale: 1, filter: "brightness(1)", duration: 1.05, ease: "expo.out" }, 2.85 + i * 0.05);
      });
      // The hero moves into the France column; the comparison is revealed.
      tl.to(tin, { x: 0, y: 0, scale: 1, duration: 1.15, ease: "power3.inOut" }, 2.7)
        .to(shadow, { autoAlpha: 1, duration: 0.8 }, 3.2)
        .add(NFJ.productIn(kub, { y: 60, rotate: 6, duration: 0.9, ease: "expo.out" }), 3.2)
        .set(kub, { autoAlpha: 1 }, 3.2)
        .set([fr, jp], { autoAlpha: 1 }, 2.7)
        .to(dark, { autoAlpha: 0, duration: 1.0, ease: "power2.inOut" }, 2.8)
        .to([bgFr, bgJp], { scale: 1, duration: 1.8, ease: "power2.out" }, 2.7)
        .to([top, light], { autoAlpha: 1, duration: 0.9 }, 3.0)
        .to(divider, { autoAlpha: 1, scaleY: 1, duration: 0.9, ease: "expo.inOut" }, 3.1)
        .add(NFJ.wordsIn(title, { stagger: 0.05, duration: 0.85, track: ["0.07em", "0.02em"] }), 3.0)
        .add(NFJ.glassIn(chipFr, { from: "left", duration: 0.6 }), 3.35)
        .add(NFJ.glassIn(chipJp, { from: "left", duration: 0.6 }), 3.45)
        .add(NFJ.glassIn(capFr, { from: "left", duration: 0.75 }), 3.55)
        .add(NFJ.imageIn(frame, { from: "up", inner: frame.querySelector("img"), duration: 1.0 }), 3.55)
        .set(frame, { autoAlpha: 1 }, 3.55)
        .add(NFJ.glassIn(capJp, { from: "left", duration: 0.75 }), 3.7)
        .add(NFJ.glassIn(ident, { from: "left", duration: 0.7 }), 3.95);
      return tl;
    },
    idle() {
      // Nearly stationary: the warm light breathes, nothing else moves.
      idle.add(gsap.to(light, { opacity: 0.75, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true }));
    },
    stop() { idle.kill(); },
    parts: { tin, kub, ings, dark, title, fr, jp }
  });
})();
