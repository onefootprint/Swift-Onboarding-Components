import React from 'react';
import { QueryClientProvider } from 'react-query';
import PageGuard from 'src/components/page-guard';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import Layout from '../components/layout';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';
import { UserDataProvider } from './users/hooks/use-user-data';

configureSentry();
configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <DesignSystemProvider theme={themes.light}>
      <UserDataProvider>
        <GlobalStyle />
        <PageGuard>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PageGuard>
      </UserDataProvider>
    </DesignSystemProvider>
  </QueryClientProvider>
);

const GlobalStyle = createGlobalStyle``;

export default App;
