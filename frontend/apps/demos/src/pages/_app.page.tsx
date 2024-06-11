import '@onefootprint/footprint-js/dist/footprint-js.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import { createGlobalStyle } from 'styled-components';
import Providers from '../components/providers';

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

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </Head>
    <Providers>
      <GlobalStyle />
      <Component {...pageProps} />
    </Providers>
  </>
);

const GlobalStyle = createGlobalStyle`
   html {
    font-family: ${defaultFont.style.fontFamily};
    --font-family-default: ${defaultFont.style.fontFamily};
    --font-family-code: ${codeFont.style.fontFamily};
`;

export default App;
