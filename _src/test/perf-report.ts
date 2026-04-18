const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const bundlePath = path.resolve(
  __dirname,
  '../generated/js/dist/compare.bundle.js',
);
const rawBudgetBytes = Number(
  process.env.PERF_BUDGET_COMPARE_RAW || 500 * 1024,
);
const gzipBudgetBytes = Number(
  process.env.PERF_BUDGET_COMPARE_GZIP || 170 * 1024,
);

/**
 * Builds format bytes.
 *
 * @param {any} value Input value.
 * @returns {any} Function result.
 */
function formatBytes(value) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KiB`;
  }
  return `${(value / (1024 * 1024)).toFixed(2)} MiB`;
}

/**
 * Runs fail.
 *
 * @param {any} message Input value.
 * @returns {any} Function result.
 */
function fail(message) {
  console.error(`\n[perf] ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(bundlePath)) {
  fail(
    [`Bundle does not exist: ${bundlePath}`, 'Run `npm run build` first.'].join(
      '\n',
    ),
  );
}

const fileBuffer = fs.readFileSync(bundlePath);
const rawSize = fileBuffer.length;
const gzipSize = zlib.gzipSync(fileBuffer).length;

console.log('[perf] Compare bundle size report');
console.log(`[perf] file: ${bundlePath}`);
console.log(`[perf] raw:  ${formatBytes(rawSize)} (${rawSize} bytes)`);
console.log(`[perf] gzip: ${formatBytes(gzipSize)} (${gzipSize} bytes)`);
console.log(
  `[perf] budgets: raw <= ${formatBytes(rawBudgetBytes)}, gzip <= ${formatBytes(gzipBudgetBytes)}`,
);

if (rawSize > rawBudgetBytes || gzipSize > gzipBudgetBytes) {
  const exceeded = [];
  if (rawSize > rawBudgetBytes) {
    exceeded.push(
      `raw exceeds budget by ${formatBytes(rawSize - rawBudgetBytes)}`,
    );
  }
  if (gzipSize > gzipBudgetBytes) {
    exceeded.push(
      `gzip exceeds budget by ${formatBytes(gzipSize - gzipBudgetBytes)}`,
    );
  }

  fail(
    [
      'Bundle budget check failed.',
      `Result: ${exceeded.join('; ')}`,
      'Consider code-splitting and dependency trimming before merging.',
    ].join('\n'),
  );
}

console.log('[perf] Bundle budget check passed.');
