# _src Workspace Guide

This directory contains the active website source code, build scripts, and test harnesses.

## Quick Start

```bash
npm ci --include=dev
npm run build-css
npm run serve
```

The local site runs at `http://localhost:8011`.

## Build Pipeline

- `npm run build:legacy` compiles legacy TypeScript browser assets into `generated/js` and strips CommonJS prologue lines that break non-module script execution.
- `npm run build:compare` builds the React comparison bundle.
- `npm run build:assets` runs both build steps.
- `npm run site:build` renders static pages into `../build`.

## Runtime Assets

- `generated/js/` holds first-party compiled browser scripts.
- `vendor/` stores pinned browser runtime dependencies used by legacy pages.
- `.eleventy.ts` copies these assets into `build/js` during site generation.

## Test Commands

- `npm run test:unit`
- `npm run test:a11y`
- `npm run test:e2e`
- `npm run test` (full suite)

## Documentation

- `npm run docs:jsdoc:check` validates JSDoc coverage in active first-party TS/JS files.
- `npm run docs:jsdoc` regenerates Markdown docs under `docs/jsdoc`.
