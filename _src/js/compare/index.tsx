import {schemeSet2 as colors} from 'd3-scale-chromatic';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Select, {type SingleValue} from 'react-select';
import {fetchTotals} from './api';
import Breakdown from './Breakdown';
import {t} from './i18n';
import Total from './Total';
import type {
  BreakdownKey,
  BreakdownView,
  BudgetOption,
  BudgetRecord,
  BudgetTotalDisplay,
  DiffColors,
  SelectedYears,
} from './types';

const BUDGET_TYPE_LABEL_KEYS: Record<number, string> = {
  1: 'budgetType.adopted',
  2: 'budgetType.adjusted',
  3: 'budgetType.proposed',
};

const BREAKDOWNS: Array<BreakdownView> = [
  {
    key: 'spendDept',
    labelKey: 'compare.breakdowns.spendDept',
    type: 'spending',
    dimension: 'department',
  },
  {
    key: 'spendCat',
    labelKey: 'compare.breakdowns.spendCat',
    type: 'spending',
    dimension: 'category',
  },
  {
    key: 'revDept',
    labelKey: 'compare.breakdowns.revDept',
    type: 'revenue',
    dimension: 'department',
  },
  {
    key: 'revCat',
    labelKey: 'compare.breakdowns.revCat',
    type: 'revenue',
    dimension: 'category',
  },
];

const MOBILE_WIDTH_MAX = 767;
const LOW_MEMORY_DEVICE_MAX_GB = 2;
const headingStyles = [{color: colors[0]}, {color: colors[1]}];
const diffColors: DiffColors = {
  neg: '#e41a1c',
  pos: '#4daf4a',
};

/**
 * Gets get connection.
 *
 * @returns {any} Function result.
 */
function getConnection(): NetworkInformation | null {
  if (typeof navigator === 'undefined') {
    return null;
  }
  return (
    navigator.connection ??
    navigator.mozConnection ??
    navigator.webkitConnection ??
    null
  );
}

/**
 * Builds derive performance flags.
 *
 * @returns {any} Function result.
 */
function derivePerformanceFlags(): {
  compactMode: boolean;
  constrainedMode: boolean;
} {
  if (typeof window === 'undefined') {
    return {compactMode: false, constrainedMode: false};
  }

  const connection = getConnection();
  const effectiveType = String(connection?.effectiveType ?? '').toLowerCase();
  const lowBandwidthConnection = Boolean(
    connection?.saveData ||
      effectiveType.includes('slow-2g') ||
      effectiveType.includes('2g') ||
      effectiveType.includes('3g'),
  );
  const lowMemoryDevice =
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= LOW_MEMORY_DEVICE_MAX_GB;
  const compactMode = window.innerWidth <= MOBILE_WIDTH_MAX;
  const constrainedMode =
    compactMode && (lowBandwidthConnection || lowMemoryDevice);

  return {compactMode, constrainedMode};
}

/**
 * Gets get budget option.
 *
 * @param {any} record Input value.
 * @param {any} index Input value.
 * @returns {any} Function result.
 */
function getBudgetOption(record: BudgetRecord, index: number): BudgetOption {
  const labelKey =
    BUDGET_TYPE_LABEL_KEYS[Number(record.budget_type)] ??
    BUDGET_TYPE_LABEL_KEYS[1];
  return {
    value: index,
    label: `${record.fiscal_year_range} ${t(labelKey)}`,
  };
}

/**
 * Gets get budget defaults.
 *
 * @param {any} budgets Input value.
 * @returns {any} Function result.
 */
function getBudgetDefaults(
  budgets: Array<BudgetOption>,
): [BudgetOption | null, BudgetOption | null] {
  if (!budgets.length) {
    return [null, null];
  }
  if (budgets.length === 1) {
    return [budgets[0], budgets[0]];
  }
  return [budgets[0], budgets[1]];
}

/**
 * Builds format totals.
 *
 * @param {any} selectedYears Input value.
 * @returns {any} Function result.
 */
function formatTotals(
  selectedYears: SelectedYears,
): Array<BudgetTotalDisplay | undefined> {
  return selectedYears.map(record => {
    if (!record) {
      return undefined;
    }
    return {
      key: record.fiscal_year_range,
      total: record.total,
    };
  });
}

