import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { IdentifyMachineProvider } from './components/identify-machine-provider';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router, { DonePayload } from './pages/router';
import { IdentifyMachineArgs } from './utils/state-machine';

type IdentifyProps = IdentifyMachineArgs & {
  onDone: (payload: DonePayload) => void;
};

const Identify = ({
  bootstrapData,
  obConfigAuth,
  onDone,
  showLogo,
}: IdentifyProps) => (
  <I18nextProvider i18n={configureI18next()}>
    <QueryClientProvider client={queryClient}>
      <IdentifyMachineProvider
        bootstrapData={bootstrapData}
        obConfigAuth={obConfigAuth}
        showLogo={showLogo}
      >
        <Router onDone={onDone} />
      </IdentifyMachineProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default Identify;
