import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import { CollectKycDataProps } from './collect-kyc-data.types';
import {
  MachineProvider,
  useCollectKycDataMachine,
} from './components/machine-provider';
import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import { Events } from './utils/state-machine/types';

const i18n = configureReactI18next();

const App = ({ context, onDone }: CollectKycDataProps) => {
  const [, send] = useCollectKycDataMachine();
  const { authToken, customData, tenant } = context;

  useEffectOnce(() => {
    if (!customData || !tenant) {
      return;
    }
    const { missingAttributes, userFound } = customData;
    send({
      type: Events.receivedContext,
      payload: {
        authToken,
        missingAttributes,
        userFound,
        tenant,
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

const AppWithMachine = ({ context, metadata, onDone }: CollectKycDataProps) => (
  <MachineProvider>
    <App context={context} metadata={metadata} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
