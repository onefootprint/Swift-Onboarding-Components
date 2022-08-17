import React from 'react';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import Layout from '../components/layout';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <DesignSystemProvider theme={themes.light}>
    <GlobalStyle />
    <Layout navigation={pageProps.navigation}>
      <Component {...pageProps} />
    </Layout>
  </DesignSystemProvider>
);

const GlobalStyle = createGlobalStyle`
  html {
    --header-height: 54px;
    scroll-padding-top: var(--header-height);
  }
`;

export default App;
