# js/i18n-site.ts

- JSDoc blocks found: 15

## Block 1

Associated declaration: `function normalizeLocale(value) {`

```ts
/**
   * Normalizes locale values to supported site locales.
   *
   * @param {unknown} value Candidate locale input.
   * @returns {'en-US'|'es-419'|null} Supported locale code or null.
   */
```

## Block 2

Associated declaration: `function interpolate(template: string, vars?: Record<string, unknown>) {`

```ts
/**
   * Replaces token placeholders in a localized string.
   *
   * @param {string} template Translation template.
   * @param {Record<string, unknown>} vars Interpolation variables.
   * @returns {string} Interpolated string.
   */
```

## Block 3

Associated declaration: `function t(key: string, fallback?: string, vars?: Record<string, unknown>) {`

```ts
/**
   * Resolves a translation key with optional fallback and interpolation.
   *
   * @param {string} key Translation key.
   * @param {string} fallback Fallback message.
   * @param {Record<string, unknown>} vars Interpolation variables.
   * @returns {string} Localized text.
   */
```

## Block 4

Associated declaration: `function resolveLocale() {`

```ts
/**
   * Resolves locale from query params, storage, document, and browser preferences.
   *
   * @returns {'en-US'|'es-419'} Resolved locale.
   */
```

## Block 5

Associated declaration: `function applyTranslations(root: Document | Element) {`

```ts
/**
   * Applies data-attribute-based translations to a root node.
   *
   * @param {Document|Element} root DOM root for translation updates.
   * @returns {void}
   */
```

## Block 6

Associated declaration: `function getSortedReplacementKeys(map) {`

```ts
/**
   * Returns cached map keys sorted by length, longest first.
   *
   * @param {Record<string, string>} map Replacement map.
   * @returns {string[]} Sorted keys.
   */
```

## Block 7

Associated declaration: `function applyFragmentMap(value, map) {`

```ts
/**
   * Applies fragment substitutions using a translation map.
   *
   * @param {string} value Source text.
   * @param {Record<string, string>} map Replacement map.
   * @returns {string} Text with substitutions applied.
   */
```

## Block 8

Associated declaration: `function translateLegacyText(`

```ts
/**
   * Translates a dynamic legacy data label using locale-specific maps.
   *
   * @param {string} value Label text.
   * @param {string} locale Locale override.
   * @returns {string} Translated label when available.
   */
```

## Block 9

Associated declaration: `function applyLegacyAttributeTranslations(`

```ts
/**
   * Translates legacy text fragments in selected element attributes.
   *
   * @param {Document|Element} root Root node.
   * @param {Record<string, string>} attributeMap Translation map.
   * @returns {void}
   */
```

## Block 10

Associated declaration: `function applyLegacyTextNodeTranslations(`

```ts
/**
   * Translates legacy free-text nodes across the rendered document.
   *
   * @param {Document|Element} root Root node.
   * @param {Record<string, string>} textMap Translation map.
   * @returns {void}
   */
```

## Block 11

Associated declaration: `function applyLegacyDocumentTitleTranslations(locale) {`

```ts
/**
   * Translates the document title using the legacy text map.
   *
   * @param {'en-US'|'es-419'} locale Active locale.
   * @returns {void}
   */
```

## Block 12

Associated declaration: `function applyLegacyLeafText(root: Document | Element) {`

```ts
/**
   * Applies legacy attribute, text-node, and title translations.
   *
   * @param {Document|Element} root Root node.
   * @returns {void}
   */
```

## Block 13

Associated declaration: `function propagateLocaleToLinks(`

```ts
/**
   * Appends the active locale to same-origin links in a DOM root.
   *
   * @param {'en-US'|'es-419'} locale Active locale.
   * @param {Document|Element} root Root node.
   * @returns {void}
   */
```

## Block 14

Associated declaration: `function setLocale(locale: string, options?: {persist?: boolean}) {`

```ts
/**
   * Sets the active locale and re-renders translated content.
   *
   * @param {string} locale Requested locale.
   * @param {{persist?: boolean}} options Optional behavior flags.
   * @returns {void}
   */
```

## Block 15

Associated declaration: `function init() {`

```ts
/**
   * Initializes locale state and language selector bindings.
   *
   * @returns {void}
   */
```
