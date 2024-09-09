import { Logger } from '@onefootprint/idv';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { createGlobalStyle } from 'styled-components';

import { DM_Mono, DM_Sans } from 'next/font/google';
import Providers from '../components/providers';
import { GOOGLE_MAPS_SRC } from '../config/constants';
Logger.init('components', /* deferSessionRecord */ true);

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
    <Providers pageProps={pageProps}>
      <GlobalStyle />
      <Component {...pageProps} />
    </Providers>
    {GOOGLE_MAPS_SRC ? <Script src={GOOGLE_MAPS_SRC} async strategy="lazyOnload" /> : null}
  </>
);

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 56px; // TODO: Move it to higher scope for every usage of Layout Component
    height: 100%;
    font-family: ${defaultFont.style.fontFamily};
    --font-family-default: ${defaultFont.style.fontFamily};
    --font-family-code: ${codeFont.style.fontFamily};
  }

  body {
    background: transparent;
    height: 100%;

    #__next {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
`;

export default App;
