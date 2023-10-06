import 'react-native-reanimated';
import 'react-native-worklets-core';

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import SplashScreen from 'react-native-splash-screen';

import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import configureSentry from './config/initializers/sentry';
import Idv from './domains/idv';
import Preview from './domains/preview';
import useShouldOpenIdv from './hooks/use-should-open-idv';
import AnalyticsProvider from './utils/analytics';

configureReactI18next();
configureSentry();

const IdvApp = () => {
  const { linkingUrl, isPreview, isDemo, isDebug } = useShouldOpenIdv();

  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return isPreview ? (
    <QueryClientProvider client={queryClient}>
      <Preview isDemo={isDemo} isDebug={isDebug} />
    </QueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
      </AnalyticsProvider>
    </QueryClientProvider>
  );
};

export default IdvApp;
