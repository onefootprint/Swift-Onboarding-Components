import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureReactI18next();
configureSentry();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

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
