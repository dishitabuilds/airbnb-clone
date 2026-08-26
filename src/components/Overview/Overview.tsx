import type { Listing } from '@/lib/types';
import { GuestFavourite, StarSmall } from '@/components/icons';
import styles from './Overview.module.css';

/** The badge shows five stars regardless of the score; the number carries the value. */
const STARS = [0, 1, 2, 3, 4];

/**
 * Top of the left column: the "Entire serviced apartment…" heading, the capacity
 * line, the Guest favourite card and the host row.
 */
export function Overview({ listing }: { listing: Listing }) {
  return (
    <section className={styles.overview}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{listing.subtitle}</h2>
        <div className={styles.capacity}>{listing.capacity}</div>
      </div>

      {listing.isGuestFavourite && (
        <div className={styles.favourite}>
          <div className={styles.badge}>
            <span className={styles.laurel}>
              <GuestFavourite />
            </span>
            {/* The reference breaks the word across two lines between the laurels.
                Screen readers get the phrase once, unbroken, from the .srOnly copy. */}
            <span className={styles.badgeWord} aria-hidden="true">
              Guest
              <br />
              favourite
            </span>
            <span className="srOnly">Guest favourite</span>
            <span className={`${styles.laurel} ${styles.laurelFlipped}`}>
              <GuestFavourite />
            </span>
          </div>

          <p className={styles.blurb}>{listing.guestFavouriteBlurb}</p>

          <div className={styles.scores}>
            <div className={styles.score}>
              <div className={styles.scoreValue}>{listing.rating}</div>
              <div className={styles.stars} aria-hidden="true">
                {STARS.map((i) => (
                  <span key={i}>
                    <StarSmall size={10} />
                  </span>
                ))}
              </div>
              <span className="srOnly">out of 5 stars</span>
            </div>

            <div className={styles.divider} aria-hidden="true" />

            <div className={styles.score}>
              <div className={styles.scoreValue}>{listing.reviewCount}</div>
              <div className={styles.scoreLabel}>Reviews</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.host}>
        {/* Decorative: the name beside it already identifies the host. */}
        <img
          className={styles.avatar}
          src={listing.host.avatar}
          alt=""
          width={46}
          height={46}
        />
        <div>
          <div className={styles.hostName}>Hosted by {listing.host.name}</div>
          <div className={styles.hostMeta}>{listing.host.yearsHosting} years hosting</div>
        </div>
      </div>
    </section>
  );
}
