/* Nescafé — a cinematic coffee moment, then the comparison.
   The pour is composited from two real photographs: a moka pot pouring
   (CC0) and a genuine Nescafé mug whose logo is printed on the cup itself,
   so the branding has the cup's own curvature and light. The stream is the
   photographed stream, revealed top-to-bottom; it falls behind the mug's
   rim. Then steam, a push-in on the logo, and a pull-back that parks the
   mug between Paris and Tokyo as the slide's anchor. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide-id="nescafe"]');
  const idle = NFJ.idleBag();
  const q = (s) => $(s, el);

  const fr = q(".split__fr"), jp = q(".split__jp"), bgFr = q(".s4-bg-fr"), bgJp = q(".s4-bg-jp");
  const top = q(".split__top"), light = q(".s4-light"), divider = q(".split__divider");
  const title = q(".split__title"), chipFr = q(".split__chip--fr"), chipJp = q(".split__chip--jp");
  const capFr = q(".s4-cap-fr"), capJp = q(".s4-cap-jp");
  const frameCup = q(".s4-frame-cup"), frameGenio = q(".s4-frame-genio"), frameVend = q(".s4-frame-vending");
  const capsules = q(".s4-capsules");
  const warm = q(".s4-warm"), cam = q(".s4-cam"), pot = q(".s4-pot"), stream = q(".s4-pot__stream");
  const hero = q(".s4-hero"), mug = q(".s4-hero__mug"), heroShadow = q(".s4-hero__shadow"), steam = q(".s4-steam");

  // Opening framing of the mug (relative to its settled place between the two markets).
  const OPEN = { x: -90, y: -157, scale: 1.9 };

  NFJ.registerSlide("nescafe", {
    el,
    reset() {
      idle.kill();
      gsap.set([fr, jp], { autoAlpha: 0 });
      gsap.set([bgFr, bgJp], { x: 0, y: 0, scale: 1.12 });
      gsap.set([top, light, divider, title, chipFr, chipJp, capFr, capJp, frameCup, frameGenio, frameVend, capsules], { autoAlpha: 0 });
      gsap.set(divider, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(warm, { autoAlpha: 1 });
      gsap.set(cam, { scale: 1, x: 0, y: 0 });
      gsap.set(hero, { x: OPEN.x, y: OPEN.y + 40, scale: OPEN.scale, autoAlpha: 1 });
      gsap.set(mug, { filter: "brightness(0.05)" });
      gsap.set(heroShadow, { autoAlpha: 0 });
      gsap.set(steam, { autoAlpha: 0 });
      gsap.set(pot, { x: -260, y: -180, rotation: -16, autoAlpha: 0 });
      gsap.set(stream, { clipPath: "inset(0% 0% 100% 0%)", x: 0 });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      // A dark, warm scene; the mug rises into the light.
      tl.to(mug, { filter: "brightness(1)", duration: 1.3, ease: "sine.inOut" }, 0.2)
        .to(hero, { y: OPEN.y, duration: 1.4, ease: "power2.out" }, 0.2)
        .to(heroShadow, { autoAlpha: 1, duration: 1 }, 0.6)
        // The pot enters from the shadows and tilts into the pour.
        .to(pot, { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 1.0, ease: "power2.out" }, 0.85)
        // The photographed stream falls (top → bottom, with gravity) …
        .to(stream, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power1.in" }, 1.75)
        .to(stream, { x: 0.8, duration: 0.09, ease: "none", repeat: 11, yoyo: true }, 2.2)
        // … steam rises, and the camera pushes in towards the logo on the cup.
        .to(steam, { autoAlpha: 1, duration: 1.2 }, 2.3)
        .to(cam, { scale: 1.14, transformOrigin: "880px 650px", duration: 1.8, ease: "power2.inOut" }, 2.0)
        // The pour ends: the stream leaves from the top, the pot withdraws.
        .to(stream, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.4, ease: "power1.in" }, 3.35)
        .to(pot, { rotation: -14, x: -240, y: -200, autoAlpha: 0, duration: 0.8, ease: "power2.in" }, 3.5)
        // Pull back: the mug settles between the two markets as the anchor.
        .to(cam, { scale: 1, duration: 1.3, ease: "power3.inOut" }, 3.9)
        .to(hero, { x: 0, y: 0, scale: 1, duration: 1.3, ease: "power3.inOut" }, 3.9)
        .set([fr, jp], { autoAlpha: 1 }, 3.9)
        .to(warm, { autoAlpha: 0, duration: 1.1, ease: "power2.inOut" }, 4.0)
        .to([bgFr, bgJp], { scale: 1, duration: 2.0, ease: "power2.out" }, 3.9)
        .to([top, light], { autoAlpha: 1, duration: 0.9 }, 4.2)
        .to(divider, { autoAlpha: 1, scaleY: 1, duration: 0.9, ease: "expo.inOut" }, 4.4)
        .add(NFJ.wordsIn(title, { stagger: 0.05, duration: 0.85, track: ["0.07em", "0.02em"] }), 4.3)
        .add(NFJ.glassIn(chipFr, { from: "left", duration: 0.6 }), 4.7)
        .add(NFJ.glassIn(chipJp, { from: "left", duration: 0.6 }), 4.8)
        .add(NFJ.imageIn(frameCup, { from: "up", inner: frameCup.querySelector("img"), duration: 1.0 }), 4.6)
        .set(frameCup, { autoAlpha: 1 }, 4.6)
        .add(NFJ.productIn(capsules, { y: 50, rotate: -6, duration: 1.0 }), 4.9)
        .set(capsules, { autoAlpha: 1 }, 4.9)
        .add(NFJ.imageIn(frameGenio, { from: "up", inner: frameGenio.querySelector("img"), duration: 1.0 }), 4.75)
        .set(frameGenio, { autoAlpha: 1 }, 4.75)
        .add(NFJ.imageIn(frameVend, { from: "up", inner: frameVend.querySelector("img"), duration: 1.0 }), 4.95)
        .set(frameVend, { autoAlpha: 1 }, 4.95)
        .add(NFJ.glassIn(capFr, { from: "left", duration: 0.75 }), 5.05)
        .add(NFJ.glassIn(capJp, { from: "left", duration: 0.75 }), 5.2);
      return tl;
    },
    idle() {
      idle.add(
        NFJ.drift(bgFr, { x: 10, y: -4, scale: 1.03, duration: 14 }),
        NFJ.drift(bgJp, { x: -10, y: 4, scale: 1.03, duration: 15 })
      );
    },
    stop() { idle.kill(); },
    parts: { hero, mug, cam, warm, title, fr, jp }
  });
})();
