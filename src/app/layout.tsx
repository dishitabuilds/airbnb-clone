import type { Metadata } from 'next';
import '@/styles/globals.css';
import { listing } from '@/lib/listing';

export const metadata: Metadata = {
  title: listing.documentTitle,
  description: listing.description.slice(0, 160),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The variable font carries every weight on the page; without it the type
            ramp collapses to a fallback, so it is worth blocking on. */}
        <link
          rel="preload"
          href="/assets/fonts/AirbnbCerealVF.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
