import 'react-native-reanimated';
import 'react-native-worklets-core';
import 'react-native-get-random-values';

import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import SplashScreen from 'react-native-splash-screen';

import queryClient from './config/initializers/react-query';
import configureSentry from './config/initializers/sentry';
import Idv from './domains/idv';
import Preview from './domains/preview';
import useShouldOpenIdv from './hooks/use-should-open-idv';
import AnalyticsProvider from './utils/analytics';

configureSentry();

const IdvApp = () => {
  const { linkingUrl, isPreview, isDemo, isDebug } = useShouldOpenIdv();

  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return isPreview ? (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider debug>
        <Preview isDemo={isDemo} isDebug={isDebug} />
      </AnalyticsProvider>
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
