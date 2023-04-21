import React from 'react';

import RequirementsMachineProvider from './components/machine-provider';
import Router from './pages/router';
import { OnboardingRequirementsMachineArgs } from './utils/state-machine';

type RequirementsProps = Partial<OnboardingRequirementsMachineArgs> & {
  onDone: () => void;
};

const Requirements = ({
  userFound,
  device,
  authToken,
  config,
  email,
  sandboxSuffix,
  onDone,
}: RequirementsProps) => {
  if (!device || !authToken || !config) {
    throw new Error('Missing onboarding requirements props');
  }

  return (
    <RequirementsMachineProvider
      userFound={!!userFound}
      device={device}
      authToken={authToken}
      config={config}
      email={email}
      sandboxSuffix={sandboxSuffix}
    >
      <Router onDone={onDone} />
    </RequirementsMachineProvider>
  );
};

export default Requirements;
