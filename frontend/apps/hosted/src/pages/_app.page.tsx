import { AppearanceProvider } from '@onefootprint/appearance';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';
import { HostedMachineProvider } from 'src/components/hosted-machine-provider';

import {
  configureLogRocket,
  configureSentry,
} from '../config/initializers/logger';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

configureSentry();
configureLogRocket();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <ObserveCollectorProvider appName="hosted">
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
    </ObserveCollectorProvider>
  </QueryClientProvider>
);

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 65px;
    --loading-container-min-height: 188px;
    
    ${media.greaterThan('md')`
       --navigation-header-height: 57px;
       --loading-container-min-width: 432px;
    `}
  }

  ${({ theme }) => css`
    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
    }
  `}`;

export default App;
