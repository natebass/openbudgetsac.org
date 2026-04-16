import axios from 'axios';

import type {
  BreakdownDimension,
  BudgetBreakdownPair,
  BudgetDataType,
  BudgetRecord,
  BudgetTypeId,
} from './types';

const API_BASE = '/data/compare';

const typePaths: Record<BudgetDataType, string> = {
  spending: '/fiscal-years-expenses',
  revenue: '/fiscal-years-revenue',
};

const dimensionPaths: Record<BreakdownDimension, string> = {
  department: '/depts',
  category: '/account-cats',
};

const dimensionKeys: Record<BreakdownDimension, string> = {
  department: 'department',
  category: 'account_category',
};

const REQUEST_TIMEOUT_MS = 15000;
const SAFE_YEAR_RE = /^FY\d{2}$/i;
const TYPE_SORT_WEIGHT_BASE = 6;

interface BreakdownRow {
  budget_type: BudgetTypeId;
  total: number | string;
  account_category?: string;
  department?: string;
  [key: string]: unknown;
}

/**
 * Checks whether is safe breakdown key.
 *
 * @param {any} value Input value.
 * @returns {any} Function result.
 */
function isSafeBreakdownKey(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value !== '__proto__' &&
    value !== 'prototype' &&
    value !== 'constructor'
  );
}

/**
 * Gets get totals sort index.
 *
 * @param {any} record Input value.
 * @returns {any} Function result.
 */
function getTotalsSortIndex(
  record: Pick<BudgetRecord, 'fiscal_year_range' | 'budget_type'>,
): number {
  const year = record.fiscal_year_range.slice(2, 4);
  const type = TYPE_SORT_WEIGHT_BASE / Number(record.budget_type);
  return Number(`${year}.${type}`);
}

/**
 * Builds create breakdown url.
 *
 * @param {any} year Input value.
 * @param {any} type Input value.
 * @param {any} dimension Input value.
 * @returns {any} Function result.
 */
function createBreakdownUrl(
  year: string,
  type: BudgetDataType,
  dimension: BreakdownDimension,
): string {
  return `${API_BASE}${typePaths[type]}${dimensionPaths[dimension]}/${encodeURIComponent(year)}.json`;
}

/**
 * Gets parse numeric total.
 *
 * @param {any} rawTotal Input value.
 * @returns {any} Function result.
 */
function parseNumericTotal(rawTotal: unknown): number {
  const parsed = Number(rawTotal);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Checks whether assert valid breakdown request.
 *
 * @param {any} years Input value.
 * @param {any} yearTypes Input value.
 * @param {any} type Input value.
 * @param {any} dimension Input value.
 * @returns {any} Function result.
 */
function assertValidBreakdownRequest(
  years: unknown,
  yearTypes: unknown,
  type: unknown,
  dimension: unknown,
): asserts years is Array<string> {
  if (
    !Array.isArray(years) ||
    !Array.isArray(yearTypes) ||
    years.length !== yearTypes.length ||
    years.length === 0
  ) {
    throw new Error('Invalid budget comparison request');
  }
  if (
    !years.every(year => typeof year === 'string' && SAFE_YEAR_RE.test(year))
  ) {
    throw new Error('Invalid fiscal year format');
  }
  if (
    !Object.prototype.hasOwnProperty.call(typePaths, type) ||
    !Object.prototype.hasOwnProperty.call(dimensionPaths, dimension)
  ) {
    throw new Error('Unsupported comparison dimension or type');
  }
}

export /**
 * Gets fetch breakdown data.
 *
 * @param {any} years Input value.
 * @param {any} yearTypes Input value.
 * @param {any} type Input value.
 * @param {any} dimension Input value.
 * @returns {any} Function result.
 */
async function fetchBreakdownData(
  years: Array<string>,
  yearTypes: Array<BudgetTypeId>,
  type: BudgetDataType,
  dimension: BreakdownDimension,
): Promise<BudgetBreakdownPair> {
  assertValidBreakdownRequest(years, yearTypes, type, dimension);
  const urls = years.map(year => createBreakdownUrl(year, type, dimension));

  try {
    const responses = await Promise.all(
      urls.map(url =>
        axios.get<Array<BreakdownRow>>(url, {timeout: REQUEST_TIMEOUT_MS}),
      ),
    );

    const budgets = responses.map((response, index) => {
      if (!Array.isArray(response.data)) {
        throw new Error(`Unexpected API response format for ${urls[index]}`);
      }

      return response.data.reduce<Record<string, number>>(
        (accumulator, row) => {
          if (String(row.budget_type) === String(yearTypes[index])) {
            const key = row[dimensionKeys[dimension]];
            if (isSafeBreakdownKey(key)) {
              accumulator[key] = parseNumericTotal(row.total);
            }
          }
          return accumulator;
        },
        {},
      );
    });

    return [budgets[0] ?? {}, budgets[1] ?? {}];
  } catch (error) {
    console.error('Failed to fetch compare breakdown data', error);
    throw error;
  }
}

export /**
 * Gets fetch totals.
 *
 * @returns {any} Function result.
 */
async function fetchTotals(): Promise<Array<BudgetRecord>> {
  try {
    const response = await axios.get<Array<BudgetRecord>>(
      `${API_BASE}${typePaths.spending}/totals.json`,
      {timeout: REQUEST_TIMEOUT_MS},
    );

    const data = response.data;
    if (!Array.isArray(data)) {
      throw new Error('Unexpected totals response format');
    }

    data.sort((left, right) => {
      const indexLeft = getTotalsSortIndex(left);
      const indexRight = getTotalsSortIndex(right);
      if (indexLeft === indexRight) {
        return 0;
      }
      return indexLeft > indexRight ? -1 : 1;
    });

    return data;
  } catch (error) {
    console.error('Failed to fetch compare totals', error);
    throw error;
  }
}
