import type { ComponentType } from 'react';

import type { ThingsToKnowSection } from '@/lib/types';
import type { IconProps } from '@/components/icons';
import { CheckInRating, MessageHost, Shield } from '@/components/icons';
import styles from './ThingsToKnow.module.css';

/**
 * The capture heads each column with a glyph, but `ThingsToKnowSection` carries
 * no icon field, so the column title selects it. Names come from `icons.tsx`,
 * which is generated from the glyph's first appearance in the capture rather
 * than from what it draws: `MessageHost` is the calendar-and-cross mark and
 * `CheckInRating` the clock-in-a-speech-bubble.
 */
const COLUMN_ICONS: Record<string, ComponentType<IconProps>> = {
  'Cancellation policy': MessageHost,
  'House rules': CheckInRating,
  'Safety & property': Shield,
};

/** "Things to know" — three equal columns across the 1120px content width. */
export function ThingsToKnow({ sections }: { sections: ThingsToKnowSection[] }) {
  return (
    <section className={styles.thingsToKnow}>
      <h2 className={styles.title}>Things to know</h2>

      <div className={styles.grid}>
        {sections.map((section) => {
          const Icon = COLUMN_ICONS[section.title];

          return (
            <div key={section.title}>
              {Icon ? <Icon size={24} className={styles.icon} /> : null}
              <h3 className={styles.columnTitle}>{section.title}</h3>

              {section.lines.map((line) => (
                <p className={styles.line} key={line}>
                  {line}
                </p>
              ))}

              {/*
                All three links read "Learn more"; the label names its column so
                each one is distinguishable out of context.
              */}
              <a
                className={styles.link}
                href="#"
                aria-label={`${section.linkLabel} about ${section.title}`}
              >
                {section.linkLabel}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
