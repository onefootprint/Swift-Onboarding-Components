import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { MachineProvider } from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import type { CollectKycDataProps } from './types';
import allAttributes from './utils/all-attributes';
import getInitData from './utils/get-init-data';
import type { MachineContext } from './utils/state-machine';

const i18n = configureI18next();

const App = ({ context, onDone }: CollectKycDataProps) => {
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const { config, userFound, requirement, bootstrapData, disabledFields } =
    customData;
  const cdos = allAttributes(requirement);
  const initData = getInitData(cdos, bootstrapData, disabledFields);
  const initContext: MachineContext = {
    authToken,
    device,
    config,
    userFound,
    requirement,
    data: initData,
    initialData: {},
  };

  return (
    <MachineProvider initialContext={initContext}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <Router onDone={onDone} />
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
