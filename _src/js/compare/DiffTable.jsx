import React from 'react'
import { Bar } from 'react-chartjs-2'

import { DiffStyled, asDollars, compareChartOptions, getSortedBudgetKeys, translateDataLabel } from './utils'
import { t } from './i18n.js'

/**
 * Compares values in descending order.
 *
 * @param {number|string} a Left value.
 * @param {number|string} b Right value.
 * @returns {number} Sort comparator value.
 */
function compareDesc (a, b) {
  if (a === b) {
    return 0
  }
  return a > b ? -1 : 1
}

/**
 * Compares values in ascending order.
 *
 * @param {number|string} a Left value.
 * @param {number|string} b Right value.
 * @returns {number} Sort comparator value.
 */
function compareAsc (a, b) {
  if (a === b) {
    return 0
  }
  return a < b ? -1 : 1
}

/**
 * Builds per-row chart data for the two selected fiscal years.
 *
 * @param {{value:number,prev:number}} entry Row diff entry.
 * @param {Array<{fiscal_year_range:string}>} years Selected year records.
 * @param {string[]} colors Series colors.
 * @returns {{labels:string[],datasets:Array<{data:number[],label:string,backgroundColor:string}>}} Chart.js data.
 */
function buildRowChartData (entry, years, colors) {
  return {
    labels: [''],
    datasets: [
      {
        data: [entry.value],
        label: years[0].fiscal_year_range,
        backgroundColor: colors[0]
      },
      {
        data: [entry.prev],
        label: years[1].fiscal_year_range,
        backgroundColor: colors[1]
      }
    ]
  }
}

export default class DiffTable extends React.Component {
  /**
   * Initializes table sort state.
   *
   * @param {object} props React component props.
   */
  constructor (props) {
    super(props)
    this.state = {
      sortBy: 'diff',
      showAllRows: false
    }
    this.handleSortChange = this.handleSortChange.bind(this)
    this.handleShowAllRows = this.handleShowAllRows.bind(this)
  }

  /**
   * Updates active sort mode.
   *
   * @param {Event} event Input change event.
   * @returns {void}
   */
  handleSortChange (event) {
    const target = event.target
    this.setState({ sortBy: target.value })
  }

  /**
   * Reveals all rows in constrained mode.
   *
   * @returns {void}
   */
  handleShowAllRows () {
    this.setState({ showAllRows: true })
  }

  /**
   * Resets expanded rows when entering compact/constrained mode.
   *
   * @param {object} prevProps Previous props.
   * @returns {void}
   */
  componentDidUpdate (prevProps) {
    const isLimitedMode = this.props.constrainedMode || this.props.compactMode
    const wasLimitedMode = prevProps.constrainedMode || prevProps.compactMode

    if (isLimitedMode && !wasLimitedMode && this.state.showAllRows) {
      this.setState({ showAllRows: false })
    }
  }

  /**
   * Renders the diff table and spark bars.
   *
   * @returns {JSX.Element} Sorted diff table.
   */
  render () {
    const sortFunc = this.state.sortBy === 'diff' ? compareDesc : compareAsc
    const isLimitedMode = this.props.constrainedMode || this.props.compactMode
    const showRowCharts = !isLimitedMode
    const defaultVisibleRows = isLimitedMode ? 20 : Infinity

    const diffEntries = getSortedBudgetKeys(this.props.data).map((key) => {
      const res = {
        key,
        value: this.props.data[0][key],
        prev: this.props.data[1][key]
      }
      if (res.prev !== undefined && res.prev !== null) {
        res.diff = (res.value || 0) - res.prev
        if (this.props.usePct) {
          res.diff = res.diff / Math.abs(res.prev)
        }
      } else {
        res.diff = Infinity
      }
      return res
    })
      .sort((a, b) => {
        return sortFunc(a[this.state.sortBy], b[this.state.sortBy])
      })

    const visibleEntries = this.state.showAllRows ? diffEntries : diffEntries.slice(0, defaultVisibleRows)

    const diffList = visibleEntries.map((entry) => {
      const displayKey = translateDataLabel(entry.key)
      const data = buildRowChartData(entry, this.props.years, this.props.colors)
      const chartOptions = {
        ...compareChartOptions,
        indexAxis: 'y',
        animation: false,
        normalized: true
      }

      return (
        <tr key={entry.key}>
          <td>
            <h4>
              {displayKey}
              {showRowCharts
                ? (
                  <Bar
                    data={data}
                    options={chartOptions}
                    height={40}
                    role='img'
                    aria-label={t('compare.chartAria.row', { item: displayKey })}
                  />
                  )
                : (
                  <small className='text-muted'>
                    {this.props.years[0].fiscal_year_range}: {asDollars(entry.value || 0)}
                    {' | '}
                    {this.props.years[1].fiscal_year_range}: {asDollars(entry.prev || 0)}
                  </small>
                  )}
            </h4>
          </td>
          <td>
            <DiffStyled
              diff={entry.diff} colors={this.props.diffColors}
              usePct={this.props.usePct}
            />
          </td>
        </tr>
      )
    })

    return (
      <div>
        <table className='table'>
          <caption className='sr-only'>
            {t('diffTable.caption')}
          </caption>
          <thead>
            <tr>
              <th scope='col' colSpan='2' className='form-horizontal'>
                <div className='form-group'>
                  <label className='col-sm-3 col-sm-offset-6 control-label' htmlFor='diffSortControl'>{t('diffTable.sortBy')} </label>
                  <div className='col-sm-3'>
                    <select
                      className='form-control' id='diffSortControl'
                      value={this.state.sortBy} onChange={this.handleSortChange}
                    >
                      <option value='diff'>{t('diffTable.sortAmount')}</option>
                      <option value='key'>{t('diffTable.sortName')}</option>
                    </select>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th scope='col'>{t('diffTable.budgetItem')}</th>
              <th scope='col'>{t('diffTable.difference')}</th>
            </tr>
          </thead>
          <tbody>
            {diffList}
          </tbody>
        </table>
        {!this.state.showAllRows && diffEntries.length > visibleEntries.length
          ? (
            <button
              type='button'
              className='btn btn-default btn-sm'
              onClick={this.handleShowAllRows}
            >
              {t('diffTable.showAllRows')}
            </button>
            )
          : null}
      </div>
    )
  }
}
