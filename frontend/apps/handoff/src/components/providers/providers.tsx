import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';

import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import MachineProvider from '../machine-provider';

configureI18n();

const Providers = ({ children }: React.PropsWithChildren) => (
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

export default Providers;
