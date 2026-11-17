/* Finale — premium and minimal, in deliberate contrast to the slides before.
   Charcoal and one soft spotlight. KitKat, Nescafé and Maggi appear as
   silhouettes and are lit one at a time; the statement lands in two beats,
   a single light sweep crosses it, the Nestlé logo arrives, and a very slow
   pull-back reveals the full frame — then everything stops. No idle loops. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide-id="finale"]');
  const q = (s) => $(s, el);

  const world = q(".s6-world"), spot = q(".s6-spot"), floor = q(".s6-floor");
  const pools = $$(".s6-pool", el), shadows = $$(".s6-sh", el);
  const mug = q(".s6-mug"), kk = q(".s6-kk"), mg = q(".s6-mg");
  const lines = $$(".s6-title .line", el), sweep = q(".s6-sweep"), sub = q(".s6-sub"), logo = q(".s6-logo");

  NFJ.registerSlide("finale", {
    el,
    reset() {
      gsap.set(world, { scale: 1.1, y: -10 });
      gsap.set([spot, floor].concat(pools, shadows), { autoAlpha: 0 });
      gsap.set([mug, kk, mg], { autoAlpha: 0, y: 0, filter: "brightness(0)" });
      gsap.set(lines, { autoAlpha: 0 });
      gsap.set([sub, logo], { autoAlpha: 0 });
      gsap.set(sweep, { autoAlpha: 0, left: "-30%" });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      tl.to(spot, { autoAlpha: 1, duration: 1.4, ease: "sine.inOut" }, 0)
        .to(floor, { autoAlpha: 1, duration: 1.4, ease: "sine.inOut" }, 0.2)
        // Silhouettes first …
        .to([kk, mug, mg], { autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: "sine.inOut" }, 0.4);
      // … then each brand is lit in turn (KitKat, Nescafé, Maggi).
      [[kk, pools[1], shadows[1]], [mug, pools[0], shadows[0]], [mg, pools[2], shadows[2]]].forEach(([p, pool, sh], i) => {
        const t = 1.0 + i * 0.45;
        tl.to(p, { filter: "brightness(1)", duration: 0.9, ease: "sine.inOut" }, t)
          .to(pool, { autoAlpha: 1, duration: 1.0, ease: "sine.inOut" }, t)
          .to(sh, { autoAlpha: 1, duration: 0.8 }, t + 0.1);
      });
      // The statement in two beats, then the supporting line.
      tl.add(NFJ.wordsIn(lines[0], { stagger: 0.09, duration: 1.0, track: ["0.12em", "0.04em"] }), 2.3)
        .add(NFJ.wordsIn(lines[1], { stagger: 0.09, duration: 1.0, track: ["0.12em", "0.04em"] }), 2.95)
        .add(NFJ.textIn(sub, { duration: 0.8 }), 3.6)
        // One light sweep across the statement.
        .to(sweep, { autoAlpha: 1, duration: 0.2 }, 3.9)
        .to(sweep, { left: "120%", duration: 1.3, ease: "power2.inOut" }, 3.9)
        .to(sweep, { autoAlpha: 0, duration: 0.3 }, 4.9)
        .set(sweep, { left: "-30%" }, 5.25)
        // The Nestlé identity, quietly.
        .fromTo(logo, { autoAlpha: 0, y: 12 }, { autoAlpha: 0.95, y: 0, duration: 1.2, ease: "power2.out" }, 4.4)
        // A very slow pull-back that reveals the whole frame, then stops.
        .to(world, { scale: 1, y: 0, duration: 6.0, ease: "power1.inOut" }, 0.3);
      return tl;
    },
    idle() { /* deliberately empty: the final frame holds perfectly still */ },
    stop() {},
    parts: { world, mug, kk, mg, logo }
  });
})();
