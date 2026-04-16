# js/data.ts

- JSDoc blocks found: 8

## Block 1

Associated declaration: `namespace.findIndex = (array, value, comparitor) => {`

```ts
/**
   * Finds the first index matching the provided comparator.
   *
   * @param {Array<*>} array Input list.
   * @param {*} value Target value.
   * @param {(a:*, b:*) => number} comparitor Comparator returning 0 on match.
   * @returns {number} Matching index or -1.
   */
```

## Block 2

Associated declaration: `namespace.hierarchy = () => {`

```ts
/**
   * Creates hierarchy helpers for budget data trees.
   *
   * @returns {{crunch:function,spelunk:function,path:function,apply:function}} Hierarchy API.
   */
```

## Block 3

Associated declaration: `function _prepare_recurse(node) {`

```ts
/**
     * Recursively prepares node values and parent/depth links.
     *
     * @param {object} node Tree node.
     * @returns {{income:number,expense:number,balance:number}} Aggregated totals.
     */
```

## Block 4

Associated declaration: `function _prepare(data) {`

```ts
/**
     * Converts nested d3 data into a root node shape used by visualizations.
     *
     * @param {Array<object>} data Nested data array.
     * @returns {object} Root node.
     */
```

## Block 5

Associated declaration: `crunch: (rows, order) => {`

```ts
/**
       * Nests flat rows into hierarchical budget data.
       *
       * @param {Array<Array<*>>} rows Data rows.
       * @param {string[]} order Dimension order.
       * @returns {object} Prepared root node.
       */
```

## Block 6

Associated declaration: `spelunk: function (root, keys, cmp) {`

```ts
/**
       * Finds the deepest node reachable by a sequence of keys.
       *
       * @param {object} root Root node.
       * @param {string[]} keys Path segments.
       * @param {(a:*, b:*) => number} [cmp] Key comparator.
       * @returns {object} Matching node or deepest ancestor.
       */
```

## Block 7

Associated declaration: `path: node => {`

```ts
/**
       * Builds the path from root to the given node.
       *
       * @param {object} node Tree node.
       * @returns {object[]} Ordered root-to-node path.
       */
```

## Block 8

Associated declaration: `apply: function (node, func) {`

```ts
/**
       * Applies a callback recursively to a node and descendants.
       *
       * @param {object} node Tree node.
       * @param {(node:object) => void} func Visitor callback.
       * @returns {void}
       */
```
