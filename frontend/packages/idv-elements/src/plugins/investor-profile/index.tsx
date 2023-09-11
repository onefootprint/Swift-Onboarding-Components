import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useInvestorProfileMachine,
} from './components/machine-provider';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import type { InvestorProfileProps } from './investor-profile.types';
import Router from './pages/router';

const i18n = configureI18next();

const App = ({ context, onDone }: InvestorProfileProps) => {
  const [, send] = useInvestorProfileMachine();
  const { authToken, device, customData } = context;

  useEffectOnce(() => {
    send({
      type: 'receivedContext',
      payload: {
        device,
        authToken,
        showTransition: customData?.showTransition,
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

const AppWithMachine = ({ context, onDone }: InvestorProfileProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
