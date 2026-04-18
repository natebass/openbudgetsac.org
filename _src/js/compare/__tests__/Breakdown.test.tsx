import {render, screen, waitFor} from '@testing-library/react';
import {fetchBreakdownData} from '../api';
import Breakdown from '../Breakdown';

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

const mockFetchBreakdownData = fetchBreakdownData as jest.MockedFunction<
  typeof fetchBreakdownData
>;

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

  test('renders an error banner when breakdown fetch fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFetchBreakdownData.mockRejectedValue(new Error('network down'));

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
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Unable to load this breakdown right now. Try selecting a different year pair or refreshing the page.',
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('refetches when year pairs change and ignores stale responses', async () => {
    let resolveFirst!: (value: [{Fire: number}, {Fire: number}]) => void;
    let rejectFirst!: (reason: Error) => void;
    const firstRequest = new Promise<[{Fire: number}, {Fire: number}]>(
      (resolve, reject) => {
        resolveFirst = resolve;
        rejectFirst = reject;
      },
    );
    const secondRequest = Promise.resolve<[{Fire: number}, {Fire: number}]>([
      {Fire: 22},
      {Fire: 11},
    ]);
    mockFetchBreakdownData
      .mockReturnValueOnce(firstRequest)
      .mockReturnValueOnce(secondRequest);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const {rerender} = render(
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

    rerender(
      <Breakdown
        colors={['#000', '#111']}
        diffColors={{pos: 'green', neg: 'red'}}
        usePct
        years={[
          {fiscal_year_range: 'FY26', budget_type: 2, total: 110},
          {fiscal_year_range: 'FY25', budget_type: 1, total: 100},
        ]}
        type='spending'
        dimension='department'
        compactMode={false}
        constrainedMode={false}
      />,
    );

    await waitFor(() => {
      expect(mockFetchBreakdownData).toHaveBeenCalledTimes(2);
    });

    rejectFirst(new Error('stale fetch'));
    resolveFirst([{Fire: 50}, {Fire: 40}]);

    await waitFor(() => {
      expect(screen.getByTestId('trend')).toBeInTheDocument();
      expect(screen.getByTestId('diff-table')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      'Failed loading comparison breakdown',
      expect.objectContaining({message: 'stale fetch'}),
    );
    consoleErrorSpy.mockRestore();
  });
});
