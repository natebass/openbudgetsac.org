import {render, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import {fetchBreakdownData} from '../../api';
import Breakdown from '../../Breakdown';
import DiffTable from '../../DiffTable';
import Total from '../../Total';

jest.mock('../../api', () => ({
  fetchBreakdownData: jest.fn(),
}));

jest.mock('../../Trend', () => {
  return function MockTrend() {
    return <div role='img' aria-label='Budget trend chart' />;
  };
});

jest.mock('react-chartjs-2', () => ({
  Bar: (props: any) => (
    <div
      data-testid='mock-bar'
      role={props.role ?? 'img'}
      aria-label={props['aria-label'] ?? 'chart'}
    />
  ),
}));

const mockFetchBreakdownData = fetchBreakdownData as jest.MockedFunction<
  typeof fetchBreakdownData
>;

describe('compare accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Total has no critical accessibility violations', async () => {
    const {container} = render(
      <Total
        colors={['#000', '#111']}
        diffColors={{pos: 'green', neg: 'red'}}
        usePct
        data={[
          {key: 'FY25', total: 1200},
          {key: 'FY24', total: 1000},
        ]}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('DiffTable has no critical accessibility violations', async () => {
    const {container} = render(
      <DiffTable
        data={[{Fire: 100}, {Fire: 90}]}
        years={[
          {fiscal_year_range: 'FY25', budget_type: 1, total: 100},
          {fiscal_year_range: 'FY24', budget_type: 1, total: 90},
        ]}
        colors={['#000', '#111']}
        diffColors={{pos: 'green', neg: 'red'}}
        usePct={false}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Breakdown states have no critical accessibility violations', async () => {
    mockFetchBreakdownData.mockResolvedValue([{Fire: 10}, {Fire: 8}]);

    const {container} = render(
      <Breakdown
        colors={['#000', '#111']}
        diffColors={{pos: 'green', neg: 'red'}}
        usePct
        years={[
          {fiscal_year_range: 'FY25', budget_type: 1, total: 100},
          {fiscal_year_range: 'FY24', budget_type: 1, total: 90},
        ]}
        type='spending'
        dimension='department'
        compactMode={false}
        constrainedMode={false}
      />,
    );

    await waitFor(() => {
      expect(mockFetchBreakdownData).toHaveBeenCalledTimes(1);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
