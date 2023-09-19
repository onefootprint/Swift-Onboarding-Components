import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import SplashScreen from 'react-native-splash-screen';

import queryClient from './config/initializers/react-query';
import Idv from './domains/idv';
import Preview from './domains/preview';
import Wallet from './domains/wallet';
import useShouldOpenIdv from './hooks/use-should-open-idv';

const App = () => {
  const { linkingUrl, shouldOpen, isPreview, isDemo, isDebug } =
    useShouldOpenIdv();

  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return isPreview ? (
    <QueryClientProvider client={queryClient}>
      <Preview isDemo={isDemo} isDebug={isDebug} />
    </QueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>
      {shouldOpen ? (
        <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
      ) : (
        <Wallet onLoad={handleLoad} />
      )}
    </QueryClientProvider>
  );
};

export default App;
