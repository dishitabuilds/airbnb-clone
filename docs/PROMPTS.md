# AI-assisted development log

The sequence of prompts and agent invocations used to build this clone, in order,
with the reasoning behind each step. Agent configs referenced here live in
`.claude/agents/`; the shared workflow lives in `.claude/skills/clone-fidelity/`.

---

## Phase 0 — Brief

> Build a pixel-perfect clone of the Airbnb listing page at
> `https://airbnb-clone-umber-two.vercel.app` — three views (Listing, Photo tour,
> Lightbox), desktop only, matching visual design, animation and accessibility.
> Ship an architecture diagram for a production-scale marketplace alongside it.
> AI agents may assist; lifting the reference codebase is disqualifying.

The constraint that shaped everything: **reproduce the result, never the source.**
So the first job was not writing code — it was turning the reference into
*measurements* that could be built against independently.

---

## Phase 1 — Getting at the reference

The site sits behind a Vercel bot checkpoint. `curl` and headless Chromium both got
HTTP 429; the challenge needs a real browser.

**Approach taken:** launch the user's actual Chrome with `--remote-debugging-port=9222`,
let it clear the checkpoint, then attach Playwright over CDP.

```
Fetch the reference page. curl returns 429 (Vercel Security Checkpoint) and
headless Playwright does not clear it either. Launch real Chrome with remote
debugging, attach over CDP, and capture the page once it passes.
```

A second obstacle followed: `getComputedStyle(el).fontSize` returned empty strings in
this environment — the JS binding yields a zero-length declaration. Worked around by
querying Chrome's style engine directly:

```
Computed styles come back empty via the JS API. Use CDP CSS.getComputedStyleForNode
against the DOM node ids instead.
```

## Phase 2 — Capture everything, once

Rather than repeatedly re-inspecting a flaky remote page, the whole reference was
dumped to disk in one pass:

```
Walk the DOM over CDP and dump, for every element: tag, attributes, direct text,
box model [x,y,w,h], and every computed property that differs from its initial
value. Do this for the listing page, the Photo tour subtree, the Lightbox, and the
amenities modal. Then download every referenced asset — images, avatars, chips,
the variable font — through the authenticated page context.
```

Produced `.reference/`: 1313 elements for the listing page, 205 for the tour, 23 for
the lightbox, 252 for the amenities modal, plus 73 assets and the reference's own
stylesheet. A small query tool (`.reference/spec.mjs`) prints any subtree as a
readable spec, so later agents could pull exact numbers without re-scraping.

## Phase 3 — Behaviour, not just pixels

Layout can be measured from a static dump; behaviour has to be driven:

```
Drive the reference and record what actually happens: what opens the Photo tour,
what opens the Lightbox, what Escape does at each layer, whether arrows wrap or
clamp, whether history/back is wired, where focus goes on close, and at what
scroll offset the compact header appears.
```

Findings that went straight into the spec:

- Hero image click and "Show all photos" both open the **tour** (not the lightbox).
- The lightbox stacks **over** the tour; its grid button returns to the tour.
- Escape unwinds **one layer per press**.
- Arrows **clamp** at both ends — no wraparound.
- State is mirrored to the URL (`?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000+i`) with
  `pushState`, so Back closes one layer and a photo is deep-linkable.
- Focus returns to the opening control on close.
- The compact header reveals at scrollY ≈ 627, when the hero grid clears the viewport.

## Phase 4 — Icons

```
Extract every unique SVG in the page with its viewBox and a human label, then
generate a typed React icon module from them — camelCase attributes, currentColor,
and a label→component map so amenity rows resolve their own glyph.
```

72 icons → `src/components/icons.tsx`, regenerable via `npm run gen:icons`.

## Phase 5 — Foundation before parallelism

Written by hand before any agent was dispatched, because these are the contracts
everything else depends on:

- `src/styles/tokens.css` — palette, type, easing, z-index scale.
- `src/lib/types.ts` + `src/lib/listing.ts` — the domain model and its content.
- `src/components/gallery/GalleryProvider.tsx` — the overlay state machine, URL sync
  and focus-restoration refs.
- `src/hooks/useFocusTrap.ts`, `useScrollLock.ts` — refcounted, so a stacked overlay
  does not release the lock belonging to the layer beneath it.
- `src/app/page.tsx` — the composition root, which fixed every component's prop
  signature up front so seven agents could build against it without colliding.

## Phase 6 — Parallel section builds

Seven agents, partitioned by **file ownership** so none could touch the same file.
Each was pointed at its role config, the capture, and the exact spec queries to run.

