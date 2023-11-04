import React from "react"
import {Bar} from "react-chartjs-2"
import {keys, set} from "d3-collection"
import {asTick} from "./utils.jsx"

const verticalChartOptions = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: context => `${context.dataset.label}: ${asTick(context.raw / 1000000)}M`
      },
    }
  }
}

const Trend = ({data, years, colors}) => {
  const allKeys = set()
  keys(data[0]).forEach(key => allKeys.add(key))
  keys(data[1]).forEach(key => allKeys.add(key))
  const labels = allKeys.values().sort()
  const datasets = data.map((record, index) => {
    return {
      label: years[index].value,
      data: labels.map(label => record[label]),
      backgroundColor: colors[index],
    }
  })
  return <Bar options={verticalChartOptions} data={{labels, datasets}} height={125}></Bar>
}

export default Trend