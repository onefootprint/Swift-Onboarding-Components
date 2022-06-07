import FootprintProvider from 'footprint-provider';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import { GOOGLE_MAPS_KEY } from 'src/constants';
import { createGlobalStyle } from 'styled';
import { Container, DesignSystemProvider, themes } from 'ui';

import FootprintFooter from '../components/footprint-footer';
import Header from '../components/header';
import MachineProvider from '../components/machine-provider';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();
configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
    <QueryClientProvider client={queryClient}>
      <MachineProvider>
        <FootprintProvider>
          <DesignSystemProvider theme={themes.light}>
            <GlobalStyle />
            <Container>
              <Header />
              <Component {...pageProps} />
              <FootprintFooter />
            </Container>
          </DesignSystemProvider>
        </FootprintProvider>
      </MachineProvider>
    </QueryClientProvider>
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`}
      strategy="lazyOnload"
    />
  </>
);

const GlobalStyle = createGlobalStyle``;

export default App;
