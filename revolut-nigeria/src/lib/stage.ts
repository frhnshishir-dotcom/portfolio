import { CARD_CENTER, IMAGE } from './scene';
import type { Point } from './quad';

export type Viewport = { width: number; height: number };

/** Where the photograph sits on screen: `screen = image * scale + (x, y)`. */
export type StageLayout = {
  scale: number;
  x: number;
  y: number;
  /** Screen position of the card's centre. */
  anchor: Point;
};

export type LayoutMode = 'wide' | 'short' | 'portrait';

/** Must match the media queries in the CSS: (max-aspect-ratio: 4/5) and (max-height: 619px). */
export function layoutMode({ width, height }: Viewport): LayoutMode {
  if (width / height <= 0.8) return 'portrait';
  if (height < 620) return 'short';
  return 'wide';
}

/**
 * Screen point the card's centre rests on.
 * The card is the anchor of the composition, so the photograph is positioned
 * from the card outwards rather than centred as a whole. On wide screens it
 * sits a little low, leaving the sky for the headline; elsewhere it keeps the
 * height it has in the photograph, which needs the least enlargement.
 */
export function restAnchor(viewport: Viewport): Point {
  const y = layoutMode(viewport) === 'wide' ? 0.6 : CARD_CENTER[1] / IMAGE.height;
  return [viewport.width / 2, viewport.height * y];
}

/**
 * Smallest scale at which the photograph covers the viewport while the card's
 * centre sits exactly on `anchor`.
 */
export function solveStage(viewport: Viewport, anchor: Point = restAnchor(viewport)): StageLayout {
  const [cx, cy] = CARD_CENTER;
  const [ax, ay] = anchor;
  const scale = Math.max(
    viewport.width / IMAGE.width,
    viewport.height / IMAGE.height,
    // each edge of the photograph must stay outside the viewport
    ax / cx,
    (viewport.width - ax) / (IMAGE.width - cx),
    ay / cy,
    (viewport.height - ay) / (IMAGE.height - cy),
  );
  return { scale, x: ax - cx * scale, y: ay - cy * scale, anchor };
}
