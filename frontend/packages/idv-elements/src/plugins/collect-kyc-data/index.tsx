import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useCollectKycDataMachine,
} from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import { CollectKycDataProps } from './types';

const i18n = configureI18next();

const App = ({ context, onDone }: CollectKycDataProps) => {
  const [, send] = useCollectKycDataMachine();
  const { authToken, customData, device } = context;

  useEffectOnce(() => {
    if (!customData) {
      return;
    }
    const {
      missingAttributes,
      userFound,
      email,
      sandboxSuffix,
      config,
      fixedData,
    } = customData;
    send({
      type: 'receivedContext',
      payload: {
        device,
        authToken,
        missingAttributes,
        userFound,
        email,
        sandboxSuffix,
        config,
        fixedData,
      },
    });
  });

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Router onDone={onDone} />
      </QueryClientProvider>
    </I18nextProvider>
  );
};

const AppWithMachine = ({ context, onDone }: CollectKycDataProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
