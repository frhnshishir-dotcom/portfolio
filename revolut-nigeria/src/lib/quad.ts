/**
 * Quad geometry: map a flat rectangle onto any four screen points.
 *
 * A CSS `matrix3d` can express a full projective transform of the plane, so a
 * plain rectangular element can be laid exactly over a card that was
 * photographed in perspective. Everything the portal does (attach, turn to
 * face the viewer, grow until it fills the viewport) is a single element whose
 * four target corners move; the matrix is re-solved every frame.
 */

export type Point = readonly [x: number, y: number];
/** Corners in the order top-left, top-right, bottom-right, bottom-left. */
export type Quad = readonly [Point, Point, Point, Point];

/** Row-major 3x3 homography. */
export type Homography = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

/**
 * Homography taking the unit square (0,0) (1,0) (1,1) (0,1) to `quad`.
 * Closed form after Heckbert, "Fundamentals of Texture Mapping and Image Warping".
 */
export function unitSquareToQuad(quad: Quad): Homography {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;

  // A parallelogram needs no perspective terms; solving anyway would divide by ~0.
  const scale = Math.max(Math.abs(dx1), Math.abs(dx2), Math.abs(dy1), Math.abs(dy2), 1e-9);
  if (Math.abs(dx3) < 1e-9 * scale && Math.abs(dy3) < 1e-9 * scale) {
    return [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0, 1];
  }

  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const h = (dx1 * dy3 - dx3 * dy1) / den;

  return [
    x1 - x0 + g * x1, x3 - x0 + h * x3, x0,
    y1 - y0 + g * y1, y3 - y0 + h * y3, y0,
    g, h, 1,
  ];
}

/** Homography taking a `width` x `height` rectangle at the origin to `quad`. */
export function rectToQuad(width: number, height: number, quad: Quad): Homography {
  const [a, b, c, d, e, f, g, h, i] = unitSquareToQuad(quad);
  return [a / width, b / height, c, d / width, e / height, f, g / width, h / height, i];
}

export function applyHomography(m: Homography, [x, y]: Point): Point {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
}

/**
 * The homography as a CSS transform. The element must use
 * `transform-origin: 0 0` and sit at the origin of its containing block.
 * (CSS matrices are column-major; z is passed through untouched.)
 */
export function toMatrix3d(m: Homography): string {
  const [a, b, c, d, e, f, g, h, i] = m;
  return `matrix3d(${n(a)},${n(d)},0,${n(g)},${n(b)},${n(e)},0,${n(h)},0,0,1,0,${n(c)},${n(f)},0,${n(i)})`;
}

/** `matrix3d` that lays a `width` x `height` element over `quad`. */
export function quadMatrix3d(width: number, height: number, quad: Quad): string {
  return toMatrix3d(rectToQuad(width, height, quad));
}

// Fixed notation: exponent notation ("1e-7") is not valid inside matrix3d().
function n(value: number): string {
  return Number.isFinite(value) ? value.toFixed(10) : '0';
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPoint(a: Point, b: Point, t: number): Point {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

export function lerpQuad(a: Quad, b: Quad, t: number): Quad {
  return [
    lerpPoint(a[0], b[0], t),
    lerpPoint(a[1], b[1], t),
    lerpPoint(a[2], b[2], t),
    lerpPoint(a[3], b[3], t),
  ];
}

/** Axis-aligned rectangle as a quad, given its centre and size. */
export function rectQuad(cx: number, cy: number, width: number, height: number): Quad {
  const hw = width / 2;
  const hh = height / 2;
  return [
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh],
    [cx - hw, cy + hh],
  ];
}

/**
 * Where the diagonals cross. For a rectangle seen in perspective this is the
 * image of the rectangle's true centre, which the centroid of the corners is not.
 */
export function quadCenter(quad: Quad): Point {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const den = (x0 - x2) * (y1 - y3) - (y0 - y2) * (x1 - x3);
  if (Math.abs(den) < 1e-12) {
    return [(x0 + x1 + x2 + x3) / 4, (y0 + y1 + y2 + y3) / 4];
  }
  const t = ((x0 - x1) * (y1 - y3) - (y0 - y1) * (x1 - x3)) / den;
  return [x0 + t * (x2 - x0), y0 + t * (y2 - y0)];
}

/** Uniform scale then translate: image pixels to screen pixels. */
export function transformQuad(quad: Quad, scale: number, tx: number, ty: number): Quad {
  const p = ([x, y]: Point): Point => [x * scale + tx, y * scale + ty];
  return [p(quad[0]), p(quad[1]), p(quad[2]), p(quad[3])];
}

/** Mean length of the two side edges (left and right). */
export function quadHeight(quad: Quad): number {
  const d = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  return (d(quad[0], quad[3]) + d(quad[1], quad[2])) / 2;
}

/** Length of the longer of the two side edges. */
export function quadMaxSide(quad: Quad): number {
  const d = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  return Math.max(d(quad[0], quad[3]), d(quad[1], quad[2]));
}

/** Axis-aligned bounds of a quad. */
export function quadBounds(quad: Quad): { left: number; top: number; right: number; bottom: number } {
  const xs = quad.map((p) => p[0]);
  const ys = quad.map((p) => p[1]);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
}
