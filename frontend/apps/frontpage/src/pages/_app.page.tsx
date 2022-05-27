import '@typeform/embed/build/css/popup.css';

import React from 'react';
import { createGlobalStyle } from 'styled';
import { DesignSystemProvider, themes } from 'ui';

import Layout from '../components/layout';
import MDXProvider from '../components/mdx-provider';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const GlobalStyle = createGlobalStyle``;

const App = ({ Component, pageProps }: AppProps) => (
  <DesignSystemProvider theme={themes.light}>
    <GlobalStyle />
    <Layout>
      <MDXProvider>
        <Component {...pageProps} />
      </MDXProvider>
    </Layout>
  </DesignSystemProvider>
);

export default App;
