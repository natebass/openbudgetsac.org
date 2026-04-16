# js/flow-page.ts

- JSDoc blocks found: 7

## Block 1

Associated declaration: `function flowPageI18nT(`

```ts
/**
 * Resolves a localized message with optional interpolation.
 *
 * @param {string} key Translation key.
 * @param {string} fallback Fallback message.
 * @param {Record<string, unknown>} [vars] Interpolation values.
 * @returns {string} Localized text.
 */
```

## Block 2

Associated declaration: `function resolveFlowFilename(filename: string): string {`

```ts
/**
 * Resolves a legacy filename alias to the normalized data asset name.
 *
 * @param {string} filename Raw filename from page markup.
 * @returns {string} Normalized filename.
 */
```

## Block 3

Associated declaration: `function showFlowStatus(message: string, isError: boolean): void {`

```ts
/**
 * Updates the flow status region with the current load state.
 *
 * @param {string} message Screen-readable status text.
 * @param {boolean} isError Whether the message describes an error.
 * @returns {void}
 */
```

## Block 4

Associated declaration: `function readFlowFiles(): Array<FlowFileRecord> {`

```ts
/**
 * Reads flow file metadata from JSON bootstrap data or hidden inputs.
 *
 * @returns {FlowFileRecord[]} Available CSV file records.
 */
```

## Block 5

Associated declaration: `function buildFlowDisplayFiles(`

```ts
/**
 * Builds the display metadata used by the fiscal-year dropdown.
 *
 * @param {FlowFileRecord[]} files Raw file list.
 * @returns {FlowDisplayRecord[]} Sorted display records.
 */
```

## Block 6

Associated declaration: `function initFlowPage(): void {`

```ts
/**
 * Initializes the shared flow page controls and chart loading.
 *
 * @returns {void}
 */
```

## Block 7

Associated declaration: `function drawFlow(): boolean {`

```ts
/**
   * Loads the selected flow CSV and redraws the chart.
   *
   * @returns {boolean} False when the selected year is not usable.
   */
```
