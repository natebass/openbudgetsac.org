# js/spreadsheet.ts

- JSDoc blocks found: 13

## Block 1

Associated declaration: `namespace.spreadsheet = function() {`

```ts
/**
   * Creates spreadsheet/table renderer for budget rows.
   *
   * @returns {{width:function,on:function,columns:function,column:function,cell:function,value:function,data:function,element:function,display:function}} Spreadsheet API.
   */
```

## Block 2

Associated declaration: `let _get_value = function(d) {`

```ts
/**
     * Default value accessor used for sorting.
     *
     * @param {object} d Row datum.
     * @returns {*} Sort value.
     */
```

## Block 3

Associated declaration: `let _cell = function(d, i, _row, elem) {`

```ts
/**
     * Default cell renderer.
     *
     * @param {*} d Cell datum.
     * @param {number} i Cell index.
     * @param {*} elem d3 cell selection.
     */
```

## Block 4

Associated declaration: `let _column = function(d, i, elem) {`

```ts
/**
     * Default header renderer.
     *
     * @param {*} d Header datum.
     * @param {number} i Header index.
     * @param {*} elem d3 header selection.
     */
```

## Block 5

Associated declaration: `width: function() {`

```ts
/**
       * Gets/sets table width.
       */
```

## Block 6

Associated declaration: `on: function(action, callback) {`

```ts
/**
       * Gets/sets event handlers.
       */
```

## Block 7

Associated declaration: `columns: function() {`

```ts
/**
       * Gets/sets column labels.
       */
```

## Block 8

Associated declaration: `column: function() {`

```ts
/**
       * Gets/sets column renderer.
       */
```

## Block 9

Associated declaration: `cell: function() {`

```ts
/**
       * Gets/sets cell renderer.
       */
```

## Block 10

Associated declaration: `value: function() {`

```ts
/**
       * Gets/sets value accessor for row sorting.
       */
```

## Block 11

Associated declaration: `data: function() {`

```ts
/**
       * Gets/sets source data.
       */
```

## Block 12

Associated declaration: `element: function() {`

```ts
/**
       * Gets/sets host element.
       */
```

## Block 13

Associated declaration: `display: function() {`

```ts
/**
       * Renders the spreadsheet table.
       */
```
