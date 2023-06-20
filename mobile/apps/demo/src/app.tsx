import { useFonts } from '@expo-google-fonts/dm-sans';
import Idv from '@onefootprint/idv';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

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
    <View
      onLayout={handleLoad}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Idv />
    </View>
  ) : null;
};

export default App;
