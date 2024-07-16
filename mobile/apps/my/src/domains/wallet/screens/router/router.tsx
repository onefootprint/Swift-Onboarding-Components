import { IcoFootprint24, IcoShield40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import configureReactI18next from '@/config/initializers/react-i18next';

import useSession from '../../hooks/use-session';
import type { Navigation } from '../../wallet.types';
import EmailIdentification from '../email-identification';
import Login from '../login';
import Settings from '../settings';
import Sharing from '../sharing';
import Vault from '../vault';
import BackButton from './components/back-button';
import SettingsButton from './components/settings-button';

configureReactI18next();

const Stack = createNativeStackNavigator<Navigation>();
const Tab = createBottomTabNavigator<Navigation>();

const Router = () => {
  const { isLoggedIn } = useSession();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'EmailIdentification'}>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="EmailIdentification" component={EmailIdentification} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            title: '',
            headerShadowVisible: false,
            headerLeft: ({ canGoBack }) => {
              return canGoBack ? <BackButton /> : null;
            },
          }}
        >
          <Stack.Screen name="Login" component={Login} />
        </Stack.Group>
        <Stack.Group
          screenOptions={{
            headerLargeTitle: true,
            presentation: 'formSheet',
            headerLeft: ({ canGoBack }) => {
              return canGoBack ? <BackButton /> : null;
            },
          }}
        >
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const VaultScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        component={Vault}
        name="Vault"
        options={{
          headerLargeTitle: true,
          headerRight: () => <SettingsButton />,
        }}
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
        options={{
          headerLargeTitle: true,
          headerRight: () => <SettingsButton />,
        }}
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
            <Typography variant="caption-3" color={focused ? 'accent' : 'tertiary'}>
              Vault
            </Typography>
          ),
          tabBarIcon: ({ focused }) => <IcoFootprint24 color={focused ? 'accent' : 'tertiary'} />,
        }}
      />
      <Tab.Screen
        name="SharingStack"
        component={SharingScreen}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => {
            return (
              <Typography variant="caption-3" color={focused ? 'accent' : 'tertiary'}>
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
