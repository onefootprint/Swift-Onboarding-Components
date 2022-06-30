import FootprintProvider from 'footprint-provider';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import styled, { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider, media } from 'ui';

import FootprintFooter from '../components/footprint-footer';
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
              <NavigationHeader id="navigation-header-portal" />
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
    body {
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    body {
      background: transparent;
    }

    #__next {
      background-color: ${theme.backgroundColor.primary};
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 480px;
      margin: 0 auto;

      ${media.greaterThan('md')`
        background-color: unset;
        display: block;
        margin: ${theme.spacing[9]}px auto 0;
        width: 100%;
      `}
    }
  `}
 
`;

const Content = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
    flex: 1 0 auto;
    padding: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      background-color: ${theme.backgroundColor.primary};
      padding: 0 ${theme.spacing[7]}px ${theme.spacing[7]}px;
    `}
  `}
`;

const NavigationHeader = styled.header`
  height: 56px;
`;

export default App;
