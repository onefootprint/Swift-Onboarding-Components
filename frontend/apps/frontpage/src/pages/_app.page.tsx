/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { DesignSystemProvider, themes } from 'ui';

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const App = ({ Component, pageProps }: AppProps) => (
  <DesignSystemProvider theme={themes.light}>
    <Component {...pageProps} />
  </DesignSystemProvider>
);

export default App;
