import { media } from '@onefootprint/ui';
import type { AppProps } from 'next/app';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';

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

const App = ({ Component, pageProps }: AppProps) => {
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
        <Component {...pageProps} />
      </Providers>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      font-family: ${defaultFont.style.fontFamily};
      --font-family-default: ${defaultFont.style.fontFamily};
      --font-family-code: ${codeFont.style.fontFamily};
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
