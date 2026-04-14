import axios from 'axios'

const API_BASE = '/data/compare'

const typePaths = {
  spending: '/fiscal-years-expenses',
  revenue: '/fiscal-years-revenue'
}

const dimensionPaths = {
  department: '/depts',
  category: '/account-cats'
}

const dimensionKeys = {
  department: 'department',
  category: 'account_category'
}
const REQUEST_TIMEOUT_MS = 15000
const SAFE_YEAR_RE = /^FY\d{2}$/i
const TYPE_SORT_WEIGHT_BASE = 6

/**
 * Checks whether a breakdown label is safe to use as an object key.
 *
 * @param {unknown} value Candidate key value.
 * @returns {boolean} True when the key is safe.
 */
function isSafeBreakdownKey (value) {
  return typeof value === 'string' &&
    value.length > 0 &&
    value !== '__proto__' &&
    value !== 'prototype' &&
    value !== 'constructor'
}

/**
 * Builds a sortable index for totals based on fiscal year and budget type.
 *
 * @param {{fiscal_year_range:string,budget_type:(string|number)}} record Totals record.
 * @returns {number} Numeric sort key.
 */
function getTotalsSortIndex (record) {
  const year = record.fiscal_year_range.slice(2, 4)
  // Historical type IDs are not naturally ordered for UI display.
  const type = TYPE_SORT_WEIGHT_BASE / record.budget_type
  // Compose a sortable key like YY.T where YY dominates sort precedence.
  return +`${year}.${type}`
}

/**
 * Builds the JSON endpoint URL for one breakdown request.
 *
 * @param {string} year Fiscal year token.
 * @param {'spending'|'revenue'} type Budget dataset type.
 * @param {'department'|'category'} dimension Breakdown grouping.
 * @returns {string} Endpoint URL.
 */
function createBreakdownUrl (year, type, dimension) {
  return API_BASE + typePaths[type] + dimensionPaths[dimension] + `/${encodeURIComponent(year)}.json`
}

/**
 * Parses a numeric total and falls back to zero for invalid values.
 *
 * @param {unknown} rawTotal Raw value from the dataset.
 * @returns {number} Parsed numeric total.
 */
function parseNumericTotal (rawTotal) {
  const parsed = Number(rawTotal)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Validates request inputs before fetching compare breakdown data.
 *
 * @param {unknown} years Requested fiscal years.
 * @param {unknown} yearTypes Requested budget types.
 * @param {unknown} type Dataset type selector.
 * @param {unknown} dimension Breakdown dimension selector.
 * @returns {void}
 */
function assertValidBreakdownRequest (years, yearTypes, type, dimension) {
  if (!Array.isArray(years) || !Array.isArray(yearTypes) || years.length !== yearTypes.length || years.length === 0) {
    throw new Error('Invalid budget comparison request')
  }
  if (!years.every(year => typeof year === 'string' && SAFE_YEAR_RE.test(year))) {
    throw new Error('Invalid fiscal year format')
  }
  if (!Object.prototype.hasOwnProperty.call(typePaths, type) || !Object.prototype.hasOwnProperty.call(dimensionPaths, dimension)) {
    throw new Error('Unsupported comparison dimension or type')
  }
}

/**
 * Fetches breakdown data for two years and filters rows by budget type.
 *
 * @param {string[]} years Fiscal year identifiers.
 * @param {(string|number)[]} yearTypes Budget type per requested year.
 * @param {'spending'|'revenue'} type Data type path selector.
 * @param {'department'|'category'} dimension Grouping dimension.
 * @returns {Promise<Array<Record<string, number>>>} Two budget maps keyed by dimension label.
 */
export function fetchBreakdownData (years, yearTypes, type, dimension) {
  assertValidBreakdownRequest(years, yearTypes, type, dimension)
  // Fetch both years in parallel so UI wait time is bounded by the slower request.
  const urls = years.map((year) => createBreakdownUrl(year, type, dimension))

  return Promise.all(urls.map((url) => axios.get(url, { timeout: REQUEST_TIMEOUT_MS })))
    .then((budgets) => {
      return budgets.map((budget, i) => {
        if (!budget || !Array.isArray(budget.data)) {
          throw new Error(`Unexpected API response format for ${urls[i]}`)
        }
        return budget.data.reduce((acc, row) => {
          // Budget type can be numeric or string depending on source file version.
          if (String(row.budget_type) === String(yearTypes[i])) {
            // Convert the matching row into a normalized numeric map entry.
            const key = row[dimensionKeys[dimension]]
            if (isSafeBreakdownKey(key)) {
              acc[key] = parseNumericTotal(row.total)
            }
          }
          return acc
        }, {})
      })
    })
    .catch((error) => {
      console.error('Failed to fetch compare breakdown data', error)
      throw error
    })
}

/**
 * Fetches total spending records and sorts newest-first.
 *
 * @returns {Promise<Array<{fiscal_year_range:string,budget_type:(string|number),total:number}>>}
 * Sorted totals list.
 */
export function fetchTotals () {
  return axios.get(API_BASE + typePaths.spending + '/totals.json', { timeout: REQUEST_TIMEOUT_MS }).then((response) => {
    const data = response.data
    if (!Array.isArray(data)) {
      throw new Error('Unexpected totals response format')
    }

    data.sort((a, b) => {
      // Sort newest fiscal years first, then keep a stable local budget-type order.
      const indexA = getTotalsSortIndex(a)
      const indexB = getTotalsSortIndex(b)

      if (indexA === indexB) {
        return 0
      }
      return indexA > indexB ? -1 : 1
    })

    return data
  }).catch((error) => {
    console.error('Failed to fetch compare totals', error)
    throw error
  })
}
