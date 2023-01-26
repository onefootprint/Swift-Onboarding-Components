import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
// import { useRouter } from 'next/router';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components';

import Layout from '../components/layout';
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
  // const router = useRouter();
  // const { hideAppClip } = router.query;

  <QueryClientProvider client={queryClient}>
    <ObserveCollectorProvider appName="handoff">
      <MachineProvider>
        <DesignSystemProvider theme={themes.light}>
          <GlobalStyle />
          <Head>
            {/* {hideAppClip ? null : (
              <meta
                name="apple-itunes-app"
                content="app-id=1632436468, app-clip-bundle-id=com.onefootprint.my.live, app-clip-display=card"
              />
            )} */}
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DesignSystemProvider>
      </MachineProvider>
    </ObserveCollectorProvider>
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
      padding: ${theme.spacing[5]} ${theme.spacing[6]} ${theme.spacing[11]}
        ${theme.spacing[6]};
    }
  `}`;

export default App;
