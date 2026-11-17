import accountSvg from '../../assets/icon-account.svg?raw';
import plusSvg from '../../assets/icon-plus.svg?raw';
import styles from './Icon.module.css';

const ICONS = { account: accountSvg, plus: plusSvg } as const;

type Props = { name: keyof typeof ICONS; className?: string };

/** Inlines a local SVG so it inherits `currentColor` from its surroundings. */
export function Icon({ name, className }: Props) {
  return (
    <span
      className={[styles.icon, className].filter(Boolean).join(' ')}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
