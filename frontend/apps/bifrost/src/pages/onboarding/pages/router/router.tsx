import { useLogStateMachine } from '@onefootprint/dev-tools';
import { DeviceSignals } from '@onefootprint/footprint-elements';
import { OnboardingStatus } from '@onefootprint/types';
import React, { useEffect } from 'react';
import useOnboardingMachine from 'src/hooks/use-onboarding-machine';
import OnboardingRequirements from 'src/pages/onboarding-requirements';

import Authorize from '../authorize/authorize';
import InitOnboarding from '../init-onboarding';

export type DonePayload = {
  validationToken?: string;
  status?: OnboardingStatus;
};

type RouterProps = {
  onDone: (payload: DonePayload) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingMachine();
  const isDone = state.matches('success');
  const {
    validationToken,
    status,
    userFound,
    device,
    config,
    authToken,
    email,
    sandboxSuffix,
  } = state.context;
  useLogStateMachine('onboarding', state);

  useEffect(() => {
    if (isDone) {
      onDone({ validationToken, status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  if (state.matches('initOnboarding')) {
    return <InitOnboarding />;
  }
  if (state.matches('onboardingRequirements')) {
    return (
      <OnboardingRequirements
        userFound={!!userFound}
        device={device}
        config={config}
        authToken={authToken}
        email={email}
        sandboxSuffix={sandboxSuffix}
        onDone={() => {
          send({
            type: 'onboardingRequirementsCompleted',
          });
        }}
      />
    );
  }
  if (state.matches('authorize')) {
    return (
      <DeviceSignals page="authorize" fpAuthToken={state.context.authToken}>
        <Authorize />
      </DeviceSignals>
    );
  }
  return null;
};

export default Router;
