---
name: clone-fidelity
description: The measure-build-diff loop used to reproduce the reference page exactly. Use when building or correcting any part of the clone, when a section "looks close but not right", or when deciding whether a visual difference is real.
---

# Clone fidelity

A pixel-perfect clone is not a drawing exercise. Every value in this codebase should
be traceable to a measurement. The loop is: **measure, build, diff, repeat.**

## 1. Measure

The reference was captured once, in full, into `.reference/`. Read
`.reference/README.md` for the format, then query the slice you need:

```bash
node .reference/spec.mjs listing "What this place offers" 6
node .reference/spec.mjs tour tourNav
node .reference/spec.mjs lightbox
```

Prefer `.reference/reference.css` when you want the *authored* value rather than the
resolved one — it shows intent (`gap: 24px`) where computed style shows outcome.

Two capture artefacts to keep in mind:

- Borders read `0.666667px` and outlines `2.66667px`. The capture ran at 1.5× device
  scale and the browser snapped them to whole device pixels. Authored values are `1px`
  and `4px`.
- Class names in the dumps are content hashes. They mean nothing. Never carry one into
  source.

## 2. Build

Work from the numbers, not the screenshot. Screenshots are for catching mistakes you
did not know to look for; they are not a source of measurements.

Match in this order, because errors compound downward:

1. **Box** — width, height, padding, margin, gap.
2. **Type** — family, size, weight, line-height, colour.
3. **Surface** — background, border, radius, shadow.
4. **Motion** — duration, easing, what property actually animates.

The reference uses one easing almost everywhere: `cubic-bezier(.2, 0, 0, 1)`, exposed
as `var(--ease)`. Durations cluster at `.15s` for hover feedback, `.2-.25s` for
in-page state, `.3s` for overlays.

## 3. Diff

Run the clone and the capture side by side rather than trusting your eye:

```bash
npm run dev
node scripts/verify.mjs           # geometry + style diff against .reference
node scripts/verify.mjs --a11y    # keyboard, focus, roles
```

The whole page is **6255px** tall at a 1512px viewport. That number is a fast smoke
test — if it has drifted by more than a few pixels, a section is structurally wrong,
and no amount of local nudging will fix it.

## Judging a difference

- **≤1px geometry**: a match. Sub-pixel layout differs between engines and chasing it
  wastes time.
- **Any colour, weight, size or radius difference**: real. Fix it.
- **A difference you cannot explain**: find the cause before adjusting. A number nudged
  until it looks right will break at the next viewport or when content changes. If a
  gap is off by 4px, the answer is usually a wrong `line-height` or a collapsed margin
  above it, not a `margin-top: -4px`.

## What not to do

- Do not copy the reference's markup or CSS rules. Its class names are hashed and its
  structure is its own; reproduce the *result*, in your own components.
- Do not add a wrapper `<div>` purely to make a number work. If the box model needs a
  wrapper the reference does not have, you have modelled the layout wrong.
- Do not leave a magic number uncommented. If a value came from measurement and is not
  obvious, say where it came from.
