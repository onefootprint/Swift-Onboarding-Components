import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import type { CollectKybDataProps } from './collect-kyb-data.types';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { MachineContext } from './utils/state-machine';

const i18n = configureI18next();

const App = ({ context, onDone }: CollectKybDataProps) => {
  const { authToken, customData, device } = context;
  if (!customData) {
    return null;
  }

  const {
    config,
    userFound,
    kybRequirement,
    // TODO: add support for kyb bootstrap data in the future
    kycRequirement,
    kycBootstrapData,
  } = customData;
  const initContext: MachineContext = {
    device,
    authToken,
    config,
    userFound,
    kybRequirement,
    kycRequirement,
    kycBootstrapData,
    data: {}, // TODO: add support for kyb bootstrap data in the future
  };

  return (
    <MachineProvider args={initContext}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <Router onDone={onDone} />
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
