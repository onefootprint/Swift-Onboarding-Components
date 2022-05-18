import React from 'react';
import { createGlobalStyle } from 'styled';
import { DesignSystemProvider, themes } from 'ui';

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const GlobalStyle = createGlobalStyle``;

const App = ({ Component, pageProps }: AppProps) => (
  <DesignSystemProvider theme={themes.light}>
    <GlobalStyle />
    <Component {...pageProps} />
  </DesignSystemProvider>
);

export default App;
