import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import FootprintDevTools from '@onefootprint/dev-tools';
import { DesignSystemProvider } from '@onefootprint/ui';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Layout from '../components/layout';
import PageGuard from '../components/page-guard';
import configureReactI18next from '../config/initializers/react-i18next';
import ReactQueryProvider from '../config/initializers/react-query-provider';
import configureSentry from '../config/initializers/sentry';
import { UserDataProvider } from './users/hooks/use-user-data';

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
      <ReactQueryProvider>
        <DesignSystemProvider theme={themes.light}>
          <FootprintDevTools />
          <UserDataProvider>
            <GlobalStyle />
            <PageGuard>
              <Layout name={pageProps.layout}>
                <Component />
              </Layout>
            </PageGuard>
          </UserDataProvider>
        </DesignSystemProvider>
      </ReactQueryProvider>
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
