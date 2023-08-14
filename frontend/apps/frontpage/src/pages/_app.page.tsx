import '@onefootprint/footprint-js/dist/footprint-js.css';

import { createGlobalStyle, css } from '@onefootprint/styled';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';

import CustomDesignSystemProvider from '../components/custom-design-system-provider';
import Layout from '../components/layout';
import MDXProvider from '../components/mdx-provider';
import { FATHOM_TRACKING_CODE } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

configureReactI18next();

const GlobalStyle = createGlobalStyle`
 ${({ theme }) => css`
   :root {
     --desktop-header-height: 64px;
     --desktop-spacing: ${theme.spacing[10]};
     --mobile-header-height: 72px;
     --mobile-spacing: ${theme.spacing[9]};
     font-size: 16px;
   }
   body {
     background-color: ${theme.backgroundColor.primary};
   }
 `}
`;

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
    <Script />
    <Script
      id="hotjar"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:3586342,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
      }}
    />
    <QueryClientProvider client={queryClient}>
      <CustomDesignSystemProvider>
        <GlobalStyle />
        <Layout>
          <MDXProvider>
            <Component {...pageProps} />
          </MDXProvider>
        </Layout>
      </CustomDesignSystemProvider>
    </QueryClientProvider>
  </>
);

export default App;
