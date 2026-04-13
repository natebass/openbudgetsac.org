# js/budget-treemap.js

- JSDoc blocks found: 17

## Block 1

Associated declaration: `function i18nT (key, fallback, vars) {`

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

## Block 2

Associated declaration: `function escapeHtml (value) {`

```js
/**
   * Runs escape html.
   *
   * @param {any} value Input value.
   * @returns {any} Function result.
   */
```

## Block 3

Associated declaration: `namespace.budget_treemap = function () {`

```js
/**
   * Creates the composed budget treemap experience (treemap + table + controls).
   *
   * @returns {object} Budget treemap API.
   */
```

## Block 4

Associated declaration: `let _get_value = function (d) {`

```js
/**
     * Default accessor for node amount value.
     *
     * @param {object} d Node datum.
     * @returns {number} Amount value.
     */
```

## Block 5

Associated declaration: `let _hash_normalize = function (s) {`

```js
/**
     * Normalizes hash path segments.
     *
     * @param {string} s Hash segment.
     * @returns {string} Normalized segment.
     */
```

## Block 6

Associated declaration: `let _hash_compare = function (v1, v2) {`

```js
/**
     * Compares hash path segment values.
     *
     * @param {*} v1 Segment value A.
     * @param {*} v2 Segment value B.
     * @returns {number} 0 when equal, otherwise 1.
     */
```

## Block 7

Associated declaration: `function _apply_handlers (d3obj) {`

```js
/**
     * Applies registered interaction handlers to a d3-like object.
     *
     * @param {*} d3obj Object implementing `.on`.
     * @returns {void}
     */
```

## Block 8

Associated declaration: `let _tooltip_function = function (d, i) {`

```js
/**
     * Builds tooltip HTML content for treemap rectangles.
     *
     * @param {object} d Node datum.
     * @param {number} i Node index.
     * @returns {string} Tooltip HTML.
     */
```

## Block 9

Associated declaration: `expected: function () {`

```js
/**
       * Gets/sets expected hash to avoid redundant refreshes.
       *
       * @returns {*}
       */
```

## Block 10

Associated declaration: `get: function (root) {`

```js
/**
       * Resolves the currently selected node from window hash.
       *
       * @param {object} root Root node.
       * @returns {object} Active node.
       */
```

## Block 11

Associated declaration: `set: function (node) {`

```js
/**
       * Sets window hash to represent the provided node path.
       *
       * @param {object} node Active node.
       * @returns {void}
       */
```

## Block 12

Associated declaration: `create: function () {`

```js
/**
         * Loads data and initializes composed treemap UI widgets.
         *
         * @returns {void}
         */
```

## Block 13

Associated declaration: `function (e) {`

```js
/**
         * Runs onhashchange.
         *
         * @param {any} e Input value.
         * @returns {any} Function result.
         */
```

## Block 14

Associated declaration: `function _create_breadcrumbs (d) {`

```js
/**
           * Renders clickable breadcrumb path for the current node.
           *
           * @param {object} d Current node.
           * @returns {void}
           */
```

## Block 15

Associated declaration: `_create_dropdown: function () {`

```js
/**
       * Creates and binds dropdown filters.
       *
       * @returns {void}
       */
```

## Block 16

Associated declaration: `_sync_dropdown_selection: function () {`

```js
/**
         * Applies current dropdown choice values to existing dropdown controls.
         *
         * @returns {void}
         */
```

## Block 17

Associated declaration: `refresh: function () {`

```js
/**
       * Rebuilds the visualization based on current configuration.
       *
       * @returns {void}
       */
```
