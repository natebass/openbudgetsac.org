import React from 'react';
import {fetchBreakdownData} from './api';
import DiffTable from './DiffTable';
import {t} from './i18n';
import Trend from './Trend';
import type {
  BreakdownDimension,
  BudgetBreakdownPair,
  BudgetDataType,
  DiffColors,
  SelectedYears,
} from './types';

/**
 * Runs are same years.
 *
 * @param {any} currentYears Input value.
 * @param {any} previousYears Input value.
 * @returns {any} Function result.
 */
function areSameYears(
  currentYears: SelectedYears,
  previousYears: SelectedYears,
): boolean {
  return currentYears.every((year, index) => {
    const previousYear = previousYears[index];
    if (!year && !previousYear) {
      return true;
    }
    if (!year || !previousYear) {
      return false;
    }
    return (
      year.fiscal_year_range === previousYear.fiscal_year_range &&
      String(year.budget_type) === String(previousYear.budget_type)
    );
  });
}

/**
 * Checks whether has complete years.
 *
 * @param {any} years Input value.
 * @returns {any} Function result.
 */
function hasCompleteYears(
  years: SelectedYears,
): years is [NonNullable<SelectedYears[0]>, NonNullable<SelectedYears[1]>] {
  return years.every(Boolean);
}

interface BreakdownProps {
  colors: Array<string>;
  compactMode: boolean;
  constrainedMode: boolean;
  diffColors: DiffColors;
  dimension: BreakdownDimension;
  type: BudgetDataType;
  usePct: boolean;
  years: SelectedYears;
}

interface BreakdownState {
  budgets: BudgetBreakdownPair;
  error: string | null;
  pending: boolean;
}

export default class Breakdown extends React.Component<
  BreakdownProps,
  BreakdownState
> {
  private activeFetchId = 0;

  /**
   * Runs constructor.
   *
   * @param {any} props Input value.
   * @returns {any} Function result.
   */
  constructor(props: BreakdownProps) {
    super(props);
    this.state = {
      budgets: [{}, {}],
      error: null,
      pending: true,
    };
    this.fetchData = this.fetchData.bind(this);
  }

  /**
   * Runs component did mount.
   *
   * @returns {any} Function result.
   */
  componentDidMount(): void {
    this.fetchData(this.props.years);
  }

  /**
   * Runs component did update.
   *
   * @param {any} prevProps Input value.
   * @returns {any} Function result.
   */
  componentDidUpdate(prevProps: BreakdownProps): void {
    if (
      !areSameYears(this.props.years, prevProps.years) ||
      this.props.type !== prevProps.type ||
      this.props.dimension !== prevProps.dimension
    ) {
      this.fetchData(this.props.years);
    }
  }

  /**
   * Gets fetch data.
   *
   * @param {any} years Input value.
   * @returns {any} Function result.
   */
  fetchData(years: SelectedYears): void {
    this.activeFetchId += 1;
    const currentFetchId = this.activeFetchId;
    this.setState({pending: true, error: null});

    if (!hasCompleteYears(years)) {
      return;
    }

    const yearNames = years.map(year => year.fiscal_year_range);
    const yearTypes = years.map(year => year.budget_type);
    void fetchBreakdownData(
      yearNames,
      yearTypes,
      this.props.type,
      this.props.dimension,
    )
      .then(budgets => {
        if (currentFetchId !== this.activeFetchId) {
          return;
        }
        this.setState({budgets, error: null, pending: false});
      })
      .catch(error => {
        if (currentFetchId !== this.activeFetchId) {
          return;
        }
        console.error('Failed loading comparison breakdown', error);
        this.setState({
          budgets: [{}, {}],
          error: t('error.breakdownUnavailable'),
          pending: false,
        });
      });
  }

  /**
   * Runs render.
   *
   * @returns {any} Function result.
   */
  render(): React.JSX.Element {
    if (this.state.pending) {
      return (
        <div className='text-muted' role='status' aria-live='polite'>
          {t('loading.breakdown')}
        </div>
      );
    }
    if (this.state.error) {
      return (
        <div className='alert alert-warning' role='alert'>
          {this.state.error}
        </div>
      );
    }

    return (
      <div>
        <Trend
          data={this.state.budgets}
          colors={this.props.colors}
          years={this.props.years}
          compactMode={this.props.compactMode}
          constrainedMode={this.props.constrainedMode}
        />
        <DiffTable
          data={this.state.budgets}
          years={this.props.years}
          colors={this.props.colors}
          diffColors={this.props.diffColors}
          usePct={this.props.usePct}
          compactMode={this.props.compactMode}
          constrainedMode={this.props.constrainedMode}
        />
      </div>
    );
  }
}
