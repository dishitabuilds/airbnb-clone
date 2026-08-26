'use client';

import type { Photo } from '@/lib/types';
import { useGallery } from '@/components/gallery/GalleryProvider';
import { GridDots } from '@/components/icons';
import styles from './PhotoGrid.module.css';

/**
 * The five-photo hero grid.
 *
 * Measured behaviour: every tile opens the Photo tour, not the lightbox — the
 * lightbox is only reachable from inside the tour. "Show all photos" does the
 * same thing, so both share the one handler.
 *
 * This section owns `#photos`; the compact header watches it to decide when to
 * slide down.
 */
export function PhotoGrid({ photos, title }: { photos: Photo[]; title: string }) {
  const { openTour } = useGallery();

  return (
    <section id="photos" className={styles.section} aria-label="Photos of this place">
      <div id="heroGrid" className={styles.grid}>
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className={styles.tile}
            aria-label={`${title} image ${index + 1}`}
            onClick={openTour}
          >
            {/* The button's label already names the image, so the img is decorative. */}
            <img
              src={photo.src}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </button>
        ))}
      </div>

      <button type="button" id="showAllPhotos" className={styles.showAll} onClick={openTour}>
        <GridDots size={15} />
        Show all photos
      </button>
    </section>
  );
}
