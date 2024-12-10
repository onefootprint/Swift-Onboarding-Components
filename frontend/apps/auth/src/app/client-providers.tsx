'use client';

import configureI18n from '@/src/config/initializers/18next';
import FootprintProvider from '@/src/provider-footprint';
import configureFootprint from '@/src/provider-footprint/adapters';
import { AppearanceProvider } from '@onefootprint/appearance';
import { Logger } from '@onefootprint/idv';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import '../styles/globals.css';

type AppearanceResponse = Parameters<typeof AppearanceProvider>[0];
type Theme = AppearanceResponse['theme'];
type Override = {
  appearance: NonNullable<AppearanceResponse['appearance']> | null;
  rules: string | null;
};

type ClientProvidersProps = {
  children: React.ReactNode;
  loadedStyle: Omit<AppearanceResponse, 'children' | 'rules' | 'appearance'> & Override;
};

configureI18n();
const fpClient = configureFootprint();
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});
Logger.init('auth', /* deferSessionRecord */ true);

const ClientProviders = ({ loadedStyle, children }: ClientProvidersProps) => (
  <AppearanceProvider
    appearance={loadedStyle.appearance || {}}
    rules={loadedStyle.rules || ''}
    theme={loadedStyle.theme as NonNullable<Theme>}
  >
    <QueryClientProvider client={queryClient}>
      <FootprintProvider client={fpClient}>{children}</FootprintProvider>
    </QueryClientProvider>
  </AppearanceProvider>
);

export default ClientProviders;
