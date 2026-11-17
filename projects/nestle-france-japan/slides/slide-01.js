/* Opening — "travelling between two markets".
   0.0–0.8 near darkness, silhouettes · 0.8–2.0 Paris and Tokyo arrive from
   opposite sides on their own camera moves · 1.5–2.6 a light sweeps down the
   glass seam · 2.2–3.5 a smoked-glass plate arrives from the foreground ·
   3.0–4.5 masked typography. Stable: both cities visible, only faint motes. */
(function () {
  "use strict";
  const { $, $$ } = NFJ;
  const M = NFJ.motion;
  const el = $('[data-slide-id="opening"]');
  const idle = NFJ.idleBag();

  const paris = $(".s1-paris", el), tokyo = $(".s1-tokyo", el);
  const parisImg = $(".s1-paris .s1-img", el), tokyoImg = $(".s1-tokyo .s1-img", el);
  const hazes = $$(".s1-haze", el);
  const seam = $(".s1-seam", el), beam = $(".s1-beam", el), glow = $(".s1-glow", el), shade = $(".s1-shade", el);
  const dark = $(".s1-dark", el), motesBox = $(".s1-motes", el);
  const plate = $(".s1-plate", el), logo = $(".s1-logo", el), title = $(".s1-title", el);
  const sub = $(".s1-sub", el), meta = $(".s1-meta", el);
  const tags = $$(".s1-tag", el);

  // The seam: each city is revealed by growing its own polygon.
  const P_START = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
  const P_END = "polygon(0% 0%, 57.5% 0%, 47.5% 100%, 0% 100%)";
  const T_START = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
  const T_END = "polygon(57.5% 0%, 100% 0%, 100% 100%, 47.5% 100%)";

  // A few drifting motes of light — atmosphere, never confetti.
  const motes = [];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.style.left = (4 + Math.random() * 92).toFixed(1) + "%";
    s.style.top = (12 + Math.random() * 70).toFixed(1) + "%";
    const k = 0.6 + Math.random() * 1.6;
    s.style.transform = `scale(${k.toFixed(2)})`;
    motesBox.appendChild(s);
    motes.push(s);
  }

  NFJ.registerSlide("opening", {
    el,
    reset() {
      idle.kill();
      gsap.set(paris, { clipPath: P_START, autoAlpha: 1, x: 0 });
      gsap.set(tokyo, { clipPath: T_START, autoAlpha: 1, x: 0 });
      gsap.set([parisImg, tokyoImg], { x: 0, y: 0, scale: 1.18, filter: "brightness(0.12)" });
      gsap.set(hazes, { autoAlpha: 0 });
      gsap.set(dark, { autoAlpha: 1 });
      gsap.set([seam, glow, shade].concat(tags), { autoAlpha: 0 });
      gsap.set(seam, { yPercent: -110 });
      gsap.set(beam, { autoAlpha: 0, top: "-30%" });
      gsap.set(plate, { autoAlpha: 0, z: 0, scale: 1, rotationX: 0, y: 0, "--tint": 0.6 });
      gsap.set([logo, sub, meta, title], { autoAlpha: 0 });
      gsap.set(motes, { autoAlpha: 0, x: 0, y: 0 });
    },
    enter() {
      const tl = gsap.timeline({ defaults: { ease: M.out } });
      // 0.0–0.8 · near darkness; faint light, architecture as silhouettes
      tl.to(dark, { autoAlpha: 0.55, duration: 0.8, ease: "sine.inOut" }, 0)
        .to(paris, { clipPath: "polygon(0% 0%, 18% 0%, 8% 100%, 0% 100%)", duration: 0.8, ease: "sine.inOut" }, 0)
        .to(tokyo, { clipPath: "polygon(92% 0%, 100% 0%, 100% 100%, 82% 100%)", duration: 0.8, ease: "sine.inOut" }, 0)
        .to(motes, { autoAlpha: 0.35, duration: 1.2, stagger: { each: 0.03, from: "random" } }, 0.2)
        // 0.8–2.0 · cities emerge from opposite sides, each with its own camera
        .to(dark, { autoAlpha: 0, duration: 1.2, ease: "power2.out" }, 0.8)
        .fromTo(paris, { x: -140 }, { x: 0, clipPath: P_END, duration: 1.25, ease: "power3.inOut" }, 0.8)
        .fromTo(tokyo, { x: 140 }, { x: 0, clipPath: T_END, duration: 1.25, ease: "power3.inOut" }, 0.9)
        .to(parisImg, { scale: 1.06, x: 10, filter: "brightness(1)", duration: 2.6, ease: "power2.out" }, 0.8)
        .to(tokyoImg, { scale: 1.06, x: -10, filter: "brightness(1)", duration: 2.6, ease: "power2.out" }, 0.9)
        .to(hazes, { autoAlpha: 1, duration: 1.6 }, 1.0)
        .to(shade, { autoAlpha: 1, duration: 1.2 }, 1.1)
        // 1.5–2.6 · the seam is lit by a vertical sweep
        .set(seam, { autoAlpha: 1 }, 1.5)
        .to(seam, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 1.5)
        .to(beam, { autoAlpha: 1, duration: 0.2 }, 1.75)
        .to(beam, { top: "100%", duration: 0.85, ease: "power2.inOut" }, 1.75)
        .to(beam, { autoAlpha: 0, duration: 0.25 }, 2.4)
        .to(glow, { autoAlpha: 1, duration: 1.4 }, 1.9)
        // 2.2–3.5 · the smoked-glass plate arrives from the foreground
        .fromTo(plate,
          { autoAlpha: 0, z: 520, rotationX: -10, y: 80, "--blur": "0px", "--edge-x": "-30%", "--sheen-x": "-60%" },
          { autoAlpha: 1, z: 0, rotationX: 0, y: 0, "--blur": "18px", duration: 1.3, ease: "expo.out" }, 2.2)
        .to(plate, { "--edge-x": "130%", duration: 1.5, ease: M.soft }, 2.6)
        .to(plate, { "--sheen-x": "140%", duration: 1.7, ease: M.soft }, 2.7)
        .add(NFJ.glassIn(tags[0], { from: "left", duration: 0.7 }), 2.4)
        .add(NFJ.glassIn(tags[1], { from: "right", duration: 0.7 }), 2.5)
        // 3.0–4.5 · identity and title, in stages
        .fromTo(logo, { autoAlpha: 0, y: 14, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, clearProps: "filter" }, 3.0)
        .add(NFJ.wordsIn(title, { stagger: 0.1, duration: 0.95, track: ["0.12em", "0.03em"] }), 3.2)
        .add(NFJ.textIn(sub, { duration: 0.7 }), 3.85)
        .add(NFJ.textIn(meta, { duration: 0.6, y: 10 }), 4.1);
      return tl;
    },
    idle() {
      // Stable state: barely-there drift and floating motes.
      idle.add(
        NFJ.drift(parisImg, { x: 18, y: -4, scale: 1.075, duration: 14 }),
        NFJ.drift(tokyoImg, { x: -18, y: 4, scale: 1.075, duration: 14 }),
        motes.map((m, i) => gsap.to(m, { y: -30 - (i % 5) * 8, x: (i % 2 ? 1 : -1) * 10, duration: 9 + (i % 4), ease: "sine.inOut", repeat: -1, yoyo: true })),
        NFJ.glassAmbient([plate], { every: 10 })
      );
    },
    stop() { idle.kill(); },
    parts: { paris, tokyo, plate, logo, seam, tags, title, sub, meta, shade, glow, motes }
  });
})();
