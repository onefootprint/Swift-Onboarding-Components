import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import HandoffLayout from '../components/handoff-layout';
import MachineProvider from '../components/machine-provider';
import { SHOW_APP_CLIP_BANNER } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <>
    {SHOW_APP_CLIP_BANNER && (
      <Head>
        <meta
          name="apple-itunes-app"
          content="app-id=1632436468, app-clip-bundle-id=com.onefootprint.my.Clip, app-clip-display=card"
        />
      </Head>
    )}
    <QueryClientProvider client={queryClient}>
      <ObserveCollectorProvider appName="handoff">
        <MachineProvider>
          <DesignSystemProvider theme={themes.light}>
            <GlobalStyle />
            <HandoffLayout>
              <Component {...pageProps} />
            </HandoffLayout>
          </DesignSystemProvider>
        </MachineProvider>
      </ObserveCollectorProvider>
    </QueryClientProvider>
  </>
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
