# js/compare/api.js

- JSDoc blocks found: 5

## Block 1

Associated declaration: `function isSafeBreakdownKey (value) {`

```js
/**
 * Checks whether is safe breakdown key.
 *
 * @param {any} value Input value.
 * @returns {any} Function result.
 */
```

## Block 2

Associated declaration: `function getTotalsSortIndex (record) {`

```js
/**
 * Gets get totals sort index.
 *
 * @param {any} record Input value.
 * @returns {any} Function result.
 */
```

## Block 3

Associated declaration: `function assertValidBreakdownRequest (years, yearTypes, type, dimension) {`

```js
/**
 * Checks whether assert valid breakdown request.
 *
 * @param {any} years Input value.
 * @param {any} yearTypes Input value.
 * @param {any} type Input value.
 * @param {any} dimension Input value.
 * @returns {any} Function result.
 */
```

## Block 4

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

## Block 5

Associated declaration: `export function fetchTotals () {`

```js
/**
 * Fetches total spending records and sorts newest-first.
 *
 * @returns {Promise<Array<{fiscal_year_range:string,budget_type:(string|number),total:number}>>}
 * Sorted totals list.
 */
```
