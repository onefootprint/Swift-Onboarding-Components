import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import MachineProvider from '../machine-provider';

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

const Providers = ({ children }: React.PropsWithChildren) => (
  <div className={`${defaultFont.variable} ${codeFont.variable}`}>
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
  </div>
);

export default Providers;