interface CompareState {
  activeBreakdown: BreakdownKey;
  budget1: BudgetRecord | null;
  budget1Choice: number | null;
  budget1Options: Array<BudgetOption>;
  budget2: BudgetRecord | null;
  budget2Choice: number | null;
  budget2Options: Array<BudgetOption>;
  budgetChoices: Array<BudgetOption>;
  changeType: 'pct' | 'usd';
  compactMode: boolean;
  constrainedMode: boolean;
  error: string | null;
  loading: boolean;
  totals: Array<BudgetRecord>;
}

class Compare extends React.Component<Record<string, never>, CompareState> {
  private connection: NetworkInformation | null = null;
  private resizeHandler?: () => void;
  private resizeRaf: number | null = null;

  /**
   * Runs constructor.
   *
   * @param {any} props Input value.
   * @returns {any} Function result.
   */
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      activeBreakdown: 'spendDept',
      budget1: null,
      budget1Choice: null,
      budget1Options: [],
      budget2: null,
      budget2Choice: null,
      budget2Options: [],
      budgetChoices: [],
      changeType: 'pct',
      compactMode: false,
      constrainedMode: false,
      error: null,
      loading: true,
      totals: [],
    };
    this.applyPerformanceFlags = this.applyPerformanceFlags.bind(this);
    this.handleBreakdownSelect = this.handleBreakdownSelect.bind(this);
    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleSelectBudget = this.handleSelectBudget.bind(this);
    this.handleSelectBudget1 = this.handleSelectBudget1.bind(this);
    this.handleSelectBudget2 = this.handleSelectBudget2.bind(this);
    this.scheduleApplyPerformanceFlags =
      this.scheduleApplyPerformanceFlags.bind(this);
  }

  /**
   * Runs component did mount.
   *
   * @returns {any} Function result.
   */
  componentDidMount(): void {
    this.applyPerformanceFlags();
    this.resizeHandler = this.scheduleApplyPerformanceFlags;
    window.addEventListener('resize', this.resizeHandler, {passive: true});
    this.connection = getConnection();
    if (
      this.connection &&
      typeof this.connection.addEventListener === 'function'
    ) {
      this.connection.addEventListener('change', this.resizeHandler);
    }

    void fetchTotals()
      .then(totals => {
        const budgetChoices = totals.map(getBudgetOption);
        const defaultChoices = getBudgetDefaults(budgetChoices);
        if (!defaultChoices[0] || !defaultChoices[1]) {
          this.setState({error: t('error.noBudgetYears'), loading: false});
          return;
        }

        const budget1Choice = defaultChoices[0].value;
        const budget2Choice = defaultChoices[1].value;
        const budget1Options = budgetChoices.filter(
          option => option.value !== budget2Choice,
        );
        const budget2Options = budgetChoices.filter(
          option => option.value !== budget1Choice,
        );

        this.setState({
          budget1: totals[budget1Choice],
          budget1Choice,
          budget1Options,
          budget2: totals[budget2Choice],
          budget2Choice,
          budget2Options,
          budgetChoices,
          error: null,
          loading: false,
          totals,
        });
      })
      .catch(error => {
        console.error('Failed loading compare totals', error);
        this.setState({
          error: t('error.compareDataUnavailable'),
          loading: false,
        });
      });
  }

  /**
   * Runs component will unmount.
   *
   * @returns {any} Function result.
   */
  componentWillUnmount(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (
      this.connection &&
      this.resizeHandler &&
      typeof this.connection.removeEventListener === 'function'
    ) {
      this.connection.removeEventListener('change', this.resizeHandler);
    }
    if (this.resizeRaf) {
      window.cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = null;
    }
  }

  /**
   * Sets apply performance flags.
   *
   * @returns {any} Function result.
   */
  applyPerformanceFlags(): void {
    const nextFlags = derivePerformanceFlags();
    if (
      nextFlags.compactMode === this.state.compactMode &&
      nextFlags.constrainedMode === this.state.constrainedMode
    ) {
      return;
    }
    this.setState(nextFlags);
  }

  /**
   * Runs schedule apply performance flags.
   *
   * @returns {any} Function result.
   */
  scheduleApplyPerformanceFlags(): void {
    if (this.resizeRaf) {
      return;
    }
    this.resizeRaf = window.requestAnimationFrame(() => {
      this.resizeRaf = null;
      this.applyPerformanceFlags();
    });
  }

  /**
   * Runs handle change type.
   *
   * @param {any} event Input value.
   * @returns {any} Function result.
   */
  handleChangeType(event: React.ChangeEvent<HTMLSelectElement>): void {
    this.setState({
      changeType: event.target.value as CompareState['changeType'],
    });
  }

  /**
   * Runs handle select budget1.
   *
   * @param {any} option Input value.
   * @returns {any} Function result.
   */
  handleSelectBudget1(option: SingleValue<BudgetOption>): void {
    if (option) {
      this.handleSelectBudget('budget1', 'budget2', option.value);
    }
  }

  /**
   * Runs handle select budget2.
   *
   * @param {any} option Input value.
   * @returns {any} Function result.
   */
  handleSelectBudget2(option: SingleValue<BudgetOption>): void {
    if (option) {
      this.handleSelectBudget('budget2', 'budget1', option.value);
    }
  }

  /**
   * Runs handle breakdown select.
   *
   * @param {any} key Input value.
   * @returns {any} Function result.
   */
  handleBreakdownSelect(key: BreakdownKey): void {
    if (this.state.activeBreakdown === key) {
      return;
    }
    this.setState({activeBreakdown: key});
  }

  /**
   * Runs handle select budget.
   *
   * @param {any} key Input value.
   * @param {any} otherKey Input value.
   * @param {any} index Input value.
   * @returns {any} Function result.
   */
  handleSelectBudget(
    key: 'budget1' | 'budget2',
    otherKey: 'budget1' | 'budget2',
    index: number,
  ): void {
    const selectedChoiceKey = `${key}Choice` as
      | 'budget1Choice'
      | 'budget2Choice';
    const otherOptionsKey = `${otherKey}Options` as
      | 'budget1Options'
      | 'budget2Options';

    if (this.state[selectedChoiceKey] === index) {
      return;
    }

    const otherBudgetOptions = this.state.budgetChoices.filter(
      option => option.value !== index,
    );
    this.setState({
      [key]: this.state.totals[index],
      [selectedChoiceKey]: index,
      [otherOptionsKey]: otherBudgetOptions,
    } as Pick<
      CompareState,
      | 'budget1'
      | 'budget2'
      | 'budget1Choice'
      | 'budget2Choice'
      | 'budget1Options'
      | 'budget2Options'
    >);
  }

  /**
   * Runs render.
   *
   * @returns {any} Function result.
   */
  render(): React.JSX.Element {
    if (this.state.loading) {
      return (
        <div className='text-muted' role='status' aria-live='polite'>
          {t('loading.comparisonData')}
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

    const usePct = this.state.changeType === 'pct';
    const budget1Selected =
      this.state.budgetChoices.find(
        option => option.value === this.state.budget1Choice,
      ) ?? null;
    const budget2Selected =
      this.state.budgetChoices.find(
        option => option.value === this.state.budget2Choice,
      ) ?? null;
    const selectedYears: SelectedYears = [
      this.state.budget1,
      this.state.budget2,
    ];
    const totals = formatTotals(selectedYears);
    const breakdowns = BREAKDOWNS.map(item => ({
      ...item,
      label: t(item.labelKey ?? ''),
    }));
    const activeBreakdown =
      breakdowns.find(item => item.key === this.state.activeBreakdown) ??
      breakdowns[0];

    return (
      <div className='compare-app'>
        {this.state.constrainedMode ? (
          <p className='text-muted small'>{t('mode.lowBandwidth')}</p>
        ) : null}
        <div className='row'>
          <div className='col-sm-10'>
            <h1 className='compare-title'>
              <span className='compare-title__label'>
                {t('compare.title.compare')}
              </span>
              <span
                style={headingStyles[0]}
                className='choose-budget compare-title__budget'
              >
                <span id='compareBudgetYearALabel' className='sr-only'>
                  {t('compare.budgetYear.first')}
                </span>
                <Select<BudgetOption, false>
                  options={this.state.budget1Options}
                  value={budget1Selected}
                  onChange={this.handleSelectBudget1}
                  inputId='compareBudgetYearA'
                  aria-labelledby='compareBudgetYearALabel'
                  aria-label={t('compare.budgetYear.selectFirst')}
                  isSearchable={false}
                  isClearable={false}
                />
              </span>{' '}
              <span className='compare-title__connector'>
                {t('compare.title.with')}
              </span>{' '}
              <span
                style={headingStyles[1]}
                className='choose-budget compare-title__budget'
              >
                <span id='compareBudgetYearBLabel' className='sr-only'>
                  {t('compare.budgetYear.second')}
                </span>
                <Select<BudgetOption, false>
                  options={this.state.budget2Options}
                  value={budget2Selected}
                  onChange={this.handleSelectBudget2}
                  inputId='compareBudgetYearB'
                  aria-labelledby='compareBudgetYearBLabel'
                  aria-label={t('compare.budgetYear.selectSecond')}
                  isSearchable={false}
                  isClearable={false}
                />
              </span>
            </h1>
          </div>
          <div className='col-sm-2'>
            <div className='form-group'>
              <label htmlFor='changeTypeControl'>
                {t('compare.showChangesAs')}
              </label>
              <select
                className='form-control'
                id='changeTypeControl'
                value={this.state.changeType}
                onChange={this.handleChangeType}
              >
                <option value='pct'>
                  {t('compare.changeType.percentage')}
                </option>
                <option value='usd'>{t('compare.changeType.dollars')}</option>
              </select>
            </div>
          </div>
          <div className='col-sm-12'>
            <Total
              data={totals}
              colors={colors}
              diffColors={diffColors}
              usePct={usePct}
              constrainedMode={this.state.constrainedMode}
            />
            <h2>{t('compare.breakdowns.title')}</h2>
            <p>{t('compare.breakdowns.description')}</p>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-3'>
            <ul
              className='nav nav-pills nav-stacked'
              role='tablist'
              aria-label={t('compare.breakdowns.navLabel')}
            >
              {breakdowns.map(item => (
                <li
                  key={item.key}
                  className={item.key === activeBreakdown.key ? 'active' : ''}
                  role='presentation'
                >
                  <button
                    type='button'
                    className='btn btn-link'
                    role='tab'
                    id={`${item.key}-tab`}
                    aria-controls={`${item.key}-panel`}
                    aria-selected={item.key === activeBreakdown.key}
                    tabIndex={item.key === activeBreakdown.key ? 0 : -1}
                    onClick={() => this.handleBreakdownSelect(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div
            className='col-sm-9'
            role='tabpanel'
            id={`${activeBreakdown.key}-panel`}
            aria-labelledby={`${activeBreakdown.key}-tab`}
          >
            <Breakdown
              colors={colors}
              diffColors={diffColors}
              usePct={usePct}
              years={selectedYears}
              type={activeBreakdown.type}
              dimension={activeBreakdown.dimension}
              compactMode={this.state.compactMode}
              constrainedMode={this.state.constrainedMode}
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Runs enable a11y runtime checks.
 *
 * @returns {any} Function result.
 */
async function enableA11yRuntimeChecks(): Promise<void> {
  if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') {
    return;
  }
  if (window.__axeA11yRuntimeEnabled) {
    return;
  }

  window.__axeA11yRuntimeEnabled = true;

  try {
    const axeModule = await import('@axe-core/react');
    const reactDomModule = await import('react-dom');
    const runAxe = (axeModule.default ?? axeModule) as (
      react: typeof React,
      reactDom: unknown,
      timeout?: number,
    ) => void;
    runAxe(React, reactDomModule, 1000);
  } catch (error) {
    console.warn('Unable to initialize @axe-core/react runtime checks.', error);
  }
}

export {Compare};

const rootElement = document.getElementById('root');
if (rootElement) {
  void enableA11yRuntimeChecks().finally(() => {
    createRoot(rootElement).render(<Compare />);
  });
}
