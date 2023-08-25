module.exports = {
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'turbo',
    'prettier',
    '@react-native',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
      },
    },
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  rules: {
    'react/jsx-props-no-spreading': [
      'error',
      {
        exceptions: [],
      },
    ],
    'global-require': 'off',
    'react/no-unstable-nested-components': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
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
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      env: {
        jest: true,
      },
      files: [
        '**/?(*.)+(spec|test).[jt]s?(x)',
        '**/@onefootprint/test-utils/**/**.[jt]s?(x)',
      ],
      extends: ['plugin:jest/recommended'],
      rules: {
        'import/no-extraneous-dependencies': [
          'off',
          {
            devDependencies: [
              '**/?(*.)+(spec|test).[jt]s?(x)',
              '**/@onefootprint/test-utils/**/**.[jt]s?(x)',
            ],
          },
        ],
      },
    },
  ],
};
