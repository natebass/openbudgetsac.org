import React from 'react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js'
import { format } from 'd3-format'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export const asTick = format('$,.1f')

export const asDollars = format('+$,')

export const asPct = format('+.2%')

export const BUDGET_TYPES = {
  1: 'Adopted',
  2: 'Adjusted',
  3: 'Proposed'
}

export const compareChartOptions = {
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label
          return `${label}: ${asTick(context.parsed.x / 1000000)}M`
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        beginAtZero: true,
        callback: (value) => {
          // display as currency in millions
          return `${asTick(value / 1000000)}M`
        }
      }
    }
  }
}

/**
 * Formats a numeric diff as either percentage or dollars.
 *
 * @param {number} value Diff value.
 * @param {boolean} usePct When true, format as percentage.
 * @returns {string} Human-readable difference string.
 */
export function asDiff (value, usePct) {
  // special handling for sentinel values
  switch (value) {
    case Infinity:
      return 'Newly Added'
    default:
      break
  }

  // otherwise choose the appropriate formatting
  if (usePct) {
    return asPct(value)
  }

  return asDollars(value)
}

export class DiffStyled extends React.Component {
  /**
   * Renders a colorized diff value.
   *
   * @returns {JSX.Element} Styled diff span.
   */
  render () {
    const style = {
      color: this.props.diff >= 0 ? this.props.colors.pos : this.props.colors.neg
    }

    return <span style={style}> {asDiff(this.props.diff, this.props.usePct)}</span>
  }
}
