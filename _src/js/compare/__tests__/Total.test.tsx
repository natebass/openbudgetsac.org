import {render, screen} from '@testing-library/react';

import Total from '../Total';

const mockBar = jest.fn((props: any) => (
  <div data-testid='mock-bar' data-props={JSON.stringify(props)} />
));

jest.mock('react-chartjs-2', () => ({
  Bar: (props: any) => mockBar(props),
}));

describe('Total component', () => {
  const baseProps = {
    colors: ['#000', '#111'],
    diffColors: {pos: 'green', neg: 'red'},
  };

  beforeEach(() => {
    mockBar.mockClear();
  });

  test('shows loading state when totals are unavailable', () => {
    render(<Total {...baseProps} data={[]} usePct />);
    expect(screen.getByText('Loading totals...')).toBeInTheDocument();
  });

  test('shows loading state when one selected total is missing', () => {
    render(
      <Total
        {...baseProps}
        usePct
        data={[{key: 'FY25', total: 1200}, undefined]}
      />,
    );
    expect(screen.getByText('Loading totals...')).toBeInTheDocument();
  });

  test('renders total change and chart when totals are available', () => {
    render(
      <Total
        {...baseProps}
        usePct
        data={[
          {key: 'FY25', total: 1200},
          {key: 'FY24', total: 1000},
        ]}
      />,
    );

    expect(screen.getByText(/Total Change:/)).toBeInTheDocument();
    expect(screen.getByText('+20.00%')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar')).toBeInTheDocument();
    const barProps = mockBar.mock.calls[0]?.[0] as {
      options: {plugins: {tooltip: {enabled: boolean}}};
    };
    expect(barProps.options.plugins.tooltip.enabled).toBe(true);
  });

  test('renders dollar-mode change and disables tooltip when constrained', () => {
    render(
      <Total
        {...baseProps}
        usePct={false}
        constrainedMode
        data={[
          {key: 'FY25', total: 900},
          {key: 'FY24', total: 1000},
        ]}
      />,
    );

    expect(screen.getByText(/Total Change:/)).toBeInTheDocument();
    expect(screen.getByText(/[−-]\$100/)).toBeInTheDocument();
    const barProps = mockBar.mock.calls[0]?.[0] as {
      options: {plugins: {tooltip: {enabled: boolean}}};
    };
    expect(barProps.options.plugins.tooltip.enabled).toBe(false);
  });
});
