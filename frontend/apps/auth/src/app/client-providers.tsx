'use client';

import { AppearanceProvider } from '@onefootprint/appearance';
import { LoggerDeprecated } from '@onefootprint/idv';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import configureI18n from '@/src/config/initializers/18next';
import { useEffectOnceStrict } from '@/src/hooks';
import FootprintProvider from '@/src/provider-footprint';
import configureFootprint from '@/src/provider-footprint/adapters';

type AppearanceResponse = Parameters<typeof AppearanceProvider>[0];
type Theme = AppearanceResponse['theme'];
type Override = {
  appearance: NonNullable<AppearanceResponse['appearance']> | null;
  rules: string | null;
};

type ClientProvidersProps = {
  children: React.ReactNode;
  loadedStyle: Omit<AppearanceResponse, 'children' | 'rules' | 'appearance'> &
    Override;
};

configureI18n();
const fpClient = configureFootprint();
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const overrideThemeBackground = (theme: Theme) => {
  if (theme) {
    return {
      ...theme,
      backgroundColor: {
        ...theme.backgroundColor,
        primary:
          theme.backgroundColor.primary === '#ffffff'
            ? 'transparent'
            : theme.backgroundColor.primary,
      },
    };
  }

  return theme;
};

try {
  LoggerDeprecated.setupSentry();
} catch (e) {
  console.error(e);
}

const ClientProviders = ({ loadedStyle, children }: ClientProvidersProps) => {
  useEffectOnceStrict(() => LoggerDeprecated.setupLogRocket('auth'));

  return (
    <AppearanceProvider
      appearance={loadedStyle.appearance || {}}
      rules={loadedStyle.rules || ''}
      theme={overrideThemeBackground(loadedStyle.theme) as NonNullable<Theme>}
    >
      <QueryClientProvider client={queryClient}>
        <FootprintProvider client={fpClient}>{children}</FootprintProvider>
      </QueryClientProvider>
    </AppearanceProvider>
  );
};

export default ClientProviders;
