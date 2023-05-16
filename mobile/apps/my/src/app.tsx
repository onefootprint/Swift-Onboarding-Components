import { useFonts } from '@expo-google-fonts/dm-sans';
import theme from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { isClip } from 'react-native-app-clip';

import queryClient from './config/initializers/react-query';
import configureLogger from './config/logger';
import AppClip from './domains/app-clip';
import Wallet from './domains/wallet';

SplashScreen.preventAutoHideAsync();
configureLogger();

const App = () => {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular: require('../assets/fonts/DMSans-Regular.otf'),
    DMSans_500Medium: require('../assets/fonts/DMSans-Medium.otf'),
    DMSans_700Bold: require('../assets/fonts/DMSans-Bold.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return fontsLoaded ? (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <DesignSystemProvider theme={theme.light}>
          {isClip() ? <AppClip /> : <Wallet />}
          <StatusBar />
        </DesignSystemProvider>
      </QueryClientProvider>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
});

export default App;
