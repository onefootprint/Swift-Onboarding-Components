import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createGlobalStyle } from 'styled';
import { DesignSystemProvider, themes } from 'ui';

type AppProps = {
  Component: React.FC;
  pageProps: Record<string, any>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

const GlobalStyle = createGlobalStyle``;

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <DesignSystemProvider theme={themes.light}>
      <GlobalStyle />
      <Component {...pageProps} />
    </DesignSystemProvider>
  </QueryClientProvider>
);

export default App;
