import { CardFace } from '../CardFace/CardFace';
import styles from './Portal.module.css';

/**
 * The four planes that ride on the photographed card. Each one is a
 * card-sized element (CARD_FACE units) laid over the card's four corners with
 * the same matrix3d, so they stay locked to it through every camera move.
 *
 *   body  an opaque card that takes over from the photograph before it turns
 *   face  the light layer: logo, chip and details lit from within
 *   rim   the electric-blue edge light
 *   fill  the white light that becomes the portal
 *
 * Their strengths are CSS variables on the experience root
 * (--body, --light, --rim, --rim-glow, --fill, --sheen), driven by GSAP.
 */
export function Portal() {
  return (
    <div className={styles.portal} aria-hidden="true">
      <div className={`${styles.plane} ${styles.body}`} data-plane="body">
        <div className={styles.sheen} />
        <CardFace layers={['logo', 'chip', 'details']} variant="print" className={styles.bodyArt} />
      </div>

      <div className={`${styles.plane} ${styles.face}`} data-plane="face">
        <CardFace layers={['logo', 'chip', 'details']} className={styles.glow} />
        <CardFace layers={['logo', 'chip', 'details']} className={styles.crisp} />
      </div>

      <div className={`${styles.plane} ${styles.rim}`} data-plane="rim">
        <CardFace layers={['rim']} className={styles.rimHalo} />
        <CardFace layers={['rim']} className={styles.rimLine} />
      </div>

      <div className={`${styles.plane} ${styles.fill}`} data-plane="fill" />
    </div>
  );
}
