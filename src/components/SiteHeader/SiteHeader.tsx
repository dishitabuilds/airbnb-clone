import Link from 'next/link';

import { AirbnbLogo, Globe, Menu, Search } from '@/components/icons';
import styles from './SiteHeader.module.css';

/**
 * The static top bar: logo, search pill, account actions.
 *
 * Nothing here is stateful — the pill's fields are the reference's own inert
 * buttons — so this stays a server component.
 */
export function SiteHeader() {
  return (
    <header id="siteHeader" className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.logo} href="/" aria-label="Airbnb homepage">
          <span className={styles.logoMark}>
            <AirbnbLogo />
          </span>
        </Link>

        <div className={styles.search} role="search">
          <button type="button" className={styles.field}>
            {/* The house is decoration beside the "Anywhere" label. */}
            <img
              className={styles.house}
              src="/assets/images/ui/searchbar-house.png"
              alt=""
              aria-hidden="true"
            />
            Anywhere
          </button>

          <span className={styles.divider} />

          <button type="button" className={styles.field}>
            Anytime
          </button>

          <span className={styles.divider} />

          <button type="button" className={`${styles.field} ${styles.placeholder}`}>
            Add guests
          </button>

          <button type="button" className={styles.searchButton} aria-label="Search">
            <Search size={14} className={styles.searchGlyph} />
          </button>
        </div>

        <nav className={styles.actions}>
          <a className={styles.host} href="/host">
            Become a host
          </a>

          <button
            type="button"
            className={styles.round}
            aria-label="Choose a language and currency"
          >
            <Globe size={16} />
          </button>

          <button type="button" className={styles.round} aria-label="Main navigation menu">
            <Menu size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}
