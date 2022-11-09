import React from 'react';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '../src/utils/design-system-provider';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  Story => (
    <DesignSystemProvider theme={themes.light}>
      <Story />
    </DesignSystemProvider>
  ),
];
