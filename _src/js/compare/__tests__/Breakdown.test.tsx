import {render, screen, waitFor} from '@testing-library/react';

import Breakdown from '../Breakdown';
import {fetchBreakdownData} from '../api';

jest.mock('../api', () => ({
  fetchBreakdownData: jest.fn(),
}));

jest.mock('../Trend', () => {
  return function MockTrend() {
    return <div data-testid='trend' />;
  };
});

jest.mock('../DiffTable', () => {
  return function MockDiffTable() {
    return <div data-testid='diff-table' />;
  };
});

const mockFetchBreakdownData = fetchBreakdownData as jest.MockedFunction<typeof fetchBreakdownData>;

describe('Breakdown component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('stays pending when year objects are incomplete', () => {
    render(
      <Breakdown
        colors={['#000', '#111']}
        diffColors={{pos: 'green', neg: 'red'}}
        usePct
        years={[null, null]}
        type='spending'
        dimension='department'
        compactMode={false}
        constrainedMode={false}
      />,
    );

    expect(mockFetchBreakdownData).not.toHaveBeenCalled();
    expect(screen.getByText('Loading breakdown...')).toBeInTheDocument();
  });

  test('loads and renders chart and table children when data resolves', async () => {
    mockFetchBreakdownData.mockResolvedValue([{Fire: 10}, {Fire: 8}]);

    render(
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
      expect(screen.getByTestId('trend')).toBeInTheDocument();
      expect(screen.getByTestId('diff-table')).toBeInTheDocument();
    });
  });
});
