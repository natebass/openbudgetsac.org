import {render, screen} from '@testing-library/react';

import {DiffStyled, asDiff, getSortedBudgetKeys} from '../utils';

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

    expect(screen.getByText('+10.00%')).toHaveStyle({color: 'rgb(0, 128, 0)'});

    rerender(<DiffStyled diff={-250} colors={{pos: 'green', neg: 'red'}} usePct={false} />);
    expect(screen.getByText(/[−-]\$250/)).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });
});
