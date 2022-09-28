import themes from '@onefootprint/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { FootprintFooter, FootprintJsProvider } from 'footprint-elements';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
import { DesignSystemProvider, media } from 'ui';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
import SandboxBanner from '../components/sandbox-banner';
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
      <BifrostMachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <FootprintJsProvider>
            <Container>
              <SandboxBanner />
              <Content id="content">
                <NavigationHeader id="navigation-header-portal" />
                <Component {...pageProps} />
              </Content>
              <FootprintFooter />
            </Container>
          </FootprintJsProvider>
        </DesignSystemProvider>
      </BifrostMachineProvider>
    </QueryClientProvider>
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`}
      strategy="lazyOnload"
    />
  </>
);

const GlobalStyle = createGlobalStyle`
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
    ${({ theme }) => css`
      background-blend-mode: ${theme.backgroundColor.primary};
      background-color: ${theme.backgroundColor.primary};
      height: 100vh;

      ${media.greaterThan('md')`
        background: unset;
      `}
    `}
  }
`;

const Container = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    position: relative;

    ${media.greaterThan('md')`
      height: unset;
      margin: ${theme.spacing[9]}px auto 0;
      max-width: 480px;
    `}
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]}px ${theme.spacing[7]}px;
    `}
  `}
`;

const NavigationHeader = styled.header`
  height: 56px;
`;

export default App;
