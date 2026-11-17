import wordmark from '../../assets/revolut-wordmark.svg';
import styles from './Preloader.module.css';

/**
 * White first frame. The counter and the rule are driven from the motion
 * layer with real byte progress; this component only provides the markup.
 */
export function Preloader() {
  return (
    <div className={styles.preloader} data-preloader role="status" aria-live="polite">
      <span className="visually-hidden">Loading the experience</span>
      <div className={styles.centre}>
        <div className={styles.mask}>
          <img className={styles.wordmark} src={wordmark} alt="Revolut" data-pre-item draggable={false} />
        </div>
        <div className={styles.rule} aria-hidden="true">
          <i data-pre-bar />
        </div>
      </div>
      <div className={styles.meta} aria-hidden="true">
        <div className={styles.mask}>
          <span data-pre-item>Lagos, Nigeria</span>
        </div>
        <div className={styles.mask}>
          <span className={styles.count} data-pre-item>
            <span data-pre-count>000</span>
          </span>
        </div>
        <div className={styles.mask}>
          <span data-pre-item>06°27′N 03°24′E</span>
        </div>
      </div>
    </div>
  );
}
