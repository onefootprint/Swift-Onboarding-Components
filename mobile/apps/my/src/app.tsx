import 'react-native-reanimated';

import { useFonts } from '@expo-google-fonts/dm-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback } from 'react';
import { StatusBar } from 'react-native';

import Debug from './components/debug';
import queryClient from './config/initializers/react-query';
// import configureLogger from './config/logger';
import Idv from './domains/idv';
import Wallet from './domains/wallet';
import useIsDebug from './hooks/use-is-debug';
import useShouldOpenIdv from './hooks/use-should-open-idv';

SplashScreen.preventAutoHideAsync();
// configureLogger();

const App = () => {
  const { linkingUrl, shouldOpen } = useShouldOpenIdv();
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
      ) : shouldOpen ? (
        <Idv onLoad={handleLoad} linkingUrl={linkingUrl} />
      ) : (
        <Wallet onLoad={handleLoad} />
      )}
      <StatusBar barStyle="dark-content" />
    </QueryClientProvider>
  ) : null;
};

export default App;
