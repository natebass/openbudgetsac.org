# js/tree-page.ts

- JSDoc blocks found: 6

## Block 1

Associated declaration: `function readTreeConfig(): TreePageConfig | null {`

```ts
/**
 * Reads the tree page configuration from the JSON bootstrap block.
 *
 * @returns {TreePageConfig | null} Parsed config or null when absent.
 */
```

## Block 2

Associated declaration: `function normalizeTreeHash(value: string): string {`

```ts
/**
 * Normalizes hash segments so legacy routes stay stable across casing changes.
 *
 * @param {string} value Raw hash segment.
 * @returns {string} Normalized segment.
 */
```

## Block 3

Associated declaration: `function compareTreeHash(left: string, right: string): number {`

```ts
/**
 * Compares normalized hash path values.
 *
 * @param {string} left Left path value.
 * @param {string} right Right path value.
 * @returns {number} Zero when values match.
 */
```

## Block 4

Associated declaration: `function resolveTreeUrl(config: TreePageConfig): string {`

```ts
/**
 * Builds the current data URL from the dropdown choices and configured template.
 *
 * @param {TreePageConfig} config Page configuration.
 * @returns {string} Resolved JSON data URL.
 */
```

## Block 5

Associated declaration: `function parseTreeHash(config: TreePageConfig, hash: string): string {`

```ts
/**
 * Applies the URL hash to the tree dropdown state before the first render.
 *
 * @param {TreePageConfig} config Page configuration.
 * @param {string} hash Raw location hash.
 * @returns {string} Remaining tree path after dropdown values are consumed.
 */
```

## Block 6

Associated declaration: `function initTreePage(): void {`

```ts
/**
 * Initializes the shared tree page renderer.
 *
 * @returns {void}
 */
```
