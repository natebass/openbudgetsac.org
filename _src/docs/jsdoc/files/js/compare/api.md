# js/compare/api.js

- JSDoc blocks found: 7

## Block 1

Associated declaration: `function isSafeBreakdownKey (value) {`

```js
/**
 * Checks whether a breakdown label is safe to use as an object key.
 *
 * @param {unknown} value Candidate key value.
 * @returns {boolean} True when the key is safe.
 */
```

## Block 2

Associated declaration: `function getTotalsSortIndex (record) {`

```js
/**
 * Builds a sortable index for totals based on fiscal year and budget type.
 *
 * @param {{fiscal_year_range:string,budget_type:(string|number)}} record Totals record.
 * @returns {number} Numeric sort key.
 */
```

## Block 3

Associated declaration: `function createBreakdownUrl (year, type, dimension) {`

```js
/**
 * Builds the JSON endpoint URL for one breakdown request.
 *
 * @param {string} year Fiscal year token.
 * @param {'spending'|'revenue'} type Budget dataset type.
 * @param {'department'|'category'} dimension Breakdown grouping.
 * @returns {string} Endpoint URL.
 */
```

## Block 4

Associated declaration: `function parseNumericTotal (rawTotal) {`

```js
/**
 * Parses a numeric total and falls back to zero for invalid values.
 *
 * @param {unknown} rawTotal Raw value from the dataset.
 * @returns {number} Parsed numeric total.
 */
```

## Block 5

Associated declaration: `function assertValidBreakdownRequest (years, yearTypes, type, dimension) {`

```js
/**
 * Validates request inputs before fetching compare breakdown data.
 *
 * @param {unknown} years Requested fiscal years.
 * @param {unknown} yearTypes Requested budget types.
 * @param {unknown} type Dataset type selector.
 * @param {unknown} dimension Breakdown dimension selector.
 * @returns {void}
 */
```

## Block 6

Associated declaration: `export function fetchBreakdownData (years, yearTypes, type, dimension) {`

```js
/**
 * Fetches breakdown data for two years and filters rows by budget type.
 *
 * @param {string[]} years Fiscal year identifiers.
 * @param {(string|number)[]} yearTypes Budget type per requested year.
 * @param {'spending'|'revenue'} type Data type path selector.
 * @param {'department'|'category'} dimension Grouping dimension.
 * @returns {Promise<Array<Record<string, number>>>} Two budget maps keyed by dimension label.
 */
```

## Block 7

Associated declaration: `export function fetchTotals () {`

```js
/**
 * Fetches total spending records and sorts newest-first.
 *
 * @returns {Promise<Array<{fiscal_year_range:string,budget_type:(string|number),total:number}>>}
 * Sorted totals list.
 */
```
