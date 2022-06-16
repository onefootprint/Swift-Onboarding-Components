import FootprintProvider from 'footprint-provider';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import styled, { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider, media } from 'ui';

import FootprintFooter from '../components/footprint-footer';
import Header from '../components/header';
import MachineProvider from '../components/machine-provider';
import { GOOGLE_MAPS_KEY } from '../config/constants';
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
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <FootprintProvider>
            <Content>
              <Header />
              <Component {...pageProps} />
            </Content>
            <FootprintFooter />
          </FootprintProvider>
        </DesignSystemProvider>
      </MachineProvider>
    </QueryClientProvider>
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`}
      strategy="lazyOnload"
    />
  </>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html,
    body,
    #__next {
      height: 100%;
      width: 100%;
    }

    body {
      background: transparent;
    }

    #__next {
      max-width: 500px;
      overflow: hidden;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      background-color: ${theme.backgroundColor.primary};

      ${media.greaterThan('md')`
        background-color: unset;
        display: block;
        margin: ${theme.spacing[9]}px auto 0;
      `}
    }
  `}
 
`;

const Content = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[1]}px ${theme.borderRadius[1]}px 0 0;
    flex: 1 0 auto;
    padding: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      background-color: ${theme.backgroundColor.primary};
      padding: 0 ${theme.spacing[7]}px ${theme.spacing[7]}px;
    `}
  `}
`;

export default App;
