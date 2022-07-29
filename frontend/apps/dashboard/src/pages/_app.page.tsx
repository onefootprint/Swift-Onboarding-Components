import React, { useEffect, useState } from 'react';
import PageGuard from 'src/components/page-guard';
import { createGlobalStyle, css } from 'styled-components';
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

const App = ({ Component, pageProps }: AppProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
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
