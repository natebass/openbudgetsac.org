const js = require('@eslint/js')
const globals = require('globals')
const jestPlugin = require('eslint-plugin-jest')
const reactHooksPlugin = require('eslint-plugin-react-hooks')

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'css/**',
      'styles/**',
      'images/**',
      'data/**',
      'js/old/**',
      'js/dist/**',
      '../build/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        ...globals.jest
      }
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
      jest: jestPlugin
    },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'jest/no-disabled-tests': 'error',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error'
    }
  },
  {
    files: ['test/**/*.js', '__tests__/**/*.js', 'js/compare/__tests__/**/*.[jt]s?(x)'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['bench/**/*.js', 'jest.config.cjs', 'webpack.config.js'],
    languageOptions: {
      sourceType: 'commonjs'
    },
    rules: {
      'no-console': 'off'
    }
  }
]