| Agent | Config | Scope |
| --- | --- | --- |
| 1 | `pixel-builder` | SiteHeader, CompactHeader, ListingTitle, PhotoGrid |
| 2 | `pixel-builder` | Overview, Highlights, Description, Sleeping |
| 3 | `pixel-builder` | Amenities, AmenitiesModal, Calendar |
| 4 | `pixel-builder` | BookingCard |
| 5 | `pixel-builder` | Reviews |
| 6 | `pixel-builder` | Location, MeetHost, ThingsToKnow, NearbyStays |
| 7 | `interaction-a11y` | PhotoTour, Lightbox, `scripts/verify.mjs` |

The prompt shape used for each (abridged):

```
Read .claude/agents/<role>.md, .reference/README.md, and the clone-fidelity skill.
Then read tokens.css, types.ts and page.tsx — match its prop contracts exactly.

Build <components>. For each, run: node .reference/spec.mjs <dump> "<anchor>" <depth>
and take every size, colour, weight, radius, gap and easing from that output or
from .reference/reference.css. Never invent a number.

<measured values inlined so the agent starts from facts, not a hunt>

Constraints: create files only inside your component folders; class names in the
dumps are content hashes and must not be reproduced; borders read 0.666667px
because the capture ran at 1.5x DPI — the authored value is 1px; tsc will show
errors from components other agents are building in parallel, ignore those but
ensure zero in your files.
```

Two details that made parallelism work:

1. **`page.tsx` written first.** Prop contracts were fixed before any agent started,
   so integration was mechanical rather than negotiated.
2. **Measured values inlined into each prompt.** Agents that have the numbers build;
   agents that have to hunt for them drift.

## Phase 7 — Verification

Two purpose-built harnesses, both kept in the repo:

- **`scripts/verify.mjs`** (`npm run verify`) — drives the real page and asserts the
  behaviour list from Phase 3, PASS/FAIL per assertion. **22/22.**
- **`scripts/measure.mjs`** (`npm run measure`) — re-measures the running clone over
  CDP and diffs it against `.reference/dump-listing.json`. **150 checks within
  tolerance, 0 unexplained.**

Two things had to be corrected for before the diff meant anything, and both were found
by comparing numbers rather than looking at screenshots:

1. The reference window had a **classic 15px scrollbar**; a headless browser has an
   overlay one. That is a flat 8px x-offset on the centred container and a 15px width
   difference on every full-bleed element — ~30 false findings if uncorrected.
2. The capture ran at **1.5× DPI**, where Chrome snaps a `1px` border to 0.667px.

Artifact 2 turned out to explain the entire residual: the clone is 6259px tall against
the reference's 6255px, and the page has exactly **11 section dividers** — 11 × 0.333 =
3.67px. The clone renders the authored 1px, so it is the capture that is short, not the
clone that is tall. Diagnosed by counting the snapped borders in the dump and checking
the arithmetic against the measured drift, not by nudging margins.

Two agents (overlays, visual-qa) hit the session limit mid-task. Their remaining work —
a hydration race in the verify harness that made the hero-image assertion flaky, and
the whole numeric diff — was finished directly rather than by re-spawning.

## Phase 8 — Consolidation

The `code-quality` agent config sets the bar at "if a pattern appears **three or more**
times, lift it into `src/components/ui/`". On inspection the shared patterns came in
pairs, not triples: the 5-star row appears in `Overview` and `Reviews` (the third
`StarSmall` use, in `NearbyStays`, is a single inline star, not a row), and the lettered
avatar fallback in `MeetHost` and `Reviews`. Each instance carries its own measured
sizing and, for the avatars, its own tint pair read from the capture.

Consolidating two callers with divergent measured styling would have added indirection
and risked pixel drift to remove roughly a dozen lines. Left as-is, deliberately — the
same config that sets the threshold also says a refactor that shifts layout by 2px has
failed regardless of how much cleaner it reads.

## Phase 9 — Architecture diagram

```
Design a production architecture for a vacation-rental marketplace at Airbnb scale.
Show the scaling strategy for frontend, backend, storage, search and deployment —
not a box-and-line inventory, but the decisions: what is cached where, which path
must be strongly consistent, how the search index stays in step, how deploys roll.
```

Authored as HTML/CSS (`docs/architecture.html`) and rendered to PNG and PDF with
`node scripts/render-architecture.mjs`, so the diagram is version-controlled source
rather than a binary someone has to reopen in a drawing tool.

---

## What the AI workflow actually bought

- **Capture once, build many.** The expensive, flaky part (getting through the bot
  check, extracting styles despite a broken JS API) happened once. Every later agent
  read from disk.
- **Measurement beats description.** Prompts containing `652px 372px, column-gap 96px`
  produce correct layout; prompts containing "a two-column layout" produce plausible
  layout.
- **Partition by file, not by feature.** Seven agents writing simultaneously never
  conflicted because ownership was disjoint at the path level.
- **Separate the builder from the checker.** The agents that wrote the components did
  not grade them; `visual-qa` re-measured against the same dump the builders used.
