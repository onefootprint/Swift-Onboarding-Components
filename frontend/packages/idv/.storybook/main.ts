import * as path from 'node:path';
import type { StorybookConfig } from '@storybook/nextjs';

const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';

import { dirname, join } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-actions'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
  typescript: {
    skipCompiler: true,
  },
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '../../../../utils/get-random-id': path.resolve(
          __dirname,
          './../src/utils/get-random-id/get-random-id.mock.ts',
        ),
      };
    }

    return config;
  },
};

module.exports = IS_ANALYZE_ACTIVE ? require('@next/bundle-analyzer')({ enabled: true })(config) : config;
