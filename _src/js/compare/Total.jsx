import React from "react";
import {Bar} from "react-chartjs-2";
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from "chart.js";
import {asTick, DiffStyled, parseDiff} from "./utils.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  indexAxis: "y",
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  scales: {
    x: {
      ticks: {
        beginAtZero: true,
        callback: value => `${asTick(value / 1000000)}M`
      },
    },
  },
  maintainAspectRatio: false,
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
};

const Total = ({selectedYears, colors, diffColors, changeType}) => {
  const diff = parseDiff(selectedYears, changeType)
  const data = {
    labels: ["Total"],
    datasets: selectedYears.map((entry, i) => {
      return {
        data: [entry.total],
        label: entry.label,
        backgroundColor: colors[i],
        barPercentage: 0.8,
        categoryPercentage: 1,
      };
    }),
  };

  return (
    <div>
      <h2 className="text-3xl">
        Total Change:
        <DiffStyled
          diff={diff}
          colors={diffColors}
          usePercent={changeType.value === "pct"}
        ></DiffStyled>
      </h2>
      <div className="h-[100px] w-full">
        <Bar data={data} options={chartOptions}/>
      </div>
    </div>
  );
};

export default Total;
