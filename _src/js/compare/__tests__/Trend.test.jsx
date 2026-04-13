import { render, screen } from '@testing-library/react'

import Trend from '../Trend.jsx'

const mockBar = jest.fn(() => <div data-testid='mock-bar' />)

jest.mock('react-chartjs-2', () => ({
  Bar: (props) => mockBar(props)
}))

describe('Trend component', () => {
  beforeEach(() => {
    mockBar.mockClear()
  })

  test('does not disable chart aspect ratio maintenance', () => {
    render(
      <Trend
        data={[{ Fire: 1200 }, { Fire: 1000 }]}
        years={[
          { fiscal_year_range: 'FY25' },
          { fiscal_year_range: 'FY24' }
        ]}
        colors={['#000', '#111']}
        compactMode={false}
        constrainedMode={false}
      />
    )

    expect(screen.getByTestId('mock-bar')).toBeInTheDocument()
    expect(mockBar).toHaveBeenCalledTimes(1)
    const props = mockBar.mock.calls[0][0]
    expect(props.options.maintainAspectRatio).not.toBe(false)
  })
})
