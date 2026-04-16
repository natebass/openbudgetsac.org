import {fireEvent, render, screen} from '@testing-library/react';

import DiffTable from '../DiffTable';

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid='mock-bar' />,
}));

describe('DiffTable component', () => {
  const makeData = (
    size: number,
  ): [{[key: string]: number}, {[key: string]: number}] => {
    const current: {[key: string]: number} = {};
    const previous: {[key: string]: number} = {};
    for (let index = 0; index < size; index += 1) {
      const key = `Dept-${String(index).padStart(2, '0')}`;
      current[key] = 100 + index;
      previous[key] = 50 + index;
    }
    return [current, previous];
  };

  const baseProps = {
    years: [
      {fiscal_year_range: 'FY25', budget_type: 1, total: 100},
      {fiscal_year_range: 'FY24', budget_type: 1, total: 0},
    ] as any,
    colors: ['#000', '#111'],
    diffColors: {pos: 'green', neg: 'red'},
  };

  afterEach(() => {
    delete window.obI18n;
  });

  test('treats previous zero values as existing data, not newly added', () => {
    window.obI18n = {
      translateLegacyText: value => (value === 'Fire' ? 'Bomberos' : value),
    };

    render(
      <DiffTable
        data={[{Fire: 100}, {Fire: 0}]}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
      />,
    );

    expect(screen.queryByText('Newly Added')).not.toBeInTheDocument();
    expect(screen.getByText('Bomberos')).toBeInTheDocument();
    expect(screen.getByText('+$100')).toBeInTheDocument();
  });

  test('uses row charts in normal mode and can sort by name', () => {
    render(
      <DiffTable
        data={[
          {Bravo: 200, Alpha: 100, Charlie: 350},
          {Bravo: 100, Alpha: 80, Charlie: 200},
        ]}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
      />,
    );

    expect(screen.getAllByTestId('mock-bar').length).toBeGreaterThan(0);
    const sortControl = screen.getByLabelText('sort by:') as HTMLSelectElement;
    fireEvent.change(sortControl, {target: {value: 'key'}});
    const firstBodyLabel =
      document.querySelector('tbody tr h4')?.textContent ?? '';
    expect(firstBodyLabel).toContain('Alpha');
  });

  test('shows fallback values when rows are missing in one selected year', () => {
    render(
      <DiffTable
        data={[{Libraries: 25}, {Parks: 10} as any]}
        years={[null, null]}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
        constrainedMode
      />,
    );

    expect(screen.getByText(': +$25 | : +$0')).toBeInTheDocument();
    expect(screen.getByText(': +$0 | : +$10')).toBeInTheDocument();
  });

  test('in limited mode shows fallback text, row cap, and show-all behavior', () => {
    const data = makeData(21);

    const {container} = render(
      <DiffTable
        data={data}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
        compactMode
      />,
    );

    expect(screen.queryByTestId('mock-bar')).not.toBeInTheDocument();
    expect(screen.getByText('FY25: +$100 | FY24: +$50')).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    const showAll = screen.getByRole('button', {name: 'Show all rows'});
    fireEvent.click(showAll);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(21);
    expect(
      screen.queryByRole('button', {name: 'Show all rows'}),
    ).not.toBeInTheDocument();
  });

  test('resets expanded state when re-entering limited mode', () => {
    const data = makeData(21);
    const {rerender, container} = render(
      <DiffTable
        data={data}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
        compactMode
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show all rows'}));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(21);

    rerender(
      <DiffTable
        data={data}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
        compactMode={false}
      />,
    );

    rerender(
      <DiffTable
        data={data}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct={false}
        compactMode
      />,
    );

    expect(
      screen.getByRole('button', {name: 'Show all rows'}),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
  });

  test('shows newly added for percentage mode when previous value is zero', () => {
    render(
      <DiffTable
        data={[{Fire: 120}, {Fire: 0}]}
        years={baseProps.years}
        colors={baseProps.colors}
        diffColors={baseProps.diffColors}
        usePct
      />,
    );

    expect(screen.getByText('Newly Added')).toBeInTheDocument();
  });
});
