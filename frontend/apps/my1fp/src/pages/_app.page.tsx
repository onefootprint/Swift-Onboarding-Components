import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from 'react-query';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import PageGuard from '../components/page-guard';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';
import MachineProvider from './liveness-check/components/machine-provider';

configureSentry();
configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <MachineProvider>
          <DesignSystemProvider theme={themes.light}>
            <GlobalStyle />
            <PageGuard>
              <Component {...pageProps} />
            </PageGuard>
          </DesignSystemProvider>
        </MachineProvider>
      </QueryClientProvider>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  #__next {
    height: 100vh;
  }
`;

export default App;
