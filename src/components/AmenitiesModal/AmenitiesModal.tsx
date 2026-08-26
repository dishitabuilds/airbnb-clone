'use client';

import { useRef, type MouseEvent } from 'react';

import { Close, amenityIcon } from '@/components/icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { AmenityGroup } from '@/lib/types';

import styles from './AmenitiesModal.module.css';

/**
 * Amenities the reference draws greyed out and struck through, both in the page
 * preview and in the "Home safety" group inside this dialog.
 */
const UNAVAILABLE = new Set(['Carbon monoxide alarm', 'Smoke alarm']);

export function isUnavailable(label: string): boolean {
  return UNAVAILABLE.has(label);
}

interface AmenitiesModalProps {
  groups: AmenityGroup[];
  open: boolean;
  /** Also responsible for returning focus to whatever opened the dialog. */
  onClose: () => void;
}

export function AmenitiesModal({ groups, open, onClose }: AmenitiesModalProps) {
  const panel = useRef<HTMLDivElement>(null);

  useFocusTrap(panel, open, onClose);
  useScrollLock(open);

  /*
   * Dismissing on the backdrop is a pointer affordance only — the close button and
   * Escape cover every other input, so nothing here is keyboard-unreachable.
   * Comparing target to currentTarget keeps clicks inside the panel from closing it.
   */
  const onBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      id="amenModal"
      className={open ? `${styles.backdrop} ${styles.open}` : styles.backdrop}
      onClick={onBackdropClick}
      aria-hidden={open ? undefined : true}
    >
      <div
        ref={panel}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="What this place offers"
      >
        <div className={styles.header}>
          <button
            id="amenClose"
            type="button"
            className={styles.close}
            aria-label="Close"
            onClick={onClose}
          >
            <span className={styles.closeIcon}>
              <Close size={18} />
            </span>
          </button>
        </div>

        <div id="amenBody" className={styles.body}>
          <h2 className={styles.title}>What this place offers</h2>

          {groups.map((group) => (
            <div key={group.name} className={styles.group}>
              <h3 className={styles.groupName}>{group.name}</h3>
              {group.items.map((label) => {
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
                      {off && <span className="srOnly">, unavailable</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
