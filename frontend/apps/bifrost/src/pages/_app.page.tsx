import { AppearanceProvider } from '@onefootprint/appearance';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  configureFootprint,
  FootprintProvider,
  Logger,
} from '@onefootprint/idv';
import { createGlobalStyle } from '@onefootprint/styled';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
import { GOOGLE_MAPS_KEY } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

const footprint = configureFootprint();
Logger.setupSentry();
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => {
  const { appearance, theme, rules } = pageProps;
  const { ready: i18nReady } = useTranslation();
  // Prevent hydration errors from html rendering before translation is loaded
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), [i18nReady]);
  if (!ready) return null;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <ObserveCollectorProvider appName="bifrost">
        <QueryClientProvider client={queryClient}>
          <AppearanceProvider
            appearance={appearance}
            theme={theme}
            rules={rules}
          >
            <BifrostMachineProvider>
              <GlobalStyle />
              <FootprintProvider client={footprint}>
                <Component {...pageProps} />
              </FootprintProvider>
            </BifrostMachineProvider>
          </AppearanceProvider>
        </QueryClientProvider>
      </ObserveCollectorProvider>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`}
        strategy="lazyOnload"
      />
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 56px;
    --loading-container-min-height: 188px;
    height: 100%;
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
