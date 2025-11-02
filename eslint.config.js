import js from '@eslint/js';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    plugins: {
      jest,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-conditional-expect': 'error',
      'jest/no-identical-title': 'error',
    },
  },
  {
    files: ['test/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];