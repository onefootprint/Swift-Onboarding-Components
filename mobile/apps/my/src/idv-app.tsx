import 'react-native-reanimated';

import { useFonts } from '@expo-google-fonts/dm-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback } from 'react';

import Debug from './components/debug';
import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Idv from './domains/idv';
import useIsDebug from './hooks/use-is-debug';
import useShouldOpenIdv from './hooks/use-should-open-idv';

SplashScreen.preventAutoHideAsync();
configureReactI18next();

const IdvApp = () => {
  const { linkingUrl } = useShouldOpenIdv();
  const isDebug = useIsDebug();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular: require('../assets/fonts/DMSans-Regular.otf'),
    DMSans_500Medium: require('../assets/fonts/DMSans-Medium.otf'),
    DMSans_700Bold: require('../assets/fonts/DMSans-Bold.otf'),
  });

  const handleLoad = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return fontsLoaded ? (
    <QueryClientProvider client={queryClient}>
      {isDebug ? (
        <Debug onLoad={handleLoad} />
      ) : (
        <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
      )}
    </QueryClientProvider>
  ) : null;
};

export default IdvApp;
