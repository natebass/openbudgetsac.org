export type BudgetTypeId = number | string;
export type LanguageCode = 'en-US' | 'es-419';
export type BudgetDataType = 'spending' | 'revenue';
export type BreakdownDimension = 'department' | 'category';
export type BreakdownKey = 'spendDept' | 'spendCat' | 'revDept' | 'revCat';

export interface BudgetRecord {
  fiscal_year_range: string;
  budget_type: BudgetTypeId;
  total: number;
}

export interface BudgetOption {
  value: number;
  label: string;
}

export interface BudgetTotalDisplay {
  key: string;
  total: number;
}

export interface BreakdownView {
  key: BreakdownKey;
  labelKey?: string;
  label?: string;
  type: BudgetDataType;
  dimension: BreakdownDimension;
}

export interface DiffColors {
  neg: string;
  pos: string;
}

export type BudgetBreakdownRecord = Record<string, number>;
export type BudgetBreakdownPair = [
  BudgetBreakdownRecord,
  BudgetBreakdownRecord,
];
export type SelectedBudget = BudgetRecord | null;
export type SelectedYears = [SelectedBudget, SelectedBudget];
