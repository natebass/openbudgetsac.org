import {render, screen} from '@testing-library/react';

import {
  asDiff,
  compareChartOptions,
  DiffStyled,
  getSortedBudgetKeys,
  translateDataLabel,
} from '../utils';

describe('compare utils', () => {
  test('asDiff handles sentinel values', () => {
    expect(asDiff(Infinity, true)).toBe('Newly Added');
  });

  test('asDiff formats percentage and dollar values', () => {
    expect(asDiff(0.125, true)).toBe('+12.50%');
    expect(asDiff(1250, false)).toBe('+$1,250');
  });

  test('getSortedBudgetKeys merges and sorts keys from both records', () => {
    expect(
      getSortedBudgetKeys([
        {Fire: 100, Police: 90},
        {Water: 30, Fire: 80},
      ]),
    ).toEqual(['Fire', 'Police', 'Water']);
  });

  test('DiffStyled applies positive and negative colors', () => {
    const {rerender} = render(
      <DiffStyled diff={0.1} colors={{pos: 'green', neg: 'red'}} usePct />,
    );

    expect(screen.getByText('+10.00%')).toHaveStyle({
      color: 'rgb(0, 128, 0)',
    });

    rerender(
      <DiffStyled
        diff={-250}
        colors={{pos: 'green', neg: 'red'}}
        usePct={false}
      />,
    );
    expect(screen.getByText(/[−-]\$250/)).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    });
  });

  test('translateDataLabel uses runtime translator when present', () => {
    window.obI18n = {
      translateLegacyText: value => (value === 'Parks' ? 'Parques' : value),
    };

    expect(translateDataLabel('Parks')).toBe('Parques');
    delete window.obI18n;
    expect(translateDataLabel('Police')).toBe('Police');
  });

  test('chart callbacks format tooltip and x-axis labels in millions', () => {
    const tooltipLabel = compareChartOptions.plugins.tooltip.callbacks.label({
      dataset: {label: 'FY25'},
      parsed: {x: 125000000},
    });
    const xTickLabel = compareChartOptions.scales.x.ticks.callback(340000000);

    expect(tooltipLabel).toBe('FY25: $125.0M');
    expect(xTickLabel).toBe('$340.0M');
  });
});
