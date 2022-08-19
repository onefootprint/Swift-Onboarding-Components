import React, { useEffect, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider, media } from 'ui';
import { useDarkMode } from 'usehooks-ts';

import AppHeader from '../components/app-header';
import configureReactI18next from '../config/initializers/react-i18next';

configureReactI18next();

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => {
  const { isDarkMode } = useDarkMode();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return mounted ? (
    <DesignSystemProvider theme={isDarkMode ? themes.dark : themes.light}>
      <GlobalStyle />
      <AppHeader articles={pageProps.product?.articles} />
      <Component {...pageProps} />
    </DesignSystemProvider>
  ) : null;
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      --header-height: 95px;
      --product-aside-nav-width: 270px;

      ${media.greaterThan('sm')`
        --header-height: 52px;
      `}

      scroll-padding-top: calc(var(--header-height) + ${theme.spacing[5]}px);
      scroll-behavior: smooth;
    }
  `};
`;

export default App;
