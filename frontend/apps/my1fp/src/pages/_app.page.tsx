import themes from '@onefootprint/themes';
import { DesignSystemProvider } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import My1FPQueryClientProvider from 'src/components/my1fp-query-client-provider';
import { createGlobalStyle } from 'styled-components';

import PageGuard from '../components/page-guard';
import configureReactI18next from '../config/initializers/react-i18next';
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
      <MachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <My1FPQueryClientProvider>
            <GlobalStyle />
            <PageGuard>
              <Component {...pageProps} />
            </PageGuard>
          </My1FPQueryClientProvider>
        </DesignSystemProvider>
      </MachineProvider>
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
