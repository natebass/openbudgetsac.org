# css/bower_components/jquery/src/sizzle/dist/sizzle.js

- JSDoc blocks found: 14

## Block 1

Associated declaration: `function createCache() {`

```js
/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
```

## Block 2

Associated declaration: `function markFunction( fn ) {`

```js
/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
```

## Block 3

Associated declaration: `function assert( fn ) {`

```js
/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
```

## Block 4

Associated declaration: `function addHandle( attrs, handler ) {`

```js
/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
```

## Block 5

Associated declaration: `function siblingCheck( a, b ) {`

```js
/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
```

## Block 6

Associated declaration: `function createInputPseudo( type ) {`

```js
/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
```

## Block 7

Associated declaration: `function createButtonPseudo( type ) {`

```js
/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
```

## Block 8

Associated declaration: `function createPositionalPseudo( fn ) {`

```js
/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
```

## Block 9

Associated declaration: `function testContext( context ) {`

```js
/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
```

## Block 10

Associated declaration: `isXML = Sizzle.isXML = function( elem ) {`

```js
/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
```

## Block 11

Associated declaration: `setDocument = Sizzle.setDocument = function( node ) {`

```js
/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
```

## Block 12

Associated declaration: `Sizzle.uniqueSort = function( results ) {`

```js
/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
```

## Block 13

Associated declaration: `getText = Sizzle.getText = function( elem ) {`

```js
/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
```

## Block 14

Associated declaration: `select = Sizzle.select = function( selector, context, results, seed ) {`

```js
/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
```
