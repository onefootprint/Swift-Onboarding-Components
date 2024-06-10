import { Logger } from '@onefootprint/idv';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import Providers from '../components/providers';
import { GOOGLE_MAPS_SRC } from '../config/constants';

// Don't enable log rocket until we know we are in a live onboarding
Logger.init('bifrost', true);

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </Head>
    <Providers pageProps={pageProps}>
      <GlobalStyle />
      <Component {...pageProps} />
    </Providers>
    {GOOGLE_MAPS_SRC ? <Script src={GOOGLE_MAPS_SRC} async strategy="lazyOnload" /> : null}
  </>
);

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 56px;
    --loading-container-min-height: 188px;
    height: 100%;
  }

  body {
    background: transparent;
    height: 100%;

    #__next {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
`;

export default App;
