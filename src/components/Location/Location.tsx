import type { Listing } from '@/lib/types';
import { ChevronRightTiny, MapPin, Search, ZoomIn, ZoomOut } from '@/components/icons';
import styles from './Location.module.css';

/**
 * "Where you'll be" — heading, place name, the stylised static map, then the
 * neighbourhood copy.
 *
 * The reference draws the map itself out of gradients rather than loading tiles,
 * so this is a picture, not a widget: no mapping library, and the map chrome is
 * decorative. `Location` shadows the DOM `Location` interface inside this module;
 * nothing here refers to the global, so the shadowing is harmless.
 */
export function Location({ listing }: { listing: Listing }) {
  return (
    <section className={styles.location} id="location">
      <h2 className={styles.title}>Where you&rsquo;ll be</h2>

      <div className={styles.place}>{listing.location}</div>

      <div className={styles.map}>
        {/* Land, water and park shapes, plus the grid of streets drawn in ::before. */}
        <div className={styles.terrain} />

        <button className={styles.searchButton} type="button" aria-label="Search">
          <Search size={16} />
        </button>

        <div className={styles.zoom}>
          <button className={styles.zoomButton} type="button" aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
          <button className={styles.zoomButton} type="button" aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
        </div>

        {/* The pin marks the approximate area the copy below already names. */}
        <div className={styles.pin}>
          <MapPin size={56} />
        </div>
      </div>

      <p className={styles.note}>Exact location will be provided after booking.</p>

      <h3 className={styles.subheading}>{listing.neighbourhood.title}</h3>
      <p className={styles.body}>{listing.neighbourhood.body}</p>

      <button className={styles.showMore} type="button">
        Show more
        <ChevronRightTiny size={14} />
      </button>
    </section>
  );
}
