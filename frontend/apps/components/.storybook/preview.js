import React from 'react';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import i18n from './i18next.js';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  parameters: {
    i18n,
  },
  globals: {
    locale: 'english',
    locales: {
      english: 'English',
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
