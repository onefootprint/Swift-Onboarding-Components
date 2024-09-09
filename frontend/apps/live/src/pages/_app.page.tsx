import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';

import { DM_Mono, DM_Sans } from 'next/font/google';
import { createGlobalStyle } from 'styled-components';
import Providers from '../components/providers';
import { FATHOM_TRACKING_CODE } from '../config/constants';

const defaultFont = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  fallback: ['Inter'],
});

const codeFont = DM_Mono({
  display: 'swap',
  preload: true,
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

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
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </Head>
    <Providers>
      <GlobalStyle />
      <Component {...pageProps} />
    </Providers>
  </>
);

const GlobalStyle = createGlobalStyle`
   :root {
    font-family: ${defaultFont.style.fontFamily};
    --font-family-default: ${defaultFont.style.fontFamily};
    --font-family-code: ${codeFont.style.fontFamily};
   }
`;

export default App;
