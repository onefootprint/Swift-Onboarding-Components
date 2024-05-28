import '@onefootprint/footprint-js/dist/footprint-js.css';

import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import configureReactI18next from '../config/initializers/react-i18next';
import configureReactQuery from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();
const queryClient = configureReactQuery();

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={themes.light}>
        <GlobalStyle />
        <Component {...pageProps} />
      </DesignSystemProvider>
    </QueryClientProvider>
  </>
);

const GlobalStyle = createGlobalStyle``;

export default App;
