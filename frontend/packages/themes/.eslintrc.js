module.exports = {
  ...require('config/eslint-base-web'),
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
