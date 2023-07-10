import type { Theme } from '@onefootprint/design-tokens';
import { ThemeProvider } from '@onefootprint/styled';
import React from 'react';
import { StatusBar } from 'react-native';
import { Host } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Portal } from '../portal';
import { ToastProvider } from '../toast';

export type DesignSystemProviderProps = {
  children: React.ReactNode;
  theme: Theme;
};

const DesignSystemProvider = ({
  children,
  theme,
}: DesignSystemProviderProps) => (
  <SafeAreaProvider>
    <ThemeProvider theme={theme}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.backgroundColor.secondary}
      />
      <Host>
        {children}
        <Portal>
          <ToastProvider />
        </Portal>
      </Host>
    </ThemeProvider>
  </SafeAreaProvider>
);

export default DesignSystemProvider;
