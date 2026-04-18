#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_DURATION_MS = 180000;

/**
 * Gets parse number option.
 *
 * @param {any} value Input value.
 * @param {any} fallback Input value.
 * @returns {any} Function result.
 */
function parseNumberOption(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/**
 * Gets parse args.
 *
 * @param {any} argv Input value.
 * @returns {any} Function result.
 */
function parseArgs(argv) {
  const options = {
    intervalMs: DEFAULT_INTERVAL_MS,
    durationMs: DEFAULT_DURATION_MS,
    outPath: null,
    commandTokens: null,
  };

  const sepIndex = argv.indexOf('--');
  const metaArgs = sepIndex >= 0 ? argv.slice(0, sepIndex) : argv;
  const commandArgs = sepIndex >= 0 ? argv.slice(sepIndex + 1) : [];

  for (let i = 0; i < metaArgs.length; i++) {
    const arg = metaArgs[i];
    if (arg === '--interval' && metaArgs[i + 1]) {
      options.intervalMs = parseNumberOption(
        metaArgs[++i],
        DEFAULT_INTERVAL_MS,
      );
      continue;
    }
    if (arg === '--duration' && metaArgs[i + 1]) {
      options.durationMs = parseNumberOption(
        metaArgs[++i],
        DEFAULT_DURATION_MS,
      );
      continue;
    }
    if (arg === '--out' && metaArgs[i + 1]) {
      options.outPath = metaArgs[++i];
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printUsage(0);
    }
    console.error(`[memory-probe] Unknown option: ${arg}`);
    printUsage(1);
  }

  if (commandArgs.length === 0) {
    console.error('[memory-probe] Missing command. Pass it after `--`.');
    printUsage(1);
  }
  options.commandTokens = commandArgs;

  return options;
}

/**
 * Runs print usage.
 *
 * @param {any} code Input value.
 * @returns {any} Function result.
 */
function printUsage(code) {
  const msg = [
    'Usage:',
    '  node test/memory-probe.js [--interval <ms>] [--duration <ms>] [--out <file>] -- <command>',
    '',
    'Example:',
    '  node test/memory-probe.js --interval 1000 --duration 240000 --out test/memory-serve.json -- npm run serve',
    '  node test/memory-probe.js --duration 15000 -- bash -lc "npm run build && npm run serve"',
  ].join('\n');
  console.log(msg);
  process.exit(code);
}

/**
 * Runs to mi b.
 *
 * @param {any} bytes Input value.
 * @returns {any} Function result.
 */
function toMiB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Gets read proc stat.
 *
 * @param {any} pid Input value.
 * @returns {any} Function result.
 */
function readProcStat(pid) {
  try {
    const raw = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
    // The command field can include spaces and parentheses.
    // Parsing from the last ')' keeps the rest of the fields aligned.
    const closeIdx = raw.lastIndexOf(')');
    if (closeIdx < 0) {
      return null;
    }
    const tail = raw
      .slice(closeIdx + 2)
      .trim()
      .split(/\s+/);
    if (tail.length < 3) {
      return null;
    }
    return {
      pid,
      ppid: Number(tail[1]),
    };
  } catch {
    return null;
  }
}

/**
 * Gets list all pids.
 *
 * @returns {any} Function result.
 */
function listAllPids() {
  try {
    return fs
      .readdirSync('/proc')
      .filter(entry => /^\d+$/.test(entry))
      .map(entry => Number(entry));
  } catch {
    return [];
  }
}

/**
 * Gets get rss bytes for pid.
 *
 * @param {any} pid Input value.
 * @returns {any} Function result.
 */
function getRssBytesForPid(pid) {
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
    const match = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
    if (!match) {
      return 0;
    }
    return Number(match[1]) * 1024;
  } catch {
    return 0;
  }
}

/**
 * Gets collect descendants.
 *
 * @param {any} rootPid Input value.
 * @returns {any} Function result.
 */
function collectDescendants(rootPid) {
  const pids = listAllPids();
  const childMap = new Map();
  for (const pid of pids) {
    const stat = readProcStat(pid);
    if (!stat || !Number.isFinite(stat.ppid)) {
      continue;
    }
    if (!childMap.has(stat.ppid)) {
      childMap.set(stat.ppid, []);
    }
    childMap.get(stat.ppid).push(stat.pid);
  }

  const found = new Set([rootPid]);
  const queue = [rootPid];
  // Use breadth-first traversal so memory growth stays predictable.
  while (queue.length > 0) {
    const current = queue.shift();
    const children = childMap.get(current) || [];
    for (const child of children) {
      if (found.has(child)) {
        continue;
      }
      found.add(child);
      queue.push(child);
    }
  }
  return Array.from(found);
}

