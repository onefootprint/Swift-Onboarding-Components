import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import SplashScreen from 'react-native-splash-screen';

import Debug from './components/debug';
import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Idv from './domains/idv';
import useIsDebug from './hooks/use-is-debug';
import useShouldOpenIdv from './hooks/use-should-open-idv';

configureReactI18next();

const IdvApp = () => {
  const { linkingUrl } = useShouldOpenIdv();
  const isDebug = useIsDebug();

  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isDebug ? (
        <Debug onLoad={handleLoad} />
      ) : (
        <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
      )}
    </QueryClientProvider>
  );
};

export default IdvApp;
