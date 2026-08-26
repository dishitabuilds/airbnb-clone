'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { Photo } from '@/lib/types';

/**
 * Overlay state for the photo experience.
 *
 * Two layers stack: the Photo tour, and the Lightbox on top of it. The tour stays
 * mounted underneath the lightbox, so closing the lightbox reveals it again rather
 * than returning to the page.
 *
 * The URL is the single source of truth — there is no mirrored React state to drift
 * out of sync with it. Every layer is a history entry, so Back closes the lightbox,
 * Back again closes the tour, and a link carrying
 * `?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1003` opens straight to a photo.
 */

const MODAL_PARAM = 'modal';
const ITEM_PARAM = 'modalItem';
const TOUR_VALUE = 'PHOTO_TOUR_SCROLLABLE';
/** Photo indices are offset in the URL so `modalItem` is never a bare 0. */
const ITEM_OFFSET = 1000;

/** Fired after our own pushState/replaceState, which do not emit popstate. */
const NAV_EVENT = 'gallery:navigate';

interface GalleryState {
  tourOpen: boolean;
  /** Index into `photos`, or null when the lightbox is closed. */
  lightboxIndex: number | null;
}

interface GalleryContextValue extends GalleryState {
  photos: Photo[];
  activePhoto: Photo | null;
  openTour: () => void;
  closeTour: () => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  next: () => void;
  prev: () => void;
  canPrev: boolean;
  canNext: boolean;
  /** True while any overlay owns the screen. */
  anyOpen: boolean;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
}

/** A plain string snapshot, so `useSyncExternalStore` can compare it by value. */
const getSearch = () => window.location.search;
const getServerSearch = () => '';

function parse(search: string, count: number): GalleryState {
  const params = new URLSearchParams(search);
  const tourOpen = params.get(MODAL_PARAM) === TOUR_VALUE;
  const raw = params.get(ITEM_PARAM);
  let lightboxIndex: number | null = null;
  if (tourOpen && raw !== null) {
    const parsed = Number(raw) - ITEM_OFFSET;
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < count) lightboxIndex = parsed;
  }
  return { tourOpen, lightboxIndex };
}

function serialise(state: GalleryState): string {
  const params = new URLSearchParams(window.location.search);
  params.delete(MODAL_PARAM);
  params.delete(ITEM_PARAM);
  if (state.tourOpen) {
    params.set(MODAL_PARAM, TOUR_VALUE);
    if (state.lightboxIndex !== null) {
      params.set(ITEM_PARAM, String(state.lightboxIndex + ITEM_OFFSET));
    }
  }
  const qs = params.toString();
  return `${window.location.pathname}${qs ? `?${qs}` : ''}`;
}

function navigate(state: GalleryState, mode: 'push' | 'replace') {
  const url = serialise(state);
  if (mode === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
  window.dispatchEvent(new Event(NAV_EVENT));
}

export function GalleryProvider({
  photos,
  children,
}: {
  photos: Photo[];
  children: React.ReactNode;
}) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const state = useMemo(() => parse(search, photos.length), [search, photos.length]);

  /**
   * Where focus should return when a layer closes. Captured at open time, because by
   * close time the trigger is no longer the active element.
   */
  const tourTrigger = useRef<HTMLElement | null>(null);
  const lightboxTrigger = useRef<HTMLElement | null>(null);

  const openTour = useCallback(() => {
    tourTrigger.current = document.activeElement as HTMLElement | null;
    navigate({ tourOpen: true, lightboxIndex: null }, 'push');
  }, []);

  const closeTour = useCallback(() => {
    navigate({ tourOpen: false, lightboxIndex: null }, 'push');
    tourTrigger.current?.focus();
    tourTrigger.current = null;
  }, []);

  const openLightbox = useCallback((index: number) => {
    lightboxTrigger.current = document.activeElement as HTMLElement | null;
    navigate({ tourOpen: true, lightboxIndex: index }, 'push');
  }, []);

  const closeLightbox = useCallback(() => {
    navigate({ tourOpen: true, lightboxIndex: null }, 'push');
    lightboxTrigger.current?.focus();
    lightboxTrigger.current = null;
  }, []);

  /**
   * Stepping between photos replaces rather than pushes: a run of arrow presses
   * should not bury the page under 40 history entries.
   */
  const step = useCallback(
    (delta: number) => {
      const current = parse(window.location.search, photos.length);
      if (current.lightboxIndex === null) return;
      const target = current.lightboxIndex + delta;
      if (target < 0 || target >= photos.length) return; // clamp, no wrap
      navigate({ ...current, lightboxIndex: target }, 'replace');
    },
    [photos.length],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const value = useMemo<GalleryContextValue>(() => {
    const i = state.lightboxIndex;
    return {
      ...state,
      photos,
      activePhoto: i === null ? null : photos[i],
      openTour,
      closeTour,
      openLightbox,
      closeLightbox,
      next,
      prev,
      canPrev: i !== null && i > 0,
      canNext: i !== null && i < photos.length - 1,
      anyOpen: state.tourOpen,
    };
  }, [state, photos, openTour, closeTour, openLightbox, closeLightbox, next, prev]);

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery must be used inside <GalleryProvider>');
  return ctx;
}
