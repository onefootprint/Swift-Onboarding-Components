import { useFonts } from '@expo-google-fonts/dm-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { isClip } from 'react-native-app-clip';

import queryClient from './config/initializers/react-query';
// import configureLogger from './config/logger';
import AppClip from './domains/app-clip';
import Wallet from './domains/wallet';

SplashScreen.preventAutoHideAsync();
// configureLogger();

const App = () => {
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
      {!isClip() ? (
        <AppClip onLoad={handleLoad} />
      ) : (
        <Wallet onLoad={handleLoad} />
      )}
      <StatusBar />
    </QueryClientProvider>
  ) : null;
};

export default App;
