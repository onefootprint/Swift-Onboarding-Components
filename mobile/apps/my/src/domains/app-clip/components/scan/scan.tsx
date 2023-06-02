import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { Navigation } from './scan.types';
import DocSelection from './screens/doc-selection';
import DriversLicense from './screens/drivers-license';

const Stack = createNativeStackNavigator<Navigation>();

const Scan = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerShown: false,
        }}
      >
        <Stack.Screen name="DocSelection" component={DocSelection} />
        <Stack.Screen name="DriversLicense" component={DriversLicense} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Scan;
