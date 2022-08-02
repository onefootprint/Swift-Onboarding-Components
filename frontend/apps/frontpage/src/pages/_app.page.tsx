import '@typeform/embed/build/css/popup.css';

import Script from 'next/script';
import React from 'react';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import Layout from '../components/layout';
import MDXProvider from '../components/mdx-provider';
import { FATHOM_TRACKING_CODE } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import useFathomAnalytics from '../hooks/use-fathom-analytics';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const GlobalStyle = createGlobalStyle``;

const App = ({ Component, pageProps }: AppProps) => {
  useFathomAnalytics();

  return (
    <>
      {FATHOM_TRACKING_CODE && (
        <Script
          data-site={FATHOM_TRACKING_CODE}
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
};
export default App;
