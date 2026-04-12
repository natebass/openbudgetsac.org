import axios from 'axios'

import { fetchBreakdownData, fetchTotals } from '../api.js'

jest.mock('axios', () => ({
  get: jest.fn(),
  all: jest.fn((promises) => Promise.all(promises)),
  spread: jest.fn((spreader) => (responses) => spreader(...responses))
}))

describe('compare api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetchBreakdownData filters rows by budget type and maps selected dimension', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: [
          { budget_type: 1, department: 'Fire', total: '1200' },
          { budget_type: 2, department: 'Fire', total: '999' }
        ]
      })
      .mockResolvedValueOnce({
        data: [
          { budget_type: 2, department: 'Police', total: '450' },
          { budget_type: 3, department: 'Police', total: '777' }
        ]
      })

    const result = await fetchBreakdownData(['FY25', 'FY24'], [1, 2], 'spending', 'department')

    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(result).toEqual([{ Fire: 1200 }, { Police: 450 }])
  })

  test('fetchTotals sorts newest fiscal years first', async () => {
    axios.get.mockResolvedValue({
      data: [
        { fiscal_year_range: 'FY23', budget_type: 1, total: 100 },
        { fiscal_year_range: 'FY25', budget_type: 3, total: 200 },
        { fiscal_year_range: 'FY25', budget_type: 1, total: 300 }
      ]
    })

    const totals = await fetchTotals()

    expect(totals.map((item) => `${item.fiscal_year_range}-${item.budget_type}`)).toEqual([
      'FY25-1',
      'FY25-3',
      'FY23-1'
    ])
  })
})
