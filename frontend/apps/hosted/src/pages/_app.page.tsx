import { Logger } from '@onefootprint/idv';
import type { AppProps } from 'next/app';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Providers from '../components/providers';

// Don't enable log rocket until we know we are in a live onboarding
Logger.init('hosted', true);

const App = ({ Component, pageProps }: AppProps) => (
  <Providers>
    <GlobalStyle />
    <Component {...pageProps} />
  </Providers>
);

const GlobalStyle = createGlobalStyle`
  html {
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
