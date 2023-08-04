import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import CustomDesignSystemProvider from '../components/custom-design-system-provider';
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
      </Head>
      <ObserveCollectorProvider appName="dashboard">
        <ReactQueryProvider>
          <CustomDesignSystemProvider>
            <GlobalStyle />
            <ErrorBoundary>
              <Layout name={pageProps.layout}>
                <Component />
              </Layout>
            </ErrorBoundary>
          </CustomDesignSystemProvider>
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
