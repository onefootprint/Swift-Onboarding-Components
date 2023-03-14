import React from 'react';

import { OnboardingMachineArgs } from '../../utils/state-machine/onboarding/machine';
import OnboardingMachineProvider from './components/machine-provider';
import Router, { DonePayload } from './pages/router';

type OnboardingProps = Partial<OnboardingMachineArgs> & {
  onDone: (payload: DonePayload) => void;
};

const Onboarding = ({
  userFound,
  device,
  config,
  authToken,
  email,
  sandboxSuffix,
  onDone,
}: OnboardingProps) => {
  if (!device || !config || !authToken) {
    throw new Error('Missing onboarding props');
  }

  return (
    <OnboardingMachineProvider
      userFound={!!userFound}
      device={device}
      config={config}
      authToken={authToken}
      email={email}
      sandboxSuffix={sandboxSuffix}
    >
      <Router onDone={onDone} />
    </OnboardingMachineProvider>
  );
};

export default Onboarding;
