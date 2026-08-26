import type { Listing } from '@/lib/types';
import { Flag, Guests } from '@/components/icons';

import styles from './BookingCard.module.css';

/**
 * The sticky booking column: a promo strip, the booking card itself, and the
 * report link beneath it. The <aside aria-label="Booking"> landmark and the
 * sticky offset are supplied by the page, so this renders no landmark of its own.
 */
export function BookingCard({ listing }: { listing: Listing }) {
  const { stay, promo } = listing;

  return (
    <div id="bookingSticky">
      <div className={styles.promo}>
        {/*
          A 32px local SVG: next/image routes string sources through the image
          optimizer, which rejects SVG unless the project opts in, and there is
          nothing to optimise at this size. The CSS pins both dimensions, so
          there is no layout shift to guard against.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.promoIcon}
          src="/assets/images/ui/discount.svg"
          alt=""
          aria-hidden="true"
        />

        <div className={styles.promoText}>
          {promo.text}
          <br />
          <a className={styles.promoLink} href="#">
            {promo.linkLabel}
          </a>
        </div>

        <button type="button" className={styles.claim}>
          {promo.cta}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.priceRow}>
          <span className={styles.price}>{stay.total}</span>
          <span className={styles.priceNights}>for {stay.nights} nights</span>
        </div>

        <div className={styles.dates}>
          <div className={styles.dateRow}>
            <button
              type="button"
              className={styles.cell}
              aria-label={`Check-in, ${stay.checkInISO}`}
            >
              <span className={styles.cellLabel}>Check-in</span>
              <span className={styles.cellValue}>{stay.checkInISO}</span>
            </button>

            <button
              type="button"
              className={styles.cell}
              aria-label={`Checkout, ${stay.checkOutISO}`}
            >
              <span className={styles.cellLabel}>Checkout</span>
              <span className={styles.cellValue}>{stay.checkOutISO}</span>
            </button>
          </div>

          <button
            type="button"
            className={styles.guestsCell}
            aria-label={`Guests, ${stay.guests}`}
          >
            <span>
              <span className={styles.cellLabel}>Guests</span>
              <span className={styles.cellValue}>{stay.guests}</span>
            </span>
            <Guests size={16} className={styles.chevron} />
          </button>
        </div>

        <p className={styles.cancellation}>
          Free cancellation before <b>{stay.freeCancellationBefore}</b>
        </p>

        <button type="button" id="reserveBtn" className={styles.reserve}>
          Reserve
        </button>

        <p className={styles.chargedNote}>{"You won't be charged yet"}</p>
      </div>

      <div className={styles.report}>
        <Flag size={16} className={styles.reportIcon} />
        <a className={styles.reportLink} href="#">
          Report this listing
        </a>
      </div>
    </div>
  );
}
