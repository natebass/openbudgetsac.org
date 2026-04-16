# js/budget-treemap.ts

- JSDoc blocks found: 20

## Block 1

Associated declaration: `function i18nT(key: string, fallback?: string, vars?: Record<string, unknown>) {`

```ts
/**
   * Resolves a localized message with optional interpolation.
   *
   * @param {string} key Translation key.
   * @param {string} fallback Fallback message.
   * @param {Record<string, unknown>} vars Interpolation variables.
   * @returns {string} Localized message text.
   */
```

## Block 2

Associated declaration: `function escapeHtml(value) {`

```ts
/**
   * Escapes user-visible text for safe HTML rendering.
   *
   * @param {unknown} value Raw text value.
   * @returns {string} HTML-escaped text.
   */
```

## Block 3

Associated declaration: `function i18nLabel(value) {`

```ts
/**
   * Translates dynamic data labels when locale runtime is available.
   *
   * @param {any} value Source label.
   * @returns {string} Localized label text.
   */
```

## Block 4

Associated declaration: `namespace.budget_treemap = function() {`

```ts
/**
   * Creates the composed budget treemap experience (treemap + table + controls).
   *
   * @returns {object} Budget treemap API.
   */
```

## Block 5

Associated declaration: `let _get_value = function(d) {`

```ts
/**
     * Default accessor for node amount value.
     *
     * @param {object} d Node datum.
     * @returns {number} Amount value.
     */
```

## Block 6

Associated declaration: `let _hash_normalize = function(s) {`

```ts
/**
     * Normalizes hash path segments.
     *
     * @param {string} s Hash segment.
     * @returns {string} Normalized segment.
     */
```

## Block 7

Associated declaration: `let _hash_compare = function(v1, v2) {`

```ts
/**
     * Compares hash path segment values.
     *
     * @param {*} v1 Segment value A.
     * @param {*} v2 Segment value B.
     * @returns {number} 0 when equal, otherwise 1.
     */
```

## Block 8

Associated declaration: `function _apply_handlers(d3obj: any) {`

```ts
/**
     * Applies registered interaction handlers to a d3-like object.
     *
     * @param {*} d3obj Object implementing `.on`.
     * @returns {void}
     */
```

## Block 9

Associated declaration: `let _tooltip_function = function(d: LegacyTreeNode, i: number) {`

```ts
/**
     * Builds tooltip HTML content for treemap rectangles.
     *
     * @param {object} d Node datum.
     * @param {number} i Node index.
     * @returns {string} Tooltip HTML.
     */
```

## Block 10

Associated declaration: `expected: function() {`

```ts
/**
       * Gets/sets expected hash to avoid redundant refreshes.
       *
       * @returns {*}
       */
```

## Block 11

Associated declaration: `get: function(root: LegacyTreeNode): LegacyTreeNode {`

```ts
/**
       * Resolves the currently selected node from window hash.
       *
       * @param {object} root Root node.
       * @returns {object} Active node.
       */
```

## Block 12

Associated declaration: `set: function(node: LegacyTreeNode) {`

```ts
/**
       * Sets window hash to represent the provided node path.
       *
       * @param {object} node Active node.
       * @returns {void}
       */
```

## Block 13

Associated declaration: `function _ensure_elements() {`

```ts
/**
     * Lazily binds configured DOM selectors to d3 elements.
     *
     * @returns {void}
     */
```

## Block 14

Associated declaration: `function _load_data(url: string | null, callback: (error: Error | null, data: LegacyTreeNode | null) => void) {`

```ts
/**
     * Loads treemap JSON data and caches successful responses by URL.
     *
     * @param {string} url Dataset URL.
     * @param {(error: Error|null, data: object|null) => void} callback Data callback.
     * @returns {void}
     */
```

## Block 15

Associated declaration: `create: function() {`

```ts
/**
         * Loads data and initializes composed treemap UI widgets.
         *
         * @returns {void}
         */
```

## Block 16

Associated declaration: `window.onhashchange = function() {`

```ts
/**
         * Refreshes the treemap when browser hash navigation changes.
         *
         * @returns {void}
         */
```

## Block 17

Associated declaration: `function _create_breadcrumbs(d: LegacyTreeNode) {`

```ts
/**
           * Renders clickable breadcrumb path for the current node.
           *
           * @param {object} d Current node.
           * @returns {void}
           */
```

## Block 18

Associated declaration: `_create_dropdown: function() {`

```ts
/**
       * Creates and binds dropdown filters.
       *
       * @returns {void}
       */
```

## Block 19

Associated declaration: `_sync_dropdown_selection: function() {`

```ts
/**
         * Applies current dropdown choice values to existing dropdown controls.
         *
         * @returns {void}
         */
```

## Block 20

Associated declaration: `refresh: function() {`

```ts
/**
       * Rebuilds the visualization based on current configuration.
       *
       * @returns {void}
       */
```
