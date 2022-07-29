import Head from 'next/head';
import { useRouter } from 'next/router';
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

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const { hideAppClip } = router.query;

  return (
    <QueryClientProvider client={queryClient}>
      <MachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <Head>
            {hideAppClip ? null : (
              <meta
                name="apple-itunes-app"
                content="app-id=1632436468, app-clip-bundle-id=com.onefootprint.my.live, app-clip-display=card"
              />
            )}
          </Head>
          <Header />
          <Component {...pageProps} />
        </DesignSystemProvider>
      </MachineProvider>
    </QueryClientProvider>
  );
};

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
