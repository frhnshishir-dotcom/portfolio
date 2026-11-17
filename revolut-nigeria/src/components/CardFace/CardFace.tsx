import type { CSSProperties } from 'react';
import cardChip from '../../assets/revolut-card-chip.svg';
import cardLogo from '../../assets/revolut-card-logo.svg';
import { CARD_COPY, CARD_FACE, CARD_LAYOUT } from '../../lib/cardFace';
import styles from './CardFace.module.css';

export type CardFaceLayer = 'logo' | 'chip' | 'details' | 'rim';

type Props = {
  /** Which artwork groups to draw. Defaults to all of them. */
  layers?: readonly CardFaceLayer[];
  /** `light` is the glowing on-photo treatment, `print` the flat texture source. */
  variant?: 'light' | 'print';
  className?: string;
};

const ALL: readonly CardFaceLayer[] = ['rim', 'logo', 'chip', 'details'];

const vars = {
  '--face-w': `${CARD_FACE.width}px`,
  '--face-h': `${CARD_FACE.height}px`,
  '--logo-x': `${CARD_LAYOUT.logo.x}px`,
  '--logo-y': `${CARD_LAYOUT.logo.y}px`,
  '--logo-w': `${CARD_LAYOUT.logo.width}px`,
  '--chip-x': `${CARD_LAYOUT.chip.x}px`,
  '--chip-y': `${CARD_LAYOUT.chip.y}px`,
  '--chip-w': `${CARD_LAYOUT.chip.width}px`,
  '--chip-h': `${CARD_LAYOUT.chip.height}px`,
  '--details-x': `${CARD_LAYOUT.details.x}px`,
  '--details-bottom': `${CARD_LAYOUT.details.bottom}px`,
  '--tag-right': `${CARD_LAYOUT.tag.right}px`,
  '--tag-bottom': `${CARD_LAYOUT.tag.bottom}px`,
  '--rim-inset': `${CARD_LAYOUT.rim.inset}px`,
  '--rim-width': `${CARD_LAYOUT.rim.width}px`,
  '--rim-radius': `${CARD_FACE.radius - CARD_LAYOUT.rim.inset}px`,
} as CSSProperties;

/**
 * The artwork of the card front, laid out in card units.
 * It has a fixed intrinsic size; whoever places it supplies the transform.
 */
export function CardFace({ layers = ALL, variant = 'light', className }: Props) {
  const has = (layer: CardFaceLayer) => layers.includes(layer);
  return (
    <div
      className={[styles.face, styles[variant], className].filter(Boolean).join(' ')}
      style={vars}
      aria-hidden="true"
    >
      {has('rim') && <div className={styles.rim} data-face="rim" />}
      {has('logo') && (
        <img className={styles.logo} src={cardLogo} alt="" data-face="logo" draggable={false} />
      )}
      {has('chip') && (
        <img className={styles.chip} src={cardChip} alt="" data-face="chip" draggable={false} />
      )}
      {has('details') && (
        <>
          <div className={styles.details} data-face="details">
            <span className={styles.holder}>{CARD_COPY.holder}</span>
            <span className={styles.number}>{CARD_COPY.number}</span>
          </div>
          <div className={styles.tag} data-face="details">
            <i className={styles.tagDot} />
            {CARD_COPY.tag}
          </div>
        </>
      )}
    </div>
  );
}
