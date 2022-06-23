import React from 'react';
import { QueryClientProvider } from 'react-query';
import { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

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
  <QueryClientProvider client={queryClient}>
    <MachineProvider>
      <DesignSystemProvider theme={themes.light}>
        <GlobalStyle />
        <Header />
        <Component {...pageProps} />
      </DesignSystemProvider>
    </MachineProvider>
  </QueryClientProvider>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
    }

    #__next {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${theme.spacing[5]}px ${theme.spacing[6]}px;
    }
  `}`;

export default App;
