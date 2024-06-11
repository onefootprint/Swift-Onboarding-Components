import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';

import React from 'react';
import { HostedMachineProvider } from 'src/components/hosted-machine-provider';

import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';

configureI18n();

const App = ({ children }: React.PropsWithChildren) => (
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

export default App;
