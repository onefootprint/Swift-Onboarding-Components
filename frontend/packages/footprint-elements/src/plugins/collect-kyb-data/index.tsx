import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import { CollectKybDataProps } from './collect-kyb-data.types';
import {
  MachineProvider,
  useCollectKybDataMachine,
} from './components/machine-provider';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';

const i18n = configureI18next();

const App = ({ context, onDone }: CollectKybDataProps) => {
  const [, send] = useCollectKybDataMachine();
  const { authToken, customData, device } = context;

  useEffectOnce(() => {
    if (!customData) {
      return;
    }

    const { config, missingAttributes } = customData;
    send({
      type: 'receivedContext',
      payload: {
        device,
        authToken,
        config,
        missingAttributes,
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

const AppWithMachine = ({ context, onDone }: CollectKybDataProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
