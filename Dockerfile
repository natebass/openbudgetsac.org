FROM node:22-bookworm AS base

WORKDIR /app

COPY _src/package*.json ./

# Avoid downloading Puppeteer's browser in the shared base layer.
# `docker compose up` builds the runtime target only and doesn't need Chromium.
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci --include=dev --force

COPY _src .

FROM base AS chromium-deps

# Chromium runtime dependencies for Puppeteer e2e tests.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxext6 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

RUN PUPPETEER_SKIP_DOWNLOAD=false npx puppeteer browsers install chrome

FROM chromium-deps AS test

RUN npm run docs:jsdoc && npm run build && npm run test:docker

FROM chromium-deps AS verify-parallel

RUN npm run docs:jsdoc && npm run build && npm run verify:all:parallel

FROM base AS runtime

RUN npm run build

EXPOSE 8011

CMD ["npx", "@11ty/eleventy", "--serve", "--port=8011"]
