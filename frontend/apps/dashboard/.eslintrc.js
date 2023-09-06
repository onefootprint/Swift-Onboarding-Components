module.exports = {
  root: true,
  extends: ['footprint'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
  },
};
