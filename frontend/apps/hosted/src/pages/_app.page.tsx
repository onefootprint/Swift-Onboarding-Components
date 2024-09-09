import { Logger } from '@onefootprint/idv';
import type { AppProps } from 'next/app';
import { DM_Mono, DM_Sans } from 'next/font/google';
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

const codeFont = DM_Mono({
  display: 'swap',
  preload: true,
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const App = ({ Component, pageProps }: AppProps) => (
  <Providers pageProps={pageProps}>
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
