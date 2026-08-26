import styles from './page.module.css';
import { getListing, heroPhotos, photos } from '@/lib/listing';

import { GalleryProvider } from '@/components/gallery/GalleryProvider';
import { PhotoTour } from '@/components/gallery/PhotoTour';
import { Lightbox } from '@/components/gallery/Lightbox';

import { SiteHeader } from '@/components/SiteHeader';
import { CompactHeader } from '@/components/CompactHeader';
import { ListingTitle } from '@/components/ListingTitle';
import { PhotoGrid } from '@/components/PhotoGrid';
import { Overview } from '@/components/Overview';
import { Highlights } from '@/components/Highlights';
import { Description } from '@/components/Description';
import { Sleeping } from '@/components/Sleeping';
import { Amenities } from '@/components/Amenities';
import { Calendar } from '@/components/Calendar';
import { BookingCard } from '@/components/BookingCard';
import { Reviews } from '@/components/Reviews';
import { Location } from '@/components/Location';
import { MeetHost } from '@/components/MeetHost';
import { ThingsToKnow } from '@/components/ThingsToKnow';
import { NearbyStays } from '@/components/NearbyStays';

export default function ListingPage() {
  const listing = getListing();

  return (
    <GalleryProvider photos={photos}>
      <a href="#main" className="skipLink">
        Skip to content
      </a>

      <SiteHeader />
      <CompactHeader listing={listing} />

      <main id="main">
        <div className={styles.container}>
          <ListingTitle title={listing.title} />

          <PhotoGrid photos={heroPhotos} title={listing.title} />

          <div className={styles.columns}>
            <div className={styles.left} id="contentLeft">
              <Overview listing={listing} />
              <Highlights highlights={listing.highlights} />
              <Description
                text={listing.description}
                translationNote={listing.translationNote}
              />
              <Sleeping arrangements={listing.sleeping} />
              <Amenities
                preview={listing.amenityPreview}
                total={listing.amenityTotal}
                groups={listing.amenityGroups}
              />
              <Calendar stay={listing.stay} location="Candolim" />
            </div>

            <aside className={styles.aside} aria-label="Booking">
              <BookingCard listing={listing} />
            </aside>
          </div>

          <div className={styles.wide}>
            <Reviews listing={listing} />
            <Location listing={listing} />
            <MeetHost host={listing.host} />
            <ThingsToKnow sections={listing.thingsToKnow} />
            <NearbyStays stays={listing.nearby} />
          </div>
        </div>
      </main>

      <PhotoTour listing={listing} />
      <Lightbox />
    </GalleryProvider>
  );
}
