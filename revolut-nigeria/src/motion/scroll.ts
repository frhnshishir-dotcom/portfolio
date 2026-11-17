import { gsap } from '../lib/gsap';
import type { NavTheme } from '../components/Nav/Nav';
import type { SceneController } from './controller';
import { LIT } from './intro';

type ScrollOptions = {
  root: HTMLElement;
  ctrl: SceneController;
  onTheme: (theme: NavTheme) => void;
};

/** Scroll distance of the pinned journey, in viewport heights. */
const LENGTH = 3.2;

/**
 * The pinned journey, scrubbed by scroll (and therefore reversible):
 * the camera pushes in, the card turns to face the visitor, its edges light
 * up, it grows into a white portal, and the second screen is waiting inside.
 */
export function createPortalScroll({ root, ctrl, onTheme }: ScrollOptions) {
  const q = gsap.utils.selector(root);
  const clip = q('[data-stage-clip]');
  const lines = q('[data-hero-line]');
  const items = q('[data-hero-item]');
  const hint = q('[data-hero-hint]');
  const shades = q('[data-shade]');
  const reveal = q('[data-reveal]');
  const revealLines = q('[data-reveal-line]');
  const revealItems = q('[data-reveal-item]');
  const revealCard = q('[data-reveal-card]');

  gsap.set(reveal, { autoAlpha: 0 });
  gsap.set(revealLines, { yPercent: 140 });
  gsap.set(revealItems, { autoAlpha: 0, y: 28 });
  gsap.set(revealCard, { autoAlpha: 0, scale: 1.35, rotation: -7, yPercent: 10 });
  gsap.set(q('[data-reveal-card] img'), { autoAlpha: 0 });

  // Push in until the card fills about two thirds of the viewport height.
  const push = () => Math.max((ctrl.frame.viewport.height * 0.66) / ctrl.restCardHeight(), 1.15);

  let theme: NavTheme = 'onPhoto';
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate() {
      ctrl.render();
      // the navigation follows what is on screen, not where the scrollbar is
      const next: NavTheme = tl.time() >= tl.labels.covered! ? 'onPaper' : 'onPhoto';
      if (next !== theme) {
        theme = next;
        onTheme(next);
      }
    },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * LENGTH)}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tl
    // ---- 5. the visitor scrolls: copy leaves, the camera starts to move
    .to(lines, { yPercent: -140, duration: 1.0, ease: 'power2.in', stagger: 0.06 }, 0)
    .to(items, { autoAlpha: 0, y: -24, duration: 0.8, ease: 'power2.in', stagger: 0.05 }, 0)
    .to(hint, { autoAlpha: 0, duration: 0.4 }, 0)
    .to(shades, { autoAlpha: 0, duration: 2.0 }, 0)

    // ---- 6. the camera moves towards the card
    .to(ctrl.state, { zoom: push, focus: 1, duration: 3.4, ease: 'power2.inOut' }, 0)
    // the opaque card takes over from the photographed one, in exactly the same place
    .to(root, { '--body': 1, duration: 0.9 }, 2.0)

    // ---- 7. the card turns to face the visitor while the camera keeps drifting in
    .addLabel('turn', 2.8)
    .to(ctrl.state, { turn: 1, duration: 2.6, ease: 'power2.inOut' }, 'turn')
    .to(root, { '--sheen': 1, duration: 2.6, ease: 'power1.inOut' }, 'turn')
    .to(ctrl.state, { zoom: () => push() * 1.12, duration: 2.2, ease: 'power1.inOut' }, 3.4)

    // ---- 8. the edges light up
    .to(root, { '--rim': 1, '--rim-glow': 28, duration: 1.6, ease: 'power2.out' }, 4.2)

    // ---- 9. the card fills the screen with white light
    .addLabel('expand', 5.6)
    .to(ctrl.state, { expand: 1, duration: 2.8, ease: 'power3.in' }, 'expand')
    .to(root, { '--light': 0, duration: 1.6, ease: 'power1.in' }, 'expand')
    .to(root, { '--fill': 1, duration: 2.0, ease: 'power2.in' }, 'expand+=0.6')

    // ---- 10. the white portal reveals the second screen
    .addLabel('covered', 8.4)
    .set(reveal, { autoAlpha: 1 }, 'covered')
    .set(clip, { autoAlpha: 0 }, 'covered+=0.05')

    // ---- 11. the card floats in between the two headlines
    .set(revealCard, { autoAlpha: 1 }, 'covered+=0.05')
    .to(q('[data-reveal-card] img'), { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 'covered+=0.05')
    .to(revealCard, { scale: 1, rotation: 0, yPercent: 0, duration: 1.9, ease: 'expo.out' }, 'covered+=0.05')
    .to(revealLines, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.14 }, 'covered+=0.15')
    .to(revealItems, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 }, 'covered+=0.55')
    .to({}, { duration: 0.4 });

  // Light strengths that the intro left behind are the start values here.
  gsap.set(root, { '--light': LIT.light, '--rim': LIT.rim });

  return tl;
}
