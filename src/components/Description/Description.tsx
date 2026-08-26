'use client';

import { useState } from 'react';

import { ChevronRightTiny } from '@/components/icons';
import styles from './Description.module.css';

interface DescriptionProps {
  text: string;
  translationNote: string;
}

/**
 * The listing blurb, clamped to the captured 6.2em until expanded. The full text
 * always ships in the markup — only the visible height is clamped — so assistive
 * tech and crawlers read all of it.
 */
export function Description({ text, translationNote }: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={styles.description}>
      <div className={styles.note}>
        <span>
          {translationNote}{' '}
          <a href="#">Show original</a>
        </span>
      </div>

      <p id="descText" className={expanded ? styles.body : `${styles.body} ${styles.clamped}`}>
        {text}
      </p>

      <button
        id="descMore"
        type="button"
        className={styles.more}
        aria-expanded={expanded}
        aria-controls="descText"
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? 'Show less' : 'Show more'}
        <span className={styles.chevron}>
          <ChevronRightTiny size={14} />
        </span>
      </button>
    </section>
  );
}
