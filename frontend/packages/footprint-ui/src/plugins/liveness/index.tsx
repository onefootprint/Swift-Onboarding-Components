import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import { BasePluginProps } from '../base-plugin';
import MachineProvider from './components/machine-provider';
import configureReactI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import useLivenessMachine, { Events } from './hooks/use-liveness-machine';
import Router from './pages/router';

const i18n = configureReactI18next();

type LivenessPluginProps = BasePluginProps;

const App = ({ context, onDone }: LivenessPluginProps) => {
  const [, send] = useLivenessMachine();
  const { authToken, device, tenant } = context;

  useEffectOnce(() => {
    send({
      type: Events.receivedContext,
      payload: {
        authToken,
        device,
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

const AppWithMachine = ({ context, metadata, onDone }: LivenessPluginProps) => (
  <MachineProvider>
    <App context={context} metadata={metadata} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
