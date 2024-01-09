import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { L10nContextProvider } from '../../components/l10n-provider';
import configureI18next from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import { IdentifyMachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { IdentifyProps } from './types';

const Identify = ({ onDone, l10n, ...args }: IdentifyProps) => (
  <I18nextProvider i18n={configureI18next()}>
    <L10nContextProvider l10n={l10n}>
      <QueryClientProvider client={queryClient}>
        <IdentifyMachineProvider args={args}>
          <Router onDone={onDone} />
        </IdentifyMachineProvider>
      </QueryClientProvider>
    </L10nContextProvider>
  </I18nextProvider>
);

export default Identify;
