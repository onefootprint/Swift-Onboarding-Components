import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { ThemeProvider, useTheme } from 'next-themes';
import React from 'react';

type CustomDesignSystemProviderProps = {
  children: React.ReactNode;
};

const CustomDesignSystemProvider = ({
  children,
}: CustomDesignSystemProviderProps) => (
  <ThemeProvider defaultTheme="light" enableSystem={false}>
    <DesignSystemProviderWrapper>{children}</DesignSystemProviderWrapper>
  </ThemeProvider>
);

const DesignSystemProviderWrapper = ({
  children,
}: CustomDesignSystemProviderProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <DesignSystemProvider theme={themes[isDark ? 'dark' : 'light']}>
      {children}
    </DesignSystemProvider>
  );
};

export default CustomDesignSystemProvider;
