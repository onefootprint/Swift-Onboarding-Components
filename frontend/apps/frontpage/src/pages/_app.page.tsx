import '@onefootprint/footprint-js/dist/footprint-js.css';
import { GoogleTagManager } from '@next/third-parties/google';

import Intercom from '@intercom/messenger-js-sdk';
import type { AppProps } from 'next/app';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import Head from 'next/head';
import Script from 'next/script';
import React, { useEffect } from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Layout from '../components/layout';
import Providers from '../components/providers';
import { INTERCOM_APP_ID, UNIFY_API_KEY } from '../config/constants';

const defaultFont = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  fallback: ['Inter'],
});

const codeFont = Source_Code_Pro({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    if (INTERCOM_APP_ID) {
      Intercom({
        app_id: INTERCOM_APP_ID,
      });
    }
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
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
      <GoogleTagManager gtmId="GTM-PKWK59QW" />
      <Providers>
        <GlobalStyle />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
 ${({ theme }) => css`
   :root {
    font-family: ${defaultFont.style.fontFamily};
    --font-family-default: ${defaultFont.style.fontFamily};
    --font-family-code: ${codeFont.style.fontFamily};
     --desktop-header-height: 64px;
     --mobile-header-height: 72px;
     --custom-gray: #fcfcfc;
     font-size: 16px;
   }
   body {
     background-color: ${theme.backgroundColor.primary};
   }
 `}
`;

export default App;
