import { useLogStateMachine } from '@onefootprint/dev-tools';
import { IdDI } from '@onefootprint/types';
import React, { useEffect } from 'react';

import DeviceSignals from '../../../../components/device-signals';
import { useOnboardingMachine } from '../../components/machine-provider';
import Authorize from '../authorize/authorize';
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
    data,
    sandboxSuffix,
    isTransfer,
  } = state.context;
  useLogStateMachine('onboarding', state);

  useEffect(() => {
    if (isDone) {
      onDone({ validationToken });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('init') && <Init />}
      {state.matches('configInvalid') && <ConfigInvalid />}
      {state.matches('requirements') && (
        <Requirements
          userFound={!!userFound}
          device={device}
          config={config}
          authToken={authToken}
          email={data[IdDI.email]}
          sandboxSuffix={sandboxSuffix}
          isTransfer={isTransfer}
          onDone={() => {
            send({
              type: 'requirementsCompleted',
            });
          }}
        />
      )}
      {state.matches('authorize') && (
        <DeviceSignals page="authorize" fpAuthToken={state.context.authToken}>
          <Authorize />
        </DeviceSignals>
      )}
    </>
  );
};

export default Router;
