module.exports = {
  extends: [
    'next',
    'airbnb',
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'turbo',
    'prettier',
  ],

  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
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
        exceptions: [
          'FormProvider',
          'AddressInput',
          'App',
          'BaseInput',
          'Checkbox',
          'Component',
          'Field',
          'Input',
          'PhoneInput',
          'PinInput',
          'Radio',
          'SearchInput',
          'Select',
          'StyledField',
          'TextInput',
          'TextArea',
        ],
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
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'property',
        format: null,
        filter: {
          // you can expand this regex to add more allowed names
          regex: '^(paths|components|operations|external)$',
          match: false,
        },
      },
    ],
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
      extends: ['plugin:testing-library/react', 'plugin:jest/recommended'],
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
