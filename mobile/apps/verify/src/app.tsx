import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router from './screens/router';

const App = () => {
  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={configureReactI18next()}>
        <DesignSystemProvider theme={themes.light}>
          <View onLayout={handleLoad}>
            <Router />
          </View>
        </DesignSystemProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;
