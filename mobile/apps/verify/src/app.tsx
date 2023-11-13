import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import queryClient from './config/initializers/react-query';
import EmailIdentification from './screens/email-identification';

const App = () => {
  const handleLoad = useCallback(async () => {
    SplashScreen.hide();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={themes.light}>
        <View onLayout={handleLoad}>
          <EmailIdentification />
        </View>
      </DesignSystemProvider>
    </QueryClientProvider>
  );
};

export default App;
