import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { DesignSystemProvider } from '@onefootprint/ui';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import ErrorBoundary from '../components/error-boundary';
import Layout from '../components/layout';
import configureReactI18next from '../config/initializers/react-i18next';
import ReactQueryProvider from '../config/initializers/react-query-provider';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=900,maximum-scale=1.0" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <ObserveCollectorProvider appName="dashboard">
        <ReactQueryProvider>
          <DesignSystemProvider theme={themes.dark}>
            <GlobalStyle />
            <ErrorBoundary>
              <Layout name={pageProps.layout}>
                <Component />
              </Layout>
            </ErrorBoundary>
          </DesignSystemProvider>
        </ReactQueryProvider>
      </ObserveCollectorProvider>
      <Analytics />
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    #__next {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    body {
      min-width: ${theme.grid.container.maxWidth.md}px;
    }
  `}
`;

export default App;
