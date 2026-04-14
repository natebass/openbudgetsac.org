import { render, screen } from '@testing-library/react'

import DiffTable from '../DiffTable.jsx'

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid='mock-bar' />
}))

describe('DiffTable component', () => {
  afterEach(() => {
    delete window.obI18n
  })

  test('treats previous zero values as existing data, not newly added', () => {
    window.obI18n = {
      translateLegacyText: (value) => (value === 'Fire' ? 'Bomberos' : value)
    }

    render(
      <DiffTable
        data={[{ Fire: 100 }, { Fire: 0 }]}
        years={[
          { fiscal_year_range: 'FY25' },
          { fiscal_year_range: 'FY24' }
        ]}
        colors={['#000', '#111']}
        diffColors={{ pos: 'green', neg: 'red' }}
        usePct={false}
      />
    )

    expect(screen.queryByText('Newly Added')).not.toBeInTheDocument()
    expect(screen.getByText('Bomberos')).toBeInTheDocument()
    expect(screen.getByText('+$100')).toBeInTheDocument()
  })
})
