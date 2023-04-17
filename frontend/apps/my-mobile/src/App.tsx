import { Button } from '@onefootprint/ui-mobile';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isClip } from 'react-native-app-clip';

const App = () => (
  <View style={styles.container}>
    {isClip() ? (
      <View>
        <Text style={{ color: '#333', fontSize: 24 }}>App Clip!</Text>
      </View>
    ) : (
      <View>
        <Text style={{ color: '#333', fontSize: 24 }}>Regular App!</Text>
        <Button text="lorem" />
      </View>
    )}
    <StatusBar />
  </View>
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
