import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import type React from 'react';
import { HostedMachineProvider } from 'src/components/hosted-machine-provider';
import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';

const App = ({
  children,
  pageProps,
}: {
  children: React.ReactNode;
  pageProps: AppProps['pageProps'];
}) => {
  const { language } = pageProps;
  configureI18n({
    language: language ?? 'en',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HostedMachineProvider>
        <AppearanceProvider
          options={{
            strategy: ['obConfig'],
          }}
        >
          {children}
        </AppearanceProvider>
      </HostedMachineProvider>
    </QueryClientProvider>
  );
};

export default App;
