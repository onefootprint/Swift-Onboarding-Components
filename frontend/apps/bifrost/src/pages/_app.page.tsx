import '@onefootprint/design-tokens/src/output/theme.css';

import theme from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  configureFootprint,
  FootprintProvider,
} from '@onefootprint/idv-elements';
import { createGlobalStyle } from '@onefootprint/styled';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
import { GOOGLE_MAPS_KEY } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

const footprint = configureFootprint();
configureSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <meta charSet="utf-8" />
    </Head>
    <QueryClientProvider client={queryClient}>
      <ObserveCollectorProvider appName="bifrost">
        <BifrostMachineProvider>
          <DesignSystemProvider theme={theme.light}>
            <GlobalStyle />
            <FootprintProvider client={footprint}>
              <Component {...pageProps} />
            </FootprintProvider>
          </DesignSystemProvider>
        </BifrostMachineProvider>
      </ObserveCollectorProvider>
    </QueryClientProvider>
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`}
      strategy="lazyOnload"
    />
  </>
);

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 65px;
    --loading-container-min-height: 188px;
    height: 100%;
    
    ${media.greaterThan('md')`
      --navigation-header-height: 57px;
    `}
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
