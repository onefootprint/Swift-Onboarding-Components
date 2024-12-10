const { override, disableEsLint, babelInclude } = require('customize-cra');
const path = require('path');

module.exports = override(
  config => {
    disableEsLint();
    return config;
  },
  babelInclude([
    path.resolve('src'),
    path.resolve('../../packages/axios'),
    path.resolve('../../packages/request'),
    path.resolve('../../packages/dev-tools'),
    path.resolve('../../packages/types'),
  ]),
);
