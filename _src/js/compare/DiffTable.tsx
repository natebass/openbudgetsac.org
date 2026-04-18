import React from 'react';
import {Bar} from 'react-chartjs-2';
import {t} from './i18n';
import type {BudgetBreakdownPair, DiffColors, SelectedYears} from './types';
import {
  asDollars,
  compareChartOptions,
  DiffStyled,
  getSortedBudgetKeys,
  translateDataLabel,
} from './utils';

/**
 * Runs compare desc.
 *
 * @param {any} left Input value.
 * @param {any} right Input value.
 * @returns {any} Function result.
 */
function compareDesc(left: number | string, right: number | string): number {
  if (left === right) {
    return 0;
  }
  return left > right ? -1 : 1;
}

/**
 * Runs compare asc.
 *
 * @param {any} left Input value.
 * @param {any} right Input value.
 * @returns {any} Function result.
 */
function compareAsc(left: number | string, right: number | string): number {
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}

interface DiffEntry {
  diff: number;
  key: string;
  prev: number | undefined;
  value: number | undefined;
}

/**
 * Builds build row chart data.
 *
 * @param {any} entry Input value.
 * @param {any} years Input value.
 * @param {any} colors Input value.
 * @returns {any} Function result.
 */
function buildRowChartData(
  entry: DiffEntry,
  years: SelectedYears,
  colors: Array<string>,
) {
  return {
    labels: [''],
    datasets: [
      {
        backgroundColor: colors[0],
        data: [entry.value ?? 0],
        label: years[0]?.fiscal_year_range ?? '',
      },
      {
        backgroundColor: colors[1],
        data: [entry.prev ?? 0],
        label: years[1]?.fiscal_year_range ?? '',
      },
    ],
  };
}

interface DiffTableProps {
  colors: Array<string>;
  compactMode?: boolean;
  constrainedMode?: boolean;
  data: BudgetBreakdownPair;
  diffColors: DiffColors;
  usePct: boolean;
  years: SelectedYears;
}

interface DiffTableState {
  showAllRows: boolean;
  sortBy: 'diff' | 'key';
}

export default class DiffTable extends React.Component<
  DiffTableProps,
  DiffTableState
> {
  /**
   * Runs constructor.
   *
   * @param {any} props Input value.
   * @returns {any} Function result.
   */
  constructor(props: DiffTableProps) {
    super(props);
    this.state = {
      showAllRows: false,
      sortBy: 'diff',
    };
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleShowAllRows = this.handleShowAllRows.bind(this);
  }

  /**
   * Runs handle sort change.
   *
   * @param {any} event Input value.
   * @returns {any} Function result.
   */
  handleSortChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    this.setState({sortBy: event.target.value as DiffTableState['sortBy']});
  }

  /**
   * Runs handle show all rows.
   *
   * @returns {any} Function result.
   */
  handleShowAllRows(): void {
    this.setState({showAllRows: true});
  }

  /**
   * Runs component did update.
   *
   * @param {any} prevProps Input value.
   * @returns {any} Function result.
   */
  componentDidUpdate(prevProps: DiffTableProps): void {
    const isLimitedMode = Boolean(
      this.props.compactMode || this.props.constrainedMode,
    );
    const wasLimitedMode = Boolean(
      prevProps.compactMode || prevProps.constrainedMode,
    );

    if (isLimitedMode && !wasLimitedMode && this.state.showAllRows) {
      this.setState({showAllRows: false});
    }
  }

  /**
   * Runs render.
   *
   * @returns {any} Function result.
   */
  render(): React.JSX.Element {
    const sortFunc = this.state.sortBy === 'diff' ? compareDesc : compareAsc;
    const isLimitedMode = Boolean(
      this.props.compactMode || this.props.constrainedMode,
    );
    const showRowCharts = !isLimitedMode;
    const defaultVisibleRows = isLimitedMode ? 20 : Number.POSITIVE_INFINITY;

    const diffEntries = getSortedBudgetKeys(this.props.data)
      .map<DiffEntry>(key => {
        const entry: DiffEntry = {
          diff: Number.POSITIVE_INFINITY,
          key,
          prev: this.props.data[1]?.[key],
          value: this.props.data[0]?.[key],
        };
        if (entry.prev !== undefined && entry.prev !== null) {
          entry.diff = (entry.value ?? 0) - entry.prev;
          if (this.props.usePct) {
            entry.diff = entry.diff / Math.abs(entry.prev);
          }
        }
        return entry;
      })
      .sort((left, right) =>
        sortFunc(left[this.state.sortBy], right[this.state.sortBy]),
      );

    const visibleEntries = this.state.showAllRows
      ? diffEntries
      : diffEntries.slice(0, defaultVisibleRows);

    const diffList = visibleEntries.map(entry => {
      const displayKey = translateDataLabel(entry.key);
      const data = buildRowChartData(
        entry,
        this.props.years,
        this.props.colors,
      );
      const chartOptions: any = {
        ...compareChartOptions,
        animation: false,
        indexAxis: 'y',
        normalized: true,
      };

      return (
        <tr key={entry.key}>
          <td>
            <h4>
              {displayKey}
              {showRowCharts ? (
                <Bar
                  data={data}
                  options={chartOptions}
                  height={40}
                  role='img'
                  aria-label={t('compare.chartAria.row', {item: displayKey})}
                />
              ) : (
                <small className='text-muted'>
                  {this.props.years[0]?.fiscal_year_range}:{' '}
                  {asDollars(entry.value ?? 0)}
                  {' | '}
                  {this.props.years[1]?.fiscal_year_range}:{' '}
                  {asDollars(entry.prev ?? 0)}
                </small>
              )}
            </h4>
          </td>
          <td>
            <DiffStyled
              diff={entry.diff}
              colors={this.props.diffColors}
              usePct={this.props.usePct}
            />
          </td>
        </tr>
      );
    });

    return (
      <div>
        <table className='table'>
          <caption className='sr-only'>{t('diffTable.caption')}</caption>
          <thead>
            <tr>
              <th scope='col' colSpan={2} className='form-horizontal'>
                <div className='form-group'>
                  <label
                    className='col-sm-3 col-sm-offset-6 control-label'
                    htmlFor='diffSortControl'
                  >
                    {t('diffTable.sortBy')}
                  </label>
                  <div className='col-sm-3'>
                    <select
                      className='form-control'
                      id='diffSortControl'
                      value={this.state.sortBy}
                      onChange={this.handleSortChange}
                    >
                      <option value='diff'>{t('diffTable.sortAmount')}</option>
                      <option value='key'>{t('diffTable.sortName')}</option>
                    </select>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th scope='col'>{t('diffTable.budgetItem')}</th>
              <th scope='col'>{t('diffTable.difference')}</th>
            </tr>
          </thead>
          <tbody>{diffList}</tbody>
        </table>
        {isLimitedMode &&
        diffEntries.length > defaultVisibleRows &&
        !this.state.showAllRows ? (
          <button
            type='button'
            className='btn btn-default'
            onClick={this.handleShowAllRows}
          >
            {t('diffTable.showAllRows')}
          </button>
        ) : null}
      </div>
    );
  }
}
