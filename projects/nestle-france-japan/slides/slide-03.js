/* KitKat — a cinematic face-off between two market expressions.
   Dark stage → France enters from the left, Japan from the right, as
   silhouettes → contrasting rim light (KitKat red / matcha green) → the two
   compositions briefly meet near the centre → the camera pulls back to
   reveal the café and the Chocolatory. Products are photographs moved as
   flat layers: no fake 3D packaging, no distortion. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide-id="kitkat"]');
  const idle = NFJ.idleBag();
  const q = (s) => $(s, el);

  const fr = q(".split__fr"), jp = q(".split__jp"), bgFr = q(".s3-bg-fr"), bgJp = q(".s3-bg-jp");
  const top = q(".split__top"), light = q(".s3-light"), divider = q(".split__divider"), dark = q(".s3-dark");
  const rimFr = q(".s3-rim--fr"), rimJp = q(".s3-rim--jp");
  const title = q(".split__title"), chipFr = q(".split__chip--fr"), chipJp = q(".split__chip--jp");
  const capFr = q(".s3-cap-fr"), capJp = q(".s3-cap-jp");
  const gFr = q(".s3-group--fr"), gJp = q(".s3-group--jp");
  const products = $$(".s3-group .product", el);

  NFJ.registerSlide("kitkat", {
    el,
    reset() {
      idle.kill();
      gsap.set([fr, jp], { autoAlpha: 0 });
      gsap.set([bgFr, bgJp], { x: 0, y: 0, scale: 1.16 });
      gsap.set([top, light, divider, rimFr, rimJp, title, chipFr, chipJp, capFr, capJp], { autoAlpha: 0 });
      gsap.set(divider, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(dark, { autoAlpha: 1 });
      gsap.set(gFr, { x: -820, scale: 0.86, filter: "brightness(0) contrast(1.2)", autoAlpha: 1 });
      gsap.set(gJp, { x: 820, scale: 0.86, filter: "brightness(0) contrast(1.2)", autoAlpha: 1 });
      gsap.set(products, { y: 0 });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      // Silhouettes advance from opposite wings towards the viewer and the centre.
      tl.to(gFr, { x: 130, scale: 1.1, filter: "brightness(0.12) contrast(1.2)", duration: 1.35, ease: "power3.out" }, 0.15)
        .to(gJp, { x: -130, scale: 1.1, filter: "brightness(0.12) contrast(1.2)", duration: 1.35, ease: "power3.out" }, 0.3)
        // Contrasting light catches each side.
        .to(rimFr, { autoAlpha: 1, duration: 0.6, ease: "sine.inOut" }, 1.0)
        .to(rimJp, { autoAlpha: 1, duration: 0.6, ease: "sine.inOut" }, 1.15)
        .to(gFr, { filter: "brightness(1) contrast(1)", duration: 0.7, ease: "sine.inOut" }, 1.05)
        .to(gJp, { filter: "brightness(1) contrast(1)", duration: 0.7, ease: "sine.inOut" }, 1.2)
        // A brief face-off push …
        .to(gFr, { x: 160, scale: 1.13, duration: 0.5, ease: "sine.inOut" }, 1.5)
        .to(gJp, { x: -160, scale: 1.13, duration: 0.5, ease: "sine.inOut" }, 1.5)
        // … then the camera pulls back to reveal both markets.
        .to(gFr, { x: 0, scale: 1, duration: 1.2, ease: "power3.inOut" }, 2.0)
        .to(gJp, { x: 0, scale: 1, duration: 1.2, ease: "power3.inOut" }, 2.0)
        .set([fr, jp], { autoAlpha: 1 }, 2.0)
        .to(dark, { autoAlpha: 0, duration: 1.1, ease: "power2.inOut" }, 2.05)
        .to([bgFr, bgJp], { scale: 1, duration: 2.2, ease: "power2.out" }, 2.0)
        .to([rimFr, rimJp], { autoAlpha: 0.45, duration: 1.0 }, 2.4)
        .to([top, light], { autoAlpha: 1, duration: 1.0 }, 2.3)
        .to(divider, { autoAlpha: 1, scaleY: 1, duration: 0.9, ease: "expo.inOut" }, 2.5)
        .add(NFJ.wordsIn(title, { stagger: 0.05, duration: 0.85, track: ["0.07em", "0.02em"] }), 2.45)
        .add(NFJ.glassIn(chipFr, { from: "left", duration: 0.6 }), 2.9)
        .add(NFJ.glassIn(chipJp, { from: "left", duration: 0.6 }), 3.0)
        .add(NFJ.glassIn(capFr, { from: "left", duration: 0.75 }), 3.15)
        .add(NFJ.glassIn(capJp, { from: "left", duration: 0.75 }), 3.3);
      return tl;
    },
    idle() {
      idle.add(
        NFJ.drift(bgFr, { x: 10, y: -4, scale: 1.03, duration: 14 }),
        NFJ.drift(bgJp, { x: -10, y: 4, scale: 1.03, duration: 15 })
      );
    },
    stop() { idle.kill(); },
    parts: { gFr, gJp, dark, title, fr, jp }
  });
})();
