import React from 'react';
import { QueryClientProvider } from 'react-query';
import Header from 'src/components/header';
import { createGlobalStyle } from 'styled-components';
import themes from 'themes';
import { Container, DesignSystemProvider } from 'ui';

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
        <Header />
        <Component {...pageProps} />
      </Container>
    </DesignSystemProvider>
  </QueryClientProvider>
);

const GlobalStyle = createGlobalStyle``;

export default App;
