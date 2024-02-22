import { AppearanceProvider } from '@onefootprint/appearance';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { Logger } from '@onefootprint/idv';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';
import { HostedMachineProvider } from 'src/components/hosted-machine-provider';
import { createGlobalStyle, css } from 'styled-components';

import configureI18n from '../config/initializers/i18next';
import queryClient from '../config/initializers/react-query';

Logger.setupSentry();
configureI18n();

const App = ({ Component, pageProps }: AppProps) => (
  <ObserveCollectorProvider appName="hosted">
    <QueryClientProvider client={queryClient}>
      <HostedMachineProvider>
        <AppearanceProvider
          options={{
            strategy: ['obConfig'],
          }}
        >
          <GlobalStyle />
          <Component {...pageProps} />
        </AppearanceProvider>
      </HostedMachineProvider>
    </QueryClientProvider>
  </ObserveCollectorProvider>
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
