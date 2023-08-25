import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import SplashScreen from 'react-native-splash-screen';

import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Idv from './domains/idv';
import Preview from './domains/preview';
import useShouldOpenIdv from './hooks/use-should-open-idv';

configureReactI18next();

const IdvApp = () => {
  const { linkingUrl, isPreview, isDemo } = useShouldOpenIdv();

  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return isPreview ? (
    <Preview isDemo={isDemo} />
  ) : (
    <QueryClientProvider client={queryClient}>
      <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
    </QueryClientProvider>
  );
};

export default IdvApp;
