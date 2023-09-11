import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import MachineProvider, {
  useLivenessMachine,
} from './components/machine-provider';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import Router from './pages/router';
import type { LivenessProps } from './types';

const i18n = configureI18next();

const App = ({ context, onDone }: LivenessProps) => {
  const [, send] = useLivenessMachine();
  const { authToken, device } = context;

  useEffectOnce(() => {
    send({
      type: 'receivedContext',
      payload: {
        authToken,
        device,
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

const AppWithMachine = ({ context, onDone }: LivenessProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
