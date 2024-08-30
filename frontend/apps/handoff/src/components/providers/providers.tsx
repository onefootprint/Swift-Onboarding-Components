import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';

import type { AppProps } from 'next/app';
import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import MachineProvider from '../machine-provider';

const Providers = ({
  children,
  pageProps,
}: {
  children: React.ReactNode;
  pageProps: AppProps['pageProps'];
}) => {
  const { language } = pageProps;
  configureI18n({ language: language ?? 'en' });

  return (
    <QueryClientProvider client={queryClient}>
      <MachineProvider>
        <AppearanceProvider
          options={{
            strategy: ['styleParams'],
          }}
        >
          {children}
        </AppearanceProvider>
      </MachineProvider>
    </QueryClientProvider>
  );
};

export default Providers;
