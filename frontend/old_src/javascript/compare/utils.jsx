import React from "react"
import { format } from "d3-format"

export const asTick = format("$,.1f")

export const asDollars = format("+$,")

export const asPct = format("+.2%")

export const BUDGET_TYPES = {
  '1': 'Adopted',
  '2': 'Adjusted',
  '3': 'Proposed',
}

export const horizontalChartOptions = {
  indexAxis: "y",
  scales: {
    x: {
      ticks: {
        beginAtZero: true,
        callback: value => `${asTick(value / 1000000)}M`
      },
    },
  },
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: context => `${context.dataset.label}: ${asDecimalTick(context.raw / 1000000)}M`
      },
    }
  }
}

export function asDiff(value, usePct) {
  // special handling for sentinel values
  switch (value) {
    case Infinity:
      return "Newly Added"
    default:
      // otherwise, choose the appropriate formatting.
      if (usePct) {
        return asPct(value)
      } else {
        return asDollars(value)
      }
  }
}


export function DiffStyled({diff, colors, usePercent}) {
  const style = {color: diff >= 0 ? colors.pos : colors.neg}
  return (
    <span style={style}> {asDiff(diff, usePercent)}</span>
  )
}

export function parseDiff(selectedYears, changeType) {
  let difference = selectedYears[0].total - selectedYears[1].total
  if (changeType.value === "pct") {
    difference = difference / selectedYears[1].total
  }
  return difference
}