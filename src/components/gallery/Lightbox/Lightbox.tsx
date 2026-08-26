'use client';

import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import { ArrowLeft, ArrowRight, Close, GridDots } from '@/components/icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { Photo } from '@/lib/types';

import { useGallery } from '../GalleryProvider';
import { TOUR_ROOT_ID } from '../PhotoTour/PhotoTour';
import styles from './Lightbox.module.css';

/**
 * Single-photo viewer stacked over the Photo tour. Closing it returns to the
 * tour rather than to the page — both the grid button and the close button do
 * the same thing, which is what the reference does.
 *
 * The arrows in `.reference/dump-lightbox.json` are drawn at stroke-width 4,
 * heavier than the shared icon default, so the style is passed explicitly.
 */
const ARROW_STYLE = {
  display: 'block',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4,
  overflow: 'visible',
} as const;

/** The photo the overlay is currently showing, plus its flat-array index. */
interface Shown {
  photo: Photo;
  index: number;
}

export function Lightbox() {
  const {
    photos,
    activePhoto,
    lightboxIndex,
    closeLightbox,
    next,
    prev,
    canPrev,
    canNext,
  } = useGallery();

  const ref = useRef<HTMLDivElement>(null);
  const open = lightboxIndex !== null;

  /**
   * `closeLightbox` restores focus to the tour photo that opened this viewer
   * synchronously, i.e. before React commits the render that drops the tour's
   * `inert`. `focus()` on an inert element is a no-op, so the tour has to be
   * released here first. React removes the attribute again on the next commit,
   * which is a no-op once it is already gone.
   */
  const dismiss = useCallback(() => {
    document.getElementById(TOUR_ROOT_ID)?.removeAttribute('inert');
    closeLightbox();
  }, [closeLightbox]);

  useScrollLock(open);
  useFocusTrap(ref, open, dismiss);

  /**
   * Keeps the last photo, title and counter on screen through the 250ms
   * fade-out, so closing does not blank the overlay a frame before it has gone.
   * Adjusted during render rather than in an effect — the React docs' pattern
   * for deriving state from a changing prop, and it avoids a second commit.
   */
  const live =
    lightboxIndex !== null && activePhoto
      ? { photo: activePhoto, index: lightboxIndex }
      : null;
  const [previous, setPrevious] = useState<Shown | null>(null);
  if (live && live.index !== previous?.index) setPrevious(live);
  const shown = live ?? previous;

  // On the dialog, and only while it is open — no listener survives the close.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  };

  return (
    <div
      id="lightbox"
      ref={ref}
      className={open ? `${styles.shell} ${styles.open}` : styles.shell}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      inert={!open}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <header className={styles.header}>
        <button
          type="button"
          id="lbGrid"
          className={`${styles.iconBtn} ${styles.grid}`}
          aria-label="Show all photos"
          onClick={dismiss}
        >
          <span>
            <GridDots size={18} />
          </span>
        </button>

        <div className={styles.title} id="lbTitle">
          {shown?.photo.category}
        </div>

        <div className={styles.headerRight}>
          <span className={styles.counter} id="lbCounter">
            {shown ? `${shown.index + 1} of ${photos.length}` : ''}
          </span>
          <button
            type="button"
            id="lbClose"
            className={styles.iconBtn}
            aria-label="Close"
            onClick={dismiss}
          >
            <span>
              <Close size={18} />
            </span>
          </button>
        </div>
      </header>

      <button
        type="button"
        id="lbPrev"
        className={`${styles.iconBtn} ${styles.nav} ${styles.prev}`}
        aria-label="Previous"
        onClick={prev}
        disabled={!canPrev}
      >
        <span>
          <ArrowLeft size={18} style={ARROW_STYLE} />
        </span>
      </button>

      <div className={styles.stage} id="lbStage">
        {shown && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={shown.photo.id}
            className={styles.image}
            src={shown.photo.src}
            alt={shown.photo.alt}
          />
        )}
      </div>

      <button
        type="button"
        id="lbNext"
        className={`${styles.iconBtn} ${styles.nav} ${styles.next}`}
        aria-label="Next"
        onClick={next}
        disabled={!canNext}
      >
        <span>
          <ArrowRight size={18} style={ARROW_STYLE} />
        </span>
      </button>

      <div className="srOnly" role="status" aria-live="polite">
        {open && shown ? `Photo ${shown.index + 1} of ${photos.length}, ${shown.photo.category}` : ''}
      </div>
    </div>
  );
}
