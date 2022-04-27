module.exports = {
  ...require('config/eslint-base-web.js'),
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
