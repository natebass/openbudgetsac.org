# Performance Summary

Last synced: April 14, 2026

Detailed performance analysis is maintained in [`_src/PERFORMANCE.md`](_src/PERFORMANCE.md). This file tracks the repository-level guardrails and CI/CD enforcement points.

## Current Guardrails
- Compare bundle budgets are enforced by `_src/test/perf-report.js` via `npm run perf:report` (raw + gzip thresholds).
- Webpack performance hints are disabled in `_src/webpack.config.js` for cleaner local/E2E test output; `npm run perf:report` is the source of truth for bundle-size enforcement.
- E2E reliability is protected by `_src/test/e2e-preflight.js` (Linux Chromium dependency checks before test launch).
- Active first-party JavaScript/JSX JSDoc coverage is enforced by `_src/scripts/add-missing-jsdoc.mjs` via `npm run docs:jsdoc:check`.
- Memory regression tooling is available through:
  - `npm run probe:memory`
  - `npm run probe:memory:watch`
  - `npm run probe:memory:csv`
  - `npm run probe:memory:watch:csv`

## CI/CD Enforcement
- CI (`.github/workflows/ci.yml`) runs lint, unit coverage (CI), i18n smoke, a11y, perf report, benchmarks, JSDoc coverage checks, JSDoc generation, Eleventy build checks, built-site i18n sanity checks, and Puppeteer E2E.
- CI now installs Chromium explicitly for E2E jobs (`npx puppeteer browsers install chrome`) after shared-library setup.
- Non-E2E workflow installs disable browser download (`PUPPETEER_SKIP_DOWNLOAD=true npm ci --include=dev`) to keep build times and network usage lower.
- Docker `test` and `verify-parallel` targets mirror the same Puppeteer dependency model and test gates.
