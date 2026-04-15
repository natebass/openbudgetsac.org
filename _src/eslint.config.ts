const js = require('@eslint/js');
const globals = require('globals');
const googleConfig = require('eslint-config-google');
const jestPlugin = require('eslint-plugin-jest');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const googleRules = {...googleConfig.rules};
delete googleRules['max-len'];
delete googleRules['require-jsdoc'];
delete googleRules['valid-jsdoc'];

type FlatConfig = Record<string, unknown>;

const baseLanguageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    ...globals.browser,
    ...globals.node,
    ...globals.es2023,
    ...globals.jest,
  },
};

const baseRules = {
  ...googleRules,
  'curly': ['error', 'all'],
  'eqeqeq': ['error', 'always'],
  'no-implied-eval': 'error',
  'no-return-await': 'error',
  'react-hooks/rules-of-hooks': 'error',
  'jest/no-disabled-tests': 'error',
  'jest/no-focused-tests': 'error',
  'jest/valid-expect': 'error',
};

const config: Array<FlatConfig> = [
  {
    ignores: [
      'build/**',
      'coverage/**',
      'css/**',
      'data/**',
      'docs/**',
      'generated/**',
      'images/**',
      'js/dist/**',
      'node_modules/**',
      'styles/**',
      'vendor/**',
      '../build/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
    languageOptions: baseLanguageOptions,
    plugins: {
      'react-hooks': reactHooksPlugin,
      'jest': jestPlugin,
    },
    rules: baseRules,
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      ...baseLanguageOptions,
      parser: tsParser,
      parserOptions: {
        ...baseLanguageOptions.parserOptions,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'brace-style': 'off',
      'camelcase': 'off',
      'indent': 'off',
      'no-array-constructor': 'off',
      'no-invalid-this': 'off',
      'no-return-await': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/array-type': ['error', {default: 'generic'}],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', {prefer: 'type-imports'}],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', ignoreRestSiblings: true}],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/return-await': ['error', 'always'],
    },
  },
  {
    files: ['js/**/*.ts'],
    ignores: ['js/compare/**'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'eqeqeq': 'off',
      'guard-for-in': 'off',
      'new-cap': 'off',
      'no-empty': 'off',
      'no-redeclare': 'off',
      'prefer-rest-params': 'off',
    },
  },
  {
    files: ['types/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: [
      'test/**/*.ts',
      '__tests__/**/*.ts',
      'js/compare/__tests__/**/*.[jt]s?(x)',
      'bench/**/*.ts',
      '*.config.ts',
      '.eleventy.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
];

module.exports = config;
