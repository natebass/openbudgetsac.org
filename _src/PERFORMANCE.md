# Performance Audit and 3G Readiness

Date: April 11, 2026
Scope: Frontend load-path and runtime responsiveness without changing business logic.

## Issues Identified

1. The React compare bundle was built in Webpack development mode.
- Impact: significantly larger JavaScript payload and slower parse/execute time on slow mobile CPUs.
- Evidence: `_src/js/dist/compare.bundle.js` was `2,569,415` bytes before this change.

2. D3 was loaded globally in the base layout for every page.
- Impact: unnecessary JS download/parse cost on pages that do not render D3 charts.

3. Core legacy libraries were render-blocking in `<head>`.
- Impact: slower first paint and delayed interactivity on high-latency mobile connections.

4. Homepage and footer images did not use modern lazy/decode hints.
- Impact: unnecessary network contention on mobile during initial page load.

5. Local static test server did not use cache validators or gzip.
- Impact: repeated test/page loads transferred more bytes than necessary.

## Changes Implemented

1. Production bundling for compare app
- Updated Webpack config to use explicit mode via CLI and produce optimized output in production mode.
- Updated npm scripts:
  - `build` now uses `--mode production`.
  - `watch` now uses `--mode development`.

2. Reduced global JavaScript footprint
- Removed global D3 load from base layout.
- Added D3 only to chart pages (`flowScripts` and `treeScripts`) where it is required.

3. Improved critical rendering path
- Added `defer` to global jQuery/jQuery-migrate/Bootstrap scripts while preserving execution order.
- Added font preconnect + DNS prefetch hints.
- Moved Google Fonts stylesheet into `<head>` with `display=swap`.

4. Image loading optimizations
- Added `loading='lazy'` and `decoding='async'` for non-critical images.
- Kept the first homepage visualization image prioritized with `fetchpriority='high'`.

5. Better static-serving behavior for low-bandwidth environments
- Added ETag + conditional request handling (`304`).
- Added cache headers (revalidate for HTML, cache window for static assets).
- Added gzip compression for text-like responses when supported by the client.

6. Ongoing regression guard
- Added `npm run perf:report` and `test/perf-report.js` to enforce compare bundle size budgets.

## Measured Result

Compare bundle (`_src/js/dist/compare.bundle.js`):
- Before: `2,569,415` bytes (~2.45 MiB)
- After: `491,445` bytes (~480 KiB)
- Gzip: `159,906` bytes (~156 KiB)

This is an ~80.9% reduction in raw transfer size for the compare bundle.

## Verification Commands

Run from `_src/`:

- `npm run perf:report`
- `npm run bench`
- `npm run lint`
- `npm run test:unit`
- `npm run test:a11y`
- `npm run test:e2e:preflight`

## Remaining Risk / Follow-up (Optional)

1. Compare bundle is still above Webpack's default 244 KiB warning threshold.
- Optional next step: route-level or component-level code splitting for heavy compare subviews.

2. Some source images are still large for strict 3G targets.
- Optional next step: generate modern WebP/AVIF derivatives and serve responsive `srcset` variants.
