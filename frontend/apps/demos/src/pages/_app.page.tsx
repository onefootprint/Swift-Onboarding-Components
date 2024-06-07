import '@onefootprint/footprint-js/dist/footprint-js.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import Providers from '../components/providers';

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </Head>
    <Providers>
      <Component {...pageProps} />
    </Providers>
  </>
);

export default App;
