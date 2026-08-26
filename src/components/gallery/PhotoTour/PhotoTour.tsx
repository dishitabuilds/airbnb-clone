'use client';

import { useCallback, useMemo, useRef, type ReactNode } from 'react';

import { Back, Heart, Share } from '@/components/icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { Listing, Photo, PhotoCategory } from '@/lib/types';

import { useGallery } from '../GalleryProvider';
import styles from './PhotoTour.module.css';

/**
 * The full-screen photo tour: a category strip that jumps to a room, then one
 * section per room with its photos. Clicking any photo stacks the Lightbox on
 * top; the tour stays mounted underneath it.
 */

/**
 * Id of the overlay root. The Lightbox needs it to release `inert` — see the
 * comment on `dismiss` in Lightbox.tsx.
 */
export const TOUR_ROOT_ID = 'photoTour';

/** Section anchors, also used as the category strip's scroll targets. */
const sectionId = (index: number) => `tour-room-${index}`;
const headingId = (index: number) => `tour-room-${index}-title`;

interface Section {
  category: PhotoCategory;
  /** Index of this category's first photo in the flat `listing.photos` array. */
  start: number;
}

interface PlacedPhoto {
  photo: Photo;
  /** Position in the flat `listing.photos` array — what the Lightbox indexes by. */
  index: number;
}

/**
 * Splits a room's photos into rows.
 *
 * The reference lays them out in blocks of three — one full-width photo, then a
 * pair — and gives the leftovers a row of their own: a tail of one runs full
 * width, a tail of two becomes a pair. That last case is why the two-photo
 * "Full kitchen" has no full-width lead at all. Derived from the row structure
 * of all nine sections in .reference/dump-tour.json.
 */
function photoRows(photos: Photo[], start: number): PlacedPhoto[][] {
  const placed: PlacedPhoto[] = photos.map((photo, i) => ({ photo, index: start + i }));
  const rows: PlacedPhoto[][] = [];
  let i = 0;
  while (placed.length - i >= 3) {
    rows.push([placed[i]]);
    rows.push([placed[i + 1], placed[i + 2]]);
    i += 3;
  }
  if (i < placed.length) rows.push(placed.slice(i));
  return rows;
}

function IconButton({
  id,
  label,
  className,
  onClick,
  children,
}: {
  id?: string;
  label: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      id={id}
      className={className ? `${styles.iconBtn} ${className}` : styles.iconBtn}
      aria-label={label}
      onClick={onClick}
    >
      <span>{children}</span>
    </button>
  );
}

export function PhotoTour({ listing }: { listing: Listing }) {
  const { tourOpen, lightboxIndex, closeTour, openLightbox } = useGallery();
  const ref = useRef<HTMLDivElement>(null);

  useScrollLock(tourOpen);
  // Inactive while the Lightbox is above: Escape then unwinds one layer per
  // press, and Tab cannot wander down into the tour.
  useFocusTrap(ref, tourOpen && lightboxIndex === null, closeTour);

  /**
   * The Lightbox indexes into the flat `listing.photos` array, so each photo
   * needs its position there rather than its position within its category.
   */
  const sections = useMemo<Section[]>(() => {
    const list: Section[] = [];
    let start = 0;
    for (const category of listing.categories) {
      list.push({ category, start });
      start += category.photos.length;
    }
    return list;
  }, [listing.categories]);

  const scrollToSection = useCallback((index: number) => {
    const target = document.getElementById(sectionId(index));
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, []);

  return (
    <div
      id={TOUR_ROOT_ID}
      ref={ref}
      className={tourOpen ? `${styles.shell} ${styles.open}` : styles.shell}
      role="dialog"
      aria-modal="true"
      aria-label="Photo tour"
      // Closed, or covered by the Lightbox: nothing in here is reachable.
      inert={!tourOpen || lightboxIndex !== null}
      tabIndex={-1}
    >
      <header className={styles.header} id="tourBar">
        <IconButton id="tourBack" label="Back" className={styles.back} onClick={closeTour}>
          <Back size={18} />
        </IconButton>

        <h2 className={styles.title}>Photo tour</h2>

        <div className={styles.headerActions}>
          <IconButton label="Share">
            <Share size={18} />
          </IconButton>
          <IconButton label="Save">
            <Heart size={18} />
          </IconButton>
        </div>
      </header>

      <div className={styles.scroll} id="tourScroll">
        <div className={styles.inner}>
          <nav className={styles.nav} id="tourNav" aria-label="Photo categories">
            {sections.map(({ category }, index) => (
              <button
                key={category.id}
                type="button"
                className={styles.category}
                aria-label={category.name}
                onClick={() => scrollToSection(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.thumb} alt="" loading="lazy" />
                <span className={styles.categoryLabel}>{category.name}</span>
              </button>
            ))}
          </nav>

          <div id="tourRooms">
            {sections.map(({ category, start }, index) => {
              const rows = photoRows(category.photos, start);
              return (
                <section
                  key={category.id}
                  id={sectionId(index)}
                  className={styles.section}
                  aria-labelledby={headingId(index)}
                >
                  <div className={styles.sectionHead}>
                    <h3 id={headingId(index)} className={styles.sectionTitle}>
                      {category.name}
                    </h3>
                    {category.amenities.length > 0 && (
                      <p className={styles.sectionAmenities}>
                        {category.amenities.join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className={styles.photos}>
                    {rows.map((row) => (
                      <div
                        key={row[0].photo.id}
                        className={`${styles.row} ${
                          row.length === 1 ? styles.rowFull : styles.rowPair
                        }`}
                      >
                        {row.map(({ photo, index: photoIndex }) => (
                          <PhotoButton
                            key={photo.id}
                            photo={photo}
                            index={photoIndex}
                            title={listing.title}
                            onOpen={openLightbox}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoButton({
  photo,
  index,
  title,
  onOpen,
}: {
  photo: Photo;
  index: number;
  title: string;
  onOpen: (index: number) => void;
}) {
  return (
    <button
      type="button"
      className={styles.photo}
      data-idx={index}
      aria-label={`${title} image ${index + 1}`}
      onClick={() => onOpen(index)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} loading="lazy" />
    </button>
  );
}
