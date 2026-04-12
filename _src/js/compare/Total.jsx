import React from 'react'
import { Bar } from 'react-chartjs-2'
import { DiffStyled, compareChartOptions } from './utils'

export default class Total extends React.Component {
  /**
   * Renders totals and their computed difference.
   *
   * @returns {JSX.Element} Total chart panel.
   */
  render () {
    const totals = this.props.data
    if (!totals.length || totals.some(record => !record)) {
      return <div className='text-muted' role='status' aria-live='polite'>Loading totals...</div>
    }

    let diff = totals[0].total - totals[1].total
    if (this.props.usePct) {
      diff = diff / totals[1].total
    }

    const data = {
      labels: ['Total'],
      datasets: totals.map((entry, i) => {
        return {
          data: [entry.total],
          label: entry.key,
          backgroundColor: this.props.colors[i]
        }
      })
    }

    const totalChartOptions = {
      ...compareChartOptions,
      animation: false,
      normalized: true,
      maintainAspectRatio: false,
      plugins: {
        ...compareChartOptions.plugins,
        tooltip: {
          ...compareChartOptions.plugins.tooltip,
          enabled: !this.props.constrainedMode
        }
      }
    }
    const chartRenderKey = [
      totals[0] ? totals[0].key : '',
      totals[1] ? totals[1].key : '',
      this.props.constrainedMode ? 'constrained' : 'normal'
    ].join(':')

    return (
      <div>
        <h2>Total Change:
          <DiffStyled
            diff={diff} colors={this.props.diffColors} usePct={this.props.usePct}
          />
        </h2>
        <Bar
          key={chartRenderKey}
          data={data}
          height={25}
          options={{ ...totalChartOptions, indexAxis: 'y' }}
          role='img'
          aria-label='Comparison chart of total budget amounts by selected fiscal years'
        />
      </div>
    )
  }
}
