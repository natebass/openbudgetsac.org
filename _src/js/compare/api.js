import axios from 'axios'
import { descending } from 'd3-array'

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

function assertValidBreakdownRequest (years, yearTypes, type, dimension) {
  if (!Array.isArray(years) || !Array.isArray(yearTypes) || years.length !== yearTypes.length || years.length === 0) {
    throw new Error('Invalid budget comparison request')
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
  const urls = years.map((year) => {
    return API_BASE + typePaths[type] + dimensionPaths[dimension] + `/${year}.json`
  })

  return axios.all(urls.map((url) => axios.get(url, { timeout: REQUEST_TIMEOUT_MS }))).then(
    axios.spread((...budgets) => {
      return budgets.map((budget, i) => {
        if (!budget || !Array.isArray(budget.data)) {
          throw new Error(`Unexpected API response format for ${urls[i]}`)
        }
        return budget.data.reduce((acc, row) => {
          // Budget type can be numeric or string depending on source file version.
          if (String(row.budget_type) === String(yearTypes[i])) {
            // convert to object and cast totals to numbers
            const key = row[dimensionKeys[dimension]]
            if (typeof key === 'string' && key.length > 0) {
              acc[key] = Number.isFinite(+row.total) ? +row.total : 0
            }
          }
          return acc
        }, {})
      })
    })
  ).catch((error) => {
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
      const [indexA, indexB] = [a, b].map((record) => {
        const year = record.fiscal_year_range.slice(2, 4)
        // Historical type IDs are not naturally ordered for UI display.
        const type = 6 / record.budget_type
        // Compose a sortable key like YY.T where YY dominates sort precedence.
        return +`${year}.${type}`
      })

      return descending(indexA, indexB)
    })

    return data
  }).catch((error) => {
    console.error('Failed to fetch compare totals', error)
    throw error
  })
}
