import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';
import { HostedMachineProvider } from 'src/components/hosted-machine-provider';
import { createGlobalStyle, css } from 'styled-components';

import Layout from '../components/layout';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <ObserveCollectorProvider appName="hosted">
      <HostedMachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DesignSystemProvider>
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
    `}
  }

  ${({ theme }) => css`
    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
    }
  `}`;

export default App;
