import { gsap } from '../lib/gsap';
import type { SceneController } from './controller';

type IntroOptions = {
  root: HTMLElement;
  preloader: HTMLElement | null;
  nav: HTMLElement | null;
  ctrl: SceneController;
  reduced: boolean;
  onComplete: () => void;
};

/** Resting strengths of the light layers once the card is "on". */
export const LIT = { light: 0.85, rim: 0.4 } as const;

/**
 * 1. the preloader clears, 2. Lagos grows out of the white from the card,
 * 3. the card's light switches on, 4. copy and navigation arrive.
 */
export function createIntro({ root, preloader, nav, ctrl, reduced, onComplete }: IntroOptions) {
  const q = gsap.utils.selector(root);
  const clip = q('[data-stage-clip]');
  const lines = q('[data-hero-line]');
  const items = q('[data-hero-item]');
  const hint = q('[data-hero-hint]');
  const shades = q('[data-shade]');
  const preItems = preloader ? Array.from(preloader.querySelectorAll('[data-pre-item]')) : [];
  const preRule = preloader ? Array.from(preloader.querySelectorAll('[data-pre-bar]')) : [];

  const tl = gsap.timeline({ onUpdate: () => ctrl.render(), onComplete });

  if (reduced) {
    gsap.set(root, { '--light': LIT.light, '--rim': LIT.rim, '--rim-glow': 6, '--body': 0, '--fill': 0, '--sheen': -1 });
    tl.to(preloader, { autoAlpha: 0, duration: 0.4, ease: 'none' }).from(
      [nav, ...lines, ...items, ...hint],
      { autoAlpha: 0, duration: 0.4, ease: 'none' },
      '<0.15',
    );
    return tl;
  }

  // The photograph opens out of the card, so the clip starts as a point on it.
  const { anchor } = ctrl.frame.layout;
  const { width, height } = ctrl.frame.viewport;
  const top = (anchor[1] / height) * 100;
  const left = (anchor[0] / width) * 100;
  const closed = `inset(${top.toFixed(2)}% ${(100 - left).toFixed(2)}% ${(100 - top).toFixed(2)}% ${left.toFixed(2)}% round 24px)`;

  gsap.set(clip, { clipPath: closed });
  gsap.set(root, { '--light': 0, '--rim': 0, '--rim-glow': 6, '--body': 0, '--fill': 0, '--sheen': -1 });
  gsap.set(lines, { yPercent: 140 });
  gsap.set(items, { autoAlpha: 0, y: 24 });
  gsap.set(hint, { autoAlpha: 0 });
  gsap.set(shades, { autoAlpha: 0 });
  if (nav) gsap.set(nav, { autoAlpha: 0, yPercent: -60 });
  ctrl.state.intro = 1.32;
  ctrl.render();

  tl.to(preItems, { yPercent: -120, duration: 0.75, ease: 'power3.in', stagger: 0.06 })
    .to(preRule, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.6, ease: 'power3.in' }, 0.1)
    // white on white: removing the preloader changes nothing on screen
    .set(preloader, { autoAlpha: 0 })
    .addLabel('grow')
    .to(clip, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'expo.inOut' }, 'grow')
    .to(ctrl.state, { intro: 1, duration: 2.8, ease: 'expo.out' }, 'grow+=0.3')
    .to(shades, { autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 'grow+=1.1')

    // the card switches on: a short flicker, like a light finding its current
    .addLabel('light', 'grow+=1.5')
    .to(root, { keyframes: { '--light': [0, 0.5, 0.15, 0.95, LIT.light] }, duration: 1.1, ease: 'none' }, 'light')
    .to(root, { keyframes: { '--rim': [0, 0.8, 0.3, 0.7, LIT.rim] }, duration: 1.4, ease: 'none' }, 'light+=0.05')

    .addLabel('copy', 'light+=0.5')
    .to(nav, { autoAlpha: 1, yPercent: 0, duration: 1.2, ease: 'expo.out' }, 'copy')
    .to(lines, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.09 }, 'copy+=0.05')
    .to(items, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 'copy+=0.3')
    .to(hint, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 'copy+=0.8');

  return tl;
}

/** Jump straight to the end of the intro (used when the scene is rebuilt after it already played). */
export function settleIntro(root: HTMLElement, ctrl: SceneController) {
  gsap.set(root, { '--light': LIT.light, '--rim': LIT.rim, '--rim-glow': 6, '--body': 0, '--fill': 0, '--sheen': -1 });
  ctrl.state.intro = 1;
  ctrl.render();
}
