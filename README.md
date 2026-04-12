# Open Budget: Sacramento

> Open Budget: Sacramento transforms City budget data into clear, accessible, and civic-minded visualizations so residents can understand where money comes from, where it goes, and how it changes over time.

[![Website](https://img.shields.io/badge/site-openbudgetsac.org-0A66C2?logo=google-chrome&logoColor=white)](https://openbudgetsac.org/)
[![Node.js](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Eleventy](https://img.shields.io/badge/Eleventy-3.1.5-222222?logo=11ty&logoColor=white)](https://www.11ty.dev/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![Webpack](https://img.shields.io/badge/Webpack-5.105.4-8DD6F9?logo=webpack&logoColor=000)](https://webpack.js.org/)
[![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.txt)

## Table of Contents
<!-- vim-markdown-toc GFM -->

* [Background](#background)
* [Install](#install)
* [Usage](#usage)
* [Source Tree](#source-tree)
* [Total Features](#total-features)
* [Recent Feature Changes](#recent-feature-changes)
* [Tech Stack](#tech-stack)
* [List of Dependences](#list-of-dependences)
* [Outstanding Concerns / Issues / TODOs](#outstanding-concerns--issues--todos)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [License](#license)

<!-- vim-markdown-toc -->

## Background
Open Budget: Sacramento is a production civic-tech website for fiscal transparency. The project combines static pages, historical budget visualizations, and a modern React comparison workflow. It is maintained by community contributors affiliated with Open Sacramento.

Core goals:
- Make public budget data easier to understand.
- Support both high-level and detailed exploration.
- Keep the site lightweight, testable, and contributor-friendly.

## Install

### Prerequisites
- [Node.js 22.x](https://nodejs.org/) (matches Docker + CI)
- [npm](https://www.npmjs.com/)
- Optional: [Docker](https://www.docker.com/)
- Optional (data scripts): [Python 3](https://www.python.org/) + [pandas](https://pandas.pydata.org/)

### Local setup
```bash
# from repository root
cd _src
npm ci --include=dev
npm run build-css
npm run serve
```

Site will be available at `http://localhost:8011`.

### Docker setup
```bash
# from repository root
docker compose up --build
```

This launches only the website container at `http://localhost:8011`.

Optional Docker test targets:
```bash
# full Docker test target (lint + unit coverage + a11y + e2e)
docker compose --profile test build test

# parallel verification target
docker compose --profile test build test-parallel
```

## Usage
From `_src/`:

```bash
npm run serve                # eleventy dev server
npm run watch                # webpack watch for compare app
npm run build                # production compare bundle
npm run build-css            # compile Sass
npm run lint                 # standard + eslint
npm run test                 # lint + unit coverage + a11y + e2e
npm run test:e2e             # preflight + e2e against local server
npm run test:docker          # Docker-optimized full suite (coverage + a11y + e2e)
npm run perf:report          # compare bundle size budgets
npm run bench                # benchmark suite
```

For details on performance work and 3G-focused optimization history, see [`_src/PERFORMANCE.md`](_src/PERFORMANCE.md).

## CI/CD

- CI workflow (`.github/workflows/ci.yml`) validates:
  - npm checks (lint, unit coverage, a11y, perf, bench, Eleventy build)
  - E2E with a prebuilt frontend bundle via `npm run test:e2e:nobuild`
  - Docker targets:
    - `docker compose build site` (runtime/default website image)
    - `docker build --target test .` (full Docker-optimized test suite)
    - `docker build --target verify-parallel .` (parallel verification target)
- Deploy workflow (`.github/workflows/deploy.yml`) builds static files from `_src` and publishes to GitHub Pages.

## Source Tree
```text
openbudgetsac.org/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── _src/                         # primary development workspace
│   ├── __tests__/                # e2e tests
│   ├── bench/                    # benchmark harness
│   ├── css/                      # Sass + legacy vendor CSS assets
│   ├── data/                     # compare/flow/tree data + Python scripts
│   ├── images/                   # static images
│   ├── js/
│   │   ├── compare/              # React comparison app
│   │   ├── old/                  # legacy OpenSpending scripts
│   │   └── dist/                 # built bundles
│   ├── partials/                 # shared Pug partials/layouts
│   ├── templates/                # legacy template pages
│   ├── test/                     # test utilities (preflight, static server, perf)
│   ├── package.json
│   ├── jest.config.cjs
│   ├── webpack.config.js
│   └── PERFORMANCE.md
├── _treemap/                     # treemap data processing utilities
├── Dockerfile
├── docker-compose.yml
├── civic.json
└── LICENSE.txt
```

## Total Features

### Website and content features
- Public-facing civic information pages (`what-we-do`, `who-we-are`, `news`, `contact`, `discuss`, `feedback`, and guides).
- Budget process and visualization landing pages.
- Legacy/historical budget pages covering multiple fiscal cycles.

### Budget visualization features
- **Overview** flow visualization for single-year, source-to-use budget movement.
- **Detail** treemap/breakdown pages for department/fund/category drill-down.
- **Comparison** React app for side-by-side year comparisons.
- Historical visualization pages retained for continuity and archive value.

### Compare page features (`_src/js/compare/`)
- Dual budget-year selection with intelligent defaults.
- Change display modes: percentage and dollars.
- Breakdown tabs:
  - Spending by Department
  - Spending by Category
  - Revenue by Department
  - Revenue by Category
- Accessible chart/table rendering and runtime a11y checks in development.
- Constrained-mode behavior for small screens/low-bandwidth/low-memory devices.

### Performance and quality features
- Production-mode webpack builds for compare bundle.
- Automated bundle-size budget reporting (`npm run perf:report`).
- Linting via Standard + ESLint.
- Unit + accessibility tests via Jest.
- E2E verification via Puppeteer with Linux dependency preflight checks.
- Benchmarks via `bench-node`.
- CI pipeline for lint/test/build/perf/bench and Docker target validation.
- GitHub Pages deployment pipeline.

### Data tooling features
- Python CSV splitting utility for flow inputs.
- Python budget-asset generation for compare/tree datasets.
- Treemap data tooling under `_treemap/`.

## Tech Stack

### Core platform

| Tool | Version | Badge | Link |
| --- | --- | --- | --- |
| Node.js | `22.x` | ![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white) | https://nodejs.org/ |
| npm | bundled with Node 22 | ![npm](https://img.shields.io/badge/npm-package%20manager-CB3837?logo=npm&logoColor=white) | https://www.npmjs.com/ |
| Eleventy | `^3.1.5` | ![11ty](https://img.shields.io/badge/Eleventy-3.1.5-222222?logo=11ty&logoColor=white) | https://www.11ty.dev/ |
| Pug | `^3.0.4` | ![Pug](https://img.shields.io/badge/Pug-3.0.4-A86454?logo=pug&logoColor=white) | https://pugjs.org/ |
| Webpack | `^5.105.4` | ![Webpack](https://img.shields.io/badge/Webpack-5.105.4-8DD6F9?logo=webpack&logoColor=000) | https://webpack.js.org/ |
| Dart Sass | `^1.25.0` | ![Sass](https://img.shields.io/badge/Sass-1.25.0-CC6699?logo=sass&logoColor=white) | https://sass-lang.com/ |

### Frontend app + data libraries

| Library | Version | Badge | Link |
| --- | --- | --- | --- |
| React | `^19.2.4` | ![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=000) | https://react.dev/ |
| React DOM | `^19.2.4` | ![React](https://img.shields.io/badge/React%20DOM-19.2.4-61DAFB?logo=react&logoColor=000) | https://react.dev/ |
| Axios | `^1.14.0` | ![Axios](https://img.shields.io/badge/Axios-1.14.0-5A29E4?logo=axios&logoColor=white) | https://axios-http.com/ |
| Chart.js | `^4.5.1` | ![Chart.js](https://img.shields.io/badge/Chart.js-4.5.1-FF6384?logo=chartdotjs&logoColor=white) | https://www.chartjs.org/ |
| react-chartjs-2 | `^5.3.1` | ![Chart.js](https://img.shields.io/badge/react--chartjs--2-5.3.1-FF6384?logo=react&logoColor=white) | https://react-chartjs-2.js.org/ |
| react-bootstrap | `^2.10.10` | ![Bootstrap](https://img.shields.io/badge/React%20Bootstrap-2.10.10-7952B3?logo=bootstrap&logoColor=white) | https://react-bootstrap.github.io/ |
| react-select | `^5.10.2` | ![React Select](https://img.shields.io/badge/react--select-5.10.2-2684FF?logo=react&logoColor=white) | https://react-select.com/home |
| d3-array | `^3.2.4` | ![D3](https://img.shields.io/badge/D3-3.2.4-F9A03C?logo=d3.js&logoColor=white) | https://d3js.org/ |
| d3-collection | `^1.0.7` | ![D3](https://img.shields.io/badge/D3%20Collection-1.0.7-F9A03C?logo=d3.js&logoColor=white) | https://d3js.org/ |
| d3-color | `^3.1.0` | ![D3](https://img.shields.io/badge/D3%20Color-3.1.0-F9A03C?logo=d3.js&logoColor=white) | https://d3js.org/ |
| d3-format | `^3.1.2` | ![D3](https://img.shields.io/badge/D3%20Format-3.1.2-F9A03C?logo=d3.js&logoColor=white) | https://d3js.org/ |
| d3-interpolate | `^3.0.1` | ![D3](https://img.shields.io/badge/D3%20Interpolate-3.0.1-F9A03C?logo=d3.js&logoColor=white) | https://d3js.org/ |
| d3-scale-chromatic | `^3.1.0` | ![D3](https://img.shields.io/badge/D3%20Scale%20Chromatic-3.1.0-F9A03C?logo=d3.js&logoColor=white) | https://d3js.org/ |

### Testing, linting, CI tooling

| Tool | Version | Badge | Link |
| --- | --- | --- | --- |
| Jest | `^30.2.0` | ![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325?logo=jest&logoColor=white) | https://jestjs.io/ |
| Testing Library | `^16.3.0` | ![Testing Library](https://img.shields.io/badge/Testing%20Library-16.3.0-E33332?logo=testinglibrary&logoColor=white) | https://testing-library.com/ |
| jest-axe | `^10.0.0` | ![axe](https://img.shields.io/badge/jest--axe-10.0.0-5A0FC8) | https://github.com/nickcolley/jest-axe |
| Puppeteer | `^24.26.1` | ![Puppeteer](https://img.shields.io/badge/Puppeteer-24.26.1-40B5A4?logo=puppeteer&logoColor=white) | https://pptr.dev/ |
| ESLint | `^8.57.1` | ![ESLint](https://img.shields.io/badge/ESLint-8.57.1-4B32C3?logo=eslint&logoColor=white) | https://eslint.org/ |
| Standard JavaScript | `^17.1.2` | ![StandardJS](https://img.shields.io/badge/JavaScript%20Style-Standard-F3DF49?logo=javascript&logoColor=000) | https://standardjs.com/ |
| start-server-and-test | `^2.1.2` | ![start-server-and-test](https://img.shields.io/badge/start--server--and--test-2.1.2-00C853) | https://github.com/bahmutov/start-server-and-test |
| GitHub Actions | workflow | ![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white) | https://docs.github.com/actions |

## List of Dependences
All dependencies required for active development are listed below.

### JavaScript runtime dependencies (`_src/package.json`)
- `axios@^1.14.0`
- `chart.js@^4.5.1`
- `core-js@^3.49.0`
- `d3-array@^3.2.4`
- `d3-collection@^1.0.7`
- `d3-color@^3.1.0`
- `d3-format@^3.1.2`
- `d3-interpolate@^3.0.1`
- `d3-scale-chromatic@^3.1.0`
- `dart-sass@^1.25.0`
- `pug@^3.0.4`
- `react@^19.2.4`
- `react-bootstrap@^2.10.10`
- `react-chartjs-2@^5.3.1`
- `react-dom@^19.2.4`
- `react-select@^5.10.2`
- `react-spinkit@^3.0.0`

### JavaScript dev/test/build dependencies (`_src/package.json`)
- `@11ty/eleventy@^3.1.5`
- `@11ty/eleventy-plugin-pug@^1.0.0`
- `@axe-core/react@^4.11.1`
- `@babel/cli@^7.28.6`
- `@babel/core@^7.29.0`
- `@babel/preset-env@^7.29.2`
- `@babel/preset-react@^7.28.5`
- `@babel/register@^7.28.6`
- `@testing-library/jest-dom@^6.9.1`
- `@testing-library/react@^16.3.0`
- `babel-jest@^30.2.0`
- `babel-loader@^10.1.1`
- `bench-node@^0.14.0`
- `css-loader@^7.1.4`
- `eslint@^8.57.1`
- `eslint-plugin-jest@^28.13.5`
- `eslint-plugin-react@^7.37.5`
- `eslint-plugin-react-hooks@^7.0.0`
- `jest@^30.2.0`
- `jest-axe@^10.0.0`
- `jest-environment-jsdom@^30.2.0`
- `puppeteer@^24.26.1`
- `standard@^17.1.2`
- `start-server-and-test@^2.1.2`
- `style-loader@^4.0.0`
- `webpack@^5.105.4`
- `webpack-cli@^7.0.2`

### Python/data dependencies
- `_src/data/split_csv.py` and `_src/data/generate_budget_assets.py` require:
  - `pandas` (also listed in `_treemap/requirements.txt`)

### System dependencies (for Puppeteer E2E on Linux)
The E2E preflight checks and Docker test targets rely on shared libraries including:
- `libasound2`, `libatk1.0-0`, `libatk-bridge2.0-0`, `libcups2`, `libdbus-1-3`
- `libdrm2`, `libgbm1`, `libgtk-3-0`, `libnspr4`, `libnss3`
- `libpango-1.0-0`, `libx11-6`, `libx11-xcb1`, `libxcb1`, `libxext6`
- `libxcomposite1`, `libxdamage1`, `libxfixes3`, `libxkbcommon0`, `libxrandr2`, `libxss1`
- `ca-certificates`, `fonts-liberation`, `xdg-utils`

Authoritative locations:
- [`_src/test/e2e-preflight.js`](_src/test/e2e-preflight.js)
- [`Dockerfile`](Dockerfile)

## Outstanding Concerns / Issues / TODOs
No first-party `TODO`/`FIXME` markers are found in active codebase. However, the following items are known technical concerns to track:

| Concern | Context | Location |
| --- | --- | --- |
| E2E tests require Linux Chromium shared libraries | `npm run test:e2e` will fail on hosts missing required runtime libs until dependencies are installed. | [`_src/test/e2e-preflight.js`](_src/test/e2e-preflight.js) |
| Compare bundle remains above Webpack’s default warning threshold | Performance has improved significantly, but bundle size still exceeds 244 KiB default warning level. | [`_src/PERFORMANCE.md` lines 75-77](_src/PERFORMANCE.md) |
| Large source images still impact strict 3G targets | Optional optimization work remains for modern image formats and responsive variants. | [`_src/PERFORMANCE.md` lines 78-79](_src/PERFORMANCE.md) |
| Legacy OpenSpending/jQuery treemap path is still in production code | Historical widget path increases maintenance burden and modernization effort. | [`_src/js/old/treemap.js`](_src/js/old/treemap.js) |
| Historical page copy contains dated “pending” notices from 2016 | Content is factually historical, but appears stale/confusing if read as current status. | [`_src/2016-17-adjusted-budget-flow.jade:10`](_src/2016-17-adjusted-budget-flow.jade), [`_src/2016-17-adjusted-budget-tree.jade:10`](_src/2016-17-adjusted-budget-tree.jade) |

## Contributing
Contributions are welcome, but please consult with the Open Sacramento community first.

- For starter tasks, browse issues labeled `help wanted`.
- For larger architectural changes, open an issue and discuss approach first.
- Keep changes simple, focused, tested, and documented.

Typical workflow:
1. Fork the repository.
2. Create a feature branch.
3. Work in `_src/`.
4. Run lint/tests locally.
5. Open a pull request against `main`.

Useful commands from `_src/`:
```bash
npm run lint
npm run test:unit:coverage
npm run test:a11y
npm run test:e2e
npm run perf:report
```

## Maintainers
- [Open Sacramento](https://opensac.org/) (`hello@opensac.org`)

## License
[MIT](./LICENSE.txt)
