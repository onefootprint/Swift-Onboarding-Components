import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useIdDocMachine,
} from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import { IdDocProps } from './id-doc.types';
import Router from './pages/router';
import { Events } from './utils/state-machine/types';

const App = ({ context, onDone }: IdDocProps) => {
  const [, send] = useIdDocMachine();
  const { authToken, device, customData } = context;
  const documentRequestId = customData?.documentRequestId;
  useEffectOnce(() => {
    if (!documentRequestId) {
      return;
    }
    send({
      type: Events.receivedContext,
      payload: {
        authToken,
        device,
        documentRequestId,
      },
    });
  });

  return (
    <I18nextProvider i18n={configureI18next()}>
      <QueryClientProvider client={queryClient}>
        <Router onDone={onDone} />
      </QueryClientProvider>
    </I18nextProvider>
  );
};

const AppWithMachine = ({ context, onDone }: IdDocProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
