import type { ComponentType } from 'react';

import type { Listing, RatingBreakdown, Review } from '@/lib/types';
import {
  Accuracy,
  CheckInRating,
  Cleanliness,
  Communication,
  LocationRating,
  StarSmall,
  Value,
  type IconProps,
} from '@/components/icons';

import { ExpandableBody } from './ExpandableBody';
import styles from './Reviews.module.css';

/** `RatingBreakdown.icon` names an export of the generated icon set. */
const RATING_ICONS: Record<string, ComponentType<IconProps>> = {
  Cleanliness,
  Accuracy,
  CheckInRating,
  Communication,
  LocationRating,
  Value,
};

/** Histogram rows run 5 stars down to 1, matching `listing.ratingHistogram`. */
const HISTOGRAM_DIGITS = [5, 4, 3, 2, 1];

/** Every review in the capture shows a full five-star row. */
const STAR_COUNT = 5;

/**
 * Lettered avatars in the capture come in two tints: "A" is #c1852a on #f7ede2
 * and "V" is #8b6fc4 on #efeaf7. Keying off the initial keeps an author's
 * placeholder stable, and reproduces both measured pairs ('A' -> 1, 'V' -> 0).
 */
const PLACEHOLDER_TINTS = [
  { background: '#efeaf7', color: '#8b6fc4' },
  { background: '#f7ede2', color: '#c1852a' },
];

function tintFor(initial: string) {
  return PLACEHOLDER_TINTS[initial.charCodeAt(0) % PLACEHOLDER_TINTS.length];
}

function plural(count: number, unit: string) {
  return count === 1 ? `1 ${unit}` : `${count} ${unit}s`;
}

function CategoryCell({ item }: { item: RatingBreakdown }) {
  const Icon = RATING_ICONS[item.icon];

  return (
    <div className={styles.cell}>
      <div className={styles.cellLabel}>{item.label}</div>
      <div className={styles.categoryValue}>{item.value.toFixed(1)}</div>
      <div className={styles.categoryIcon}>{Icon ? <Icon size={32} /> : null}</div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initial = review.author.charAt(0).toUpperCase();

  return (
    <article>
      <div className={styles.reviewHead}>
        {review.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className={styles.avatar} src={review.avatar} alt="" width={42} height={42} />
        ) : (
          <div className={styles.avatarFallback} style={tintFor(initial)} aria-hidden="true">
            {initial}
          </div>
        )}
        <div>
          <div className={styles.author}>{review.author}</div>
          <div className={styles.tenure}>{review.tenure}</div>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.stars} aria-hidden="true">
          {Array.from({ length: STAR_COUNT }, (_, i) => (
            <StarSmall key={i} className={styles.star} size={10} />
          ))}
        </span>
        <span className="srOnly">{`Rated ${STAR_COUNT} out of 5.`}</span>
        <span aria-hidden="true">·</span>
        <span>{review.date}</span>
      </div>

      {review.clamped ? (
        <ExpandableBody body={review.body} />
      ) : (
        <div className={styles.body}>{review.body}</div>
      )}
    </article>
  );
}

export function Reviews({ listing }: { listing: Listing }) {
  const histogramSummary = listing.ratingHistogram
    .map((share, i) => `${share}% of reviews are ${plural(HISTOGRAM_DIGITS[i], 'star')}.`)
    .join(' ');

  return (
    <section id="reviews" className={styles.section} aria-label="Reviews">
      <div className={styles.hero}>
        <div className={styles.laurels}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.laurel} src="/assets/images/ui/laurel-left.png" alt="" />
          <div className={styles.heroRating}>
            <span aria-hidden="true">{listing.rating}</span>
            <span className="srOnly">{`Rated ${listing.rating} out of 5.`}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.laurel} src="/assets/images/ui/laurel-right.png" alt="" />
        </div>

        <h2 className={styles.heroTitle}>Guest favourite</h2>
        <div className={styles.heroBlurb}>
          This home is a guest favourite based on ratings, reviews and reliability
        </div>
        <button type="button" className={styles.howReviewsWork}>
          How reviews work
        </button>
      </div>

      <div className={styles.breakdown}>
        <div className={styles.cell}>
          <div className={styles.cellLabel}>Overall rating</div>
          <p className="srOnly">{histogramSummary}</p>
          <div className={styles.bars} aria-hidden="true">
            {HISTOGRAM_DIGITS.map((digit, i) => (
              <div key={digit} className={styles.barRow}>
                <span className={styles.barDigit}>{digit}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${listing.ratingHistogram[i]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {listing.ratingBreakdown.map((item) => (
          <CategoryCell key={item.label} item={item} />
        ))}
      </div>

      <div className={styles.tags}>
        {listing.reviewTags.map((tag) => (
          <button key={tag.label} type="button" className={styles.tag}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.tagImage} src={tag.image} alt="" aria-hidden="true" />
            <span>{tag.label}</span>
            <span className={styles.tagCount}>{tag.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.reviewGrid}>
        {listing.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <button type="button" className={styles.showAll}>
        {`Show all ${listing.reviewCount} reviews`}
      </button>
    </section>
  );
}
