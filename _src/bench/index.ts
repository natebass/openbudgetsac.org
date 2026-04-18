const fs = require('node:fs');
const path = require('node:path');
const {
  Suite,
  chartReport,
  jsonReport,
  prettyReport,
  textReport,
} = require('bench-node');

require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  cache: false,
});

const REPORTERS: Record<string, unknown> = {
  chart: chartReport,
  json: jsonReport,
  pretty: prettyReport,
  text: textReport,
};

/**
 * Gets get reporter.
 *
 * @returns {any} Function result.
 */
function getReporter() {
  const reporterName = (process.env.BENCH_REPORTER || 'text').toLowerCase();
  return REPORTERS[reporterName] || textReport;
}

/**
 * Builds create context.
 *
 * @returns {any} Function result.
 */
function createContext() {
  return {
    compareUtils: require('../js/compare/utils'),
  };
}

/**
 * Runs load suite registrars.
 *
 * @returns {any} Function result.
 */
function loadSuiteRegistrars() {
  const suitesDir = path.resolve(__dirname, 'suites');
  return fs
    .readdirSync(suitesDir)
    .filter((file: string) => file.endsWith('.bench.ts'))
    .sort()
    .map((file: string) => {
      const suitePath = path.join(suitesDir, file);
      return {
        file,
        register: require(suitePath),
      };
    });
}

/**
 * Runs run.
 *
 * @returns {any} Function result.
 */
async function run() {
  const suite = new Suite({
    reporter: getReporter(),
    detectDeadCodeElimination: true,
    reporterOptions: {
      printHeader: true,
    },
  });

  const context = createContext();
  const registrars = loadSuiteRegistrars();
  if (registrars.length === 0) {
    console.error(
      '[bench] No benchmark suites found in bench/suites/*.bench.ts',
    );
    process.exit(1);
  }

  for (const {file, register} of registrars) {
    if (typeof register !== 'function') {
      throw new TypeError(`Benchmark suite ${file} must export a function`);
    }
    register(suite, context);
  }

  await suite.run();
}

run().catch((error: Error) => {
  console.error('[bench] Benchmark execution failed:', error);
  process.exit(1);
});
