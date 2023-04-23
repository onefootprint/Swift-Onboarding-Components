import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import DeviceSignals from '../../../../components/device-signals';
import { useOnboardingMachine } from '../../components/machine-provider';
import Authorize from '../authorize/authorize';
import Authorized from '../authorized';
import ConfigInvalid from '../config-invalid';
import Init from '../init';
import Requirements from '../requirements';

export type DonePayload = {
  validationToken?: string;
};

type RouterProps = {
  onDone: (payload: DonePayload) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingMachine();
  const isDone = state.matches('complete');
  const {
    validationToken,
    userFound,
    device,
    config,
    authToken,
    userData,
    sandboxSuffix,
  } = state.context;
  useLogStateMachine('onboarding', state);

  useEffect(() => {
    if (isDone) {
      onDone({ validationToken });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  if (state.matches('init')) {
    return <Init />;
  }
  if (state.matches('configInvalid')) {
    return <ConfigInvalid />;
  }
  if (state.matches('requirements')) {
    return (
      <Requirements
        userFound={!!userFound}
        device={device}
        config={config}
        authToken={authToken}
        email={userData.email}
        sandboxSuffix={sandboxSuffix}
        onDone={() => {
          send({
            type: 'requirementsCompleted',
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
  if (state.matches('authorized')) {
    return <Authorized />;
  }
  return null;
};

export default Router;
