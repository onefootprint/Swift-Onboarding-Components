import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { FootprintJsProvider } from 'footprint-elements';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
import ContentWithHeaderAndFooter from '../components/content-with-header-and-footer';
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
            <ContentWithHeaderAndFooter>
              <Component {...pageProps} />
            </ContentWithHeaderAndFooter>
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
  html {
    --navigation-header-height: 65px;

    ${media.greaterThan('md')`
      --navigation-header-height: 57px;
    `}
  }

  }
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

export default App;
