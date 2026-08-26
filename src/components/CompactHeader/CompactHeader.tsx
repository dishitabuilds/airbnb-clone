'use client';

import { useEffect, useState } from 'react';
import type { Listing } from '@/lib/types';
import styles from './CompactHeader.module.css';

/** Anchor targets, in page order. Each id is owned by the section it names. */
const SECTIONS = [
  { id: 'photos', label: 'Photos' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'location', label: 'Location' },
] as const;

/**
 * Measured reveal point: the bar appears once the hero grid's bottom edge has
 * passed 40px below the viewport top. The grid's bottom sits at y=667, which puts
 * the crossing at scrollY ~= 627 at 1512x900.
 */
const REVEAL_OFFSET = 40;

/** The bar's own height — a section counts as current once it passes underneath. */
const BAR_HEIGHT = 66;

export function CompactHeader({ listing }: { listing: Listing }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // Reveal. A negative top root margin turns the measured crossing into an
  // observer boundary, so this costs nothing while the user is not near it.
  useEffect(() => {
    const hero = document.getElementById('photos');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // "Not intersecting" covers both scrolled past and still below the fold;
        // only the first should reveal the bar.
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < REVEAL_OFFSET);
      },
      { rootMargin: `-${REVEAL_OFFSET}px 0px 0px 0px`, threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Scroll spy. Throttled to one measurement per frame; the sections are read
  // fresh each pass because they mount independently of this component.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      let current: string = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= BAR_HEIGHT) current = section.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={shown ? `${styles.bar} ${styles.shown}` : styles.bar} aria-hidden={!shown}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Listing sections">
          {SECTIONS.map((section) => {
            const isActive = active === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                aria-current={isActive ? 'true' : undefined}
                // Belt and braces with `visibility: hidden`: never a tab stop
                // while the bar is off-screen.
                tabIndex={shown ? undefined : -1}
              >
                {section.label}
              </a>
            );
          })}
        </nav>

        <div className={styles.summary}>
          <div className={styles.price}>
            <div>
              <span className={styles.total}>{listing.stay.total}</span>{' '}
              <span className={styles.nights}>for {listing.stay.nights} nights</span>
            </div>
            <div className={styles.rating}>
              <span className={styles.star} aria-hidden="true" />
              {` ${listing.rating} · ${listing.reviewCount} reviews`}
            </div>
          </div>

          <button type="button" className={styles.reserve} tabIndex={shown ? undefined : -1}>
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
