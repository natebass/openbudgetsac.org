import React from 'react'
import { render, screen } from '@testing-library/react'

import Total from '../Total.jsx'

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid='mock-bar' />
}))

describe('Total component', () => {
  const baseProps = {
    colors: ['#000', '#111'],
    diffColors: { pos: 'green', neg: 'red' }
  }

  test('shows loading state when totals are unavailable', () => {
    render(<Total {...baseProps} data={[]} usePct />)

    expect(screen.getByText('Loading totals...')).toBeInTheDocument()
  })

  test('renders total change and chart when totals are available', () => {
    render(
      <Total
        {...baseProps}
        usePct
        data={[
          { key: 'FY25', total: 1200 },
          { key: 'FY24', total: 1000 }
        ]}
      />
    )

    expect(screen.getByText(/Total Change:/)).toBeInTheDocument()
    expect(screen.getByText('+20.00%')).toBeInTheDocument()
    expect(screen.getByTestId('mock-bar')).toBeInTheDocument()
  })
})
