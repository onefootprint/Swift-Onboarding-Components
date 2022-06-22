import React from 'react';
import PageGuard from 'src/components/page-guard';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import Layout from '../components/layout';
import DashboardQueryClientProvider from '../config/initializers/dashboard-query-client-provider';
import configureReactI18next from '../config/initializers/react-i18next';
import configureSentry from '../config/initializers/sentry';
import { UserDataProvider } from './users/hooks/use-user-data';

configureSentry();
configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <DesignSystemProvider theme={themes.light}>
    <DashboardQueryClientProvider>
      <UserDataProvider>
        <GlobalStyle />
        <PageGuard>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PageGuard>
      </UserDataProvider>
    </DashboardQueryClientProvider>
  </DesignSystemProvider>
);

const GlobalStyle = createGlobalStyle``;

export default App;
