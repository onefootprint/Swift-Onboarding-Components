import '@onefootprint/footprint-js/dist/footprint-js.css';
import '@onefootprint/ui/styles.css';
import Intercom from '@intercom/messenger-js-sdk';
import { GoogleTagManager } from '@next/third-parties/google';
import type { AppProps } from 'next/app';
import { DM_Mono, DM_Sans } from 'next/font/google';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { storeCurrentUrlParamsInSession } from 'src/utils/dom';
import { createGlobalStyle, css } from 'styled-components';
import Layout from '../components/layout';
import Providers from '../components/providers';
import { INTERCOM_APP_ID, UNIFY_API_KEY } from '../config/constants';
import '../styles/globals.css';

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
  subsets: ['latin'],
  variable: '--font-family-code',
  weight: ['300', '400', '500'],
  fallback: ['Courier New'],
});

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    if (INTERCOM_APP_ID) {
      Intercom({ app_id: INTERCOM_APP_ID });
    }
  }, []);

  useEffect(() => {
    storeCurrentUrlParamsInSession();
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
     --desktop-header-height: 56px;
     --mobile-header-height: 56px;
     --custom-gray: #fcfcfc;
     font-size: 16px;
   }
   body {
     background-color: ${theme.backgroundColor.primary};
   }
 `}
`;

export default App;
