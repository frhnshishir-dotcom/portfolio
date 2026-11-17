import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import styles from './Cursor.module.css';

const INTERACTIVE = 'a, button, [data-cursor]';

/**
 * A dot that tracks the pointer exactly and a ring that follows it with lag.
 * Over anything interactive the ring opens up and the dot steps aside.
 * Fine pointers only; it stays out of the way of touch and reduced motion.
 */
export function Cursor({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!el || !enabled || !fine) return;

    const dot = el.querySelector<HTMLElement>('[data-dot]')!;
    const ring = el.querySelector<HTMLElement>('[data-ring]')!;
    const html = document.documentElement;
    html.classList.add('has-cursor');

    const ctx = gsap.context(() => {
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
      const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
      let shown = false;

      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        if (!shown) {
          shown = true;
          gsap.set([dot, ring], { x: event.clientX, y: event.clientY });
          gsap.to(el, { autoAlpha: 1, duration: 0.3 });
        }
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
      };
      const over = (event: PointerEvent) => {
        const hit = (event.target as Element | null)?.closest?.(INTERACTIVE);
        el.toggleAttribute('data-active', Boolean(hit));
      };
      const leave = () => {
        shown = false;
        gsap.to(el, { autoAlpha: 0, duration: 0.2 });
      };
      const down = () => el.setAttribute('data-pressed', '');
      const up = () => el.removeAttribute('data-pressed');

      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerover', over, { passive: true });
      document.documentElement.addEventListener('pointerleave', leave);
      window.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      return () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerover', over);
        document.documentElement.removeEventListener('pointerleave', leave);
        window.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
      };
    }, el);

    return () => {
      ctx.revert();
      html.classList.remove('has-cursor');
    };
  }, [enabled]);

  return (
    <div className={styles.cursor} ref={root} aria-hidden="true">
      <div className={styles.ring} data-ring />
      <div className={styles.dot} data-dot />
    </div>
  );
}
