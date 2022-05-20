import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import FootprintFooter from 'src/components/footprint-footer/footprint-footer';
import styled, { createGlobalStyle, css } from 'styled';
import { Container, DesignSystemProvider, IconButton, themes } from 'ui';

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
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

const Header = styled.header`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0 ${theme.spacing[3]}px;
  `}
`;

const GlobalStyle = createGlobalStyle``;

export default App;
