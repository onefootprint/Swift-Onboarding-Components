import IcoClose24 from 'icons/ico/ico-close-24';
import Script from 'next/script';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import FootprintFooter from 'src/components/footprint-footer/footprint-footer';
import { GOOGLE_MAPS_KEY } from 'src/constants';
import styled, { createGlobalStyle, css } from 'styled';
import { Container, DesignSystemProvider, IconButton, themes } from 'ui';

import { BifrostMachineProvider } from '../components/bifrost-machine-provider';
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
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`}
      strategy="lazyOnload"
    />
    <QueryClientProvider client={queryClient}>
      <BifrostMachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <Container>
            <Header>
              <IconButton Icon={IcoClose24} ariaLabel="Close window" />
            </Header>
            <Component {...pageProps} />
            <FootprintFooter />
          </Container>
        </DesignSystemProvider>
      </BifrostMachineProvider>
    </QueryClientProvider>
  </>
);

const Header = styled.header`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0 ${theme.spacing[3]}px;
  `}
`;

const GlobalStyle = createGlobalStyle``;

export default App;
