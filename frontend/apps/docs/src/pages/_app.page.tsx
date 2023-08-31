import { createGlobalStyle, css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import CustomDesignSystemProvider from '../components/custom-design-system-provider';
import { API_REFERENCE_PATH } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import ApiReferenceLayout from './api-reference-layout';
import DocsLayout from './docs-layout';

configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(
    () => setMounted(true),

    [],
  );
  if (!mounted) return null;
  const isApiReference = router.asPath.startsWith(API_REFERENCE_PATH);

  return (
    <>
      <Head>
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
      </Head>
      <QueryClientProvider client={queryClient}>
        <CustomDesignSystemProvider>
          <GlobalStyle />
          {isApiReference ? (
            <ApiReferenceLayout>
              <p> isAPIReference </p>
            </ApiReferenceLayout>
          ) : (
            <DocsLayout
              article={pageProps.article}
              navigation={pageProps.page?.navigation}
            >
              <Component {...pageProps} />
            </DocsLayout>
          )}
        </CustomDesignSystemProvider>
      </QueryClientProvider>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      --header-height: 56px;
      --page-aside-nav-width: 270px;
      --page-aside-nav-api-reference-width: 288px;
      --page-sections-width: 240px;
      --page-content-width: 720px;

      ${media.greaterThan('sm')`
        --header-height: 56px;
      `}

      scroll-padding-top: calc(var(--header-height) + ${theme.spacing[5]});
      scroll-behavior: smooth;
    }
  `};
`;

export default App;
