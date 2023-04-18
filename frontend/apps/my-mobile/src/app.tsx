import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isClip } from 'react-native-app-clip';

import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';

configureReactI18next();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <View style={styles.container}>
      {isClip() ? (
        <View>
          <Text style={{ color: '#333', fontSize: 24 }}>App Clip!</Text>
        </View>
      ) : (
        <View>
          <Text style={{ color: '#333', fontSize: 24 }}>Regular App!</Text>
        </View>
      )}
      <StatusBar />
    </View>
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
