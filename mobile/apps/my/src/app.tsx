import theme from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { isClip } from 'react-native-app-clip';

import queryClient from './config/initializers/react-query';
import AppClip from './domains/app-clip';
import Wallet from './domains/wallet';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DesignSystemProvider theme={theme.light}>
      <View style={styles.container}>
        {isClip() ? <AppClip /> : <Wallet />}
        <StatusBar />
      </View>
    </DesignSystemProvider>
  </QueryClientProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
