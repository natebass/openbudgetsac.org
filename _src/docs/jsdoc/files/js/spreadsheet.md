# js/spreadsheet.js

- JSDoc blocks found: 13

## Block 1

Associated declaration: `namespace.spreadsheet = function () {`

```js
/**
   * Creates spreadsheet/table renderer for budget rows.
   *
   * @returns {{width:function,on:function,columns:function,column:function,cell:function,value:function,data:function,element:function,display:function}} Spreadsheet API.
   */
```

## Block 2

Associated declaration: `let _get_value = function (d) {`

```js
/**
     * Default value accessor used for sorting.
     *
     * @param {object} d Row datum.
     * @returns {*} Sort value.
     */
```

## Block 3

Associated declaration: `let _cell = function (d, i, elem) {`

```js
/**
     * Default cell renderer.
     *
     * @param {*} d Cell datum.
     * @param {number} i Cell index.
     * @param {*} elem d3 cell selection.
     */
```

## Block 4

Associated declaration: `let _column = function (d, i, elem) {`

```js
/**
     * Default header renderer.
     *
     * @param {*} d Header datum.
     * @param {number} i Header index.
     * @param {*} elem d3 header selection.
     */
```

## Block 5

Associated declaration: `width: function () {`

```js
/**
       * Gets/sets table width.
       */
```

## Block 6

Associated declaration: `on: function (action, callback) {`

```js
/**
       * Gets/sets event handlers.
       */
```

## Block 7

Associated declaration: `columns: function () {`

```js
/**
       * Gets/sets column labels.
       */
```

## Block 8

Associated declaration: `column: function () {`

```js
/**
       * Gets/sets column renderer.
       */
```

## Block 9

Associated declaration: `cell: function () {`

```js
/**
       * Gets/sets cell renderer.
       */
```

## Block 10

Associated declaration: `value: function () {`

```js
/**
       * Gets/sets value accessor for row sorting.
       */
```

## Block 11

Associated declaration: `data: function () {`

```js
/**
       * Gets/sets source data.
       */
```

## Block 12

Associated declaration: `element: function () {`

```js
/**
       * Gets/sets host element.
       */
```

## Block 13

Associated declaration: `display: function () {`

```js
/**
       * Renders the spreadsheet table.
       */
```
