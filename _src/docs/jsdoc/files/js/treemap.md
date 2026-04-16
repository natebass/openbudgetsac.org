# js/treemap.ts

- JSDoc blocks found: 11

## Block 1

Associated declaration: `namespace.treemap = () => {`

```ts
/**
   * Creates the legacy treemap renderer.
   *
   * @returns {object} Treemap API.
   */
```

## Block 2

Associated declaration: `function _inner_height() {`

```ts
/**
     * Calculates inner drawable height.
     *
     * @returns {number} Inner height.
     */
```

## Block 3

Associated declaration: `function _inner_width() {`

```ts
/**
     * Calculates inner drawable width.
     *
     * @returns {number} Inner width.
     */
```

## Block 4

Associated declaration: `let _get_value = d => d.value;`

```ts
/**
     * Default node value accessor.
     *
     * @param {object} d Node datum.
     * @returns {number} Node value.
     */
```

## Block 5

Associated declaration: `let _rect_text = (d, i) => '' + _get_value(d.value);`

```ts
/**
     * Default rectangle label renderer.
     *
     * @param {object} d Node datum.
     * @param {number} i Index.
     * @returns {string} Label HTML.
     */
```

## Block 6

Associated declaration: `function _path(d) {`

```ts
/**
     * Builds root-to-node ancestry path.
     *
     * @param {object} d Node.
     * @returns {object[]} Ancestor path.
     */
```

## Block 7

Associated declaration: `function _initialize(root) {`

```ts
/**
     * Initializes root layout coordinates.
     *
     * @param {object} root Root node.
     * @returns {void}
     */
```

## Block 8

Associated declaration: `function _create_display(d: any): any {`

```ts
/**
     * Creates display helpers for a particular node context.
     *
     * @param {object} d Display node.
     * @returns {object} Display helpers.
     */
```

## Block 9

Associated declaration: `function _display(d: any): any {`

```ts
/**
     * Displays a treemap view and prepares transitions.
     *
     * @param {object} d Node to display.
     * @returns {object} Display state object.
     */
```

## Block 10

Associated declaration: `(d, i, direction) => {`

```ts
/**
         * Runs transition.
         *
         * @param {any} d Input value.
         * @param {any} i Input value.
         * @param {any} direction Input value.
         * @returns {any} Function result.
         */
```

## Block 11

Associated declaration: `function _layout(d) {`

```ts
/**
     * Recursively lays out node descendants in normalized coordinates.
     *
     * @param {object} d Node to layout.
     * @returns {void}
     */
```
