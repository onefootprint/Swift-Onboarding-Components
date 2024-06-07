import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';
import { HostedMachineProvider } from 'src/components/hosted-machine-provider';

import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';

configureI18n();

const defaultFont = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  fallback: ['Inter'],
});

const codeFont = Source_Code_Pro({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const App = ({ children }: React.PropsWithChildren) => (
  <div className={`${defaultFont.variable} ${codeFont.variable}`}>
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
  </div>
);

export default App;
