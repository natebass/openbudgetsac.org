import React from 'react'
import { createRoot } from 'react-dom/client'
import Select from 'react-select'
import { schemeSet2 as colors } from 'd3-scale-chromatic'

import Total from './Total.jsx'
import { BUDGET_TYPES } from './utils.jsx'
import { fetchTotals } from './api.js'
import Breakdown from './Breakdown.jsx'

const styles = [{ color: colors[0] }, { color: colors[1] }]
const diffColors = {
  neg: '#e41a1c',
  pos: '#4daf4a'
}

function getConnection () {
  if (typeof navigator === 'undefined') {
    return null
  }
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null
}

function derivePerformanceFlags () {
  if (typeof window === 'undefined') {
    return { compactMode: false, constrainedMode: false }
  }

  const connection = getConnection()
  const effectiveType = connection ? String(connection.effectiveType || '').toLowerCase() : ''
  const lowBandwidthConnection = Boolean(
    (connection && connection.saveData) ||
    effectiveType.includes('slow-2g') ||
    effectiveType.includes('2g') ||
    effectiveType.includes('3g')
  )
  const lowMemoryDevice = typeof navigator !== 'undefined' &&
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= 2
  const compactMode = window.innerWidth <= 767
  const constrainedMode = compactMode && (lowBandwidthConnection || lowMemoryDevice)

  return { compactMode, constrainedMode }
}

/**
 * Builds a select option for a budget record.
 *
 * @param {{fiscal_year_range:string,budget_type:(string|number)}} record Budget metadata.
 * @param {number} index Option index.
 * @returns {{value:number,label:string}} Select option.
 */
function getBudgetOption (record, index) {
  return {
    value: index,
    label: `${record.fiscal_year_range} ${BUDGET_TYPES[record.budget_type]}`
  }
}

/**
 * Picks the default pair of budget options.
 *
 * @param {Array<{value:number,label:string}>} budgets Options list.
 * @returns {[{value:number,label:string}|null,{value:number,label:string}|null]} Default pair.
 */
function getBudgetDefaults (budgets) {
  if (!budgets.length) {
    return [null, null]
  }
  if (budgets.length === 1) {
    return [budgets[0], budgets[0]]
  }
  // fetchTotals already sorts newest-first, so default to the latest
  // two fiscal years available in the dataset.
  return [budgets[0], budgets[1]]
}

class Compare extends React.Component {
  /**
   * Initializes compare view state.
   *
   * @param {object} props React component props.
   */
  constructor (props) {
    super(props)
    this.state = {
      activeBreakdown: 'spendDept',
      changeType: 'pct',
      budgetChoices: [],
      totals: [],
      loading: true,
      error: null,
      compactMode: false,
      constrainedMode: false
    }
    this.handleChangeType = this.handleChangeType.bind(this)
    this.handleSelectBudget = this.handleSelectBudget.bind(this)
    this.handleSelectBudget1 = this.handleSelectBudget1.bind(this)
    this.handleSelectBudget2 = this.handleSelectBudget2.bind(this)
    this.handleBreakdownSelect = this.handleBreakdownSelect.bind(this)
    this.applyPerformanceFlags = this.applyPerformanceFlags.bind(this)
    this.scheduleApplyPerformanceFlags = this.scheduleApplyPerformanceFlags.bind(this)
  }

  /**
   * Loads totals and initializes default year selections.
   *
   * @returns {void}
   */
  componentDidMount () {
    this.applyPerformanceFlags()
    this.resizeHandler = this.scheduleApplyPerformanceFlags
    window.addEventListener('resize', this.resizeHandler, { passive: true })
    this.connection = getConnection()
    if (this.connection && typeof this.connection.addEventListener === 'function') {
      this.connection.addEventListener('change', this.resizeHandler)
    }

    fetchTotals().then((totals) => {
      const budgetChoices = totals.map(getBudgetOption)
      const defaultChoices = getBudgetDefaults(budgetChoices)
      if (!defaultChoices[0] || !defaultChoices[1]) {
        this.setState({ loading: false, error: 'No budget years available.' })
        return
      }
      const budget1Choice = defaultChoices[0].value
      const budget2Choice = defaultChoices[1].value
      const budget1Options = budgetChoices.filter(
        option => option.value !== budget2Choice
      )
      const budget2Options = budgetChoices.filter(
        option => option.value !== budget1Choice
      )
      this.setState({
        budgetChoices,
        totals,
        budget1Choice,
        budget1: totals[budget1Choice],
        budget2Choice,
        budget2: totals[budget2Choice],
        budget1Options,
        budget2Options,
        loading: false,
        error: null
      })
    }).catch((error) => {
      console.error('Failed loading compare totals', error)
      this.setState({
        loading: false,
        error: 'Unable to load comparison data right now. Please refresh the page or try again in a moment.'
      })
    })
  }

