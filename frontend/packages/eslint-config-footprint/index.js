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
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    'class-methods-use-this': [0],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-unresolved': ['error', { ignore: ['bun:test'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-restricted-exports': 'off',
    'import/no-unresolved': ['error', { ignore: ['^bun:test$'] }],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
        message: 'Unexpected property on console object was called',
      },
    ],
    'no-use-before-define': 'off',
    'react/display-name': 'off',
    'react/function-component-definition': [
      2,
      { namedComponents: 'arrow-function' },
    ],
    'react/jsx-props-no-spreading': [
      'error',
      {
        exceptions: [
          'AddressInput',
          'App',
          'BaseInput',
          'Box',
          'Checkbox',
          'Component',
          'components.Control',
          'components.Input',
          'Field',
          'FormProvider',
          'Input',
          'input',
          'NativeSelect',
          'PhoneInput',
          'PinInput',
          'Radio',
          'RealInput',
          'SearchInput',
          'Select',
          'StyledField',
          'Textarea',
          'TextArea',
          'TextInput',
          'Toggle',
        ],
      },
    ],

    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
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
