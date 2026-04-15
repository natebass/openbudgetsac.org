# scripts/run-eslint.ts

- JSDoc blocks found: 3

## Block 1

Associated declaration: `async function loadFlatConfig(): Promise<Array<unknown>> {`

```ts
/**
 * Loads the flat ESLint config from the TypeScript config file.
 *
 * @returns {Promise<Array<unknown>>} ESLint flat config entries.
 */
```

## Block 2

Associated declaration: `function sumResultField(`

```ts
/**
 * Sums a numeric field across all ESLint results.
 *
 * @param {Array<ESLint.LintResult>} results ESLint result list.
 * @param {'errorCount' | 'fatalErrorCount' | 'warningCount'} field Field name.
 * @returns {number} Total count.
 */
```

## Block 3

Associated declaration: `async function main(): Promise<void> {`

```ts
/**
 * Runs ESLint with the repository's TypeScript flat config.
 *
 * @returns {Promise<void>} Completion signal.
 */
```
