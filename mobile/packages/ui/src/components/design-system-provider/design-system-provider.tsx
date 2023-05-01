import type { Theme } from '@onefootprint/design-tokens';
import { ThemeProvider } from '@onefootprint/styled';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export type DesignSystemProviderProps = {
  children: React.ReactNode;
  theme: Theme;
};

const DesignSystemProvider = ({
  children,
  theme,
}: DesignSystemProviderProps) => (
  <SafeAreaProvider>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </SafeAreaProvider>
);

export default DesignSystemProvider;
