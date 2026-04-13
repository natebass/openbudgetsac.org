# js/palette.js

- JSDoc blocks found: 6

## Block 1

Associated declaration: `namespace.stack = function () {`

```js
/**
   * Creates a stack-based palette helper.
   *
   * @returns {{_stack:Array,transform:function,palette:function,shift:function,unshift:function}}
   * Palette API.
   */
```

## Block 2

Associated declaration: `let _transform = function (color, count) {`

```js
/**
     * Builds a darker linear scale from a source color.
     *
     * @param {string} color CSS color string.
     * @param {number} count Number of bins.
     * @returns {*} d3 linear color scale.
     */
```

## Block 3

Associated declaration: `transform: function () {`

```js
/**
       * Gets/sets the transform used to derive nested palettes.
       *
       * @returns {*}
       */
```

## Block 4

Associated declaration: `palette: function () {`

```js
/**
       * Gets/sets the current top palette.
       *
       * @returns {*}
       */
```

## Block 5

Associated declaration: `shift: function () {`

```js
/**
       * Removes the active palette from the stack.
       *
       * @returns {void}
       */
```

## Block 6

Associated declaration: `unshift: function (color, count) {`

```js
/**
       * Pushes a derived palette to the front of the stack.
       *
       * @param {string} color Base color.
       * @param {number} count Depth/size hint.
       * @returns {void}
       */
```
