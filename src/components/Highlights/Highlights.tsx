import type { ComponentType } from 'react';

import type { Highlight } from '@/lib/types';
import * as icons from '@/components/icons';
import type { IconProps } from '@/components/icons';
import styles from './Highlights.module.css';

/**
 * `Highlight.icon` names an export of `icons.tsx` ("OutdoorEntertainment", …),
 * so the glyph is looked up rather than switched on.
 */
function resolveIcon(name: string): ComponentType<IconProps> | null {
  const glyph = (icons as Record<string, unknown>)[name];
  return typeof glyph === 'function' ? (glyph as ComponentType<IconProps>) : null;
}

/** Three icon + title + body rows between the host row and the description. */
export function Highlights({ highlights }: { highlights: Highlight[] }) {
  return (
    <section className={styles.highlights}>
      {highlights.map((highlight) => {
        const Icon = resolveIcon(highlight.icon);

        return (
          <div className={styles.row} key={highlight.title}>
            <span className={styles.icon}>{Icon ? <Icon /> : null}</span>
            <div>
              <div className={styles.title}>{highlight.title}</div>
              <div className={styles.body}>{highlight.body}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
