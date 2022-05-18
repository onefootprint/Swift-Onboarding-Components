module.exports = {
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    'next',
    'airbnb',
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/'],
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['apps/*/tsconfig.json'],
      },
    },
  },
  rules: {
    'react/jsx-props-no-spreading': [
      'error',
      {
        exceptions: ['TextInput', 'Component', 'App'],
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'class-methods-use-this': [0],
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
      },
    ],
    'no-restricted-exports': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    '@next/next/no-html-link-for-pages': 'off',
  },
  overrides: [
    {
      // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching files!
      env: {
        jest: true,
      },
      files: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
        '**/test-utils/**/*.[jt]s?(x)',
      ],
      extends: ['plugin:testing-library/react', 'plugin:jest/recommended'],
      rules: {
        'import/no-extraneous-dependencies': [
          'off',
          {
            devDependencies: [
              '**/?(*.)+(spec|test).[jt]s?(x)',
              '**/test-utils/**/*.[jt]s?(x)',
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: [
    '**/*.js',
    '**/*.json',
    'node_modules',
    'public',
    'styles',
    '.next',
    'coverage',
    'dist',
    '.turbo',
  ],
};
