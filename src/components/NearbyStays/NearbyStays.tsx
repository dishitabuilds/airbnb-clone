'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { NearbyStay } from '@/lib/types';
import { ChevronLeftSmall, ChevronRightTiny, StarSmall } from '@/components/icons';
import styles from './NearbyStays.module.css';

/** The track shows five 208px cards across the 1120px content width. */
const PER_VIEW = 5;

/** The captured card pitch is 228px: a 208px card plus this gap. */
const GAP = 20;

/**
 * "More stays nearby" — a paging carousel over the nearby listings.
 *
 * The capture builds the track as a real scroll container (`overflow-x: auto`
 * with `scroll-behavior: smooth`) rather than a translated strip, so the
 * buttons page it by moving `scrollLeft`. That keeps arrow keys, trackpads and
 * tabbing to an off-screen card working for free, and `globals.css` already
 * neutralises the smooth scroll under `prefers-reduced-motion`.
 */
export function NearbyStays({ stays }: { stays: NearbyStay[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(stays.length / PER_VIEW));

  /* Read the page back off the element so manual scrolling stays in sync. */
  const syncPage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const atEnd = track.scrollLeft >= maxScroll - 1;

    setPage(atEnd ? pageCount - 1 : Math.round(track.scrollLeft / (track.clientWidth + GAP)));
  }, [pageCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener('scroll', syncPage, { passive: true });
    return () => track.removeEventListener('scroll', syncPage);
  }, [syncPage]);

  /*
   * A page is one full view plus the gap that follows it, so the next card
   * lands flush against the left edge. The browser clamps the final page.
   */
  function goTo(next: number) {
    const track = trackRef.current;
    if (!track) return;

    setPage(next);
    track.scrollTo({ left: next * (track.clientWidth + GAP) });
  }

  return (
    <section className={styles.nearbyStays}>
      <div className={styles.header}>
        <h2 className={styles.title}>More stays nearby</h2>

        <div className={styles.nav}>
          <span className={styles.pageIndicator}>
            {page + 1} / {pageCount}
          </span>

          <button
            className={styles.navButton}
            type="button"
            aria-label="Previous"
            disabled={page === 0}
            onClick={() => goTo(page - 1)}
          >
            <ChevronLeftSmall size={12} />
          </button>

          <button
            className={styles.navButton}
            type="button"
            aria-label="Next"
            disabled={page >= pageCount - 1}
            onClick={() => goTo(page + 1)}
          >
            <ChevronRightTiny size={12} />
          </button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {stays.map((stay) => (
          <a
            className={styles.card}
            key={stay.id}
            href="#"
            aria-label={`${stay.title}, ${stay.price}, rated ${stay.rating} out of 5`}
          >
            {/* The card's label already names the stay, so the image is decorative. */}
            <img
              className={styles.image}
              src={stay.image}
              alt=""
              loading="lazy"
              width={208}
              height={208}
            />
            <div className={styles.cardTitle}>{stay.title}</div>
            <div className={styles.price}>
              {stay.price}{' '}
              <span className={styles.star}>
                <StarSmall size={10} />
              </span>{' '}
              {stay.rating}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
