import React from 'react';
import { addDecorator } from '@storybook/react';
import { withThemesProvider } from 'storybook-addon-styled-component-theme';
import { ThemeProvider } from 'styled-components';
import light from '../src/config/themes/light';
import dark from '../src/config/themes/dark';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const themes = [light, dark];
addDecorator(withThemesProvider(themes), ThemeProvider);
