# scripts/add-missing-jsdoc.ts

- JSDoc blocks found: 15

## Block 1

Associated declaration: `function normalizeRelative(filePath: string): string {`

```ts
/**
 * Builds normalize relative.
 *
 * @param {any} filePath Input value.
 * @returns {any} Function result.
 */
```

## Block 2

Associated declaration: `function shouldSkip(relativePath: string): boolean {`

```ts
/**
 * Checks whether should skip.
 *
 * @param {any} relativePath Input value.
 * @returns {any} Function result.
 */
```

## Block 3

Associated declaration: `function isSourceFile(filePath: string): boolean {`

```ts
/**
 * Checks whether is source file.
 *
 * @param {any} filePath Input value.
 * @returns {any} Function result.
 */
```

## Block 4

Associated declaration: `async function collectFiles(dir: string): Promise<Array<string>> {`

```ts
/**
 * Gets collect files.
 *
 * @param {any} dir Input value.
 * @returns {any} Function result.
 */
```

## Block 5

Associated declaration: `function hasJSDocBefore(node: any, comments: Array<any>): boolean {`

```ts
/**
 * Checks whether has jsdoc before.
 *
 * @param {any} node Input value.
 * @param {any} comments Input value.
 * @returns {any} Function result.
 */
```

## Block 6

Associated declaration: `function toWords(name: string): string {`

```ts
/**
 * Runs to words.
 *
 * @param {any} name Input value.
 * @returns {any} Function result.
 */
```

## Block 7

Associated declaration: `function describeName(name: string): string {`

```ts
/**
 * Runs describe name.
 *
 * @param {any} name Input value.
 * @returns {any} Function result.
 */
```

## Block 8

Associated declaration: `function paramName(node: any, index: number): string {`

```ts
/**
 * Runs param name.
 *
 * @param {any} node Input value.
 * @param {any} index Input value.
 * @returns {any} Function result.
 */
```

## Block 9

Associated declaration: `function getIndent(source: string, index: number): string {`

```ts
/**
 * Gets get indent.
 *
 * @param {any} source Input value.
 * @param {any} index Input value.
 * @returns {any} Function result.
 */
```

## Block 10

Associated declaration: `function getFunctionName(node: any, parent: any): string | null {`

```ts
/**
 * Gets get function name.
 *
 * @param {any} node Input value.
 * @param {any} parent Input value.
 * @returns {any} Function result.
 */
```

## Block 11

Associated declaration: `function buildJSDoc(name: string, params: Array<any>, indent: string): string {`

```ts
/**
 * Builds build jsdoc.
 *
 * @param {any} name Input value.
 * @param {any} params Input value.
 * @param {any} indent Input value.
 * @returns {any} Function result.
 */
```

## Block 12

Associated declaration: `\`);`

```ts
/**`,
    `${indent} * ${describeName(name)}`,
    `${indent} *`,
  ];

  params.forEach((param, index) => {
    lines.push(
      `${indent} * @param {any} ${paramName(param, index)} Input value.`,
    );
  });

  lines.push(`${indent} * @returns {any} Function result.`);
  lines.push(`${indent} */
```

## Block 13

Associated declaration: `function traverseAndCollect(`

```ts
/**
 * Runs traverse and collect.
 *
 * @param {any} node Input value.
 * @param {any} parent Input value.
 * @param {any} comments Input value.
 * @param {any} source Input value.
 * @param {any} inserts Input value.
 * @returns {any} Function result.
 */
```

## Block 14

Associated declaration: `async function patchFile(`

```ts
/**
 * Runs patch file.
 *
 * @param {any} absolutePath Input value.
 * @returns {any} Function result.
 */
```

## Block 15

Associated declaration: `async function main(): Promise<void> {`

```ts
/**
 * Runs main.
 *
 * @returns {any} Function result.
 */
```
