import React from 'react';
import {Bar} from 'react-chartjs-2';
import {t} from './i18n';
import type {BudgetBreakdownPair, SelectedYears} from './types';
import {asTick, getSortedBudgetKeys, translateDataLabel} from './utils';

const chartOptions: any = {
  animation: false,
  normalized: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label;
          return `${label}: ${asTick(context.parsed.y / 1000000)}M`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
      },
    },
    y: {
      title: {
        display: true,
        text: t('trend.amountInMillions'),
      },
      ticks: {
        beginAtZero: true,
        callback: (value: number) => {
          const numberValue = (value / 1000000).toLocaleString('en');
          return `$${numberValue}M`;
        },
      },
    },
  },
};

interface TrendProps {
  colors: Array<string>;
  compactMode?: boolean;
  constrainedMode?: boolean;
  data: BudgetBreakdownPair;
  years: SelectedYears;
}

export default class Trend extends React.Component<TrendProps> {
  /**
   * Runs render.
   *
   * @returns {any} Function result.
   */
  render(): React.JSX.Element {
    const rawLabels = getSortedBudgetKeys(this.props.data);
    const labels = rawLabels.map(label => translateDataLabel(label));
    const datasets = this.props.data.map((record, index) => ({
      backgroundColor: this.props.colors[index],
      data: rawLabels.map(label => record[label] ?? 0),
      label: this.props.years[index]?.fiscal_year_range ?? '',
    }));

    const data = {labels, datasets};

    const responsiveChartOptions: any = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        tooltip: {
          ...chartOptions.plugins.tooltip,
          enabled: !this.props.constrainedMode,
        },
      },
      scales: {
        ...chartOptions.scales,
        x: {
          ...chartOptions.scales.x,
          ticks: {
            ...chartOptions.scales.x.ticks,
            autoSkip: Boolean(this.props.compactMode),
            maxTicksLimit: this.props.compactMode ? 8 : undefined,
          },
        },
      },
    };

    const chartRenderKey = [
      this.props.years[0]?.fiscal_year_range ?? '',
      this.props.years[1]?.fiscal_year_range ?? '',
      this.props.compactMode ? 'compact' : 'full',
      this.props.constrainedMode ? 'constrained' : 'normal',
    ].join(':');

    return (
      <Bar
        key={chartRenderKey}
        data={data}
        options={responsiveChartOptions}
        height={125}
        role='img'
        aria-label={t('compare.chartAria.trend')}
      />
    );
  }
}
