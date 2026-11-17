import { CARD_FACE } from './cardFace';
import { quadCenter, type Quad } from './quad';

/**
 * Geometry of the hero photograph (src/assets/lagos-hero.webp).
 *
 * All four numbers below were measured from that image and from no other:
 * tools/measure_corners.py fits a line to each edge of the card's front face
 * and intersects them. If the photograph is ever replaced, measure again.
 */
export const IMAGE = { width: 4096, height: 2640 } as const;

/** Front-face corners of the card in image pixels: TL, TR, BR, BL. */
export const CARD_CORNERS: Quad = [
  [1737.0, 947.3],
  [2358.1, 986.5],
  [2358.1, 2011.9],
  [1737.0, 2020.0],
];

/** Image of the card's true centre (where the diagonals cross). */
export const CARD_CENTER = quadCenter(CARD_CORNERS);

/** Width / height of the physical card. */
export const CARD_ASPECT = CARD_FACE.width / CARD_FACE.height;
