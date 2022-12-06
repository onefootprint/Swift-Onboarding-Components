import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import AppHeader from '../components/app-header';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <DesignSystemProvider theme={themes.light}>
      <GlobalStyle />
      <AppHeader navigation={pageProps.page?.navigation} />
      <Component {...pageProps} />
    </DesignSystemProvider>
  </QueryClientProvider>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      --header-height: 56px;
      --page-aside-nav-width: 270px;

      ${media.greaterThan('sm')`
        --header-height: 52px;
      `}

      scroll-padding-top: calc(var(--header-height) + ${theme.spacing[5]});
      scroll-behavior: smooth;
    }
  `};
`;

export default App;
