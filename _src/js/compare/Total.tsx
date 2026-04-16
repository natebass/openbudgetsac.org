import React from 'react';
import {Bar} from 'react-chartjs-2';
import {t} from './i18n';
import type {BudgetTotalDisplay, DiffColors} from './types';
import {compareChartOptions, DiffStyled} from './utils';

interface TotalProps {
  colors: Array<string>;
  constrainedMode?: boolean;
  data: Array<BudgetTotalDisplay | undefined>;
  diffColors: DiffColors;
  usePct: boolean;
}

export default class Total extends React.Component<TotalProps> {
  /**
   * Runs render.
   *
   * @returns {any} Function result.
   */
  render(): React.JSX.Element {
    const totals = this.props.data;
    if (!totals.length || totals.some(record => !record)) {
      return (
        <div className='text-muted' role='status' aria-live='polite'>
          {t('loading.totals')}
        </div>
      );
    }

    const safeTotals = totals as [BudgetTotalDisplay, BudgetTotalDisplay];
    let diff = safeTotals[0].total - safeTotals[1].total;
    if (this.props.usePct) {
      diff = diff / safeTotals[1].total;
    }

    const data = {
      labels: ['Total'],
      datasets: safeTotals.map((entry, index) => ({
        backgroundColor: this.props.colors[index],
        data: [entry.total],
        label: entry.key,
      })),
    };

    const totalChartOptions: any = {
      ...compareChartOptions,
      animation: false,
      normalized: true,
      plugins: {
        ...compareChartOptions.plugins,
        tooltip: {
          ...compareChartOptions.plugins.tooltip,
          enabled: !this.props.constrainedMode,
        },
      },
    };

    const chartRenderKey = [
      safeTotals[0].key,
      safeTotals[1].key,
      this.props.constrainedMode ? 'constrained' : 'normal',
    ].join(':');

    return (
      <div>
        <h2>
          {t('compare.totalChange')}
          <DiffStyled
            diff={diff}
            colors={this.props.diffColors}
            usePct={this.props.usePct}
          />
        </h2>
        <Bar
          key={chartRenderKey}
          data={data}
          height={25}
          options={{...totalChartOptions, indexAxis: 'y'}}
          role='img'
          aria-label={t('compare.chartAria.total')}
        />
      </div>
    );
  }
}
