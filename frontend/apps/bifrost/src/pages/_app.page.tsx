import { AppearanceProvider } from '@onefootprint/appearance';
import { FootprintProvider, Logger, configureFootprint } from '@onefootprint/idv';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
import { GOOGLE_MAPS_SRC } from '../config/constants';
import configureI18n from '../config/initializers/i18next';
import queryClient from '../config/initializers/react-query';

const footprint = configureFootprint();
// Don't enable log rocket until we know we are in a live onboarding
Logger.init('bifrost', true);
configureI18n();

const App = ({ Component, pageProps }: AppProps) => {
  const { appearance, theme, rules } = pageProps;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <AppearanceProvider appearance={appearance} theme={theme} rules={rules}>
          <BifrostMachineProvider>
            <GlobalStyle />
            <FootprintProvider client={footprint}>
              <Component {...pageProps} />
            </FootprintProvider>
          </BifrostMachineProvider>
        </AppearanceProvider>
      </QueryClientProvider>
      {GOOGLE_MAPS_SRC ? <Script src={GOOGLE_MAPS_SRC} async strategy="lazyOnload" /> : null}
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
