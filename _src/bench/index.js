const fs = require('node:fs')
const path = require('node:path')
const { Suite, textReport, jsonReport, prettyReport, chartReport } = require('bench-node')

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  cache: false
})

const REPORTERS = {
  text: textReport,
  json: jsonReport,
  pretty: prettyReport,
  chart: chartReport
}

/**
 * Gets get reporter.
 *
 * @returns {any} Function result.
 */
function getReporter () {
  const reporterName = (process.env.BENCH_REPORTER || 'text').toLowerCase()
  return REPORTERS[reporterName] || textReport
}

/**
 * Builds create context.
 *
 * @returns {any} Function result.
 */
function createContext () {
  return {
    compareUtils: require('../js/compare/utils.jsx')
  }
}

/**
 * Runs load suite registrars.
 *
 * @returns {any} Function result.
 */
function loadSuiteRegistrars () {
  const suitesDir = path.resolve(__dirname, 'suites')
  return fs.readdirSync(suitesDir)
    .filter((file) => file.endsWith('.bench.js'))
    .sort()
    .map((file) => {
      const suitePath = path.join(suitesDir, file)
      const register = require(suitePath)
      return {
        file,
        register
      }
    })
}

/**
 * Runs run.
 *
 * @returns {any} Function result.
 */
async function run () {
  const suite = new Suite({
    reporter: getReporter(),
    detectDeadCodeElimination: true,
    reporterOptions: {
      printHeader: true
    }
  })

  const context = createContext()
  const registrars = loadSuiteRegistrars()

  if (registrars.length === 0) {
    console.error('[bench] No benchmark suites found in bench/suites/*.bench.js')
    process.exit(1)
  }

  for (const { file, register } of registrars) {
    if (typeof register !== 'function') {
      throw new TypeError(`Benchmark suite ${file} must export a function`)
    }
    register(suite, context)
  }

  await suite.run()
}

run().catch((error) => {
  console.error('[bench] Benchmark execution failed:', error)
  process.exit(1)
})
