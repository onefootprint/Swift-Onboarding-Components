import themes from '@onefootprint/themes';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import My1FPQueryClientProvider from 'src/components/my1fp-query-client-provider';
import { createGlobalStyle } from 'styled-components';
import { DesignSystemProvider } from 'ui';

import PageGuard from '../components/page-guard';
import configureReactI18next from '../config/initializers/react-i18next';
import configureSentry from '../config/initializers/sentry';
import MachineProvider from './liveness-check/components/machine-provider';

configureSentry();
const i18n = configureReactI18next();

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
      <I18nextProvider i18n={i18n}>
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
      </I18nextProvider>
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
