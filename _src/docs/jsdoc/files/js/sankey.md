# js/sankey.ts

- JSDoc blocks found: 21

## Block 1

Associated declaration: `d3.sankey = function() {`

```ts
/**
 * Creates a d3 sankey layout instance.
 *
 * @returns {object} Sankey layout API.
 */
```

## Block 2

Associated declaration: `function link(d) {`

```ts
/**
     * Generates a cubic Bézier path for a sankey link.
     *
     * @param {{source:object,target:object,sy:number,ty:number,dy:number}} d Link datum.
     * @returns {string} SVG path command.
     */
```

## Block 3

Associated declaration: `function computeNodeLinks() {`

```ts
/**
   * Populates `sourceLinks` and `targetLinks` for each node.
   *
   * @returns {void}
   */
```

## Block 4

Associated declaration: `function computeNodeValues() {`

```ts
/**
   * Computes each node value from incoming/outgoing link totals.
   *
   * @returns {void}
   */
```

## Block 5

Associated declaration: `function computeNodeBreadths() {`

```ts
/**
   * Assigns horizontal breadth (`x`) positions for each node.
   *
   * @returns {void}
   */
```

## Block 6

Associated declaration: `function moveSinksRight(x) {`

```ts
/**
   * Moves sink nodes to the right-most column.
   *
   * @param {number} x Max breadth index.
   * @returns {void}
   */
```

## Block 7

Associated declaration: `function scaleNodeBreadths(kx) {`

```ts
/**
   * Scales node breadth coordinates to pixel units.
   *
   * @param {number} kx Scaling factor.
   * @returns {void}
   */
```

## Block 8

Associated declaration: `function computeNodeDepths(iterations) {`

```ts
/**
   * Computes vertical positions and heights for nodes.
   *
   * @param {number} iterations Relaxation iterations.
   * @returns {void}
   */
```

## Block 9

Associated declaration: `function initializeNodeDepth() {`

```ts
/**
     * Initializes node/link depths before relaxation passes.
     *
     * @returns {void}
     */
```

## Block 10

Associated declaration: `function relaxLeftToRight(alpha) {`

```ts
/**
     * Relaxes node depth from left to right.
     *
     * @param {number} alpha Relaxation coefficient.
     * @returns {void}
     */
```

## Block 11

Associated declaration: `function weightedSource(link) {`

```ts
/**
       * Calculates weighted source center by link value.
       *
       * @param {object} link Sankey link.
       * @returns {number} Weighted source center.
       */
```

## Block 12

Associated declaration: `function relaxRightToLeft(alpha) {`

```ts
/**
     * Relaxes node depth from right to left.
     *
     * @param {number} alpha Relaxation coefficient.
     * @returns {void}
     */
```

## Block 13

Associated declaration: `function weightedTarget(link) {`

```ts
/**
       * Calculates weighted target center by link value.
       *
       * @param {object} link Sankey link.
       * @returns {number} Weighted target center.
       */
```

## Block 14

Associated declaration: `function resolveCollisions() {`

```ts
/**
     * Resolves overlapping nodes within each breadth column.
     *
     * @returns {void}
     */
```

## Block 15

Associated declaration: `function ascendingDepth(a, b) {`

```ts
/**
     * Sort comparator for y-position.
     *
     * @param {object} a Node A.
     * @param {object} b Node B.
     * @returns {number} Sort order.
     */
```

## Block 16

Associated declaration: `function centerFunds() {`

```ts
/**
     * Applies custom vertical centering for fund nodes.
     *
     * @returns {void}
     */
```

## Block 17

Associated declaration: `function computeLinkDepths() {`

```ts
/**
   * Computes `sy` and `ty` offsets for link stacking.
   *
   * @returns {void}
   */
```

## Block 18

Associated declaration: `function ascendingSourceDepth(a, b) {`

```ts
/**
     * Sort comparator by source y-position.
     *
     * @param {object} a Link A.
     * @param {object} b Link B.
     * @returns {number} Sort order.
     */
```

## Block 19

Associated declaration: `function ascendingTargetDepth(a, b) {`

```ts
/**
     * Sort comparator by target y-position.
     *
     * @param {object} a Link A.
     * @param {object} b Link B.
     * @returns {number} Sort order.
     */
```

## Block 20

Associated declaration: `function center(node) {`

```ts
/**
   * Computes vertical center for a node.
   *
   * @param {object} node Sankey node.
   * @returns {number} Center y coordinate.
   */
```

## Block 21

Associated declaration: `function value(link) {`

```ts
/**
   * Value accessor for links.
   *
   * @param {{value:number}} link Sankey link.
   * @returns {number} Link value.
   */
```
