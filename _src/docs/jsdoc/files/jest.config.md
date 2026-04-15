# jest.config.ts

- JSDoc blocks found: 3

## Block 1

Associated declaration: `__tests__/**',`

```ts
/**/*.{ts,tsx}',
    '!<rootDir>/js/compare/**/
```

## Block 2

Associated declaration: `*.test.[jt]s?(x)'],`

```ts
/**',
    '!<rootDir>/js/compare/index.tsx',
    '!<rootDir>/js/compare/Trend.tsx',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  clearMocks: true,
  restoreMocks: true,
  errorOnDeprecated: true,
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/js/compare/__tests__/**/
```

## Block 3

Associated declaration: `*.test.ts'],`

```ts
/**/*.a11y.[jt]s?(x)'],
      setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      moduleNameMapper,
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/e2e/**/
```
