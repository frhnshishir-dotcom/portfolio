import { describe, expect, it } from 'vitest';
import { CARD_CENTER, IMAGE } from './scene';
import { restAnchor, solveStage } from './stage';

const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1080 },
  { width: 1024, height: 1366 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
  { width: 844, height: 390 },
];

describe('solveStage', () => {
  it.each(viewports)('covers a $width x $height viewport', (viewport) => {
    const { scale, x, y } = solveStage(viewport);
    expect(x).toBeLessThanOrEqual(1e-6);
    expect(y).toBeLessThanOrEqual(1e-6);
    expect(x + IMAGE.width * scale).toBeGreaterThanOrEqual(viewport.width - 1e-6);
    expect(y + IMAGE.height * scale).toBeGreaterThanOrEqual(viewport.height - 1e-6);
  });

  it.each(viewports)('puts the card centre on the anchor at $width x $height', (viewport) => {
    const anchor = restAnchor(viewport);
    const { scale, x, y } = solveStage(viewport, anchor);
    expect(CARD_CENTER[0] * scale + x).toBeCloseTo(anchor[0], 6);
    expect(CARD_CENTER[1] * scale + y).toBeCloseTo(anchor[1], 6);
  });

  it('never scales beyond what the anchor requires', () => {
    const viewport = { width: 1440, height: 900 };
    const { scale } = solveStage(viewport);
    const cover = Math.max(viewport.width / IMAGE.width, viewport.height / IMAGE.height);
    expect(scale).toBeLessThan(cover * 1.05);
  });
});
