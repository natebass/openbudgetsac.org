# js/compare/DiffTable.jsx

- JSDoc blocks found: 8

## Block 1

Associated declaration: `function compareDesc (a, b) {`

```js
/**
 * Compares values in descending order.
 *
 * @param {number|string} a Left value.
 * @param {number|string} b Right value.
 * @returns {number} Sort comparator value.
 */
```

## Block 2

Associated declaration: `function compareAsc (a, b) {`

```js
/**
 * Compares values in ascending order.
 *
 * @param {number|string} a Left value.
 * @param {number|string} b Right value.
 * @returns {number} Sort comparator value.
 */
```

## Block 3

Associated declaration: `function buildRowChartData (entry, years, colors) {`

```js
/**
 * Builds per-row chart data for the two selected fiscal years.
 *
 * @param {{value:number,prev:number}} entry Row diff entry.
 * @param {Array<{fiscal_year_range:string}>} years Selected year records.
 * @param {string[]} colors Series colors.
 * @returns {{labels:string[],datasets:Array<{data:number[],label:string,backgroundColor:string}>}} Chart.js data.
 */
```

## Block 4

Associated declaration: `constructor (props) {`

```js
/**
   * Initializes table sort state.
   *
   * @param {object} props React component props.
   */
```

## Block 5

Associated declaration: `handleSortChange (event) {`

```js
/**
   * Updates active sort mode.
   *
   * @param {Event} event Input change event.
   * @returns {void}
   */
```

## Block 6

Associated declaration: `handleShowAllRows () {`

```js
/**
   * Reveals all rows in constrained mode.
   *
   * @returns {void}
   */
```

## Block 7

Associated declaration: `componentDidUpdate (prevProps) {`

```js
/**
   * Resets expanded rows when entering compact/constrained mode.
   *
   * @param {object} prevProps Previous props.
   * @returns {void}
   */
```

## Block 8

Associated declaration: `render () {`

```js
/**
   * Renders the diff table and spark bars.
   *
   * @returns {JSX.Element} Sorted diff table.
   */
```
