const moduleNameMapper = {
  '^d3-array$': '<rootDir>/node_modules/d3-array/dist/d3-array.js',
  '^d3-collection$':
    '<rootDir>/node_modules/d3-collection/dist/d3-collection.js',
  '^d3-format$': '<rootDir>/node_modules/d3-format/dist/d3-format.js',
};

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/js/compare/**/*.{ts,tsx}',
    '!<rootDir>/js/compare/**/__tests__/**',
    '!<rootDir>/js/compare/index.tsx',
    '!<rootDir>/js/compare/Trend.tsx',
    '!<rootDir>/js/compare/types.ts',
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
      testMatch: ['<rootDir>/js/compare/__tests__/**/*.test.[jt]s?(x)'],
      setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      moduleNameMapper,
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      testPathIgnorePatterns: ['/node_modules/', '/__tests__/e2e/'],
    },
    {
      displayName: 'a11y',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/js/compare/__tests__/a11y/**/*.a11y.[jt]s?(x)'],
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
      testMatch: ['<rootDir>/__tests__/e2e/**/*.test.ts'],
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      testTimeout: 120000,
    },
  ],
};
