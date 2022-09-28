import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import { MachineProvider, useD2PMachine } from './components/machine-provider';
import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import { D2PPluginProps } from './d2p.types';
import Router from './pages/router';
import { Events } from './utils/state-machine/types';

const i18n = configureReactI18next();

const App = ({ context, onDone }: D2PPluginProps) => {
  const [, send] = useD2PMachine();
  const { authToken, device, customData } = context;

  useEffectOnce(() => {
    if (!customData?.missingRequirements) {
      return;
    }

    send({
      type: Events.receivedContext,
      payload: {
        authToken,
        device,
        missingRequirements: { ...customData.missingRequirements },
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

const AppWithMachine = ({ context, metadata, onDone }: D2PPluginProps) => (
  <MachineProvider>
    <App context={context} metadata={metadata} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
