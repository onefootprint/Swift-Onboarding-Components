const { override, disableEsLint, babelInclude, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const webpack = require('webpack');

module.exports = override(
  config => {
    disableEsLint();
    return config;
  },
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      globalThis: 'globalthis',
    }),
  ),
  babelInclude([
    path.resolve('src'),
    path.resolve('../../packages/axios'),
    path.resolve('../../packages/request'),
    path.resolve('../../packages/dev-tools'),
    path.resolve('../../packages/types'),
  ]),
);
