'use client';

import { Logger } from '@onefootprint/idv';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import configureI18n from '@/src/config/locales/configure-i18n';
import { useEffectOnceStrict } from '@/src/hooks';
import AppearanceProvider from '@/src/package-appearance/provider';
import type { AppearanceResponse } from '@/src/package-appearance/types';

type EditProvidersProps = {
  children: React.ReactNode;
  loadedStyle: AppearanceResponse;
};

configureI18n();
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

try {
  Logger.setupSentry();
} catch (e) {
  console.error(e);
}

const UserProviders = ({ loadedStyle, children }: EditProvidersProps) => {
  useEffectOnceStrict(() => Logger.setupLogRocket('auth'));

  return (
    <AppearanceProvider
      appearance={loadedStyle.appearance || {}}
      rules={loadedStyle.rules || ''}
      theme={loadedStyle.theme}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppearanceProvider>
  );
};

export default UserProviders;
