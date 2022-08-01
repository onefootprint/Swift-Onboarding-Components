import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import PageGuard from 'src/components/page-guard';
import { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import Layout from '../components/layout';
import configureReactI18next from '../config/initializers/react-i18next';
import ReactQueryProvider from '../config/initializers/react-query-provider';
import configureSentry from '../config/initializers/sentry';
import { UserDataProvider } from './users/hooks/use-user-data';

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
        <meta name="viewport" content="width=900,maximum-scale=1.0" />
      </Head>
      <DesignSystemProvider theme={themes.light}>
        <ReactQueryProvider>
          <UserDataProvider>
            <GlobalStyle />
            <PageGuard>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </PageGuard>
          </UserDataProvider>
        </ReactQueryProvider>
      </DesignSystemProvider>
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
