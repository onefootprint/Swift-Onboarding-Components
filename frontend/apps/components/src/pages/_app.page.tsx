import { AppearanceProvider } from '@onefootprint/appearance';
import { createGlobalStyle } from '@onefootprint/styled';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import React from 'react';
import FootprintProvider from 'src/components/footprint-provider';
import configureFootprint from 'src/components/footprint-provider/adapters';

import { GOOGLE_MAPS_KEY } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

const footprint = configureFootprint();
configureSentry();
configureReactI18next();

// TODO: add error boundary
// https://linear.app/footprint/issue/FP-4515/add-nice-error-boundaryfallback-to-embedded-components
const App = ({ Component, pageProps }: AppProps) => {
  const { appearance, theme, rules } = pageProps;

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppearanceProvider appearance={appearance} theme={theme} rules={rules}>
          <GlobalStyle />
          <FootprintProvider client={footprint}>
            <Component {...pageProps} />
          </FootprintProvider>
        </AppearanceProvider>
      </QueryClientProvider>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`}
        strategy="lazyOnload"
      />
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 56px; // TODO: Move it to higher scope for every usage of Layout Component
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
