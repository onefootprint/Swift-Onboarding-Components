import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { ThemeProvider, useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const isVaultingSection = router.pathname.includes('/vaulting');
  const { theme } = useTheme();
  const isDark = theme === 'dark' || isVaultingSection;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DesignSystemProvider theme={themes[isDark ? 'dark' : 'light']}>
      {children}
    </DesignSystemProvider>
  );
};

export default CustomDesignSystemProvider;
