import FootprintProvider from 'footprint-provider';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import { GOOGLE_MAPS_KEY } from 'src/constants';
import styled, { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import FootprintFooter from '../components/footprint-footer';
import Header from '../components/header';
import MachineProvider from '../components/machine-provider';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

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
            <Content>
              <Header />
              <Component {...pageProps} />
            </Content>
            <FootprintFooter />
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

const GlobalStyle = createGlobalStyle`
  html, body, #__next {
    height: 100%;
  }

  #__next {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
`;

const Content = styled.section`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: 0 ${theme.spacing[6]}px;
  `}
`;

export default App;
