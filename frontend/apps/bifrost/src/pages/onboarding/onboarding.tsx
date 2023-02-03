import { useLogStateMachine } from '@onefootprint/dev-tools';
import { DeviceSignals, withProvider } from '@onefootprint/footprint-elements';
import React from 'react';
import { States } from 'src/utils/state-machine/onboarding';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import OnboardingRequirements from '../onboarding-requirements';
import MachineProvider from './components/machine-provider';
import Authorize from './pages/authorize';
import InitOnboarding from './pages/init-onboarding';

const Onboarding = () => {
  const [state] = useOnboardingMachine();
  useLogStateMachine('onboarding', state);

  if (state.matches(States.initOnboarding)) {
    return <InitOnboarding />;
  }

  if (state.matches(States.onboardingRequirements)) {
    return <OnboardingRequirements />;
  }
  if (state.matches(States.authorize)) {
    return (
      <DeviceSignals page="authorize" fpAuthToken={state.context.authToken}>
        <Authorize />
      </DeviceSignals>
    );
  }
  return null;
};

export default () => withProvider(MachineProvider, Onboarding);
