import React from 'react'
import { createRoot } from 'react-dom/client'
import Select from 'react-select'
import { schemeSet2 as colors } from 'd3-scale-chromatic'

import Total from './Total.jsx'
import { fetchTotals } from './api.js'
import Breakdown from './Breakdown.jsx'
import { t } from './i18n.js'

const BUDGET_TYPE_LABEL_KEYS = {
  1: 'budgetType.adopted',
  2: 'budgetType.adjusted',
  3: 'budgetType.proposed'
}
const BREAKDOWNS = [
  {
    key: 'spendDept',
    labelKey: 'compare.breakdowns.spendDept',
    type: 'spending',
    dimension: 'department'
  },
  {
    key: 'spendCat',
    labelKey: 'compare.breakdowns.spendCat',
    type: 'spending',
    dimension: 'category'
  },
  {
    key: 'revDept',
    labelKey: 'compare.breakdowns.revDept',
    type: 'revenue',
    dimension: 'department'
  },
  {
    key: 'revCat',
    labelKey: 'compare.breakdowns.revCat',
    type: 'revenue',
    dimension: 'category'
  }
]
const MOBILE_WIDTH_MAX = 767
const LOW_MEMORY_DEVICE_MAX_GB = 2

const styles = [{ color: colors[0] }, { color: colors[1] }]
const diffColors = {
  neg: '#e41a1c',
  pos: '#4daf4a'
}

/**
 * Gets get connection.
 *
 * @returns {any} Function result.
 */
function getConnection () {
  if (typeof navigator === 'undefined') {
    return null
  }
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null
}

/**
 * Builds derive performance flags.
 *
 * @returns {any} Function result.
 */
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
    navigator.deviceMemory <= LOW_MEMORY_DEVICE_MAX_GB
  const compactMode = window.innerWidth <= MOBILE_WIDTH_MAX
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
  const labelKey = BUDGET_TYPE_LABEL_KEYS[record.budget_type] || BUDGET_TYPE_LABEL_KEYS[1]
  return {
    value: index,
    label: `${record.fiscal_year_range} ${t(labelKey)}`
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
  // `fetchTotals` already sorts newest first, so default to the latest two fiscal years.
  return [budgets[0], budgets[1]]
}

function formatTotals (selectedYears) {
  return selectedYears.map((record) => {
    if (!record) {
      return undefined
    }
    return {
      key: record.fiscal_year_range,
      total: record.total
    }
  })
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
        this.setState({ loading: false, error: t('error.noBudgetYears') })
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
        error: t('error.compareDataUnavailable')
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
    this.setState({
      changeType: event.target.value
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
    const selectedChoiceKey = `${key}Choice`
    const selectedBudgetKey = key
    const otherOptionsKey = `${otherKey}Options`

    if (this.state[selectedChoiceKey] === index) {
      return
    }

    const otherBudgetOptions = this.state.budgetChoices.slice()
    otherBudgetOptions.splice(index, 1)
    this.setState({
      [selectedChoiceKey]: index,
      [selectedBudgetKey]: this.state.totals[index],
      [otherOptionsKey]: otherBudgetOptions
    })
  }

  /**
   * Renders compare page controls and active breakdown panel.
   *
   * @returns {JSX.Element} Compare application UI.
   */
  render () {
    if (this.state.loading) {
      return <div className='text-muted' role='status' aria-live='polite'>{t('loading.comparisonData')}</div>
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
    const totals = formatTotals(selectedYears)
    const breakdowns = BREAKDOWNS.map((item) => ({
      key: item.key,
      label: t(item.labelKey),
      type: item.type,
      dimension: item.dimension
    }))
    const activeBreakdown = breakdowns.find(
      item => item.key === this.state.activeBreakdown
    ) || breakdowns[0]

    return (
      <div className='compare-app'>
        {this.state.constrainedMode
          ? <p className='text-muted small'>{t('mode.lowBandwidth')}</p>
          : null}
        <div className='row'>
          <div className='col-sm-10'>
            <h1 className='compare-title'>
              <span className='compare-title__label'>{t('compare.title.compare')}</span>
              <span style={styles[0]} className='choose-budget compare-title__budget'>
                <span id='compareBudgetYearALabel' className='sr-only'>{t('compare.budgetYear.first')}</span>
                <Select
                  options={this.state.budget1Options}
                  value={budget1Selected}
                  onChange={this.handleSelectBudget1}
                  inputId='compareBudgetYearA'
                  aria-labelledby='compareBudgetYearALabel'
                  aria-label={t('compare.budgetYear.selectFirst')}
                  isSearchable={false}
                  isClearable={false}
                />
              </span>{' '}
              <span className='compare-title__connector'>{t('compare.title.with')}</span>{' '}
              <span style={styles[1]} className='choose-budget compare-title__budget'>
                <span id='compareBudgetYearBLabel' className='sr-only'>{t('compare.budgetYear.second')}</span>
                <Select
                  options={this.state.budget2Options}
                  value={budget2Selected}
                  onChange={this.handleSelectBudget2}
                  inputId='compareBudgetYearB'
                  aria-labelledby='compareBudgetYearBLabel'
                  aria-label={t('compare.budgetYear.selectSecond')}
                  isSearchable={false}
                  isClearable={false}
                />
              </span>
            </h1>
          </div>
          <div className='col-sm-2'>
            <div className='form-group'>
              <label htmlFor='changeTypeControl'>{t('compare.showChangesAs')}</label>
              <select
                className='form-control'
                id='changeTypeControl'
                value={this.state.changeType}
                onChange={this.handleChangeType}
              >
                <option value='pct'>{t('compare.changeType.percentage')}</option>
                <option value='usd'>{t('compare.changeType.dollars')}</option>
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
            <h2>{t('compare.breakdowns.title')}</h2>
            <p>
              {t('compare.breakdowns.description')}
            </p>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>
            <ul className='nav nav-pills nav-stacked' role='tablist' aria-label={t('compare.breakdowns.navLabel')}>
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
