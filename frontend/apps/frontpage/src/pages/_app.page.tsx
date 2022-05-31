import '@typeform/embed/build/css/popup.css';

import { IS_PROD } from 'global-constants';
import Script from 'next/script';
import React from 'react';
import { createGlobalStyle } from 'styled';
import { DesignSystemProvider, themes } from 'ui';

import Layout from '../components/layout';
import MDXProvider from '../components/mdx-provider';
import { FATHOM_ANALYTICS_SITE } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const GlobalStyle = createGlobalStyle``;

const App = ({ Component, pageProps }: AppProps) => (
  <>
    {IS_PROD && (
      <Script
        data-site={FATHOM_ANALYTICS_SITE}
        defer
        src="https://cdn.usefathom.com/script.js"
      />
    )}
    <DesignSystemProvider theme={themes.light}>
      <GlobalStyle />
      <Layout>
        <MDXProvider>
          <Component {...pageProps} />
        </MDXProvider>
      </Layout>
    </DesignSystemProvider>
  </>
);

export default App;
