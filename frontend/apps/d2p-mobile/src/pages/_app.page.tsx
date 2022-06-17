import React from 'react';
import { QueryClientProvider } from 'react-query';
import styled, { createGlobalStyle, css } from 'styled-components';
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
        <Content>
          <Header />
          <ComponentContainer>
            <Component {...pageProps} />
          </ComponentContainer>
        </Content>
      </DesignSystemProvider>
    </MachineProvider>
  </QueryClientProvider>
);

const ComponentContainer = styled.div`
  flex: 1 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    padding: ${theme.spacing[5]}px;
  `}
`;

const GlobalStyle = createGlobalStyle`
${({ theme }) => css`
  html,
  body,
  #__next {
    height: 100%;
    width: 100%;
  }

  #__next {
    overflow: hidden;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
  }
`}`;

export default App;
