import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureReactI18next();
configureSentry();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <DesignSystemProvider theme={themes.light}>
      <GlobalStyle />
      <Component {...pageProps} />
    </DesignSystemProvider>
  </QueryClientProvider>
);

const GlobalStyle = createGlobalStyle``;

export default App;
