import React from 'react'

import DiffTable from './DiffTable.jsx'
import Trend from './Trend.jsx'
import { fetchBreakdownData } from './api.js'
import { t } from './i18n.js'

/**
 * Checks whether two selected year arrays represent the same year/type pairings.
 *
 * @param {Array<{fiscal_year_range:string,budget_type:(string|number)}|null>} currentYears Current years.
 * @param {Array<{fiscal_year_range:string,budget_type:(string|number)}|null>} previousYears Previous years.
 * @returns {boolean} True when selections match.
 */
function areSameYears (currentYears, previousYears) {
  if (!Array.isArray(currentYears) || !Array.isArray(previousYears) || currentYears.length !== previousYears.length) {
    return false
  }
  return currentYears.every((year, index) => {
    const prevYear = previousYears[index]
    if (!year && !prevYear) {
      return true
    }
    if (!year || !prevYear) {
      return false
    }
    return year.fiscal_year_range === prevYear.fiscal_year_range &&
      String(year.budget_type) === String(prevYear.budget_type)
  })
}

/**
 * Checks whether both selected year entries are present.
 *
 * @param {Array<unknown>} years Year selection array.
 * @returns {boolean} True when all entries are truthy.
 */
function hasCompleteYears (years) {
  return Array.isArray(years) && years.every(Boolean)
}

export default class SpendingByDept extends React.Component {
  /**
   * Initializes breakdown state.
   *
   * @param {object} props React component props.
   */
  constructor (props) {
    super(props)
    this.state = {
      budgets: [],
      pending: true,
      error: null
    }
    this.activeFetchId = 0
    this.fetchData = this.fetchData.bind(this)
  }

  /**
   * Loads data after mount.
   *
   * @returns {void}
   */
  componentDidMount () {
    this.fetchData(this.props.years)
  }

  /**
   * Refetches when selected years change.
   *
   * @param {object} prevProps Previous props.
   * @returns {void}
   */
  componentDidUpdate (prevProps) {
    if (!areSameYears(this.props.years, prevProps.years) ||
      this.props.type !== prevProps.type ||
      this.props.dimension !== prevProps.dimension) {
      this.fetchData(this.props.years)
    }
  }

  /**
   * Fetches breakdown data for selected year objects.
   *
   * @param {Array<{fiscal_year_range:string,budget_type:(string|number)}|null>} years Year records.
   * @returns {void}
   */
  fetchData (years) {
    this.activeFetchId += 1
    const currentFetchId = this.activeFetchId
    this.setState({ pending: true, error: null })

    if (!hasCompleteYears(years)) {
      return
    }

    const yearNames = years.map(year => year.fiscal_year_range)
    const yearTypes = years.map(year => year.budget_type)
    fetchBreakdownData(yearNames, yearTypes, this.props.type, this.props.dimension)
      .then((budgets) => {
        if (currentFetchId !== this.activeFetchId) {
          return
        }
        this.setState({ budgets, pending: false, error: null })
      })
      .catch((error) => {
        if (currentFetchId !== this.activeFetchId) {
          return
        }
        console.error('Failed loading comparison breakdown', error)
        this.setState({ budgets: [], pending: false, error: t('error.breakdownUnavailable') })
      })
  }

  /**
   * Renders loading state or chart/table breakdowns.
   *
   * @returns {JSX.Element} Breakdown content.
   */
  render () {
    if (this.state.pending) {
      return <div className='text-muted' role='status' aria-live='polite'>{t('loading.breakdown')}</div>
    }
    if (this.state.error) {
      return <div className='alert alert-warning' role='alert'>{this.state.error}</div>
    }

    return (
      <div>
        <Trend
          data={this.state.budgets} colors={this.props.colors}
          years={this.props.years}
          compactMode={this.props.compactMode}
          constrainedMode={this.props.constrainedMode}
        />
        <DiffTable
          data={this.state.budgets} years={this.props.years}
          colors={this.props.colors} diffColors={this.props.diffColors}
          usePct={this.props.usePct}
          compactMode={this.props.compactMode}
          constrainedMode={this.props.constrainedMode}
        />
      </div>
    )
  }
}
