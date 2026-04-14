# js/compare/Breakdown.jsx

- JSDoc blocks found: 7

## Block 1

Associated declaration: `function areSameYears (currentYears, previousYears) {`

```js
/**
 * Checks whether two selected year arrays represent the same year/type pairings.
 *
 * @param {Array<{fiscal_year_range:string,budget_type:(string|number)}|null>} currentYears Current years.
 * @param {Array<{fiscal_year_range:string,budget_type:(string|number)}|null>} previousYears Previous years.
 * @returns {boolean} True when selections match.
 */
```

## Block 2

Associated declaration: `function hasCompleteYears (years) {`

```js
/**
 * Checks whether both selected year entries are present.
 *
 * @param {Array<unknown>} years Year selection array.
 * @returns {boolean} True when all entries are truthy.
 */
```

## Block 3

Associated declaration: `constructor (props) {`

```js
/**
   * Initializes breakdown state.
   *
   * @param {object} props React component props.
   */
```

## Block 4

Associated declaration: `componentDidMount () {`

```js
/**
   * Loads data after mount.
   *
   * @returns {void}
   */
```

## Block 5

Associated declaration: `componentDidUpdate (prevProps) {`

```js
/**
   * Refetches when selected years change.
   *
   * @param {object} prevProps Previous props.
   * @returns {void}
   */
```

## Block 6

Associated declaration: `fetchData (years) {`

```js
/**
   * Fetches breakdown data for selected year objects.
   *
   * @param {Array<{fiscal_year_range:string,budget_type:(string|number)}|null>} years Year records.
   * @returns {void}
   */
```

## Block 7

Associated declaration: `render () {`

```js
/**
   * Renders loading state or chart/table breakdowns.
   *
   * @returns {JSX.Element} Breakdown content.
   */
```
