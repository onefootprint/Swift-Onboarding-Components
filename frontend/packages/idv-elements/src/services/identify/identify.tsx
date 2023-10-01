import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { IdentifyMachineProvider } from './components/machine-provider';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import type { IdentifyProps } from './types';

const Identify = ({ onDone, ...args }: IdentifyProps) => (
  <I18nextProvider i18n={configureI18next()}>
    <QueryClientProvider client={queryClient}>
      <IdentifyMachineProvider args={args}>
        <Router onDone={onDone} />
      </IdentifyMachineProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default Identify;
