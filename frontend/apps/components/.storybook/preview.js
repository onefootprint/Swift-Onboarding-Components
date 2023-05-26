import React from 'react';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import '@onefootprint/design-tokens/src/output/theme.css';

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
