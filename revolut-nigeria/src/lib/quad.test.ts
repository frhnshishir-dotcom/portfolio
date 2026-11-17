import { describe, expect, it } from 'vitest';
import { CARD_CORNERS } from './scene';
import {
  applyHomography,
  lerpQuad,
  quadCenter,
  quadMatrix3d,
  rectQuad,
  rectToQuad,
  transformQuad,
  type Point,
  type Quad,
} from './quad';

const W = 540;
const H = 856;
const corners: Point[] = [
  [0, 0],
  [W, 0],
  [W, H],
  [0, H],
];

function expectMapsOnto(quad: Quad, tolerance = 1e-6) {
  const m = rectToQuad(W, H, quad);
  corners.forEach((corner, index) => {
    const [x, y] = applyHomography(m, corner);
    expect(Math.abs(x - quad[index]![0])).toBeLessThan(tolerance);
    expect(Math.abs(y - quad[index]![1])).toBeLessThan(tolerance);
  });
}

/** Apply a CSS matrix3d string to a point on the z = 0 plane, as a browser would. */
function applyCss(matrix: string, [x, y]: Point): Point {
  const v = matrix
    .slice('matrix3d('.length, -1)
    .split(',')
    .map(Number);
  const px = v[0]! * x + v[4]! * y + v[12]!;
  const py = v[1]! * x + v[5]! * y + v[13]!;
  const pw = v[3]! * x + v[7]! * y + v[15]!;
  return [px / pw, py / pw];
}

describe('rectToQuad', () => {
  it('maps the rectangle corners onto the photographed card', () => {
    expectMapsOnto(CARD_CORNERS);
  });

  it('handles the affine case (an axis-aligned rectangle)', () => {
    expectMapsOnto(rectQuad(720, 450, 300, 475.5));
  });

  it('handles every quad along a turn from perspective to facing', () => {
    const from: Quad = [
      [611.2, 331.9],
      [829.5, 349.5],
      [829.5, 697.6],
      [611.2, 721.5],
    ];
    const to = rectQuad(720, 450, 1900, 3012);
    for (let t = 0; t <= 1; t += 0.05) expectMapsOnto(lerpQuad(from, to, t), 1e-5);
  });

  it('keeps straight lines straight: the centre maps to the diagonal crossing', () => {
    const quad: Quad = [
      [100, 80],
      [420, 130],
      [400, 610],
      [90, 700],
    ];
    const m = rectToQuad(W, H, quad);
    const centre = applyHomography(m, [W / 2, H / 2]);
    const expected = quadCenter(quad);
    expect(centre[0]).toBeCloseTo(expected[0], 6);
    expect(centre[1]).toBeCloseTo(expected[1], 6);
  });
});

describe('quadMatrix3d', () => {
  it('produces a CSS matrix that lands the element corners on the quad', () => {
    const quad = transformQuad(CARD_CORNERS, 0.362027, -23.804, 0);
    const css = quadMatrix3d(W, H, quad);
    expect(css).toMatch(/^matrix3d\((-?\d+(\.\d+)?,){15}-?\d+(\.\d+)?\)$/);
    corners.forEach((corner, index) => {
      const [x, y] = applyCss(css, corner);
      expect(x).toBeCloseTo(quad[index]![0], 4);
      expect(y).toBeCloseTo(quad[index]![1], 4);
    });
  });
});
