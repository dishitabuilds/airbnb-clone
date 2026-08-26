/**
 * Domain model for a listing page.
 *
 * Shaped the way a listings service would return it, so `getListing()` can be
 * swapped from a local module to a network call without touching components.
 */

export interface Photo {
  /** Stable id, also used as the lightbox deep-link key. */
  id: string;
  src: string;
  alt: string;
  /** Category this photo belongs to, e.g. "Bedroom". */
  category: string;
}

export interface PhotoCategory {
  id: string;
  name: string;
  /** Thumbnail shown in the photo-tour category strip. */
  thumb: string;
  /** Amenities listed beside the category heading in the tour. */
  amenities: string[];
  photos: Photo[];
}

export interface Highlight {
  icon: string;
  title: string;
  body: string;
}

export interface SleepingArrangement {
  /** Room photo — the reference shows a 318×212 image, not an icon. */
  image: string;
  name: string;
  detail: string;
}

export interface AmenityGroup {
  name: string;
  items: string[];
}

export interface RatingBreakdown {
  label: string;
  value: number;
  icon: string;
}

export interface ReviewTag {
  label: string;
  count: number;
  image: string;
}

export interface Review {
  id: string;
  author: string;
  /** Avatar path, or null when the reference shows a lettered placeholder. */
  avatar: string | null;
  tenure: string;
  date: string;
  body: string;
  /** Reviews longer than the clamp get a "Show more" control. */
  clamped: boolean;
}

export interface CoHost {
  name: string;
  avatar: string | null;
}

export interface Host {
  name: string;
  avatar: string;
  role: string;
  reviews: number;
  rating: number;
  yearsHosting: number;
  facts: { icon: string; text: string }[];
  coHosts: CoHost[];
  responseRate: string;
  responseTime: string;
}

export interface ThingsToKnowSection {
  title: string;
  lines: string[];
  linkLabel: string;
}

export interface NearbyStay {
  id: string;
  image: string;
  title: string;
  price: string;
  rating: string;
}

export interface Stay {
  /** Nightly total for the selected range, pre-formatted for display. */
  total: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  checkInISO: string;
  checkOutISO: string;
  guests: string;
  freeCancellationBefore: string;
}

export interface Listing {
  id: string;
  title: string;
  documentTitle: string;
  subtitle: string;
  location: string;
  capacity: string;
  rating: number;
  reviewCount: number;
  isGuestFavourite: boolean;
  guestFavouriteBlurb: string;
  photos: Photo[];
  categories: PhotoCategory[];
  highlights: Highlight[];
  description: string;
  translationNote: string;
  sleeping: SleepingArrangement[];
  amenityPreview: string[];
  amenityTotal: number;
  amenityGroups: AmenityGroup[];
  ratingBreakdown: RatingBreakdown[];
  ratingHistogram: number[];
  reviewTags: ReviewTag[];
  reviews: Review[];
  host: Host;
  neighbourhood: { title: string; body: string };
  thingsToKnow: ThingsToKnowSection[];
  nearby: NearbyStay[];
  stay: Stay;
  promo: { text: string; linkLabel: string; cta: string };
}
