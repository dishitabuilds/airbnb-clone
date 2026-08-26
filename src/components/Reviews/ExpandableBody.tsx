'use client';

import { useId, useState } from 'react';

import styles from './Reviews.module.css';

/**
 * The one interactive part of a review card: a body clamped to four lines
 * (84px at 15px/1.4 in the capture) with a disclosure that expands it in place.
 * Kept as its own client component so the rest of the section stays on the server.
 */
export function ExpandableBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  return (
    <>
      <div
        id={bodyId}
        className={expanded ? styles.body : `${styles.body} ${styles.bodyClamped}`}
      >
        {body}
      </div>
      <button
        type="button"
        className={styles.showMore}
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </>
  );
}
