import '@onefootprint/design-tokens/src/output/theme.css';

import theme from '@onefootprint/design-tokens';
import {
  configureFootprint,
  FootprintProvider,
} from '@onefootprint/footprint-elements';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
import Layout from '../components/layout';
import { GOOGLE_MAPS_KEY } from '../config/constants';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';
import useExtendedAppearance from '../hooks/use-extended-appearance';

const footprint = configureFootprint();
configureSentry();
configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => {
  useExtendedAppearance();

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <BifrostMachineProvider>
          <DesignSystemProvider theme={theme.light}>
            <GlobalStyle />
            <FootprintProvider client={footprint}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </FootprintProvider>
          </DesignSystemProvider>
        </BifrostMachineProvider>
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
    --navigation-header-height: 65px;

    ${media.greaterThan('md')`
      --navigation-header-height: 57px;
    `}
  }

  body {
    background: transparent;
  }
`;

export default App;
