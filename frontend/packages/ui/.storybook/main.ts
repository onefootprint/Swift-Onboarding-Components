import { dirname, join } from 'path';
import type { StorybookConfig } from '@storybook/nextjs';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    ...[
      '@chromatic-com/storybook',
      '@storybook/addon-actions',
      '@storybook/addon-essentials',
      '@storybook/addon-interactions',
      '@storybook/addon-links',
      '@storybook/addon-themes',
      'storybook-addon-pseudo-states',
    ].map(getAbsolutePath),
    {
      name: getAbsolutePath('@storybook/addon-styling-webpack'),
      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  implementation: require.resolve('postcss'),
                },
              },
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
