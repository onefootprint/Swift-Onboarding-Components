import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <ObserveCollectorProvider appName="handoff">
      <DesignSystemProvider theme={themes.light}>
        <GlobalStyle />
        <Component {...pageProps} />
      </DesignSystemProvider>
    </ObserveCollectorProvider>
  </QueryClientProvider>
);
const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
    }

    #__next {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0 0 ${theme.spacing[11]} 0;
    }
  `}`;

export default App;
