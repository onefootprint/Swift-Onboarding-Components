'use client';

import { Logger } from '@onefootprint/idv';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import configureI18n from '@/src/config/initializers/18next';
import { useEffectOnceStrict } from '@/src/hooks';
import AppearanceProvider from '@/src/package-appearance/provider';
import type { AppearanceResponse } from '@/src/package-appearance/types';
import FootprintProvider from '@/src/provider-footprint';
import configureFootprint from '@/src/provider-footprint/adapters';

type ClientProvidersProps = {
  children: React.ReactNode;
  loadedStyle: AppearanceResponse;
};

configureI18n();
const fpClient = configureFootprint();
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const overrideThemeBackground = (theme: AppearanceResponse['theme']) => {
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
  Logger.setupSentry();
} catch (e) {
  console.error(e);
}

const ClientProviders = ({ loadedStyle, children }: ClientProvidersProps) => {
  useEffectOnceStrict(() => Logger.setupLogRocket('auth'));

  return (
    <AppearanceProvider
      appearance={loadedStyle.appearance || {}}
      rules={loadedStyle.rules || ''}
      theme={overrideThemeBackground(loadedStyle.theme)}
    >
      <QueryClientProvider client={queryClient}>
        <FootprintProvider client={fpClient}>{children}</FootprintProvider>
      </QueryClientProvider>
    </AppearanceProvider>
  );
};

export default ClientProviders;
