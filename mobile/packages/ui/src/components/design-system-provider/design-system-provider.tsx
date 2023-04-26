import type { Theme } from '@onefootprint/design-tokens';
import { ThemeProvider } from '@onefootprint/styled';
import React from 'react';

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
