import React from 'react';
import type { Theme } from '@onefootprint/design-tokens';
import { ThemeProvider } from '@onefootprint/styled';

export type DesignSystemProviderProps = {
  children: React.ReactNode;
  theme: Theme;
};

const DesignSystemProvider = ({
  children,
  theme,
}: DesignSystemProviderProps) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default DesignSystemProvider;
