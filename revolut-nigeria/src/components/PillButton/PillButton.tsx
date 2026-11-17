import type { MouseEventHandler } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './PillButton.module.css';

type Props = {
  label: string;
  /** light: white on the photograph · glass: frosted on the photograph · ink: dark on paper */
  variant: 'light' | 'glass' | 'ink';
  icon?: 'plus' | 'account';
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ariaLabel?: string;
  className?: string;
};

/**
 * The pill: the label rolls up to a second copy of itself on hover while the
 * icon chip turns. Renders a link when given `href`, otherwise a button.
 */
export function PillButton({ label, variant, icon, href, onClick, ariaLabel, className }: Props) {
  const content = (
    <>
      <span className={styles.roll}>
        <span className={styles.label}>{label}</span>
        <span className={styles.label} aria-hidden="true">
          {label}
        </span>
      </span>
      {icon && (
        <span className={styles.chip}>
          <Icon name={icon} />
        </span>
      )}
    </>
  );
  const props = {
    className: [styles.pill, className].filter(Boolean).join(' '),
    'data-variant': variant,
    'data-icon': icon,
    'data-cursor': '',
    'aria-label': ariaLabel,
    onClick,
  };
  return href ? (
    <a {...props} href={href} target="_blank" rel="noreferrer noopener">
      {content}
    </a>
  ) : (
    <button type="button" {...props}>
      {content}
    </button>
  );
}
