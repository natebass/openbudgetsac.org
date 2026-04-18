import axios from 'axios';

import {fetchBreakdownData, fetchTotals} from '../api';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('compare api', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('fetchBreakdownData filters rows by budget type and maps the selected dimension', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: [
          {budget_type: 1, department: 'Fire', total: '1200'},
          {budget_type: 2, department: 'Fire', total: '999'},
        ],
      } as any)
      .mockResolvedValueOnce({
        data: [
          {budget_type: 2, department: 'Police', total: '450'},
          {budget_type: 3, department: 'Police', total: '777'},
        ],
      } as any);

    const result = await fetchBreakdownData(
      ['FY25', 'FY24'],
      [1, 2],
      'spending',
      'department',
    );

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{Fire: 1200}, {Police: 450}]);
  });

  test('fetchTotals sorts newest fiscal years first', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [
        {fiscal_year_range: 'FY23', budget_type: 1, total: 100},
        {fiscal_year_range: 'FY25', budget_type: 3, total: 200},
        {fiscal_year_range: 'FY25', budget_type: 1, total: 300},
      ],
    } as any);

    const totals = await fetchTotals();

    expect(
      totals.map(item => `${item.fiscal_year_range}-${item.budget_type}`),
    ).toEqual(['FY25-1', 'FY25-3', 'FY23-1']);
  });

  test('fetchBreakdownData validates request shape, year format, and supported dimensions', async () => {
    await expect(
      fetchBreakdownData(['FY25'], [1, 2], 'spending', 'department'),
    ).rejects.toThrow('Invalid budget comparison request');
    await expect(
      fetchBreakdownData(['2025'] as any, [1] as any, 'spending', 'department'),
    ).rejects.toThrow('Invalid fiscal year format');
    await expect(
      fetchBreakdownData(
        ['FY25'] as any,
        [1] as any,
        'invalid' as any,
        'department',
      ),
    ).rejects.toThrow('Unsupported comparison dimension or type');
    await expect(
      fetchBreakdownData(
        ['FY25'] as any,
        [1] as any,
        'spending',
        'invalid' as any,
      ),
    ).rejects.toThrow('Unsupported comparison dimension or type');
  });

  test('fetchBreakdownData rejects unexpected payload shape and logs errors', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({data: {not: 'an array'}} as any)
      .mockResolvedValueOnce({data: []} as any);

    await expect(
      fetchBreakdownData(['FY25', 'FY24'], [1, 1], 'spending', 'department'),
    ).rejects.toThrow('Unexpected API response format');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch compare breakdown data',
      expect.any(Error),
    );
  });

  test('fetchBreakdownData ignores unsafe keys and coerces non-numeric totals to zero', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: [
          {budget_type: 1, account_category: '__proto__', total: 9999},
          {
            budget_type: 1,
            account_category: 'General',
            total: 'not-a-number',
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        data: [
          {budget_type: 2, account_category: 'Utilities', total: 321},
          {budget_type: 2, account_category: 'constructor', total: 777},
        ],
      } as any);

    const result = await fetchBreakdownData(
      ['FY25', 'FY24'],
      [1, 2],
      'spending',
      'category',
    );
    expect(result).toEqual([{General: 0}, {Utilities: 321}]);
  });

  test('fetchTotals throws on unexpected payload and logs the error', async () => {
    mockedAxios.get.mockResolvedValueOnce({data: {not: 'an array'}} as any);

    await expect(fetchTotals()).rejects.toThrow(
      'Unexpected totals response format',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch compare totals',
      expect.any(Error),
    );
  });

  test('fetchTotals handles equal sort indexes without reordering ties', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [
        {fiscal_year_range: 'FY25', budget_type: 1, total: 300},
        {fiscal_year_range: 'FY25', budget_type: 1, total: 200},
      ],
    } as any);

    const totals = await fetchTotals();
    expect(totals[0].total).toBe(300);
    expect(totals[1].total).toBe(200);
  });
});
