import type { SleepingArrangement } from '@/lib/types';
import styles from './Sleeping.module.css';

/** One 318x212 room photo per sleeping arrangement, two to a row in the 652px column. */
export function Sleeping({ arrangements }: { arrangements: SleepingArrangement[] }) {
  return (
    <section className={styles.sleeping}>
      <h2 className={styles.title}>Where you&apos;ll sleep</h2>

      <div className={styles.grid}>
        {arrangements.map((arrangement) => (
          <div key={arrangement.name}>
            <img
              className={styles.photo}
              src={arrangement.image}
              alt={`Photo of the ${arrangement.name.toLowerCase()}`}
              width={318}
              height={212}
            />
            <div className={styles.name}>{arrangement.name}</div>
            <div className={styles.detail}>{arrangement.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
