import {render, screen} from '@testing-library/react';

import Trend from '../Trend';

const mockBar = jest.fn((props: any) => <div data-testid='mock-bar' data-options={JSON.stringify(props.options)} />);

jest.mock('react-chartjs-2', () => ({
  Bar: (props: any) => mockBar(props),
}));

describe('Trend component', () => {
  beforeEach(() => {
    mockBar.mockClear();
  });

  test('does not disable chart aspect ratio maintenance', () => {
    render(
      <Trend
        data={[{Fire: 1200}, {Fire: 1000}]}
        years={[
          {fiscal_year_range: 'FY25', budget_type: 1, total: 1200},
          {fiscal_year_range: 'FY24', budget_type: 1, total: 1000},
        ]}
        colors={['#000', '#111']}
        compactMode={false}
        constrainedMode={false}
      />,
    );

    expect(screen.getByTestId('mock-bar')).toBeInTheDocument();
    expect(mockBar).toHaveBeenCalledTimes(1);
    const props = mockBar.mock.calls[0]?.[0] as {options: {maintainAspectRatio?: boolean}};
    expect(props.options.maintainAspectRatio).not.toBe(false);
  });
});
