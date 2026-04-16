const {spawnSync} = require('node:child_process');
const fs = require('node:fs');

const PACKAGE_HINTS = {
  'libasound.so.2': 'libasound2',
  'libatk-1.0.so.0': 'libatk1.0-0',
  'libatk-bridge-2.0.so.0': 'libatk-bridge2.0-0',
  'libatspi.so.0': 'libatspi2.0-0',
  'libcairo.so.2': 'libcairo2',
  'libcups.so.2': 'libcups2',
  'libdbus-1.so.3': 'libdbus-1-3',
  'libdrm.so.2': 'libdrm2',
  'libgbm.so.1': 'libgbm1',
  'libgtk-3.so.0': 'libgtk-3-0',
  'libnspr4.so': 'libnspr4',
  'libnss3.so': 'libnss3',
  'libnssutil3.so': 'libnss3',
  'libsmime3.so': 'libnss3',
  'libpango-1.0.so.0': 'libpango-1.0-0',
  'libpangocairo-1.0.so.0': 'libpango-1.0-0',
  'libx11-xcb.so.1': 'libx11-xcb1',
  'libxcomposite.so.1': 'libxcomposite1',
  'libxdamage.so.1': 'libxdamage1',
  'libxfixes.so.3': 'libxfixes3',
  'libxkbcommon.so.0': 'libxkbcommon0',
  'libxrandr.so.2': 'libxrandr2',
};

/**
 * Runs fail.
 *
 * @param {any} message Input value.
 * @returns {any} Function result.
 */
function fail(message) {
  console.error(`\n[preflight:e2e] ${message}\n`);
  process.exit(1);
}

/**
 * Gets resolve chrome path.
 *
 * @returns {any} Function result.
 */
function resolveChromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (error) {
    fail(`Puppeteer is not available: ${error.message}`);
  }

  try {
    return puppeteer.executablePath();
  } catch (error) {
    fail([
      'Unable to resolve a Chromium executable for Puppeteer.',
      `Reason: ${error.message}`,
      'Run: npx puppeteer browsers install chrome',
    ].join('\n'));
  }
}

/**
 * Gets parse missing libraries.
 *
 * @param {any} lddOutput Input value.
 * @returns {any} Function result.
 */
function parseMissingLibraries(lddOutput) {
  return lddOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('=> not found'))
    .map((line) => line.split('=>')[0].trim());
}

/**
 * Builds build install hints.
 *
 * @param {any} missingLibraries Input value.
 * @returns {any} Function result.
 */
function buildInstallHints(missingLibraries) {
  const packages = [...new Set(missingLibraries.map((lib) => PACKAGE_HINTS[lib]).filter(Boolean))];

  if (packages.length === 0) {
    return 'Install the missing shared libraries listed above using your OS package manager.';
  }

  return [
    'Likely Debian/Ubuntu packages:',
    `  sudo apt-get update && sudo apt-get install -y ${packages.join(' ')}`,
  ].join('\n');
}

/**
 * Runs run.
 *
 * @returns {any} Function result.
 */
function run() {
  if (process.platform !== 'linux') {
    console.log(`[preflight:e2e] Skipping OS dependency check on ${process.platform}.`);
    return;
  }

  const chromePath = resolveChromePath();
  if (!chromePath || !fs.existsSync(chromePath)) {
    fail([
      'Chromium executable path does not exist.',
      `Resolved path: ${chromePath || '(empty)'}`,
      'Run: npx puppeteer browsers install chrome',
    ].join('\n'));
  }

  const result = spawnSync('ldd', [chromePath], {encoding: 'utf8'});

  if (result.error) {
    if (result.error.code === 'EPERM') {
      console.warn([
        '[preflight:e2e] Skipping Chromium dependency inspection because this environment does not allow ldd.',
        `[preflight:e2e] Chromium binary: ${chromePath}`,
      ].join('\n'));
      return;
    }
    fail(`Could not run ldd against Chromium binary (${chromePath}): ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail([
      `ldd failed with exit code ${result.status}.`,
      `stderr: ${result.stderr || '(none)'}`,
      `binary: ${chromePath}`,
    ].join('\n'));
  }

  const missingLibraries = parseMissingLibraries(result.stdout);

  if (missingLibraries.length > 0) {
    const missingList = missingLibraries.map((lib) => `  - ${lib}`).join('\n');

    fail([
      'Chromium system dependencies are missing. Puppeteer E2E tests will fail until these are installed.',
      `Chromium binary: ${chromePath}`,
      'Missing shared libraries:',
      missingList,
      buildInstallHints(missingLibraries),
    ].join('\n'));
  }

  console.log(`[preflight:e2e] Chromium dependency check passed (${chromePath}).`);
}

run();
