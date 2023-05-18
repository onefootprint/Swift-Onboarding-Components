import { useLogStateMachine } from '@onefootprint/dev-tools';
import { IdDI } from '@onefootprint/types';
import React, { useEffect } from 'react';

import { useOnboardingMachine } from '../../components/machine-provider';
import ConfigInvalid from '../config-invalid';
import Init from '../init';
import Requirements from '../requirements';
import Validate from '../validate';

export type DonePayload = {
  validationToken?: string;
};

type RouterProps = {
  onDone: (payload: DonePayload) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingMachine();
  const {
    userFound,
    device,
    config,
    authToken,
    data,
    sandboxSuffix,
    isTransfer,
    validationToken,
  } = state.context;
  useLogStateMachine('onboarding', state);

  const isDone = state.matches('complete');
  useEffect(() => {
    if (isDone) {
      // Will enter this with either a null validationToken (in the transfer app) or with a
      // validationToken after validate
      onDone({ validationToken });
    }
  }, [isDone, onDone, validationToken]);

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
          phoneNumber={data[IdDI.phoneNumber]}
          sandboxSuffix={sandboxSuffix}
          isTransfer={isTransfer}
          onDone={() => {
            send({
              type: 'requirementsCompleted',
            });
          }}
        />
      )}
      {state.matches('validate') && <Validate />}
    </>
  );
};

export default Router;
