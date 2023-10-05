import { AppearanceProvider } from '@onefootprint/appearance';
import { Logger, ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createGlobalStyle, css } from '@onefootprint/styled';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import MachineProvider from '../components/machine-provider';
import configureReactI18next from '../config/initializers/react-i18next';
import queryClient from '../config/initializers/react-query';

Logger.setup('handoff');
configureReactI18next();

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  // https://developer.apple.com/documentation/app_clips/supporting_invocations_from_your_website_and_the_messages_app
  const shouldShowAppClipSmartBanner = router.pathname.includes('/appclip');

  return (
    <>
      {shouldShowAppClipSmartBanner ? (
        <Head>
          <meta
            name="apple-itunes-app"
            content="app-id=1632436468, app-clip-bundle-id=com.onefootprint.my.Clip, app-clip-display=card"
          />
        </Head>
      ) : null}
      <QueryClientProvider client={queryClient}>
        <ObserveCollectorProvider appName="handoff">
          <MachineProvider>
            <AppearanceProvider
              options={{
                strategy: ['styleParams'],
              }}
            >
              <GlobalStyle />
              <Component {...pageProps} />
            </AppearanceProvider>
          </MachineProvider>
        </ObserveCollectorProvider>
      </QueryClientProvider>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    html {
      height: 100%;
    }

    body {
      background-color: ${theme.backgroundColor.primary};
      overflow: hidden;
      height: 100%;
    }

    #__next {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  `}`;

export default App;
