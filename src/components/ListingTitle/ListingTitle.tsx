import { Heart, Share } from '@/components/icons';
import styles from './ListingTitle.module.css';

/**
 * The h1 and its Share / Save pair.
 *
 * Both buttons are inert in the reference too, so nothing here needs client
 * JavaScript. The ids match the capture, which the verify script keys off.
 */
export function ListingTitle({ title }: { title: string }) {
  return (
    <div className={styles.row}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <button type="button" id="shareBtn" className={styles.action}>
          <Share size={16} />
          <span className={styles.label}>Share</span>
        </button>

        <button type="button" id="saveBtn" className={styles.action}>
          <Heart size={16} />
          <span className={styles.label}>Save</span>
        </button>
      </div>
    </div>
  );
}
