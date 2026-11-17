import cardUrl from '../assets/revolut-card.webp';
import heroSmallUrl from '../assets/lagos-hero-2048.webp';
import heroUrl from '../assets/lagos-hero.webp';
import type { AssetSpec } from './preload';

export type AssetKey = 'hero' | 'card';

/** The camera pushes in about this far (relative to rest) before the photograph is covered. */
const MAX_PUSH = 1.8;

/**
 * The photograph ships at two sizes. Geometry is always expressed in the
 * coordinates of the 4096-pixel original; the smaller file is the same frame
 * at half the resolution and is simply drawn into the same box.
 * The half-size file is used only when it stays sharp at the deepest push-in.
 */
export function pickAssets(restScale: number): Record<AssetKey, AssetSpec> {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const devicePixels = 4096 * restScale * MAX_PUSH * dpr;
  const small = devicePixels <= 2048 * 1.2;
  return {
    hero: small
      ? { url: heroSmallUrl, expectedBytes: 440_000 }
      : { url: heroUrl, expectedBytes: 2_500_000 },
    card: { url: cardUrl, expectedBytes: 70_000 },
  };
}
