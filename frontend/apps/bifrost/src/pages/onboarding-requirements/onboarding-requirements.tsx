import React from 'react';
import { OnboardingRequirementsMachineArgs } from 'src/utils/state-machine/onboarding-requirements/machine';

import OnboardingRequirementsMachineProvider from './components/machine-provider';
import Router from './pages/router';

type OnboardingRequirementsProps =
  Partial<OnboardingRequirementsMachineArgs> & {
    onDone: () => void;
  };

const OnboardingRequirements = ({
  userFound,
  device,
  authToken,
  config,
  email,
  onDone,
}: OnboardingRequirementsProps) => {
  if (!device || !authToken || !config) {
    throw new Error('Missing onboarding requirements props');
  }

  return (
    <OnboardingRequirementsMachineProvider
      userFound={!!userFound}
      device={device}
      authToken={authToken}
      config={config}
      email={email}
    >
      <Router onDone={onDone} />
    </OnboardingRequirementsMachineProvider>
  );
};

export default OnboardingRequirements;
