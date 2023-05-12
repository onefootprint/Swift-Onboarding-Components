import { IdDI } from '@onefootprint/types';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { MachineProvider } from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import { CollectKycDataProps } from './types';
import { KycData } from './utils/data-types';
import { MachineContext } from './utils/state-machine';

const i18n = configureI18next();

const App = ({ context, onDone }: CollectKycDataProps) => {
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const {
    config,
    userFound,
    sandboxSuffix,
    requirement,
    bootstrapData,
    fixedFields,
  } = customData;

  const data: KycData = {};
  if (bootstrapData) {
    Object.entries(bootstrapData).forEach(([key, value]) => {
      data[key as IdDI] = {
        value,
        bootstrap: true,
      };
    });
  }
  if (fixedFields) {
    fixedFields.forEach(field => {
      const entry = data[field];
      if (entry) {
        entry.fixed = true;
      }
    });
  }

  const initialContext: MachineContext = {
    authToken,
    device,
    config,
    userFound,
    sandboxSuffix,
    requirement,
    data,
  };

  return (
    <MachineProvider args={initialContext}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <Router onDone={onDone} />
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
