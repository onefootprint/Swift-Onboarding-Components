import React from 'react';

import RequirementsMachineProvider from './components/machine-provider';
import Router from './pages/router';
import { OnboardingRequirementsMachineArgs } from './utils/state-machine';

type DonePayload = {
  validationToken?: string;
};

type RequirementsProps = Partial<OnboardingRequirementsMachineArgs> & {
  onDone: (payload: DonePayload) => void;
};

const Requirements = ({
  userFound,
  device,
  authToken,
  config,
  email,
  phoneNumber,
  sandboxSuffix,
  isTransfer,
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
      phoneNumber={phoneNumber}
      sandboxSuffix={sandboxSuffix}
      isTransfer={isTransfer}
    >
      <Router onDone={onDone} />
    </RequirementsMachineProvider>
  );
};

export default Requirements;
