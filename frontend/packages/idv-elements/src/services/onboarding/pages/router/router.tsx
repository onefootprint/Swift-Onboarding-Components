import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import { useOnboardingMachine } from '../../components/machine-provider';
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
  useLogStateMachine('onboarding', state);
  const {
    userFound,
    device,
    config,
    authToken,
    bootstrapData,
    isTransfer,
    overallOutcome,
    validationToken,
    idDocOutcome,
  } = state.context;

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
      {state.matches('requirements') && (
        <Requirements
          userFound={!!userFound}
          device={device}
          config={config}
          authToken={authToken}
          bootstrapData={bootstrapData}
          isTransfer={isTransfer}
          overallOutcome={overallOutcome}
          idDocOutcome={idDocOutcome}
          onDone={() => send({ type: 'requirementsCompleted' })}
        />
      )}
      {state.matches('validate') && <Validate />}
    </>
  );
};

export default Router;
