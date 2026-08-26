'use client';

import { useCallback, useRef, useState } from 'react';

import { AmenitiesModal, isUnavailable } from '@/components/AmenitiesModal';
import { amenityIcon } from '@/components/icons';
import type { AmenityGroup } from '@/lib/types';

import styles from './Amenities.module.css';

interface AmenitiesProps {
  /** The ten amenities shown on the page, in reference order. */
  preview: string[];
  /** Total across every group — the count in the trigger's label. */
  total: number;
  groups: AmenityGroup[];
}

/**
 * Client component because it owns the modal's open state and has to hand focus
 * back to the trigger when the modal closes.
 */
export function Amenities({ preview, total, groups }: AmenitiesProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Focus returns to the control that opened the modal, not the top of the page.
    trigger.current?.focus();
  }, []);

  return (
    <section id="amenities" className={styles.section}>
      <h2 className={styles.title}>What this place offers</h2>

      <div className={styles.grid}>
        {preview.map((label) => {
          const Icon = amenityIcon(label);
          const off = isUnavailable(label);
          return (
            <div
              key={label}
              className={off ? `${styles.row} ${styles.unavailable}` : styles.row}
            >
              <span className={styles.icon}>
                <Icon />
              </span>
              <span className={styles.label}>
                {label}
                {/* The strikethrough is the only visual cue; say it out loud too. */}
                {off && <span className="srOnly">, unavailable</span>}
              </span>
            </div>
          );
        })}
      </div>

      <button
        id="showAmen"
        ref={trigger}
        type="button"
        className={styles.showAll}
        onClick={() => setOpen(true)}
      >
        Show all {total} amenities
      </button>

      <AmenitiesModal groups={groups} open={open} onClose={close} />
    </section>
  );
}
