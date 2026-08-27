# Airbnb listing page — pixel-perfect clone

**Live:** [airbnb-clone-dishita.vercel.app](https://airbnb-clone-dishita.vercel.app)

A reproduction of the Airbnb listing page at
[airbnb-clone-umber-two.vercel.app](https://airbnb-clone-umber-two.vercel.app) (the
reference), covering all three views — **Listing page**, **Photo tour**, and
**Lightbox** — matched to it visually and behaviourally. Desktop, 1512px.

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## How this was built

The reference was not read as source. It was **measured**.

Every element on all three views was captured over the Chrome DevTools Protocol into
`.reference/dump-*.json`: tag, attributes, text, box model, and every computed property
that differs from its initial value — 1313 elements for the listing page alone. Each
component was then built against those numbers, and re-measured against them afterwards.

None of the reference's markup, class names or CSS rules appear in this codebase. Its
class names are content hashes (`_KpcKWX`) and carry no meaning; everything here is
named for its role.

Full account of the workflow, including every prompt: **[`docs/PROMPTS.md`](docs/PROMPTS.md)**.

## Stack

| | | Why |
| --- | --- | --- |
| **Next.js 16** (App Router) | React 19.2 | Server Components keep the listing data out of the client bundle. |
| **TypeScript** | strict | The domain model is the contract seven parallel agents built against. |
| **CSS Modules** | no framework | The design is bespoke — `26px/30px`, `rgba(0,0,0,.08)`, `cubic-bezier(.2,0,0,1)`. Utility classes would have been noise around arbitrary values. |
| **No runtime dependencies** | — | No state library, no animation library, no UI kit. |

Data lives in `src/lib/listing.ts` behind `getListing()`, shaped the way a listings
service would return it, so swapping the module for a network call touches one function.

## Structure

```
src/
  app/
    layout.tsx            Font preload, metadata
    page.tsx              Composition root — fixes every component's props
    page.module.css       1280px container, 652 / 96 / 372 column split
  components/
    gallery/
      GalleryProvider.tsx State machine for both overlays + URL sync
      PhotoTour/          Full-screen categorised gallery
      Lightbox/           Single-photo viewer, stacks above the tour
    <Section>/            One folder each: .tsx + .module.css + index.ts
    icons.tsx             72 glyphs, generated — `npm run gen:icons`
  hooks/
    useFocusTrap.ts       Tab containment + Escape, per layer
    useScrollLock.ts      Refcounted, so stacked overlays nest correctly
  lib/
    types.ts  listing.ts  Domain model and content
  styles/
    tokens.css            Palette, type, easing, z-index scale
    globals.css           Reset, focus rules, reduced-motion
scripts/
  verify.mjs              Behavioural harness (Playwright)
  gen-icons.mjs           Regenerates the icon module
  render-architecture.mjs Renders the diagram to PNG + PDF
docs/
  architecture.{html,png,pdf}
  PROMPTS.md
```

## The three views

**Listing page.** Sticky booking column, a compact header that reveals once the hero
grid clears the viewport, scroll-spy nav, expandable description, two-month calendar,
review histogram, and a paged nearby-stays carousel.

**Photo tour.** Opens from "Show all photos" *or any hero image*. A category strip over
nine sections — 43 photos — each with its amenities beside the grid.

**Lightbox.** Opens from any tour photo, stacking above the tour rather than replacing
it. Its grid button returns to the tour; Escape unwinds one layer at a time.

## Behaviour parity

Behaviour was probed on the live reference and reproduced, not guessed:

- Hero image **and** "Show all photos" both open the tour.
- The lightbox stacks over the tour; the grid button returns there.
- **Escape unwinds one layer per press**: lightbox → tour → page.
- **Arrows clamp** at both ends — no wraparound. The end button is genuinely `disabled`.
- State mirrors to the URL (`?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000+i`) via
  `pushState`, so **Back closes one layer** and any photo is deep-linkable.
- Focus returns to the control that opened an overlay when it closes.
- Body scroll locks while an overlay is open, with scrollbar-width compensation so the
  page behind does not shift.

```bash
npm run verify       # drives the real page, PASS/FAIL per assertion
```

## Accessibility

- Every interactive element is a real `<button>` or `<a>` with an accessible name.
- Overlays are `role="dialog" aria-modal="true"`, focus-trapped, with the layer beneath
  marked `inert`. A closed overlay is fully out of the tab order.
- Photo changes are announced through a polite live region.
- Focus rings are keyboard-only (`:focus-visible`), never suppressed.
- Icon SVGs are `aria-hidden`; adjacent text carries the meaning. Headings step in order.
- `prefers-reduced-motion` neutralises every transition and smooth scroll.
- Skip link to `#main`.

## Verification

```bash
npm run typecheck    # tsc --noEmit          → clean
npm run lint         # eslint                → 0 errors
npm run verify       # behavioural harness   → 22/22
npm run measure      # geometry/style diff   → 150 checks, 0 unexplained
npm run build        # production build      → static, no errors
```

**`npm run verify`** drives the real page and asserts every behaviour listed above —
which control opens what, Escape unwinding one layer per press, arrow clamping, focus
trapping and restoration, scroll lock, URL state, Back, and deep links.

**`npm run measure`** re-measures the running clone over CDP and diffs it against
`.reference/dump-listing.json` — geometry plus font-size, weight, line-height, colour,
radius and gaps. It corrects for two capture artifacts before reporting, or every row
would be a false positive: the reference window had a classic 15px scrollbar (8px of
horizontal offset on the centred container), and it was captured at 1.5× DPI.

Current result: **150 checks within tolerance**, and one residual effect — the clone is
**6259px** tall against the reference's 6255px. That 4px is fully accounted for: the
page has 11 section dividers authored as `border-top: 1px`, and at 1.5× DPI Chrome
snapped each to 0.667px, so the capture records a page 11 × 0.333 = 3.67px shorter than
the same CSS renders at 1×. The clone renders the authored 1px. Matching the dump
exactly would mean shipping 0.667px borders, which would be wrong on any 1× display, so
it is deliberately left alone. Everything above the first divider matches to the pixel.

## Architecture diagram

**[`docs/architecture.png`](docs/architecture.png)** · [PDF](docs/architecture.pdf) ·
[source](docs/architecture.html)

A production-scale marketplace design covering the scaling strategy for frontend,
backend, storage, search and deployment — edge-cached RSC pages with tag-based
revalidation, a denormalised geo-sharded search index fed by CDC, a strongly-consistent
booking path with saga-orchestrated payment, and multi-region active-active reads with a
single writer per booking shard. Authored as HTML so it stays diffable; rendered with
`npm run diagram`.

## Notes

- **`.reference/`** holds the measurement capture. It is gitignored and excluded from the
  submission archive — it is data, not code.
- Images are local and pre-sized for their slots, so Next's image optimizer is disabled;
  in production they would sit behind an image CDN (see the diagram).
- The map in "Where you'll be" is the reference's own stylised panel, not a tile service.
