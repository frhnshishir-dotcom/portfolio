import { PillButton } from '../PillButton/PillButton';
import { Icon } from '../Icon/Icon';
import styles from './Reveal.module.css';

type Props = {
  cardSrc: string | undefined;
  onExplore: () => void;
  /** reduced motion: an ordinary section in the page flow */
  inFlow: boolean;
};

/** Second screen: what waits on the other side of the portal. */
export function Reveal({ cardSrc, onExplore, inFlow }: Props) {
  return (
    <section
      className={styles.reveal}
      data-reveal
      data-flow={inFlow ? '' : undefined}
      aria-labelledby="reveal-title"
    >
      <h2 id="reveal-title" className={styles.headline}>
        <span className={`${styles.display} ${styles.first}`}>
          <span className={styles.mask}>
            <span data-reveal-line>Money Without</span>
          </span>
        </span>{' '}
        <span className={`${styles.display} ${styles.second}`}>
          <span className={styles.mask}>
            <span data-reveal-line>Borders</span>
          </span>
        </span>
      </h2>

      <div className={styles.stage} data-reveal-card>
        <div className={styles.tilt} data-tilt>
          <div className={styles.float} data-float>
            {cardSrc && (
              <img
                className={styles.card}
                src={cardSrc}
                width={1440}
                height={810}
                alt="A midnight-blue Revolut card with a gold chip, floating at an angle. Cardholder Farhan Shishir, number hidden except the last four digits, 2048."
                draggable={false}
              />
            )}
          </div>
        </div>
        <div className={styles.shadow} data-float-shadow aria-hidden="true" />
      </div>

      <div className={styles.copy}>
        <p className={styles.text} data-reveal-item>
          From everyday payments to international transfers, Revolut brings financial tools
          together in one digital experience. A potential new chapter for Nigeria’s connected
          economy.
        </p>
        <div className={styles.ctas} data-reveal-item>
          <PillButton label="Discover Revolut" variant="ink" icon="account" href="https://www.revolut.com/" />
          <button type="button" className={styles.explore} onClick={onExplore} data-cursor>
            <span className={styles.plus}>
              <Icon name="plus" />
            </span>
            <span className={styles.exploreLabel}>Explore</span>
          </button>
        </div>
      </div>

      <p className={styles.note} data-reveal-item>
        A student concept for a university presentation on a hypothetical Nigerian market entry.
        Not affiliated with or endorsed by Revolut Ltd. Card details are fictional.{' '}
        <span className={styles.credit}>
          Lagos photograph:{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:Lekki-ikoyi_link_bridge.jpg"
            target="_blank"
            rel="noreferrer noopener"
            data-cursor
          >
            Ayorinde Ogundele
          </a>
          ,{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer noopener" data-cursor>
            CC BY-SA 4.0
          </a>
          , adapted.
        </span>
      </p>
    </section>
  );
}
