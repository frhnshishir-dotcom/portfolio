import { PillButton } from '../PillButton/PillButton';
import styles from './Hero.module.css';

type Props = {
  onExplore: () => void;
};

/**
 * First-screen copy. Its blocks are placed around the card using the card's
 * on-screen rectangle (CSS variables written by the scene controller), so the
 * copy never covers the card at any viewport size.
 */
export function Hero({ onExplore }: Props) {
  return (
    <div className={styles.hero} data-hero>
      <div className={styles.head}>
        <p className={styles.badge} data-hero-item>
          <i aria-hidden="true" />A new financial experience
        </p>
        <h1 className={styles.title}>
          <span className={styles.line}>
            <span data-hero-line>A New Way to Move</span>
          </span>{' '}
          <span className={styles.line}>
            <span data-hero-line>Money in Nigeria</span>
          </span>
        </h1>
      </div>

      <p className={styles.lead} data-hero-item>
        A new perspective on money, payments and global financial access. Discover how Revolut
        could bring a connected digital banking experience to Nigeria.
      </p>

      <div className={styles.actions} data-hero-item>
        <PillButton label="Explore the Experience" variant="light" icon="plus" onClick={onExplore} />
        <PillButton label="Discover Revolut" variant="glass" href="https://www.revolut.com/" />
      </div>

      <div className={styles.hint} data-hero-hint aria-hidden="true">
        <span>Scroll down for more</span>
        <i />
      </div>
    </div>
  );
}
