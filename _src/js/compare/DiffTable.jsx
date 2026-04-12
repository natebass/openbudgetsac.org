import React from 'react'
import { Bar } from 'react-chartjs-2'
import { keys, set } from 'd3-collection'
import { ascending, descending } from 'd3-array'

import { DiffStyled, asDollars, compareChartOptions } from './utils'

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
    const sortFunc = this.state.sortBy === 'diff' ? descending : ascending
    const isLimitedMode = this.props.constrainedMode || this.props.compactMode
    const showRowCharts = !isLimitedMode
    const defaultVisibleRows = isLimitedMode ? 20 : Infinity

    // get list of all possible keys from both budgets
    const allKeys = set()
    keys(this.props.data[0]).forEach((key) => {
      allKeys.add(key)
    })
    keys(this.props.data[1]).forEach((key) => {
      allKeys.add(key)
    })

    const diffEntries = allKeys.values().map((key) => {
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
      const data = {
        labels: [''],
        datasets: [
          {
            data: [entry.value],
            label: this.props.years[0].fiscal_year_range,
            backgroundColor: this.props.colors[0]
          },
          {
            data: [entry.prev],
            label: this.props.years[1].fiscal_year_range,
            backgroundColor: this.props.colors[1]
          }
        ]
      }
      const chartOptions = {
        ...compareChartOptions,
        indexAxis: 'y',
        animation: false,
        normalized: true,
        maintainAspectRatio: false
      }

      return (
        <tr key={entry.key}>
          <td>
            <h4>
              {entry.key}
              {showRowCharts
                ? (
                  <Bar
                    data={data}
                    options={chartOptions}
                    height={40}
                    role='img'
                    aria-label={`Comparison chart for ${entry.key}`}
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
            Budget item differences and sort controls
          </caption>
          <thead>
            <tr>
              <th scope='col' colSpan='2' className='form-horizontal'>
                <div className='form-group'>
                  <label className='col-sm-3 col-sm-offset-6 control-label' htmlFor='diffSortControl'>sort by: </label>
                  <div className='col-sm-3'>
                    <select
                      className='form-control' id='diffSortControl'
                      value={this.state.sortBy} onChange={this.handleSortChange}
                    >
                      <option value='diff'>amount</option>
                      <option value='key'>name</option>
                    </select>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th scope='col'>Budget Item</th>
              <th scope='col'>Difference</th>
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
              Show all rows
            </button>
            )
          : null}
      </div>
    )
  }
}
