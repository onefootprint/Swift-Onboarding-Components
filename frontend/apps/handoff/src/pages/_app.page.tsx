import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';

import MachineProvider from '../components/machine-provider';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <ObserveCollectorProvider appName="handoff">
      <MachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <Component {...pageProps} />
        </DesignSystemProvider>
      </MachineProvider>
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
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  `}`;

export default App;
