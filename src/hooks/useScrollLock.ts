'use client';

import { useEffect } from 'react';

let lockCount = 0;

/**
 * Freezes page scroll while an overlay is open.
 *
 * Refcounted, because the lightbox opens on top of the tour: the tour must not
 * release the lock when the lightbox above it closes.
 *
 * The scrollbar's width is replaced with padding so the page behind does not jump
 * sideways as it disappears.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    if (lockCount === 1) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.dataset.scrollLocked = 'true';
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        delete document.body.dataset.scrollLocked;
        document.body.style.paddingRight = '';
      }
    };
  }, [active]);
}