/**
 * Runs sample tree rss.
 *
 * @param {any} rootPid Input value.
 * @returns {any} Function result.
 */
function sampleTreeRss(rootPid) {
  const pids = collectDescendants(rootPid);
  let totalRssBytes = 0;
  for (const pid of pids) {
    totalRssBytes += getRssBytesForPid(pid);
  }
  return {pids, totalRssBytes};
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
 * Runs summarize.
 *
 * @param {any} samples Input value.
 * @returns {any} Function result.
 */
function summarize(samples) {
  if (!samples.length) {
    return null;
  }
  let peak = samples[0];
  for (const sample of samples) {
    if (sample.totalRssBytes > peak.totalRssBytes) {
      peak = sample;
    }
  }
  const initial = samples[0];
  const final = samples[samples.length - 1];
  return {
    sampleCount: samples.length,
    initialRssBytes: initial.totalRssBytes,
    finalRssBytes: final.totalRssBytes,
    peakRssBytes: peak.totalRssBytes,
    deltaRssBytes: final.totalRssBytes - initial.totalRssBytes,
    peakAtMs: peak.atMs,
  };
}

/**
 * Runs run.
 *
 * @returns {any} Function result.
 */
function run() {
  if (process.platform !== 'linux') {
    console.error(
      '[memory-probe] This script currently supports Linux / WSL only.',
    );
    process.exit(1);
  }

  const options = parseArgs(process.argv.slice(2));
  const displayCommand = options.commandTokens.join(' ');

  const child = spawn(
    options.commandTokens[0],
    options.commandTokens.slice(1),
    {
      stdio: 'inherit',
    },
  );

  const start = Date.now();
  const samples = [];
  let stopped = false;
  let timeoutId = null;
  let intervalId = null;

  /**
   * Runs take sample.
   *
   * @returns {any} Function result.
   */
  function takeSample() {
    if (!child.pid) {
      return;
    }
    const sample = sampleTreeRss(child.pid);
    samples.push({
      atMs: Date.now() - start,
      totalRssBytes: sample.totalRssBytes,
      pidCount: sample.pids.length,
    });
  }

  /**
   * Runs stop sampling.
   *
   * @returns {any} Function result.
   */
  function stopSampling() {
    if (stopped) {
      return;
    }
    stopped = true;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  /**
   * Runs terminate child tree.
   *
   * @returns {any} Function result.
   */
  function terminateChildTree() {
    if (!child.pid) {
      return;
    }
    const descendants = collectDescendants(child.pid);
    // Stop children first, then the root, to reduce orphaned processes.
    for (const pid of descendants.reverse()) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // Best effort: process may already have exited.
      }
    }
    setTimeout(() => {
      for (const pid of descendants.reverse()) {
        try {
          process.kill(pid, 'SIGKILL');
        } catch {
          // Best effort: process may already have exited.
        }
      }
    }, 4000);
  }

  process.on('SIGINT', () => {
    console.log('\n[memory-probe] Caught SIGINT, stopping child process...');
    terminateChildTree();
  });

  takeSample();
  intervalId = setInterval(takeSample, options.intervalMs);

  timeoutId = setTimeout(() => {
    console.log(
      `[memory-probe] Duration limit reached (${options.durationMs} ms).`,
    );
    terminateChildTree();
  }, options.durationMs);

  child.on('exit', (code, signal) => {
    takeSample();
    stopSampling();

    const summary = summarize(samples);
    if (!summary) {
      console.error('[memory-probe] No memory samples collected.');
      process.exit(code || 1);
      return;
    }

    const report = {
      command: displayCommand,
      intervalMs: options.intervalMs,
      durationMs: options.durationMs,
      startedAt: new Date(start).toISOString(),
      endedAt: new Date().toISOString(),
      exit: {code, signal},
      summary,
      samples,
    };

    if (options.outPath) {
      const outputPath = ensureParentDir(options.outPath);
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`[memory-probe] Wrote report: ${outputPath}`);
    }

    console.log('[memory-probe] Summary:');
    console.log(`  samples: ${summary.sampleCount}`);
    console.log(`  initial RSS: ${toMiB(summary.initialRssBytes)} MiB`);
    console.log(`  final RSS:   ${toMiB(summary.finalRssBytes)} MiB`);
    console.log(
      `  peak RSS:    ${toMiB(summary.peakRssBytes)} MiB at ${summary.peakAtMs} ms`,
    );
    console.log(`  delta RSS:   ${toMiB(summary.deltaRssBytes)} MiB`);

    if (typeof code === 'number') {
      process.exit(code);
      return;
    }
    process.exit(0);
  });
}

run();
