import '@typeform/embed/build/css/popup.css';

import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import Drift from 'react-driftjs';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import Layout from '../components/layout';
import MDXProvider from '../components/mdx-provider';
import { FATHOM_TRACKING_CODE } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const GlobalStyle = createGlobalStyle``;

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
    {FATHOM_TRACKING_CODE && (
      <Script
        data-canonical="false"
        data-site={FATHOM_TRACKING_CODE}
        data-spa="auto"
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
        <Drift appId="bp8bybvft4dm" />
      </Layout>
    </DesignSystemProvider>
  </>
);
export default App;
