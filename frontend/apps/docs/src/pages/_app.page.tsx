import themes from '@onefootprint/design-tokens';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import Cmd from 'src/components/cmd';

import AppHeader from '../components/app-header';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
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
      <DesignSystemProvider theme={themes.light}>
        <GlobalStyle />
        <AppHeader navigation={pageProps.page?.navigation} />
        <Component {...pageProps} />
        <Cmd navigation={pageProps.page?.navigation} />
      </DesignSystemProvider>
    </QueryClientProvider>
  </>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      --header-height: 56px;
      --page-aside-nav-width: 270px;

      ${media.greaterThan('sm')`
        --header-height: 56px;
      `}

      scroll-padding-top: calc(var(--header-height) + ${theme.spacing[5]});
      scroll-behavior: smooth;
    }
  `};
`;

export default App;