  /**
   * Cleans up window and network listeners.
   *
   * @returns {void}
   */
  componentWillUnmount () {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
    if (this.connection && this.resizeHandler && typeof this.connection.removeEventListener === 'function') {
      this.connection.removeEventListener('change', this.resizeHandler)
    }
    if (this.resizeRaf) {
      window.cancelAnimationFrame(this.resizeRaf)
      this.resizeRaf = null
    }
  }

  /**
   * Applies adaptive UI flags for small screens and slow connections.
   *
   * @returns {void}
   */
  applyPerformanceFlags () {
    const nextFlags = derivePerformanceFlags()
    if (
      nextFlags.compactMode === this.state.compactMode &&
      nextFlags.constrainedMode === this.state.constrainedMode
    ) {
      return
    }
    this.setState(nextFlags)
  }

  /**
   * Coalesces rapid resize events to avoid repeated expensive chart rerenders.
   *
   * @returns {void}
   */
  scheduleApplyPerformanceFlags () {
    if (this.resizeRaf) {
      return
    }
    this.resizeRaf = window.requestAnimationFrame(() => {
      this.resizeRaf = null
      this.applyPerformanceFlags()
    })
  }

  /**
   * Updates diff formatting mode.
   *
   * @param {Event} event Select change event.
   * @returns {void}
   */
  handleChangeType (event) {
    const target = event.target
    this.setState({
      changeType: target.value
    })
  }

  /**
   * Handles year selection for left-hand budget selector.
   *
   * @param {{value:number}} option Selected option.
   * @returns {void}
   */
  handleSelectBudget1 (option) {
    this.handleSelectBudget('budget1', 'budget2', option.value)
  }

  /**
   * Handles year selection for right-hand budget selector.
   *
   * @param {{value:number}} option Selected option.
   * @returns {void}
   */
  handleSelectBudget2 (option) {
    this.handleSelectBudget('budget2', 'budget1', option.value)
  }

  /**
   * Switches the active breakdown tab.
   *
   * @param {string} key Breakdown key.
   * @returns {void}
   */
  handleBreakdownSelect (key) {
    if (this.state.activeBreakdown === key) {
      return
    }
    this.setState({ activeBreakdown: key })
  }

  /**
   * Updates one selected budget and constrains the opposite selector options.
   *
   * @param {'budget1'|'budget2'} key Target budget key.
   * @param {'budget1'|'budget2'} otherKey Opposite budget key.
   * @param {number} index Selected option index.
   * @returns {void}
   */
  handleSelectBudget (key, otherKey, index) {
    // No change if same selection
    if (this.state[`${key}Choice`] === index) {
      return
    }

    const otherBudgetOptions = this.state.budgetChoices.slice()
    otherBudgetOptions.splice(index, 1)
    this.setState({
      [`${key}Choice`]: index,
      [key]: this.state.totals[index],
      [`${otherKey}Options`]: otherBudgetOptions
    })
  }

