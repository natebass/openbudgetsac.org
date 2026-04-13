# js/compare/index.jsx

- JSDoc blocks found: 15

## Block 1

Associated declaration: `function getConnection () {`

```js
/**
 * Gets get connection.
 *
 * @returns {any} Function result.
 */
```

## Block 2

Associated declaration: `function derivePerformanceFlags () {`

```js
/**
 * Builds derive performance flags.
 *
 * @returns {any} Function result.
 */
```

## Block 3

Associated declaration: `function getBudgetOption (record, index) {`

```js
/**
 * Builds a select option for a budget record.
 *
 * @param {{fiscal_year_range:string,budget_type:(string|number)}} record Budget metadata.
 * @param {number} index Option index.
 * @returns {{value:number,label:string}} Select option.
 */
```

## Block 4

Associated declaration: `function getBudgetDefaults (budgets) {`

```js
/**
 * Picks the default pair of budget options.
 *
 * @param {Array<{value:number,label:string}>} budgets Options list.
 * @returns {[{value:number,label:string}|null,{value:number,label:string}|null]} Default pair.
 */
```

## Block 5

Associated declaration: `constructor (props) {`

```js
/**
   * Initializes compare view state.
   *
   * @param {object} props React component props.
   */
```

## Block 6

Associated declaration: `componentDidMount () {`

```js
/**
   * Loads totals and initializes default year selections.
   *
   * @returns {void}
   */
```

## Block 7

Associated declaration: `componentWillUnmount () {`

```js
/**
   * Cleans up window and network listeners.
   *
   * @returns {void}
   */
```

## Block 8

Associated declaration: `applyPerformanceFlags () {`

```js
/**
   * Applies adaptive UI flags for small screens and slow connections.
   *
   * @returns {void}
   */
```

## Block 9

Associated declaration: `scheduleApplyPerformanceFlags () {`

```js
/**
   * Coalesces rapid resize events to avoid repeated expensive chart rerenders.
   *
   * @returns {void}
   */
```

## Block 10

Associated declaration: `handleChangeType (event) {`

```js
/**
   * Updates diff formatting mode.
   *
   * @param {Event} event Select change event.
   * @returns {void}
   */
```

## Block 11

Associated declaration: `handleSelectBudget1 (option) {`

```js
/**
   * Handles year selection for left-hand budget selector.
   *
   * @param {{value:number}} option Selected option.
   * @returns {void}
   */
```

## Block 12

Associated declaration: `handleSelectBudget2 (option) {`

```js
/**
   * Handles year selection for right-hand budget selector.
   *
   * @param {{value:number}} option Selected option.
   * @returns {void}
   */
```

## Block 13

Associated declaration: `handleBreakdownSelect (key) {`

```js
/**
   * Switches the active breakdown tab.
   *
   * @param {string} key Breakdown key.
   * @returns {void}
   */
```

## Block 14

Associated declaration: `handleSelectBudget (key, otherKey, index) {`

```js
/**
   * Updates one selected budget and constrains the opposite selector options.
   *
   * @param {'budget1'|'budget2'} key Target budget key.
   * @param {'budget1'|'budget2'} otherKey Opposite budget key.
   * @param {number} index Selected option index.
   * @returns {void}
   */
```

## Block 15

Associated declaration: `render () {`

```js
/**
   * Renders compare page controls and active breakdown panel.
   *
   * @returns {JSX.Element} Compare application UI.
   */
```
