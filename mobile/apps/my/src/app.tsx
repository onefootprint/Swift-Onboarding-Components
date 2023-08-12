import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import SplashScreen from 'react-native-splash-screen';

import Debug from './components/debug';
import queryClient from './config/initializers/react-query';
// import configureLogger from './config/logger';
import Idv from './domains/idv';
import Wallet from './domains/wallet';
import useIsDebug from './hooks/use-is-debug';
import useShouldOpenIdv from './hooks/use-should-open-idv';
// configureLogger();

const App = () => {
  const { linkingUrl, shouldOpen } = useShouldOpenIdv();
  const isDebug = useIsDebug();

  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isDebug ? (
        <Debug onLoad={handleLoad} />
      ) : shouldOpen ? (
        <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
      ) : (
        <Wallet onLoad={handleLoad} />
      )}
    </QueryClientProvider>
  );
};

export default App;
