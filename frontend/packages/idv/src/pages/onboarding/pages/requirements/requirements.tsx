import React from 'react';

import RequirementsMachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { OnboardingRequirementsMachineArgs } from './utils/state-machine';

type RequirementsProps = OnboardingRequirementsMachineArgs & {
  onDone: () => void;
};

const Requirements = ({ onDone, ...args }: RequirementsProps) => (
  <RequirementsMachineProvider args={args}>
    <Router onDone={onDone} />
  </RequirementsMachineProvider>
);

export default Requirements;
