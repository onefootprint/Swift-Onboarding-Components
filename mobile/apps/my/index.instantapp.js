import React from 'react';
import { AppRegistry, View, Text } from 'react-native';

// TODO: Load ADV in this entrypoint.
const InstantApp = () => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    }}
  >
    <Text
      style={{
        fontSize: 40,
        margin: 10,
        textAlign: 'center',
      }}
    >
      InstantApp,
    </Text>
    <Text
      style={{
        fontSize: 20,
        margin: 10,
        textAlign: 'center',
      }}
    >
      02/08/2023
    </Text>
  </View>
);

AppRegistry.registerComponent('instantapp', () => InstantApp);
