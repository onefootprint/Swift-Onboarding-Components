import { Logger } from '@onefootprint/idv';
import type { AppProps } from 'next/app';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Providers from '../components/providers';

// Don't enable log rocket until we know we are in a live onboarding
Logger.init('hosted', /* deferSessionRecord */ true);

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
  <Providers>
    <GlobalStyle />
    <Component {...pageProps} />
  </Providers>
);

const GlobalStyle = createGlobalStyle`
  html {
    font-family: ${defaultFont.style.fontFamily};
    --font-family-default: ${defaultFont.style.fontFamily};
    --font-family-code: ${codeFont.style.fontFamily};
    --navigation-header-height: 56px;
    --loading-container-min-height: 188px;
  }

  ${({ theme }) => css`
    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
    }
  `}`;

export default App;
