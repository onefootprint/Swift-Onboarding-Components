import { media } from '@onefootprint/ui';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Providers from '../components/providers';
import { API_REFERENCE_PATH, INTERNAL_API_REFERENCE_PATH } from '../config/constants';
import ApiReference from './api-reference';
import Docs from './docs';
import InternalApiReference from './internal-api-reference';

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isApiReference = router.asPath.startsWith(API_REFERENCE_PATH);
  const isInternalApiReference = router.asPath.startsWith(INTERNAL_API_REFERENCE_PATH);
  const isDocsSite = !isApiReference && !isInternalApiReference;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      <Providers>
        <GlobalStyle />
        {isApiReference && <ApiReference />}
        {isInternalApiReference && <InternalApiReference />}
        {isDocsSite && (
          <Docs article={pageProps.article} navigation={pageProps.page?.navigation}>
            <Component {...pageProps} />
          </Docs>
        )}
      </Providers>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      --header-height: 56px;
      --page-aside-nav-width: 270px;
      --page-aside-nav-api-reference-width: 420px;
      --page-aside-nav-api-reference-width-small: 320px;
      --page-sections-width: 240px;
      --page-content-width: 800px;

      ${media.greaterThan('sm')`
        --header-height: 56px;
      `}

      scroll-padding-top: calc(var(--header-height) + ${theme.spacing[5]});
      scroll-behavior: smooth;
    }
  `};
`;

export default App;
