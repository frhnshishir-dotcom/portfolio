import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { pickAssets, type AssetKey } from '../../lib/assets';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { preloadAssets, type LoadedAsset } from '../../lib/preload';
import { IMAGE } from '../../lib/scene';
import { solveStage } from '../../lib/stage';
import { createSceneController } from '../../motion/controller';
import { createIntro, settleIntro } from '../../motion/intro';
import { createPortalScroll } from '../../motion/scroll';
import { Cursor } from '../Cursor/Cursor';
import { Hero } from '../Hero/Hero';
import { Nav, type NavTheme } from '../Nav/Nav';
import { Portal } from '../Portal/Portal';
import { Preloader } from '../Preloader/Preloader';
import { Reveal } from '../Reveal/Reveal';
import styles from './Experience.module.css';

type Assets = Record<AssetKey, LoadedAsset>;

const lock = (on: boolean) => document.documentElement.classList.toggle('is-locked', on);

export function Experience() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const [assets, setAssets] = useState<Assets | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [theme, setTheme] = useState<NavTheme>('onPhoto');
  const introPlayed = useRef(false);
  const journey = useRef<ScrollTrigger | null>(null);

  // ---- 1. preloader: stream the photograph and the card, report real bytes
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    lock(true);

    const abort = new AbortController();
    const counter = document.querySelector<HTMLElement>('[data-pre-count]');
    const bar = document.querySelector<HTMLElement>('[data-pre-bar]');
    const shown = { value: 0 };
    const draw = () => {
      if (counter) counter.textContent = String(Math.round(shown.value)).padStart(3, '0');
      if (bar) bar.style.transform = `scaleX(${(shown.value / 100).toFixed(4)})`;
    };
    let tween: gsap.core.Tween | undefined;

    const { scale } = solveStage({ width: window.innerWidth, height: window.innerHeight });
    preloadAssets(
      pickAssets(scale),
      (ratio) => {
        tween?.kill();
        tween = gsap.to(shown, { value: ratio * 100, duration: 0.6, ease: 'power2.out', onUpdate: draw });
      },
      abort.signal,
    )
      .then((result) => {
        tween?.kill();
        tween = gsap.to(shown, {
          value: 100,
          duration: 0.35,
          ease: 'power1.out',
          onUpdate: draw,
          onComplete: () => {
            if (abort.signal.aborted) {
              result.hero.dispose();
              result.card.dispose();
            } else {
              setAssets(result);
            }
          },
        });
      })
      .catch(() => {
        /* aborted by a remount; the next run loads again */
      });

    return () => {
      abort.abort();
      tween?.kill();
    };
  }, []);

  // release the object URLs when the page goes away
  useEffect(
    () => () => {
      assets?.hero.dispose();
      assets?.card.dispose();
    },
    [assets],
  );

  // ---- 2. the scene: intro, then the pinned journey (or the reduced version)
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!assets || !root) return;

    const stage = root.querySelector<HTMLElement>('[data-stage]')!;
    const planes = Array.from(root.querySelectorAll<HTMLElement>('[data-plane]'));
    const ctrl = createSceneController({ root, stage, planes });
    const preloader = document.querySelector<HTMLElement>('[data-preloader]');
    const nav = document.querySelector<HTMLElement>('[data-nav]');
    setTheme('onPhoto');

    const ctx = gsap.context(() => {});

    const startJourney = () =>
      ctx.add(() => {
        lock(false);
        let stopFloat: (() => void) | undefined;
        if (reduced) {
          // No pinning and no scrubbing: the second screen is simply the next section.
          journey.current = ScrollTrigger.create({
            trigger: '[data-reveal][data-flow]',
            start: 'top 12%',
            // never "left": the section is the end of the page
            end: '+=1000000',
            onToggle: (self) => setTheme(self.isActive ? 'onPaper' : 'onPhoto'),
          });
        } else {
          const tl = createPortalScroll({ root, ctrl, onTheme: setTheme });
          journey.current = tl.scrollTrigger ?? null;
          stopFloat = startFloat(root);
        }
        ScrollTrigger.refresh();
        introPlayed.current = true;
        setIntroDone(true);
        return stopFloat; // removed with the context
      });

    if (introPlayed.current) {
      // rebuilt after the intro (reduced-motion preference changed): no replay
      ctx.add(() => settleIntro(root, ctrl));
      startJourney();
    } else {
      ctx.add(() => {
        createIntro({ root, preloader, nav, ctrl, reduced, onComplete: startJourney });
      });
    }

    return () => {
      ctx.revert();
      ctrl.destroy();
      journey.current = null;
      lock(false);
    };
  }, [assets, reduced]);

  // ---- navigation through the journey
  const goTo = useCallback(
    (where: 'start' | 'end') => {
      if (reduced) {
        const section = document.querySelector<HTMLElement>('[data-reveal][data-flow]');
        const y = where === 'start' || !section ? 0 : section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y, behavior: 'auto' });
        return;
      }
      const trigger = journey.current;
      const y = where === 'start' || !trigger ? 0 : trigger.end;
      const distance = Math.abs(window.scrollY - y) / window.innerHeight;
      gsap.to(window, {
        scrollTo: { y, autoKill: true },
        duration: Math.min(1 + distance * 0.9, 4),
        ease: 'power2.inOut',
      });
    },
    [reduced],
  );
  const goHome = useCallback(() => goTo('start'), [goTo]);
  const goReveal = useCallback(() => goTo('end'), [goTo]);

  return (
    <>
      {!introDone && <Preloader />}
      <Cursor enabled={!reduced} />
      <Nav theme={theme} onHome={goHome} onExperience={goReveal} />

      <main>
        <section
          ref={rootRef}
          className={styles.experience}
          data-motion={reduced ? 'reduced' : 'full'}
          aria-label="Lagos, Nigeria"
        >
          <div className={styles.clip} data-stage-clip>
            <div className={styles.stage} data-stage style={{ width: IMAGE.width, height: IMAGE.height }}>
              {assets && (
                <img
                  className={styles.photo}
                  src={assets.hero.src}
                  width={IMAGE.width}
                  height={IMAGE.height}
                  alt="Golden hour over the Lagos Lagoon and the Lekki–Ikoyi Link Bridge. A tall midnight-blue Revolut card stands in the water like a doorway, its edges lit in electric blue."
                  draggable={false}
                />
              )}
            </div>
          </div>
          <div className={`${styles.shade} ${styles.shadeTop}`} data-shade aria-hidden="true" />
          <div className={`${styles.shade} ${styles.shadeBottom}`} data-shade aria-hidden="true" />

          <Portal />
          <Hero onExplore={goReveal} />
          {!reduced && <Reveal cardSrc={assets?.card.src} onExplore={goHome} inFlow={false} />}
        </section>

        {reduced && <Reveal cardSrc={assets?.card.src} onExplore={goHome} inFlow />}
      </main>
    </>
  );
}

/** The second-screen card hovers, and leans towards the pointer. */
function startFloat(root: HTMLElement) {
  const float = root.querySelector('[data-float]');
  const shadow = root.querySelector('[data-float-shadow]');
  const tilt = root.querySelector<HTMLElement>('[data-tilt]');
  if (!float || !shadow || !tilt) return;

  gsap.to(float, { yPercent: -3.2, rotation: 1.2, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(shadow, { scaleX: 0.84, autoAlpha: 0.65, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 1.2, ease: 'power3' });
  const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 1.2, ease: 'power3' });
  const move = (event: PointerEvent) => {
    rotateY(((event.clientX / window.innerWidth) * 2 - 1) * 7);
    rotateX(-((event.clientY / window.innerHeight) * 2 - 1) * 5);
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => window.removeEventListener('pointermove', move);
}
