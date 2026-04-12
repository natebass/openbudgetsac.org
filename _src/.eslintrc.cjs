module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'react-hooks', 'jest'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:jest/recommended'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/prop-types': 'off',
    'curly': ['error', 'all'],
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-implied-eval': 'error',
    'no-return-await': 'error',
    'react/jsx-key': 'error',
    'react/self-closing-comp': 'error',
    'jest/no-disabled-tests': 'error',
    'jest/no-focused-tests': 'error',
    'jest/valid-expect': 'error'
  },
  overrides: [
    {
      files: ['test/**/*.js', '__tests__/**/*.js', 'js/compare/__tests__/**/*.[jt]s?(x)'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['bench/**/*.js'],
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        'no-console': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'css/',
    'styles/',
    'images/',
    'data/',
    'js/old/',
    'js/dist/',
    '../build/'
  ]
}
