import logoWhite from '../../assets/revolut-logo.svg';
import logoInk from '../../assets/revolut-wordmark.svg';
import { Icon } from '../Icon/Icon';
import styles from './Nav.module.css';

export type NavTheme = 'onPhoto' | 'onPaper';

type Props = {
  theme: NavTheme;
  onHome: () => void;
  onExperience: () => void;
};

export function Nav({ theme, onHome, onExperience }: Props) {
  return (
    <header className={styles.nav} data-theme={theme} data-nav>
      <button type="button" className={styles.brand} onClick={onHome} data-cursor aria-label="Revolut, back to the start">
        <img className={styles.logoWhite} src={logoWhite} alt="" draggable={false} />
        <img className={styles.logoInk} src={logoInk} alt="" draggable={false} />
      </button>

      <nav className={styles.links} aria-label="Sections">
        <button type="button" onClick={onHome} data-cursor>
          Nigeria
        </button>
        <button type="button" onClick={onExperience} data-cursor>
          Experience
        </button>
        <a href="https://www.revolut.com/" target="_blank" rel="noreferrer noopener" data-cursor>
          Revolut
        </a>
      </nav>

      <div className={styles.side}>
        <span className={styles.tag}>
          <i aria-hidden="true" />
          Concept · Lagos
        </span>
        <a
          className={styles.account}
          href="https://www.revolut.com/"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Revolut account (opens revolut.com)"
          data-cursor
        >
          <Icon name="account" />
        </a>
      </div>
    </header>
  );
}
