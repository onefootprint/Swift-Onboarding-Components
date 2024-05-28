import '@onefootprint/footprint-js/dist/footprint-js.css';

import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';

import { FATHOM_TRACKING_CODE } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      {FATHOM_TRACKING_CODE && (
        <Script
          data-canonical="false"
          data-site={FATHOM_TRACKING_CODE}
          data-spa="auto"
          defer
          src="https://cdn.usefathom.com/script.js"
        />
      )}
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
    <DesignSystemProvider theme={themes.light}>
      <Component {...pageProps} />
    </DesignSystemProvider>
  </>
);
export default App;
