import { render, screen, waitFor } from '@testing-library/react'

import Breakdown from '../Breakdown.jsx'
import { fetchBreakdownData } from '../api.js'

jest.mock('../api.js', () => ({
  fetchBreakdownData: jest.fn()
}))

jest.mock('../Trend.jsx', () => {
  return function MockTrend () {
    return <div data-testid='trend' />
  }
})

jest.mock('../DiffTable.jsx', () => {
  return function MockDiffTable () {
    return <div data-testid='diff-table' />
  }
})

describe('Breakdown component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('stays pending when year objects are incomplete', () => {
    render(
      <Breakdown
        colors={['#000', '#111']}
        diffColors={{ pos: 'green', neg: 'red' }}
        usePct
        years={[null, null]}
        type='spending'
        dimension='department'
      />
    )

    expect(fetchBreakdownData).not.toHaveBeenCalled()
    expect(screen.getByText('Loading breakdown...')).toBeInTheDocument()
  })

  test('loads and renders chart/table children when data resolves', async () => {
    fetchBreakdownData.mockResolvedValue([{ Fire: 10 }, { Fire: 8 }])

    render(
      <Breakdown
        colors={['#000', '#111']}
        diffColors={{ pos: 'green', neg: 'red' }}
        usePct
        years={[
          { fiscal_year_range: 'FY25', budget_type: 1 },
          { fiscal_year_range: 'FY24', budget_type: 1 }
        ]}
        type='spending'
        dimension='department'
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('trend')).toBeInTheDocument()
      expect(screen.getByTestId('diff-table')).toBeInTheDocument()
    })
  })
})
