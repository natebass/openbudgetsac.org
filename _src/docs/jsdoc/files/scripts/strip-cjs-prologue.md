# scripts/strip-cjs-prologue.ts

- JSDoc blocks found: 2

## Block 1

Associated declaration: `async function collectJsFiles(dir: string): Promise<Array<string>> {`

```ts
/**
 * Recursively collects JavaScript files from a directory.
 *
 * @param {string} dir Directory path.
 * @returns {Promise<string[]>} Absolute JS file paths.
 */
```

## Block 2

Associated declaration: `async function stripCjsPrologue(): Promise<void> {`

```ts
/**
 * Removes TypeScript CommonJS prologue lines that break browser globals.
 *
 * @returns {Promise<void>} Completion promise.
 */
```
