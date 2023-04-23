import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import OnboardingMachineProvider from './components/machine-provider';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import Router, { DonePayload } from './pages/router';
import { OnboardingMachineArgs } from './utils/state-machine';

type OnboardingProps = Partial<OnboardingMachineArgs> & {
  onDone: (payload: DonePayload) => void;
};

const Onboarding = ({
  tenantPk,
  authToken,
  userData,
  sandboxSuffix,
  userFound,
  onDone,
}: OnboardingProps) => {
  if (!tenantPk || !authToken) {
    throw new Error('Missing onboarding props');
  }

  return (
    <I18nextProvider i18n={configureI18next()}>
      <QueryClientProvider client={queryClient}>
        <OnboardingMachineProvider
          userFound={userFound}
          tenantPk={tenantPk}
          authToken={authToken}
          userData={userData}
          sandboxSuffix={sandboxSuffix}
        >
          <Router onDone={onDone} />
        </OnboardingMachineProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default Onboarding;
