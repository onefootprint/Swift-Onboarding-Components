import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { ThemeProvider, useTheme } from 'next-themes';
import type React from 'react';
import { useEffect } from 'react';

type CustomDesignSystemProviderProps = {
  children: React.ReactNode;
};

const CustomDesignSystemProvider = ({ children }: CustomDesignSystemProviderProps) => (
  <ThemeProvider defaultTheme="light" enableSystem={false}>
    <DesignSystemProviderWrapper>{children}</DesignSystemProviderWrapper>
  </ThemeProvider>
);

const DesignSystemProviderWrapper = ({ children }: CustomDesignSystemProviderProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  return <DesignSystemProvider theme={themes[isDark ? 'dark' : 'light']}>{children}</DesignSystemProvider>;
};

export default CustomDesignSystemProvider;
