# js/flow.js

- JSDoc blocks found: 10

## Block 1

Associated declaration: `function (d) {`

```js
/**
 * Builds format.
 *
 * @param {any} d Input value.
 * @returns {any} Function result.
 */
```

## Block 2

Associated declaration: `function (key, fallback, vars) {`

```js
/**
 * Runs i18n t.
 *
 * @param {any} key Input value.
 * @param {any} fallback Input value.
 * @param {any} vars Input value.
 * @returns {any} Function result.
 */
```

## Block 3

Associated declaration: `function localizeFlowLabel (label) {`

```js
/**
 * Localizes known flow labels while preserving source values for data operations.
 *
 * @param {string} label Source label.
 * @returns {string} Localized label or original value.
 */
```

## Block 4

Associated declaration: `function data_wrangle (dataset, fy) {`

```js
/**
 * Normalizes schema differences across fiscal year datasets.
 *
 * @param {Array<object>} dataset Raw CSV row data.
 * @param {string} fy Fiscal year label (for example `FY26`).
 * @returns {{nodes:Array<object>,links:Array<object>}} Sankey graph input.
 */
```

## Block 5

Associated declaration: `const sort_by = (fields_arr) => {`

```js
/**
 * Creates a comparator by explicit value ordering.
 *
 * @param {string[]} fields_arr Ordered values.
 * @returns {(a:string, b:string) => number} Comparator.
 */
```

## Block 6

Associated declaration: `const fundKey = (fund_field, general_fund) => d => d[fund_field] == general_fund ? 'General Fund' : 'Non-discretionary funds'`

```js
/**
 * Creates fund bucket accessor for grouped keys.
 *
 * @param {string} fund_field Source field name.
 * @param {string} general_fund Value treated as General Fund.
 * @returns {(d:object) => string} Grouping key accessor.
 */
```

## Block 7

Associated declaration: `const rollupFn = amount_field => v => ({ total: d3.sum(v, d => +d[amount_field]) })`

```js
/**
 * Creates rollup function that adds numeric totals.
 *
 * @param {string} amount_field Amount field name.
 * @returns {(v:Array<object>) => object} Rollup reducer.
 */
```

## Block 8

Associated declaration: `const flatten = nested => nested.reduce((acc, row) => acc.concat(row), [])`

```js
/**
 * Maps grouped records into sankey nodes/links.
 *
 * @param {Array<{key:string,values:Array<{key:string,values:{total:number}}>} data Grouped data.
 * @param {'revenue'|'expense'} type Flow segment type.
 * @param {number} offset Node index offset.
 * @returns {{nodes:Array<object>,links:Array<object>}} Partial graph.
 */
```

## Block 9

Associated declaration: `function data_wrangle_v1 (dataset, category_field, department_field, expense_field, revenue_value, expense_value, fund_field, general_fund, amount_field) {`

```js
/**
 * Builds sankey nodes and links from a normalized row schema.
 *
 * @param {Array<object>} dataset Row data.
 * @param {string} category_field Revenue category field.
 * @param {string} department_field Expense department field.
 * @param {string} expense_field Expense/revenue discriminator field.
 * @param {string} revenue_value Revenue discriminator value.
 * @param {string} expense_value Expense discriminator value.
 * @param {string} fund_field Fund code field.
 * @param {string} general_fund General fund label.
 * @param {string} amount_field Amount field name.
 * @returns {{nodes:Array<object>,links:Array<object>}} Sankey graph data.
 */
```

## Block 10

Associated declaration: `function do_with_budget (data) {`

```js
/**
 * Renders the sankey chart for prepared data.
 *
 * @param {{nodes:Array<object>,links:Array<object>}} data Graph data.
 * @returns {void}
 */
```
