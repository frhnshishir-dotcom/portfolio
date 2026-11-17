/**
 * Card-face layout, in card units (1 unit = 0.1 mm, so the ID-1 card is 539.8 x 856).
 *
 * This is the single source of truth for where the artwork sits on the card.
 * The same layout is rasterised into the textures the 3D render uses
 * (tools/render-face-textures.mjs) and drawn live as the light layers that sit
 * on the photographed card, so the two can never drift apart.
 */
export const CARD_FACE = {
  width: 540,
  height: 856,
  radius: 32,
} as const;

export const CARD_LAYOUT = {
  /** Revolut wordmark, top left. Height follows the 145:32 outline. */
  logo: { x: 46, y: 54, width: 168 },
  /** Contact plate. ISO 7816 position for a portrait card (centre 30.1 mm / 15.1 mm). */
  chip: { x: 242, y: 92, width: 118, height: 130 },
  /** Cardholder block, bottom left. */
  details: { x: 46, bottom: 58 },
  /** Market tag, bottom right. */
  tag: { right: 46, bottom: 58 },
  /** Light inlay: a thin line set just inside the edge of the card. */
  rim: { inset: 9, width: 3.5 },
} as const;

export const CARD_COPY = {
  holder: 'FARHAN SHISHIR',
  number: '•••• •••• •••• 2048',
  tag: 'NG',
} as const;
