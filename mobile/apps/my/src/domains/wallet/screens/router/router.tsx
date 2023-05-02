import { IcoFootprint24, IcoShield40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import configureReactI18next from '@/config/initializers/react-i18next';

import type { Navigation } from '../../wallet.types';
import Login from '../login';
import Sharing from '../sharing';
import Vault from '../vault';

configureReactI18next();

const Stack = createNativeStackNavigator<Navigation>();
const Tab = createBottomTabNavigator<Navigation>();

const Router = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const VaultScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Vault"
        component={Vault}
        options={{ headerLargeTitle: true }}
      />
    </Stack.Navigator>
  );
};

const SharingScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Sharing"
        component={Sharing}
        options={{ headerLargeTitle: true }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="VaultStack"
        component={VaultScreen}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Typography
              variant="caption-3"
              color={focused ? 'accent' : 'tertiary'}
            >
              Vault
            </Typography>
          ),
          tabBarIcon: ({ focused }) => (
            <IcoFootprint24 color={focused ? 'accent' : 'tertiary'} />
          ),
        }}
      />
      <Tab.Screen
        name="SharingStack"
        component={SharingScreen}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => {
            return (
              <Typography
                variant="caption-3"
                color={focused ? 'accent' : 'tertiary'}
              >
                Sharing
              </Typography>
            );
          },
          tabBarIcon: ({ focused }) => {
            return <IcoShield40 color={focused ? 'accent' : 'tertiary'} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default Router;
