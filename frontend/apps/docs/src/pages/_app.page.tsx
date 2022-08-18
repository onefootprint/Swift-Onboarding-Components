import React from 'react';
import { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import AppHeader from '../components/app-header';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <DesignSystemProvider theme={themes.light}>
    <GlobalStyle />
    <AppHeader />
    <Component {...pageProps} />
  </DesignSystemProvider>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      --header-height: 54px;
      scroll-padding-top: calc(var(--header-height) + ${theme.spacing[5]}px);
      scroll-behavior: smooth;
    }
  `};
`;

export default App;
