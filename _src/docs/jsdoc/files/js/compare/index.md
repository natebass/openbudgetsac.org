# js/compare/index.jsx

- JSDoc blocks found: 17

## Block 1

Associated declaration: `function getConnection () {`

```js
/**
 * Returns the browser network information object when available.
 *
 * @returns {NetworkInformation|null} Network info object, or null when unavailable.
 */
```

## Block 2

Associated declaration: `function derivePerformanceFlags () {`

```js
/**
 * Derives UI performance flags from viewport width and connection hints.
 *
 * @returns {{compactMode:boolean, constrainedMode:boolean}} Rendering flags.
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

Associated declaration: `function formatTotals (selectedYears) {`

```js
/**
 * Maps selected year records to the totals data shape used by the total chart.
 *
 * @param {Array<{fiscal_year_range:string,total:number}|undefined>} selectedYears Selected year records.
 * @returns {Array<{key:string,total:number}|undefined>} Formatted totals list.
 */
```

## Block 6

Associated declaration: `constructor (props) {`

```js
/**
   * Initializes compare view state.
   *
   * @param {object} props React component props.
   */
```

## Block 7

Associated declaration: `componentDidMount () {`

```js
/**
   * Loads totals and initializes default year selections.
   *
   * @returns {void}
   */
```

## Block 8

Associated declaration: `componentWillUnmount () {`

```js
/**
   * Cleans up window and network listeners.
   *
   * @returns {void}
   */
```

## Block 9

Associated declaration: `applyPerformanceFlags () {`

```js
/**
   * Applies adaptive UI flags for small screens and slow connections.
   *
   * @returns {void}
   */
```

## Block 10

Associated declaration: `scheduleApplyPerformanceFlags () {`

```js
/**
   * Coalesces rapid resize events to avoid repeated expensive chart rerenders.
   *
   * @returns {void}
   */
```

## Block 11

Associated declaration: `handleChangeType (event) {`

```js
/**
   * Updates diff formatting mode.
   *
   * @param {Event} event Select change event.
   * @returns {void}
   */
```

## Block 12

Associated declaration: `handleSelectBudget1 (option) {`

```js
/**
   * Handles year selection for left-hand budget selector.
   *
   * @param {{value:number}} option Selected option.
   * @returns {void}
   */
```

## Block 13

Associated declaration: `handleSelectBudget2 (option) {`

```js
/**
   * Handles year selection for right-hand budget selector.
   *
   * @param {{value:number}} option Selected option.
   * @returns {void}
   */
```

## Block 14

Associated declaration: `handleBreakdownSelect (key) {`

```js
/**
   * Switches the active breakdown tab.
   *
   * @param {string} key Breakdown key.
   * @returns {void}
   */
```

## Block 15

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

## Block 16

Associated declaration: `render () {`

```js
/**
   * Renders compare page controls and active breakdown panel.
   *
   * @returns {JSX.Element} Compare application UI.
   */
```

## Block 17

Associated declaration: `async function enableA11yRuntimeChecks () {`

```js
/**
 * Enables axe runtime checks in non-production browser environments.
 *
 * @returns {Promise<void>} Resolves after attempting initialization.
 */
```
