#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

/**
 * Runs usage.
 *
 * @param {any} code Input value.
 * @returns {any} Function result.
 */
function usage(code) {
  console.log([
    'Usage:',
    '  node test/memory-report-to-csv.js <input.json> [output.csv]',
    '',
    'Example:',
    '  node test/memory-report-to-csv.js test/memory-serve-report.json test/memory-serve-report.csv',
  ].join('\n'));
  process.exit(code);
}

/**
 * Runs ensure parent dir.
 *
 * @param {any} filePath Input value.
 * @returns {any} Function result.
 */
function ensureParentDir(filePath) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), {recursive: true});
  return resolved;
}

/**
 * Runs to mi b.
 *
 * @param {any} bytes Input value.
 * @returns {any} Function result.
 */
function toMiB(bytes) {
  return bytes / (1024 * 1024);
}

/**
 * Runs run.
 *
 * @returns {any} Function result.
 */
function run() {
  const inputPath = process.argv[2];
  const outputPathArg = process.argv[3];

  if (!inputPath || inputPath === '--help' || inputPath === '-h') {
    usage(0);
  }

  const resolvedInput = path.resolve(inputPath);
  if (!fs.existsSync(resolvedInput)) {
    console.error(`[memory-report-to-csv] Input report not found: ${resolvedInput}`);
    process.exit(1);
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(resolvedInput, 'utf8'));
  } catch (error) {
    console.error(`[memory-report-to-csv] Failed to parse JSON: ${error.message}`);
    process.exit(1);
  }

  const samples = Array.isArray(report.samples) ? report.samples : [];
  if (samples.length === 0) {
    console.error('[memory-report-to-csv] Report has no samples array.');
    process.exit(1);
  }

  const defaultOutput = resolvedInput.replace(/\.json$/i, '.csv');
  const resolvedOutput = ensureParentDir(outputPathArg || defaultOutput);

  const lines = ['at_ms,rss_bytes,rss_mib,pid_count'];
  for (const sample of samples) {
    const atMs = Number(sample.atMs) || 0;
    const rssBytes = Number(sample.totalRssBytes) || 0;
    const rssMiB = toMiB(rssBytes).toFixed(4);
    const pidCount = Number(sample.pidCount) || 0;
    lines.push(`${atMs},${rssBytes},${rssMiB},${pidCount}`);
  }

  fs.writeFileSync(resolvedOutput, lines.join('\n') + '\n');
  console.log(`[memory-report-to-csv] Wrote CSV: ${resolvedOutput}`);
  console.log(`[memory-report-to-csv] Rows: ${samples.length}`);
}

run();
