import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import {format} from 'd3-format';
import React from 'react';

import {t} from './i18n';
import type {BudgetBreakdownPair, DiffColors} from './types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const asTick = format('$,.1f');
export const asDollars = format('+$,');
export const asPct = format('+.2%');

export const BUDGET_TYPES: Record<number, string> = {
  1: 'Adopted',
  2: 'Adjusted',
  3: 'Proposed',
};

export /**
 * Runs translate data label.
 *
 * @param {any} label Input value.
 * @returns {any} Function result.
 */
function translateDataLabel(label: string): string {
  if (
    typeof window !== 'undefined' &&
    typeof window.obI18n?.translateLegacyText === 'function'
  ) {
    return window.obI18n.translateLegacyText(String(label));
  }
  return String(label);
}

export const compareChartOptions: any = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label;
          return `${label}: ${asTick(context.parsed.x / 1000000)}M`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        beginAtZero: true,
        callback: (value: number) => `${asTick(value / 1000000)}M`,
      },
    },
  },
};

export /**
 * Gets get sorted budget keys.
 *
 * @param {any} dataPair Input value.
 * @returns {any} Function result.
 */
function getSortedBudgetKeys(dataPair: BudgetBreakdownPair): Array<string> {
  const allKeys = new Set<string>();
  dataPair.forEach(record => {
    Object.keys(record ?? {}).forEach(key => {
      allKeys.add(key);
    });
  });
  return Array.from(allKeys).sort();
}

export /**
 * Runs as diff.
 *
 * @param {any} value Input value.
 * @param {any} usePct Input value.
 * @returns {any} Function result.
 */
function asDiff(value: number, usePct: boolean): string {
  if (value === Infinity) {
    return t('diff.newlyAdded');
  }
  return usePct ? asPct(value) : asDollars(value);
}

interface DiffStyledProps {
  colors: DiffColors;
  diff: number;
  usePct: boolean;
}

export class DiffStyled extends React.Component<DiffStyledProps> {
  /**
   * Runs render.
   *
   * @returns {any} Function result.
   */
  render(): React.JSX.Element {
    const style = {
      color:
        this.props.diff >= 0 ? this.props.colors.pos : this.props.colors.neg,
    };

    return (
      <span style={style}> {asDiff(this.props.diff, this.props.usePct)}</span>
    );
  }
}