  /**
   * Renders compare page controls and active breakdown panel.
   *
   * @returns {JSX.Element} Compare application UI.
   */
  render () {
    if (this.state.loading) {
      return <div className='text-muted' role='status' aria-live='polite'>Loading comparison data...</div>
    }
    if (this.state.error) {
      return <div className='alert alert-warning' role='alert'>{this.state.error}</div>
    }

    const usePct = this.state.changeType === 'pct'
    const budget1Selected = this.state.budgetChoices.find(
      option => option.value === this.state.budget1Choice
    ) || null
    const budget2Selected = this.state.budgetChoices.find(
      option => option.value === this.state.budget2Choice
    ) || null
    const selectedYears = [this.state.budget1, this.state.budget2]
    const totals = selectedYears.map((record) => {
      if (record) {
        return {
          key: record.fiscal_year_range,
          total: record.total
        }
      }
      return undefined
    })

    const breakdowns = [
      {
        key: 'spendDept',
        label: 'Spending by Department',
        type: 'spending',
        dimension: 'department'
      },
      {
        key: 'spendCat',
        label: 'Spending by Category',
        type: 'spending',
        dimension: 'category'
      },
      {
        key: 'revDept',
        label: 'Revenue by Department',
        type: 'revenue',
        dimension: 'department'
      },
      {
        key: 'revCat',
        label: 'Revenue by Category',
        type: 'revenue',
        dimension: 'category'
      }
    ]
    const activeBreakdown = breakdowns.find(
      item => item.key === this.state.activeBreakdown
    ) || breakdowns[0]

    return (
      <div className='compare-app'>
        {this.state.constrainedMode
          ? <p className='text-muted small'>Low-bandwidth mode is on to reduce data and battery use.</p>
          : null}
        <div className='row'>
          <div className='col-sm-10'>
            <h1 className='compare-title'>
              <span className='compare-title__label'>Compare</span>
              <span style={styles[0]} className='choose-budget compare-title__budget'>
                <span id='compareBudgetYearALabel' className='sr-only'>First budget year</span>
                <Select
                  options={this.state.budget1Options}
                  value={budget1Selected}
                  onChange={this.handleSelectBudget1}
                  inputId='compareBudgetYearA'
                  aria-labelledby='compareBudgetYearALabel'
                  aria-label='Select first budget year'
                  isSearchable={false}
                  isClearable={false}
                />
              </span>{' '}
              <span className='compare-title__connector'>with</span>{' '}
              <span style={styles[1]} className='choose-budget compare-title__budget'>
                <span id='compareBudgetYearBLabel' className='sr-only'>Second budget year</span>
                <Select
                  options={this.state.budget2Options}
                  value={budget2Selected}
                  onChange={this.handleSelectBudget2}
                  inputId='compareBudgetYearB'
                  aria-labelledby='compareBudgetYearBLabel'
                  aria-label='Select second budget year'
                  isSearchable={false}
                  isClearable={false}
                />
              </span>
            </h1>
          </div>
          <div className='col-sm-2'>
            <div className='form-group'>
              <label htmlFor='changeTypeControl'>Show changes as:</label>
              <select
                className='form-control'
                id='changeTypeControl'
                value={this.state.changeType}
                onChange={this.handleChangeType}
              >
                <option value='pct'>percentage</option>
                <option value='usd'>dollars</option>
              </select>
            </div>
          </div>
          <div className='col-sm-12'>
            <Total
              data={totals}
              colors={colors}
              diffColors={diffColors}
              usePct={usePct}
              constrainedMode={this.state.constrainedMode}
            />
            <h2>Budget breakdowns</h2>
            <p>
              Get more detail on where money came from and how it was spent.
            </p>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>
            <ul className='nav nav-pills nav-stacked' role='tablist' aria-label='Budget breakdown views'>
              {breakdowns.map(item => (
                <li
                  key={item.key}
                  className={item.key === activeBreakdown.key ? 'active' : ''}
                  role='presentation'
                >
                  <button
                    type='button'
                    className='btn btn-link'
                    role='tab'
                    id={`${item.key}-tab`}
                    aria-controls={`${item.key}-panel`}
                    aria-selected={item.key === activeBreakdown.key}
                    tabIndex={item.key === activeBreakdown.key ? 0 : -1}
                    onClick={() => this.handleBreakdownSelect(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div
            className='col-sm-9'
            role='tabpanel'
            id={`${activeBreakdown.key}-panel`}
            aria-labelledby={`${activeBreakdown.key}-tab`}
          >
            <Breakdown
              colors={colors}
              diffColors={diffColors}
              usePct={usePct}
              years={selectedYears}
              type={activeBreakdown.type}
              dimension={activeBreakdown.dimension}
              compactMode={this.state.compactMode}
              constrainedMode={this.state.constrainedMode}
            />
          </div>
        </div>
      </div>
    )
  }
}

async function enableA11yRuntimeChecks () {
  if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') {
    return
  }

  if (window.__axeA11yRuntimeEnabled) {
    return
  }
  window.__axeA11yRuntimeEnabled = true

  try {
    const axeModule = await import('@axe-core/react')
    const reactDomModule = await import('react-dom')
    const runAxe = axeModule.default || axeModule
    runAxe(React, reactDomModule, 1000)
  } catch (error) {
    console.warn('Unable to initialize @axe-core/react runtime checks.', error)
  }
}

export { Compare }

const rootElement = document.getElementById('root')
if (rootElement) {
  enableA11yRuntimeChecks()
    .finally(() => {
      createRoot(rootElement).render(<Compare />)
    })
}
