import '@onefootprint/footprint-js/dist/footprint-js.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Layout from '../components/layout';
import Providers from '../components/providers';
import { FATHOM_TRACKING_CODE, UNIFY_API_KEY } from '../config/constants';

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
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
    <Script />
    {UNIFY_API_KEY && (
      <Script
        async
        data-api-key={UNIFY_API_KEY}
        id="unifytag"
        src="https://tag.unifyintent.com/v1/K5zspsc6a9Zt7KHQdwat3t/script.js"
        type="module"
      />
    )}
    <Script
      id="apollo-tracker"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.trackingFunctions) {
          window.trackingFunctions.onLoad({
            appId: '663123f271615b03001f0da9',
          });
        }
      }}
      src={`https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${Math.random()
        .toString(36)
        .substring(7)}`}
      async
      defer
    />
    <Providers>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  </>
);

const GlobalStyle = createGlobalStyle`
 ${({ theme }) => css`
   :root {
     --desktop-header-height: 64px;
     --desktop-spacing: ${theme.spacing[10]};
     --mobile-header-height: 72px;
     --mobile-spacing: ${theme.spacing[9]};
     --custom-gray: #fcfcfc;
     font-size: 16px;
   }
   body {
     background-color: ${theme.backgroundColor.primary};
   }
 `}
`;

export default App;
