import React from 'react'
import { Bar } from 'react-chartjs-2'

import { asTick, getSortedBudgetKeys, translateDataLabel } from './utils.jsx'
import { t } from './i18n.js'

const chartOpts = {
  animation: false,
  normalized: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          // Show values as currency in millions.
          const label = context.dataset.label
          return `${label}: ${asTick(context.parsed.y / 1000000)}M`
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false
      }
    },
    y: {
      title: {
        display: true,
        text: t('trend.amountInMillions')
      },
      ticks: {
        beginAtZero: true,
        callback: (value) => {
          // Show values as currency in millions.
          const num = (value / 1000000).toLocaleString('en')
          return `$${num}M`
        }
      }
    }
  }
}

export default class Trend extends React.Component {
  /**
   * Renders a two-year grouped bar chart.
   *
   * @returns {JSX.Element} Trend chart component.
   */
  render () {
    const rawLabels = getSortedBudgetKeys(this.props.data)
    const labels = rawLabels.map((label) => translateDataLabel(label))
    const datasets = this.props.data.map((record, i) => {
      return {
        label: this.props.years[i].fiscal_year_range,
        data: rawLabels.map(label => record[label]),
        backgroundColor: this.props.colors[i]
      }
    })
    const data = { labels, datasets }

    const responsiveChartOptions = {
      ...chartOpts,
      plugins: {
        ...chartOpts.plugins,
        tooltip: {
          ...chartOpts.plugins.tooltip,
          enabled: !this.props.constrainedMode
        }
      },
      scales: {
        ...chartOpts.scales,
        x: {
          ...chartOpts.scales.x,
          ticks: {
            ...chartOpts.scales.x.ticks,
            autoSkip: this.props.compactMode,
            maxTicksLimit: this.props.compactMode ? 8 : undefined
          }
        }
      }
    }
    const chartRenderKey = [
      this.props.years[0] ? this.props.years[0].fiscal_year_range : '',
      this.props.years[1] ? this.props.years[1].fiscal_year_range : '',
      this.props.compactMode ? 'compact' : 'full',
      this.props.constrainedMode ? 'constrained' : 'normal'
    ].join(':')

    return (
      <Bar
        key={chartRenderKey}
        data={data}
        options={responsiveChartOptions}
        height={125}
        role='img'
        aria-label={t('compare.chartAria.trend')}
      />
    )
  }
}
